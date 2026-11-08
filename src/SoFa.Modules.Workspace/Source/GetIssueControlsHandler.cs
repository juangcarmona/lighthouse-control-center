using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using JuanGCarmona.Lighthouse.Cqrs;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record GetIssueControls(OwnerSession Session, string Repository, int Number);
internal sealed record IssueControlObservation(string Repository, int Number, string Availability, DateTimeOffset ObservedAt,
    string? DataScope = null, long? ActingUserId = null, JsonElement? Facts = null, string? Reason = null,
    IReadOnlyList<string>? MissingReadScopes = null, bool SubmissionAvailable = false);

internal sealed class GetIssueControlsHandler(WorkspaceOptions settings, OwnerSessions sessions, GitHubAuthorization authorization,
    RepositoryAccess access, GitHubTransport transport, SourceControlBridge bridge, TimeProvider clock)
    : IQueryHandler<GetIssueControls, IssueControlObservation>
{
  public async Task<IssueControlObservation> Handle(GetIssueControls query, CancellationToken cancellationToken)
  {
    var record = query.Session;
    IssueControlObservation Failure(string availability, string reason)
    {
      lock (record.Sync) return new(query.Repository, query.Number, availability, clock.GetUtcNow(),
          record.GitHub.Current?.DataScope, record.GitHub.Current?.UserId, Reason: reason);
    }
    if (query.Number <= 0 || !settings.Repositories.Contains(query.Repository, StringComparer.OrdinalIgnoreCase))
      return Failure("invalid", "Choose a configured repository and positive issue number.");
    if (settings.GitHubAppId is null) return Failure("unsupported", "Configure the intended GitHub App ID before inspecting shared control authority.");
    using var budget = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    budget.CancelAfter(TimeSpan.FromSeconds(20));
    var connection = await authorization.CurrentAsync(record, budget.Token).ConfigureAwait(false);
    if (connection is null) return Failure("disconnected", "Connect and verify the acting GitHub user.");
    long generation;
    lock (record.Sync) generation = record.GitHub.Generation;
    bool Live()
    {
      lock (record.Sync) return ReferenceEquals(sessions.Get(record.Id), record)
          && ReferenceEquals(record.GitHub.Current, connection) && record.GitHub.Generation == generation;
    }
    var guard = new SourceRequestGuard(record.Sync, Live, connection.Stopped.Token);
    bool SameScope(RepositoryAuthority value) => value.Controls is { } controls
        && controls.Generation == generation && controls.DataScope == connection.DataScope;
    var authority = await access.CheckControlsAsync(record, query.Repository, budget.Token).ConfigureAwait(false);
    if (!Live()) return Failure("disconnected", "The source account or owner session changed.");
    if (authority.Availability == SourceAvailability.Denied || authority.Availability == SourceAvailability.Available && !authority.IssuesRead)
      return Failure("denied", "Current connected-user issue authority was denied.");
    if (authority.Availability != SourceAvailability.Available || !SameScope(authority))
      return Failure("unavailable", "The intended App installation and repository identity could not be verified.");
    var controls = authority.Controls!;

    async Task<ControlCallbackResult> Callback(JsonElement value, CancellationToken token)
    {
      if (!Live()) return new(false, Status: 409);
      var kind = SourceJson.Text(value, "kind");
      if (kind == "authority")
      {
        if (!Fields(value, "actorId", "repositoryId") || SourceJson.Number(value, "actorId") != connection.UserId
            || SourceJson.Number(value, "repositoryId") != controls.RepositoryId) throw new InvalidDataException("Invalid source authority callback.");
        var current = await access.CheckControlsAsync(record, query.Repository, token).ConfigureAwait(false);
        if (!Live() || current.Availability != SourceAvailability.Available || !current.IssuesRead || !SameScope(current)
            || current.Controls!.RepositoryId != controls.RepositoryId) return new(false, Status: 403);
        return new(true, new
        {
          actorId = connection.UserId,
          repositoryId = controls.RepositoryId,
          commentWrite = current.Controls.CommentWrite,
          dispatchWrite = current.Controls.DispatchWrite
        });
      }
      if (kind == "artifact")
      {
        if (!Fields(value, "artifactId", "member") || SourceJson.Number(value, "artifactId") is not > 0 or > 9_007_199_254_740_991
            || SourceJson.Text(value, "member") is not ("request.json" or "envelope.json" or "result.json"))
          throw new InvalidDataException("Invalid source artifact callback.");
        if (controls.ActionsRead != true) return new(false, Status: controls.ActionsRead == false ? 403 : 503);
        var content = await transport.ReadArtifactAsync(query.Repository, SourceJson.Number(value, "artifactId")!.Value,
            connection.Tokens.Access, SourceJson.Text(value, "member")!, guard, token).ConfigureAwait(false);
        if (content.Availability == "disconnected") GitHubAuthorization.Invalidate(record, connection);
        return content.Availability == "available" ? new(true, content.Content) : new(false, Status: content.Availability == "disconnected" ? 401 : 503);
      }
      if (kind != "transport" || !Fields(value, "scope", "path") || SourceJson.Text(value, "path") is not { } path)
        throw new InvalidDataException("Invalid source transport callback.");
      string target;
      if (SourceJson.Text(value, "scope") == "account" && path == "user") target = "/user";
      else if (SourceJson.Text(value, "scope") == "repository" && ControlReadPaths.Allowed(path))
      {
        var permission = path.StartsWith("contents/", StringComparison.Ordinal) || path.StartsWith("commits/", StringComparison.Ordinal) ? controls.ContentsRead
            : path.StartsWith("pulls", StringComparison.Ordinal) ? controls.PullRequestsRead
            : path.StartsWith("actions/variables/", StringComparison.Ordinal) ? controls.VariablesRead
            : path.StartsWith("actions/", StringComparison.Ordinal) ? controls.ActionsRead : true;
        if (permission != true) return new(false, Status: permission == false ? 403 : 503);
        target = "/repos/" + query.Repository + (path.Length == 0 ? "" : "/" + path);
      }
      else throw new InvalidDataException("Unsupported source read path.");
      using var response = await transport.GetAsync(target, connection.Tokens.Access, guard, token).ConfigureAwait(false);
      if (response.Status == HttpStatusCode.Unauthorized) GitHubAuthorization.Invalidate(record, connection);
      if (!Live()) return new(false, Status: 409);
      if (!response.Successful) return new(false, Status: (int)response.Status);
      if (target == "/user" && (SourceJson.Number(response.Value, "id") != connection.UserId || SourceJson.Text(response.Value, "type") != "User"))
      { GitHubAuthorization.Invalidate(record, connection); return new(false, Status: 401); }
      if (path.Length == 0 && (SourceJson.Number(response.Value, "id") != controls.RepositoryId
          || !string.Equals(SourceJson.Text(response.Value, "full_name"), query.Repository, StringComparison.OrdinalIgnoreCase)))
        return new(false, Status: 409);
      return new(true, response.Value.Clone());
    }

    var observation = await bridge.Observe(query.Repository, query.Number, Callback, budget.Token).ConfigureAwait(false);
    if (!Live()) return Failure("disconnected", "The source account or owner session changed.");
    var final = await access.CheckControlsAsync(record, query.Repository, budget.Token).ConfigureAwait(false);
    if (!Live()) return Failure("disconnected", "The source account or owner session changed.");
    if (final.Availability == SourceAvailability.Denied || final.Availability == SourceAvailability.Available && !final.IssuesRead)
      return Failure("denied", "Current connected-user authority was denied; earlier shared control facts are removed.");
    if (final.Availability != SourceAvailability.Available || !SameScope(final))
      return Failure("unavailable", "Current source authority could not be reverified.");
    if (final.Controls != controls) return Failure("denied", "App or repository grants changed during the observation; refresh current source facts.");
    if (observation.Availability == "available" && (observation.Facts is not { } facts
        || !facts.TryGetProperty("actor", out var actor) || SourceJson.Number(actor, "id") != connection.UserId
        || !facts.TryGetProperty("repository", out var repo) || SourceJson.Number(repo, "id") != controls.RepositoryId
        || !string.Equals(SourceJson.Text(repo, "name"), query.Repository, StringComparison.OrdinalIgnoreCase)
        || !facts.TryGetProperty("issue", out var issue) || SourceJson.Number(issue, "number") != query.Number))
      return Failure("unavailable", "The shared observation did not preserve its acting user and source identity.");
    var missing = new[] { ("contents", controls.ContentsRead), ("pull_requests", controls.PullRequestsRead),
      ("variables", controls.VariablesRead), ("actions", controls.ActionsRead) }.Where(item => item.Item2 != true).Select(item => item.Item1).ToArray();
    return new(query.Repository, query.Number, observation.Availability, clock.GetUtcNow(), connection.DataScope,
        connection.UserId, observation.Facts, observation.Reason, missing);
  }

  private static bool Fields(JsonElement value, string first, string second) => value.EnumerateObject().Count() == 5
      && value.EnumerateObject().All(property => property.Name is "type" or "id" or "kind" || property.Name == first || property.Name == second);
}

internal static class ControlReadPaths
{
  private const string Reads = @"^(?:issues/[1-9][0-9]*(?:/comments\?per_page=100&page=[1-9][0-9]*)?|issues/comments/[1-9][0-9]*|pulls\?state=open&per_page=100|pulls/[1-9][0-9]*(?:/(?:reviews|commits|files)\?per_page=100(?:&page=[1-9][0-9]*)?)?|commits/[^/?#\\\s]{1,768}|contents/(?:\.lighthouse/(?:reconciliation/)?[a-z0-9_.-]+\.json|\.github/workflows/[A-Za-z0-9_.-]+\.(?:yml|md)|openspec/changes/issue-[1-9][0-9]*-proposal)\?ref=[a-f0-9]{40}|actions/variables/LIGHTHOUSE_(?:AUTOMATION_ENABLED|EPIC_ENABLED)|actions/runs/[1-9][0-9]*(?:/attempts/[1-9][0-9]*)?(?:/(?:jobs|artifacts)\?per_page=100(?:&page=[1-9][0-9]*)?)?|actions/artifacts\?name=lighthouse-[a-z0-9-]{1,190}&per_page=100|actions/workflows/[A-Za-z0-9_.-]+\.yml/runs\?status=(?:queued|in_progress|waiting|requested|pending)&per_page=100)$";
  internal static bool Allowed(string path)
  {
    if (path.Length == 0) return true;
    if (path.Length > 2048 || path.Any(character => char.IsControl(character) || character == '\\') || path.StartsWith('/') || path.Contains('#')) return false;
    try
    {
      var decoded = Uri.UnescapeDataString(Uri.UnescapeDataString(path));
      if (decoded.Contains("..", StringComparison.Ordinal) || decoded.Contains('\\') || decoded.Any(char.IsControl)) return false;
      return Regex.IsMatch(path, Reads, RegexOptions.CultureInvariant | RegexOptions.NonBacktracking, TimeSpan.FromMilliseconds(100));
    }
    catch (UriFormatException) { return false; }
  }
}
