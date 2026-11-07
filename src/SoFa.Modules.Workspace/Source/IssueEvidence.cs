using System.Globalization;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using JuanGCarmona.Lighthouse.Cqrs;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record GetIssueEvidence(GetIssueContext Context);
internal sealed record SourceArtifact(string Name, long? Id, bool? Expired, long? CompressedBytes, string Availability);
internal sealed record StageEvidence(long CommentId, string SourceUrl, string Availability, string? Stage = null,
    string? Result = null, string? Gate = null, string? SourceRevision = null, long? RunId = null, int? Attempt = null,
    string? ExecutionStatus = null, string? ExecutionConclusion = null, string? Reason = null,
    IReadOnlyList<string>? MissingEvidence = null, IReadOnlyList<string>? PendingReview = null,
    string? ExecutionRequestId = null, string? Question = null, IReadOnlyList<SourceArtifact>? Artifacts = null);
internal sealed record IssueEvidence(string Availability, DateTimeOffset ObservedAt, IReadOnlyList<StageEvidence> Reports,
    string Scope, string? Reason = null, IReadOnlyList<RelatedPullRequest>? PullRequests = null, string? DataScope = null);

internal sealed partial class GetIssueEvidenceHandler(OwnerSessions sessions, GetIssueContextHandler context,
    GitHubAuthorization authorization, RepositoryAccess access, GitHubTransport transport, TimeProvider clock) : IQueryHandler<GetIssueEvidence, IssueEvidence>
{
  private static readonly string[] ArtifactKinds = ["input", "result"];
  private const string Scope = "At most 10 Lighthouse reports and 10 explicitly referenced PRs from this conversation page. Additional references and other pages may contain more evidence; current command eligibility remains a separate source decision.";
  public async Task<IssueEvidence> Handle(GetIssueEvidence query, CancellationToken cancellationToken)
  {
    var page = string.IsNullOrEmpty(query.Context.Snapshot)
        ? await context.Handle(query.Context, cancellationToken).ConfigureAwait(false)
        : context.TakeEvidencePage(query.Context);
    if (page is null)
    {
      lock (query.Context.Session.Sync)
        return new("unavailable", clock.GetUtcNow(), [], Scope,
            "This page reference was consumed, expired or replaced. Refresh the issue before reading its evidence again.",
            DataScope: query.Context.Session.GitHub.Current?.DataScope);
    }
    if (page.Availability != "available" || page.Conversation?.Availability is not ("available" or "partial"))
      return new(page.Availability, clock.GetUtcNow(), [], Scope, page.Reason ?? page.Conversation?.Reason, DataScope: page.DataScope);
    var record = query.Context.Session;
    var authority = await access.CheckAsync(record, query.Context.Repository, cancellationToken).ConfigureAwait(false);
    if (authority.Availability == SourceAvailability.Denied
        || authority.Availability == SourceAvailability.Available && !authority.IssuesRead)
      return new("denied", clock.GetUtcNow(), [], Scope, "Current repository issue authority was denied.");
    if (authority.Availability != SourceAvailability.Available)
    {
      lock (record.Sync)
        return new(record.GitHub.Current is null ? "disconnected" : "unavailable", clock.GetUtcNow(), [], Scope,
            "Current source authority could not be verified.");
    }
    if (!authority.ActionsRead)
      return new("restricted", clock.GetUtcNow(), [], Scope, "Actions-read access is unavailable; previous execution evidence was removed. Issue context remains available.", DataScope: page.DataScope);
    var connection = await authorization.CurrentAsync(record, cancellationToken).ConfigureAwait(false);
    if (connection is null) return new("disconnected", clock.GetUtcNow(), [], Scope, "The acting account is unavailable.");
    long generation;
    lock (record.Sync) generation = record.GitHub.Generation;
    if (page.DataScope != connection.DataScope)
      return new("disconnected", clock.GetUtcNow(), [], Scope, "The acting account changed during the evidence read.");
    bool Live()
    {
      lock (record.Sync) return ReferenceEquals(sessions.Get(record.Id), record)
          && ReferenceEquals(record.GitHub.Current, connection) && record.GitHub.Generation == generation;
    }
    var guard = new SourceRequestGuard(record.Sync, Live, connection.Stopped.Token);
    using var budget = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    budget.CancelAfter(TimeSpan.FromSeconds(20));
    var reports = new List<StageEvidence>();
    foreach (var comment in page.Conversation.Items.Where(row => row.Author == "github-actions[bot]" && row.AuthorType == "Bot"
        && row.Body.Contains("<!-- lighthouse-actions:", StringComparison.Ordinal)).TakeLast(10))
    {
      if (budget.IsCancellationRequested) { reports.Add(new(comment.Id, comment.SourceUrl, "unavailable", Reason: "The 20-second evidence read budget was reached.")); break; }
      try
      {
        var report = await ReadReport(query.Context.Repository, query.Context.Number, comment, connection, guard, budget.Token).ConfigureAwait(false);
        if (report.Availability == "disconnected")
        {
          GitHubAuthorization.Invalidate(record, connection);
          return new("disconnected", clock.GetUtcNow(), [], Scope, "GitHub rejected the connected-user credential.");
        }
        reports.Add(report);
      }
      catch (OperationCanceledException) { reports.Add(new(comment.Id, comment.SourceUrl, "unavailable", Reason: "Evidence read timed out or was cancelled.")); break; }
    }
    var related = await ReadRelatedPullRequests(query.Context.Repository, page, connection, guard, budget.Token).ConfigureAwait(false);
    if (related.Any(pull => pull.Availability == "disconnected"))
    {
      GitHubAuthorization.Invalidate(record, connection);
      return new("disconnected", clock.GetUtcNow(), [], Scope, "GitHub rejected the connected-user credential.");
    }
    lock (record.Sync)
      if (!ReferenceEquals(sessions.Get(record.Id), record) || !ReferenceEquals(record.GitHub.Current, connection) || record.GitHub.Generation != generation)
        return new("disconnected", clock.GetUtcNow(), [], Scope, "The source identity or authority changed.");
    return new("available", clock.GetUtcNow(), reports, Scope,
        "Published source results and GitHub execution are distinct. Current eligibility, live host leases and absent work are not inferred from this bounded page.", related, connection.DataScope);
  }

  private async Task<StageEvidence> ReadReport(string repository, int number, IssueComment comment,
      GitHubConnection connection, SourceRequestGuard guard, CancellationToken cancellationToken)
  {
    IReadOnlyList<SourceArtifact>? references = null;
    StageEvidence Unknown(string reason, long? run = null, int? attempt = null, string? execution = null, string? conclusion = null) =>
        new(comment.Id, comment.SourceUrl, "unavailable", RunId: run, Attempt: attempt, ExecutionStatus: execution, ExecutionConclusion: conclusion, Reason: reason, Artifacts: references);
    var marker = Regex.Matches(comment.Body, @"<!-- lighthouse-actions:([a-f0-9]{64}) -->");
    var stages = Regex.Matches(comment.Body, @"<!-- lighthouse-stage:([a-z]+):(passed|blocked) -->");
    var links = Regex.Matches(comment.Body, @"\[Workflow run\]\(https://github\.com/" + Regex.Escape(repository) + @"/actions/runs/([1-9][0-9]*)\)", RegexOptions.IgnoreCase);
    if (marker.Count != 1 || stages.Count != 1 || links.Count != 1
        || !long.TryParse(links[0].Groups[1].Value, out var id) || id > 9_007_199_254_740_991)
      return Unknown("Source report markers or repository-local run association are missing or ambiguous.");
    if (!guard.IsLive()) return new(comment.Id, comment.SourceUrl, "disconnected");
    using var run = await transport.GetAsync("/repos/" + repository + "/actions/runs/" + id.ToString(CultureInfo.InvariantCulture), connection.Tokens.Access, guard, cancellationToken).ConfigureAwait(false);
    if (run.Status == HttpStatusCode.Unauthorized) return new(comment.Id, comment.SourceUrl, "disconnected");
    if (!run.Successful || SourceJson.Number(run.Value, "id") != id) return Unknown("Exactly referenced workflow execution is unavailable.", id);
    var attempt = SourceJson.Number(run.Value, "run_attempt");
    var status = SourceJson.Text(run.Value, "status"); var conclusion = SourceJson.Text(run.Value, "conclusion");
    if (attempt is not > 0 or > int.MaxValue) return Unknown("Source run attempt is unavailable.", id, execution: status, conclusion: conclusion);
    if (!guard.IsLive()) return new(comment.Id, comment.SourceUrl, "disconnected");
    using var inventory = await transport.GetAsync("/repos/" + repository + "/actions/runs/" + id.ToString(CultureInfo.InvariantCulture) + "/artifacts?per_page=100", connection.Tokens.Access, guard, cancellationToken).ConfigureAwait(false);
    if (inventory.Status == HttpStatusCode.Unauthorized) return new(comment.Id, comment.SourceUrl, "disconnected");
    if (!inventory.Successful || inventory.Value.ValueKind != JsonValueKind.Object
        || !inventory.Value.TryGetProperty("artifacts", out var artifacts) || artifacts.ValueKind != JsonValueKind.Array
        || artifacts.GetArrayLength() > 100 || SourceJson.Number(inventory.Value, "total_count") != artifacts.GetArrayLength())
      return Unknown("Artifact inventory is unavailable or incomplete; no absence or result is inferred.", id, (int)attempt, status, conclusion);
    var prefix = stages[0].Groups[1].Value == "implement" ? "implement-" : "";
    references = ArtifactKinds.Select(kind =>
    {
      var name = "lighthouse-" + prefix + kind + "-" + number.ToString(CultureInfo.InvariantCulture) + "-" + attempt.Value.ToString(CultureInfo.InvariantCulture);
      var matches = artifacts.EnumerateArray().Where(row => SourceJson.Text(row, "name") == name).ToArray();
      if (matches.Length != 1) return new SourceArtifact(name, null, null, null, matches.Length == 0 ? "missing" : "ambiguous");
      bool? expired = matches[0].TryGetProperty("expired", out var flag) && flag.ValueKind is JsonValueKind.True or JsonValueKind.False ? flag.GetBoolean() : null;
      var size = SourceJson.Number(matches[0], "size_in_bytes");
      return new(name, SourceJson.Number(matches[0], "id"), expired, size,
          expired == true ? "expired" : size > 2 * 1024 * 1024 ? "oversized" : expired is null || size is null ? "unknown" : "available");
    }).ToArray();
    async Task<ArtifactJson> Read(string kind, string member)
    {
      if (!guard.IsLive()) return new("disconnected", "The acting account changed.");
      var name = "lighthouse-" + prefix + kind + "-" + number.ToString(CultureInfo.InvariantCulture) + "-" + attempt.Value.ToString(CultureInfo.InvariantCulture);
      var matches = artifacts.EnumerateArray().Where(row => SourceJson.Text(row, "name") == name).ToArray();
      if (matches.Length != 1 || !matches[0].TryGetProperty("expired", out var expired) || expired.ValueKind != JsonValueKind.False
          || SourceJson.Number(matches[0], "size_in_bytes") is not >= 0 or > 2 * 1024 * 1024
          || SourceJson.Number(matches[0], "id") is not > 0)
        return new("unavailable", "Required artifact is missing, expired, ambiguous or beyond 2 MiB compressed.");
      return await transport.ReadArtifactAsync(repository, SourceJson.Number(matches[0], "id")!.Value, connection.Tokens.Access, member, guard, cancellationToken).ConfigureAwait(false);
    }
    var input = await Read("input", "request.json").ConfigureAwait(false);
    var output = await Read("result", "envelope.json").ConfigureAwait(false);
    if (input.Availability == "disconnected" || output.Availability == "disconnected") return new(comment.Id, comment.SourceUrl, "disconnected");
    if (input.Content is not { } request || output.Content is not { } envelope)
      return Unknown(input.Reason ?? output.Reason ?? "Required source artifact unavailable.", id, (int)attempt, status, conclusion);
    var stage = stages[0].Groups[1].Value; var outcome = stages[0].Groups[2].Value;
    if (request.ValueKind != JsonValueKind.Object || envelope.ValueKind != JsonValueKind.Object)
      return Unknown("Required source JSON objects are malformed.", id, (int)attempt, status, conclusion);
    var revision = SourceJson.Text(request, "sourceRevision");
    var workflowRevision = SourceJson.Text(request, "workflowRevision") ?? revision;
    var expectedPath = request.TryGetProperty("dispatch", out _) ? ".github/workflows/lighthouse-sdlc-" + (SourceJson.Text(request, "worker") ?? stage) + ".lock.yml" : ".github/workflows/lighthouse-sdlc-router.yml";
    if (request.ValueKind != JsonValueKind.Object || envelope.ValueKind != JsonValueKind.Object
        || request.TryGetProperty("schemaVersion", out _) && SourceJson.Number(request, "schemaVersion") is not (1 or 2)
        || SourceJson.Number(envelope, "schemaVersion") != 1
        || request.TryGetProperty("attempt", out _) && SourceJson.Number(request, "attempt") != attempt
        || request.TryGetProperty("repository", out _) && !string.Equals(SourceJson.Text(request, "repository"), repository, StringComparison.OrdinalIgnoreCase)
        || !run.Value.TryGetProperty("repository", out var runRepository)
        || !string.Equals(SourceJson.Text(runRepository, "full_name"), repository, StringComparison.OrdinalIgnoreCase) || SourceJson.Number(request, "issue") != number
        || SourceJson.Text(request, "stage") != stage || SourceJson.Text(request, "runId") != marker[0].Groups[1].Value
        || NumberText(request, "workflowRunId") != id.ToString(CultureInfo.InvariantCulture)
        || !Regex.IsMatch(revision ?? "", "^[a-f0-9]{40}$") || SourceJson.Text(run.Value, "head_sha") != workflowRevision
        || SourceJson.Text(run.Value, "path") != expectedPath || status != "completed" || conclusion != "success"
        || !envelope.TryGetProperty("result", out var result) || result.ValueKind != JsonValueKind.Object
        || SourceJson.Number(result, "schemaVersion") != 1
        || SourceJson.Text(result, "runId") != marker[0].Groups[1].Value || SourceJson.Text(result, "stage") != stage || SourceJson.Text(result, "status") != outcome)
      return Unknown("Report, request, result, source revision or workflow identity does not match the adopted Lighthouse wire format.", id, (int)attempt, status, conclusion);
    if (!await SourceContract.Validate(request, envelope, cancellationToken).ConfigureAwait(false))
      return Unknown("The installed shared Lighthouse validator rejected the source result or is unavailable; no stage result is inferred.", id, (int)attempt, status, conclusion);
    return new(comment.Id, comment.SourceUrl, "available", stage, outcome, SourceJson.Text(result, "gate"), revision, id, (int)attempt,
        status, conclusion, "Published source result; this read does not validate current admission, continuation authority or live host reservation.",
        TextArray(result, "missingEvidence"), TextArray(result, "pendingReview"),
        ExecutionRequestId: SourceJson.Text(request, "runId"), Question: Question(result), Artifacts: references);
  }

  private static string? Question(JsonElement result) => result.TryGetProperty("output", out var output)
      && output.ValueKind == JsonValueKind.Object && output.TryGetProperty("handoff", out var handoff)
      ? SourceJson.Text(handoff, "question") : null;

  private static string? NumberText(JsonElement value, string name) => SourceJson.Text(value, name) ?? SourceJson.Number(value, name)?.ToString(CultureInfo.InvariantCulture);
  private static string[] TextArray(JsonElement value, string name) => value.TryGetProperty(name, out var array) && array.ValueKind == JsonValueKind.Array
      ? array.EnumerateArray().Take(30).Where(item => item.ValueKind == JsonValueKind.String).Select(item => item.GetString()!).ToArray() : [];
}
