using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using JuanGCarmona.Lighthouse.Cqrs;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record GetIssueContext(OwnerSession Session, string Repository, int Number, int Page = 1, string? Snapshot = null);
internal sealed record IssueContent(long Id, int Number, string Title, string Body, string State, string? Author,
    string? CreatedAt, string? UpdatedAt, IReadOnlyList<string> Labels, string SourceUrl, IReadOnlyList<SourceLabelFact>? LabelFacts = null);
internal sealed record IssueComment(long Id, string Body, string? Author, string? AuthorType, string? CreatedAt,
    string? UpdatedAt, string SourceUrl);
internal sealed record IssueConversation(string Availability, IReadOnlyList<IssueComment> Items, int Page, int PerPage,
    long? SourceCount, int? NextPage, bool Complete, string? Reason);
internal sealed record IssueContext(string Repository, int Number, string Availability, DateTimeOffset ObservedAt,
    long ActingUserId, string? Snapshot = null, IssueContent? Issue = null, IssueConversation? Conversation = null,
    string? Reason = null, string? DataScope = null, bool? EvidenceReadAllowed = null);

internal sealed class GetIssueContextHandler(OwnerSessions sessions, GitHubAuthorization authorization,
    RepositoryAccess access, GitHubTransport transport, TimeProvider clock) : IQueryHandler<GetIssueContext, IssueContext>
{
  internal const int PerPage = 100;
  internal const int MaximumPage = 10;

  public async Task<IssueContext> Handle(GetIssueContext query, CancellationToken cancellationToken)
  {
    var record = query.Session;
    IssueContext Failure(string availability, string reason, long user = 0)
    {
      lock (record.Sync)
        return new(query.Repository, query.Number, availability, clock.GetUtcNow(), user,
            Reason: reason, DataScope: record.GitHub.Current?.DataScope);
    }
    if (query.Number <= 0 || query.Page is < 1 or > MaximumPage)
      return Failure("invalid", "Choose a positive issue number and a conversation page from 1 through 10.");
    var authority = await access.CheckAsync(record, query.Repository, cancellationToken).ConfigureAwait(false);
    if (authority.Availability != SourceAvailability.Available || !authority.IssuesRead)
    {
      if (authority.Availability == SourceAvailability.Denied || authority.Availability == SourceAvailability.Available && !authority.IssuesRead) return Failure("denied", "Current connected-user repository authority was denied.");
      lock (record.Sync)
        return Failure(record.GitHub.Current is null ? "disconnected" : "unavailable",
            "Current connected-user repository authority could not be verified.");
    }
    var connection = await authorization.CurrentAsync(record, cancellationToken).ConfigureAwait(false);
    if (connection is null) return Failure("disconnected", "Connect and verify the acting GitHub user.");
    long generation;
    lock (record.Sync) generation = record.GitHub.Generation;
    bool Live()
    {
      lock (record.Sync) return ReferenceEquals(sessions.Get(record.Id), record)
          && ReferenceEquals(record.GitHub.Current, connection) && record.GitHub.Generation == generation;
    }
    var guard = new SourceRequestGuard(record.Sync, Live, connection.Stopped.Token);
    var path = "/repos/" + query.Repository + "/issues/" + query.Number.ToString(CultureInfo.InvariantCulture);
    if (!Live()) return Failure("disconnected", "The source identity or session changed.");
    using var issue = await transport.GetAsync(path, connection.Tokens.Access, guard, cancellationToken).ConfigureAwait(false);
    if (!Live()) return Failure("disconnected", "The source identity or session changed.");
    if (issue.Status == HttpStatusCode.Unauthorized)
    {
      GitHubAuthorization.Invalidate(record, connection);
      return Failure("disconnected", "GitHub rejected the connected-user credential.");
    }
    if (!issue.Successful) return Failure(issue.Status is HttpStatusCode.NotFound or HttpStatusCode.Forbidden ? "denied" : "unavailable",
        "The source issue is inaccessible or its response exceeded the 2 MiB read bound.", connection.UserId);
    var value = issue.Value;
    if (value.ValueKind != JsonValueKind.Object || SourceJson.Number(value, "id") is not > 0
        || SourceJson.Number(value, "number") != query.Number || value.TryGetProperty("pull_request", out _))
      return Failure("invalid", "This source record is not the requested ordinary issue.", connection.UserId);
    var id = SourceJson.Number(value, "id")!.Value;
    var count = SourceJson.Number(value, "comments") is >= 0 ? SourceJson.Number(value, "comments") : null;
    var updated = Time(value, "updated_at");
    var snapshot = Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(
        connection.DataScope + ":" + generation.ToString(CultureInfo.InvariantCulture) + ":" + query.Repository.ToLowerInvariant() + ":" + id.ToString(CultureInfo.InvariantCulture) + ":" + updated + ":" + count)));
    if (query.Page > 1 && query.Snapshot != snapshot)
      return Failure("changed", "The source issue changed while paging. Refresh to begin a new bounded snapshot.", connection.UserId);
    var source = "https://github.com/" + query.Repository + "/issues/" + query.Number.ToString(CultureInfo.InvariantCulture);
    var content = new IssueContent(id, query.Number, SourceJson.Text(value, "title") ?? "Untitled source issue",
        SourceJson.Text(value, "body") ?? "", SourceJson.Text(value, "state") ?? "unknown", Actor(value),
        Time(value, "created_at"), updated, Labels(value), source, SourceLabelCatalog.Describe(Labels(value)));
    if (!Live()) return Failure("disconnected", "The source identity or session changed.");
    using var response = await transport.GetAsync(path + "/comments?per_page=100&page="
        + query.Page.ToString(CultureInfo.InvariantCulture), connection.Tokens.Access, guard, cancellationToken).ConfigureAwait(false);
    if (!Live()) return Failure("disconnected", "The source identity or session changed.");
    if (response.Status == HttpStatusCode.Forbidden) return Failure("denied", "Source conversation authority was denied.");
    if (response.Status == HttpStatusCode.Unauthorized)
    {
      GitHubAuthorization.Invalidate(record, connection);
      return Failure("disconnected", "GitHub rejected the connected-user credential.");
    }
    if (!response.Successful || response.Value.ValueKind != JsonValueKind.Array || response.Value.GetArrayLength() > PerPage)
      return new(query.Repository, query.Number, "available", clock.GetUtcNow(), connection.UserId, snapshot, content,
          new("unavailable", [], query.Page, PerPage, count, null, false,
              "Conversation page unavailable or beyond its 2 MiB JSON bound; this is not an empty conversation."), DataScope: connection.DataScope, EvidenceReadAllowed: authority.ActionsRead);
    var rows = response.Value.EnumerateArray().ToArray();
    var mapped = rows.Where(row => SourceJson.Number(row, "id") is > 0 and <= 9_007_199_254_740_991)
        .Select(row => new IssueComment(SourceJson.Number(row, "id")!.Value, SourceJson.Text(row, "body") ?? "", Actor(row),
            row.TryGetProperty("user", out var user) ? SourceJson.Text(user, "type") : null,
            Time(row, "created_at"), Time(row, "updated_at"), source + "#issuecomment-"
            + SourceJson.Number(row, "id")!.Value.ToString(CultureInfo.InvariantCulture))).ToArray();
    var malformed = mapped.Length != rows.Length || mapped.Select(comment => comment.Id).Distinct().Count() != mapped.Length;
    if (malformed) mapped = mapped.DistinctBy(comment => comment.Id).ToArray();
    var end = (query.Page - 1L) * PerPage + rows.Length;
    var complete = !malformed && count is not null && end == count && rows.Length < PerPage;
    var hasMore = rows.Length == PerPage;
    var next = hasMore && query.Page < MaximumPage ? query.Page + 1 : (int?)null;
    var reason = malformed ? "Malformed or duplicate source records were omitted; coverage is incomplete."
        : hasMore && next is null ? "The 10-page / 1,000-comment source-read cap was reached. Inspect the source for later records."
        : !complete && next is null ? "Source count and page coverage do not establish completeness; GitHub pagination is not atomic."
        : "GitHub pagination is not atomic; source and observation times describe each page independently.";
    var result = new IssueContext(query.Repository, query.Number, "available", clock.GetUtcNow(), connection.UserId, snapshot, content,
        new(malformed ? "partial" : "available", mapped, query.Page, PerPage, count, next, complete, reason), DataScope: connection.DataScope, EvidenceReadAllowed: authority.ActionsRead);
    lock (record.Sync)
    {
      if (!Live()) return Failure("disconnected", "The source identity or session changed.");
      // One bounded page per connection, consumed by the separate evidence read.
      connection.EvidencePage = (generation, result);
    }
    return result;
  }

  internal IssueContext? TakeEvidencePage(GetIssueContext query)
  {
    var record = query.Session;
    lock (record.Sync)
    {
      if (!ReferenceEquals(sessions.Get(record.Id), record) || record.GitHub.Current is not { } connection
          || connection.EvidencePage is not { } entry || entry.Generation != record.GitHub.Generation) return null;
      var page = entry.Page;
      if (page.Snapshot != query.Snapshot || !string.Equals(page.Repository, query.Repository, StringComparison.OrdinalIgnoreCase)
          || page.Number != query.Number || page.Conversation?.Page != query.Page) return null;
      connection.EvidencePage = null;
      return clock.GetUtcNow() < page.ObservedAt.AddSeconds(30) ? page : null;
    }
  }

  private static string? Actor(JsonElement value) => value.ValueKind == JsonValueKind.Object
      && value.TryGetProperty("user", out var user) ? SourceJson.Text(user, "login") : null;
  private static string? Time(JsonElement value, string property) => DateTimeOffset.TryParse(SourceJson.Text(value, property),
      CultureInfo.InvariantCulture, DateTimeStyles.None, out var time) ? time.ToUniversalTime().ToString("o", CultureInfo.InvariantCulture) : null;
  private static string[] Labels(JsonElement value) => value.TryGetProperty("labels", out var labels) && labels.ValueKind == JsonValueKind.Array
      ? labels.EnumerateArray().Take(100).Select(row => SourceJson.Text(row, "name")).OfType<string>().ToArray() : [];
}
