using System.Globalization;
using System.Net;
using System.Text.Json;
using JuanGCarmona.Lighthouse.Cqrs;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record GetFactoryPage(OwnerSession Session, string Repository, int Page = 1, int? Number = null);
internal sealed record FactoryIssue(long Id, int Number, string Title, string? State, string? UpdatedAt,
    IReadOnlyList<string> Labels, bool LabelsComplete, string SourceUrl);
internal sealed record FactoryPage(string Repository, string Availability, DateTimeOffset ObservedAt,
    IReadOnlyList<FactoryIssue> Issues, int Page, int SourceRecords, int? NextPage, bool Complete,
    string? DataScope = null, string? ConfiguredBranch = null, string? ObservedBranch = null,
    string? Reason = null);

internal sealed class GetFactoryPageHandler(WorkspaceOptions settings, OwnerSessions sessions,
    GitHubAuthorization authorization, RepositoryAccess access, GitHubTransport transport, TimeProvider clock)
    : IQueryHandler<GetFactoryPage, FactoryPage>
{
  internal const int PerPage = 25;
  internal const int MaximumPage = 10;

  public async Task<FactoryPage> Handle(GetFactoryPage query, CancellationToken cancellationToken)
  {
    var record = query.Session;
    FactoryPage Failure(string availability, string reason) => new(query.Repository, availability, clock.GetUtcNow(),
        [], query.Page, 0, null, false, Reason: reason);
    if (query.Page is < 1 or > MaximumPage || query.Number is <= 0 || query.Number is not null && query.Page != 1)
      return Failure("invalid", "Choose pages1–10 or one positive exact issue number.");
    var authority = await access.CheckAsync(record, query.Repository, cancellationToken).ConfigureAwait(false);
    if (authority.Availability != SourceAvailability.Available || !authority.IssuesRead)
    {
      lock (record.Sync)
        return Failure(record.GitHub.Current is null ? "disconnected"
            : authority.Availability == SourceAvailability.Denied || authority.Availability == SourceAvailability.Available && !authority.IssuesRead ? "denied" : "unavailable",
          "Current repository issue-read authority is missing or could not be verified.");
    }
    var connection = await authorization.CurrentAsync(record, cancellationToken).ConfigureAwait(false);
    if (connection is null) return Failure("disconnected", "Connect and verify the GitHub account.");
    long generation;
    lock (record.Sync) generation = record.GitHub.Generation;
    bool Live()
    {
      lock (record.Sync) return ReferenceEquals(sessions.Get(record.Id), record)
          && ReferenceEquals(record.GitHub.Current, connection) && record.GitHub.Generation == generation;
    }
    var guard = new SourceRequestGuard(record.Sync, Live, connection.Stopped.Token);
    using var budget = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    budget.CancelAfter(TimeSpan.FromSeconds(30));
    try
    {
      using var metadata = await transport.GetAsync("/repos/" + query.Repository, connection.Tokens.Access, guard, budget.Token).ConfigureAwait(false);
      if (!Live()) return Failure("disconnected", "The source account or session changed.");
      if (metadata.Status == HttpStatusCode.Unauthorized)
      {
        GitHubAuthorization.Invalidate(record, connection);
        return Failure("disconnected", "GitHub rejected the source credential.");
      }
      if (!metadata.Successful || !string.Equals(SourceJson.Text(metadata.Value, "full_name"), query.Repository, StringComparison.OrdinalIgnoreCase))
        return Failure(metadata.Status is HttpStatusCode.Forbidden or HttpStatusCode.NotFound ? "denied" : "unavailable",
            "Repository metadata is unavailable; no empty backlog is inferred.");
      var path = "/repos/" + query.Repository + "/issues" + (query.Number is { } number
          ? "/" + number.ToString(CultureInfo.InvariantCulture)
          : "?state=all&sort=updated&direction=desc&per_page=25&page=" + query.Page.ToString(CultureInfo.InvariantCulture));
      using var source = await transport.GetAsync(path, connection.Tokens.Access, guard, budget.Token).ConfigureAwait(false);
      if (!Live()) return Failure("disconnected", "The source account or session changed.");
      if (source.Status == HttpStatusCode.Unauthorized)
      {
        GitHubAuthorization.Invalidate(record, connection);
        return Failure("disconnected", "GitHub rejected the source credential.");
      }
      if (query.Number is not null && source.Status == HttpStatusCode.NotFound)
        return Failure("unavailable", "The exact issue was not found or is not visible; repository authority and issue existence remain separate.");
      if (!source.Successful) return Failure(source.Status is HttpStatusCode.Forbidden or HttpStatusCode.NotFound ? "denied" : "unavailable",
          "Issue collection is unavailable or exceeded the2MiB response limit; this is not an empty result.");
      JsonElement[] rows;
      if (query.Number is not null && source.Value.ValueKind == JsonValueKind.Object) rows = [source.Value];
      else if (query.Number is null && source.Value.ValueKind == JsonValueKind.Array && source.Value.GetArrayLength() <= PerPage)
        rows = source.Value.EnumerateArray().ToArray();
      else return Failure("unavailable", "The source returned an invalid issue collection.");
      var issues = new List<FactoryIssue>();
      foreach (var row in rows)
      {
        if (row.ValueKind != JsonValueKind.Object) return Failure("unavailable", "A source record is malformed; coverage is unknown.");
        if (row.TryGetProperty("pull_request", out _))
        {
          if (query.Number is not null) return Failure("invalid", "The requested number is a pull request, not an ordinary issue.");
          continue;
        }
        if (SourceJson.Number(row, "id") is not (> 0 and <= 9_007_199_254_740_991)
            || SourceJson.Number(row, "number") is not (> 0 and <= int.MaxValue)
            || query.Number is { } requested && SourceJson.Number(row, "number") != requested
            || SourceJson.Text(row, "title") is not { Length: <= 1024 } title)
          return Failure("unavailable", "A source issue identity/title is malformed; records were not silently omitted.");
        var issueNumber = (int)SourceJson.Number(row, "number")!.Value;
        var labels = row.TryGetProperty("labels", out var collection) && collection.ValueKind == JsonValueKind.Array
            ? collection.EnumerateArray().Take(100).Select(l => SourceJson.Text(l, "name")).Where(l => l is { Length: <= 256 }).OfType<string>().ToArray() : [];
        var labelsComplete = collection.ValueKind == JsonValueKind.Array && collection.GetArrayLength() <= 100 && labels.Length == collection.GetArrayLength();
        var updated = DateTimeOffset.TryParse(SourceJson.Text(row, "updated_at"), CultureInfo.InvariantCulture,
            DateTimeStyles.None, out var time) ? time.ToUniversalTime().ToString("o", CultureInfo.InvariantCulture) : null;
        issues.Add(new(SourceJson.Number(row, "id")!.Value, issueNumber, title, SourceJson.Text(row, "state") is { Length: <= 64 } state ? state : null, updated,
            labels, labelsComplete, "https://github.com/" + query.Repository + "/issues/" + issueNumber.ToString(CultureInfo.InvariantCulture)));
      }
      var complete = query.Number is not null || rows.Length < PerPage;
      var next = !complete && query.Page < MaximumPage ? query.Page + 1 : (int?)null;
      lock (record.Sync)
        return Live() ? new(query.Repository, "available", clock.GetUtcNow(), issues, query.Page, rows.Length, next, complete,
            connection.DataScope, settings.RepositoryBranches.GetValueOrDefault(query.Repository), SourceJson.Text(metadata.Value, "default_branch") is { Length: <= 255 } branch ? branch : null,
            "Live updated-order pages are not an atomic backlog snapshot. Search/filters cover collected rows; PR records count toward source-page coverage. At most10pages/250source records per repository; exact-number lookup is separate.")
            : Failure("disconnected", "The source account or session changed.");
    }
    catch (OperationCanceledException)
    {
      return Failure(Live() ? "unavailable" : "disconnected", "The bounded source read ended; no empty backlog is inferred.");
    }
  }
}
