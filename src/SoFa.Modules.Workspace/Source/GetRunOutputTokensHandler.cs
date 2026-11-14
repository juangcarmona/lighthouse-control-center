using System.Globalization;
using System.Net;
using System.Text.Json;
using JuanGCarmona.Lighthouse.Cqrs;
using JuanGCarmona.SoFa.Modules.Workspace;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record GetRunOutputTokens(OwnerSession Session, string Repository, long RunId, long Attempt);
internal sealed record RunOutputTokens(string Repository, long RunId, long Attempt, string Availability,
    long? OutputTokens, string? SourceUrl, string? Revision, DateTimeOffset ObservedAt,
    DateTimeOffset? SourceUpdatedAt = null, string? Reason = null);

internal sealed class GetRunOutputTokensHandler(WorkspaceOptions settings, OwnerSessions sessions, GitHubAuthorization authorization,
    RepositoryAccess access, GitHubTransport transport, TimeProvider clock)
    : IQueryHandler<GetRunOutputTokens, RunOutputTokens>
{
  private const long MaxSafeInteger = 9_007_199_254_740_991;
  private static readonly TimeSpan Retention = TimeSpan.FromDays(14);

  public async Task<RunOutputTokens> Handle(GetRunOutputTokens query, CancellationToken cancellationToken)
  {
    RunOutputTokens Failure(string availability, string reason) => new(query.Repository, query.RunId, query.Attempt,
        availability, null, null, null, clock.GetUtcNow(), Reason: reason);
    if (query.RunId is <= 0 or > MaxSafeInteger || query.Attempt is <= 0 or > MaxSafeInteger
        || !IsRepository(query.Repository)) return Failure("unavailable", "Choose a configured repository and exact positive run and attempt.");

    using var budget = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, query.Session.Stopped.Token);
    budget.CancelAfter(TimeSpan.FromSeconds(25));
    try
    {
      var authority = await access.CheckAsync(query.Session, query.Repository, budget.Token).ConfigureAwait(false);
      if (authority.Availability != SourceAvailability.Available || !authority.ActionsRead)
      {
        var state = authority.Availability == SourceAvailability.Denied
            || authority.Availability == SourceAvailability.Available && !authority.ActionsRead ? "denied"
            : query.Session.GitHub.Current is null ? "disconnected" : "unavailable";
        return Failure(state, "Current connected-user Actions read authority could not be confirmed.");
      }
      var connection = await authorization.CurrentAsync(query.Session, budget.Token).ConfigureAwait(false);
      if (connection is null || connection.DataScope != authority.DataScope)
        return Failure("disconnected", "The connected GitHub identity changed during the read.");
      bool Live()
      {
        lock (query.Session.Sync) return ReferenceEquals(sessions.Get(query.Session.Id), query.Session)
            && ReferenceEquals(query.Session.GitHub.Current, connection)
            && query.Session.GitHub.Generation == authority.Generation && connection.DataScope == authority.DataScope;
      }
      var guard = new SourceRequestGuard(query.Session.Sync, Live, connection.Stopped.Token);
      var runPath = "/repos/" + query.Repository + "/actions/runs/" + query.RunId.ToString(CultureInfo.InvariantCulture)
          + "/attempts/" + query.Attempt.ToString(CultureInfo.InvariantCulture);
      using var run = await transport.GetAsync(runPath, connection.Tokens.Access, guard, budget.Token).ConfigureAwait(false);
      if (run.Status == HttpStatusCode.Unauthorized)
      {
        GitHubAuthorization.Invalidate(query.Session, connection);
        return Failure("disconnected", "GitHub rejected the connected-user credential.");
      }
      if (!run.Successful) return Failure("unavailable", "GitHub did not return this exact workflow run attempt.");
      var revision = SourceJson.Text(run.Value, "head_sha");
      var runRepository = run.Value.TryGetProperty("repository", out var repositoryValue) ? SourceJson.Text(repositoryValue, "full_name") : null;
      if (!Live()) return Failure("disconnected", "The connected account or source scope changed.");
      if (SourceJson.Number(run.Value, "id") != query.RunId || SourceJson.Number(run.Value, "run_attempt") != query.Attempt
          || !string.Equals(runRepository, query.Repository, StringComparison.OrdinalIgnoreCase)
          || !ValidRevision(revision)) return Failure("unavailable", "Workflow run identity, attempt or revision did not match the request.");

      using var inventory = await transport.GetAsync("/repos/" + query.Repository + "/actions/runs/"
          + query.RunId.ToString(CultureInfo.InvariantCulture) + "/artifacts?per_page=100", connection.Tokens.Access, guard, budget.Token).ConfigureAwait(false);
      if (inventory.Status == HttpStatusCode.Unauthorized)
      {
        GitHubAuthorization.Invalidate(query.Session, connection);
        return Failure("disconnected", "GitHub rejected the connected-user credential.");
      }
      if (!inventory.Successful || inventory.Value.ValueKind != JsonValueKind.Object
          || !inventory.Value.TryGetProperty("artifacts", out var artifacts) || artifacts.ValueKind != JsonValueKind.Array
          || artifacts.GetArrayLength() > 100 || SourceJson.Number(inventory.Value, "total_count") is not { } total
          || total < artifacts.GetArrayLength() || total > 100)
        return Failure("unavailable", "The bounded Actions artifact inventory is incomplete or malformed.");

      var expectedName = "lighthouse-" + query.RunId.ToString(CultureInfo.InvariantCulture) + "-" + query.Attempt.ToString(CultureInfo.InvariantCulture);
      var matches = artifacts.EnumerateArray().Where(row => SourceJson.Text(row, "name") == expectedName).ToArray();
      if (matches.Length != 1) return Failure("unavailable", "The exact telemetry artifact is missing or ambiguous.");
      var artifact = matches[0];
      var now = clock.GetUtcNow();
      var createdAt = Timestamp(artifact, "created_at");
      var expiresAt = Timestamp(artifact, "expires_at");
      var artifactRunId = artifact.TryGetProperty("workflow_run", out var workflowRun) ? SourceJson.Number(workflowRun, "id") : null;
      if (SourceJson.Number(artifact, "id") is not (> 0 and <= MaxSafeInteger)
          || !artifact.TryGetProperty("expired", out var expired) || expired.ValueKind != JsonValueKind.False
          || artifactRunId != query.RunId || createdAt is null || expiresAt is null || createdAt > now
          || now - createdAt > Retention || expiresAt <= now || expiresAt - createdAt > Retention
          || SourceJson.Number(artifact, "size_in_bytes") is not (>= 0 and <= 2 * 1024 * 1024))
        return Failure("unavailable", "The exact telemetry artifact is expired, outside its 14-day retention or not bound to this workflow run.");

      var evidence = await transport.ReadTelemetryArtifactAsync(query.Repository, SourceJson.Number(artifact, "id")!.Value,
          connection.Tokens.Access, guard, budget.Token).ConfigureAwait(false);
      if (evidence.Usage.Availability == "disconnected" || evidence.Records.Availability == "disconnected")
      {
        GitHubAuthorization.Invalidate(query.Session, connection);
        return Failure("disconnected", "GitHub rejected the connected-user credential.");
      }
      if (!Live()) return Failure("disconnected", "The connected account or source scope changed.");
      if (evidence.Usage.Content is not { } usage || evidence.Records.Content is not { } records
          || !ValidUsage(usage, out var outputTokens) || !ValidCorrelations(records, query.Repository, query.RunId, query.Attempt, revision!, out _))
        return Failure("unavailable", "The exact artifact does not contain complete, matching OpenCode token and run-correlation evidence.");
      return new(query.Repository, query.RunId, query.Attempt, "available", outputTokens,
          "https://github.com/" + query.Repository + "/actions/runs/" + query.RunId.ToString(CultureInfo.InvariantCulture)
            + "/attempts/" + query.Attempt.ToString(CultureInfo.InvariantCulture), revision, now, Timestamp(run.Value, "updated_at"));
    }
    catch (OperationCanceledException)
    { return Failure(query.Session.Stopped.IsCancellationRequested ? "disconnected" : "unavailable", "The exact source read was cancelled or exceeded its deadline."); }
  }

  internal static bool ValidUsage(JsonElement usage, out long outputTokens)
  {
    outputTokens = 0;
    var reportedOutputTokens = usage.ValueKind == JsonValueKind.Object && usage.TryGetProperty("tokens", out var tokenFields)
        ? SourceJson.Number(tokenFields, "outputTokens") : null;
    if (usage.ValueKind != JsonValueKind.Object || SourceJson.Number(usage, "schemaVersion") != 1
        || SourceJson.Text(usage, "source") != "opencode-native" || SourceJson.Text(usage, "coverage") != "observed"
        || !usage.TryGetProperty("tokens", out var tokens) || tokens.ValueKind != JsonValueKind.Object
        || reportedOutputTokens is not (>= 0 and <= MaxSafeInteger)) return false;
    outputTokens = reportedOutputTokens.Value;
    return true;
  }

  internal static bool ValidCorrelations(JsonElement records, string repository, long runId, long attempt,
      string revision, out string? sessionId)
  {
    sessionId = null;
    if (records.ValueKind != JsonValueKind.Array || records.GetArrayLength() is 0 or > 10_000) return false;
    string? boundIssue = null;
    foreach (var row in records.EnumerateArray())
    {
      if (row.ValueKind != JsonValueKind.Object || SourceJson.Number(row, "schemaVersion") != 1 || !row.TryGetProperty("correlation", out var correlation)
          || correlation.ValueKind != JsonValueKind.Object
          || !string.Equals(SourceJson.Text(correlation, "repository"), repository, StringComparison.OrdinalIgnoreCase)
          || SourceJson.Text(correlation, "issue") is not { Length: > 0 and <= 10 } issue
          || !int.TryParse(issue, NumberStyles.None, CultureInfo.InvariantCulture, out var parsedIssueNumber) || parsedIssueNumber <= 0
          || !string.Equals(SourceJson.Text(correlation, "revision"), revision, StringComparison.OrdinalIgnoreCase)
          || SourceJson.Text(correlation, "workflowRunId") != runId.ToString(CultureInfo.InvariantCulture)
          || SourceJson.Text(correlation, "workflowAttempt") != attempt.ToString(CultureInfo.InvariantCulture)
          || SourceJson.Text(correlation, "sessionId") is not { Length: > 0 and <= 256 } currentSession) return false;
      var parsedIssue = SourceJson.Text(correlation, "issue")!;
      if (boundIssue is not null && boundIssue != parsedIssue) return false;
      boundIssue = parsedIssue;
      if (sessionId is not null && sessionId != currentSession) return false;
      sessionId = currentSession;
    }
    return sessionId is not null;
  }

  private bool IsRepository(string repository) => repository.Contains('/')
      && settings.Repositories.Contains(repository, StringComparer.OrdinalIgnoreCase);

  private static bool ValidRevision(string? value) => value is { Length: 40 or 64 } && value.All(Uri.IsHexDigit);

  private static DateTimeOffset? Timestamp(JsonElement value, string name) => DateTimeOffset.TryParse(SourceJson.Text(value, name),
      CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsed) ? parsed.ToUniversalTime() : null;
}
