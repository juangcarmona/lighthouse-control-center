using System.Globalization;
using System.Net;
using System.Text.Json;
using JuanGCarmona.Lighthouse.Cqrs;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record GetCoverageEvidence(OwnerSession Session, string Repository);
internal sealed record CoverageEvidence(string Availability, DateTimeOffset ObservedAt, string? Reason = null,
    long? LinesCovered = null, long? LinesValid = null, double? Percentage = null, long? RunId = null,
    long? Attempt = null, string? SourceCommit = null, string? TestedCommit = null, string? RunUrl = null,
    string? Scope = null, string? DataScope = null);

internal sealed class GetCoverageEvidenceHandler(WorkspaceOptions settings, OwnerSessions sessions, GitHubAuthorization authorization,
    RepositoryAccess access, GitHubTransport transport, TimeProvider clock) : IQueryHandler<GetCoverageEvidence, CoverageEvidence>
{
  private const string Workflow = ".github/workflows/verify.yml";
  private const string ArtifactPrefix = "lighthouse-coverage-";
  private const string Scope = "SoFa.Web.Tests exercising SoFa.Modules.Workspace and SoFa.Web";
  private const long MaximumArtifactBytes = 512 * 1024;

  public async Task<CoverageEvidence> Handle(GetCoverageEvidence query, CancellationToken cancellationToken)
  {
    var record = query.Session;
    CoverageEvidence Unknown(string reason, string availability = "unknown") => new(availability, clock.GetUtcNow(), reason);
    if (!settings.Repositories.Contains(query.Repository, StringComparer.OrdinalIgnoreCase)
        || !System.Text.RegularExpressions.Regex.IsMatch(query.Repository, "^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$"))
      return Unknown("Choose a configured repository.", "denied");

    var authority = await access.CheckAsync(record, query.Repository, cancellationToken).ConfigureAwait(false);
    if (authority.Availability == SourceAvailability.Denied || authority.Availability == SourceAvailability.Available && !authority.ActionsRead)
      return Unknown("Current GitHub Actions read permission is not available.", "denied");
    if (authority.Availability != SourceAvailability.Available) return Unknown("Current GitHub source authority could not be verified.");
    var connection = await authorization.CurrentAsync(record, cancellationToken).ConfigureAwait(false);
    if (connection is null) return Unknown("Connect and verify the GitHub account.", "disconnected");
    long generation;
    lock (record.Sync) generation = record.GitHub.Generation;
    bool Live()
    {
      lock (record.Sync) return ReferenceEquals(sessions.Get(record.Id), record)
          && ReferenceEquals(record.GitHub.Current, connection) && record.GitHub.Generation == generation;
    }
    var guard = new SourceRequestGuard(record.Sync, Live, connection.Stopped.Token);
    GitHubResponse? runs = null;
    try
    {
      using var currentRepository = await transport.GetAsync("/repos/" + query.Repository, connection.Tokens.Access, guard, cancellationToken).ConfigureAwait(false);
      if (currentRepository.Status == HttpStatusCode.Unauthorized) GitHubAuthorization.Invalidate(record, connection);
      var repositoryId = SourceJson.Number(currentRepository.Value, "id");
      if (!currentRepository.Successful || repositoryId is not (> 0 and <= 9_007_199_254_740_991)
          || !string.Equals(SourceJson.Text(currentRepository.Value, "full_name"), query.Repository, StringComparison.OrdinalIgnoreCase))
        return Unknown("The current numeric repository identity could not be verified.");
      runs = await transport.GetAsync("/repos/" + query.Repository + "/actions/workflows/verify.yml/runs?per_page=1",
          connection.Tokens.Access, guard, cancellationToken).ConfigureAwait(false);
      if (runs.Status == HttpStatusCode.Unauthorized) GitHubAuthorization.Invalidate(record, connection);
      if (!runs.Successful || !runs.Value.TryGetProperty("workflow_runs", out var rows) || rows.ValueKind != JsonValueKind.Array
          || rows.GetArrayLength() != 1 || SourceJson.Number(runs.Value, "total_count") < 1)
        return Unknown("The latest repository verification run is unavailable; coverage is unknown.");
      var run = rows[0];
      var runId = SourceJson.Number(run, "id");
      var attempt = SourceJson.Number(run, "run_attempt");
      var sourceCommit = SourceJson.Text(run, "head_sha");
      if (runId is not (> 0 and <= 9_007_199_254_740_991) || attempt is not (> 0 and <= 9_007_199_254_740_991)
          || SourceJson.Text(run, "path") != Workflow || SourceJson.Text(run, "status") != "completed"
          || !Sha(sourceCommit) || !run.TryGetProperty("repository", out var repo)
          || SourceJson.Number(repo, "id") != repositoryId
          || !string.Equals(SourceJson.Text(repo, "full_name"), query.Repository, StringComparison.OrdinalIgnoreCase))
        return Unknown("The latest verification run does not provide a complete repository, commit, run and attempt identity.");

      using var inventory = await transport.GetAsync("/repos/" + query.Repository + "/actions/runs/" + runId.Value.ToString(CultureInfo.InvariantCulture)
          + "/artifacts?per_page=100", connection.Tokens.Access, guard, cancellationToken).ConfigureAwait(false);
      if (inventory.Status == HttpStatusCode.Unauthorized) GitHubAuthorization.Invalidate(record, connection);
      if (!inventory.Successful || !inventory.Value.TryGetProperty("artifacts", out var artifacts) || artifacts.ValueKind != JsonValueKind.Array
          || artifacts.GetArrayLength() > 100 || SourceJson.Number(inventory.Value, "total_count") != artifacts.GetArrayLength())
        return Unknown("The complete artifact inventory for the exact run could not be verified.");
      var name = ArtifactPrefix + runId.Value.ToString(CultureInfo.InvariantCulture) + "-" + attempt.Value.ToString(CultureInfo.InvariantCulture);
      var matches = artifacts.EnumerateArray().Where(item => SourceJson.Text(item, "name") == name).ToArray();
      if (matches.Length != 1 || SourceJson.Number(matches[0], "id") is not (> 0 and <= 9_007_199_254_740_991)
          || !matches[0].TryGetProperty("expired", out var expired) || expired.ValueKind != JsonValueKind.False
          || SourceJson.Number(matches[0], "size_in_bytes") is not (> 0 and <= MaximumArtifactBytes))
        return Unknown("The report for the exact CI attempt is missing, expired, ambiguous or too large.");
      var artifactId = SourceJson.Number(matches[0], "id")!.Value;
      var artifact = await transport.ReadArtifactAsync(query.Repository, artifactId, connection.Tokens.Access, "coverage.json", guard, cancellationToken).ConfigureAwait(false);
      if (artifact.Availability == "disconnected") GitHubAuthorization.Invalidate(record, connection);
      if (artifact.Availability != "available" || artifact.Content is not { } report)
        return Unknown("The exact-attempt coverage report could not be read.");
      return ValidateReport(report, query.Repository, repositoryId.Value, runId.Value, attempt.Value,
          sourceCommit!, SourceJson.Text(run, "html_url"), connection.DataScope, clock.GetUtcNow());
    }
    catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
    { return Unknown("Coverage source read timed out; current evidence is unknown."); }
    finally { runs?.Dispose(); }
  }

  internal static CoverageEvidence ValidateReport(JsonElement report, string repository, long repositoryId,
      long runId, long attempt, string sourceCommit, string? runUrl, string dataScope, DateTimeOffset observedAt)
  {
    CoverageEvidence Unknown(string reason) => new("unknown", observedAt, reason, DataScope: dataScope);
    if (report.ValueKind != JsonValueKind.Object || SourceJson.Number(report, "schemaVersion") != 1
        || SourceJson.Text(report, "definitionVersion") != "coverage-lines-v1"
        || SourceJson.Text(report, "repository") != repository || SourceJson.Number(report, "repositoryId") != repositoryId
        || SourceJson.Number(report, "runId") != runId || SourceJson.Number(report, "attempt") != attempt
        || SourceJson.Text(report, "sourceHeadCommit") != sourceCommit || !Sha(SourceJson.Text(report, "testedCommit"))
        || SourceJson.Text(report, "workflowPath") != Workflow || SourceJson.Text(report, "scope") != Scope
        || SourceJson.Text(report, "tool") != "coverlet.collector 6.0.4 / Cobertura"
        || !Uri.TryCreate(runUrl, UriKind.Absolute, out var url) || url.Scheme != "https" || url.Host != "github.com"
        || url.UserInfo.Length != 0 || url.Query.Length != 0 || url.Fragment.Length != 0
        || url.AbsolutePath != "/" + repository + "/actions/runs/" + runId.ToString(CultureInfo.InvariantCulture))
      return Unknown("Report identity, source scope or workflow URL does not match this exact run.");
    var covered = SourceJson.Number(report, "linesCovered");
    var valid = SourceJson.Number(report, "linesValid");
    if (covered is not (>= 0 and <= 9_007_199_254_740_991) || valid is not (> 0 and <= 9_007_199_254_740_991) || covered > valid)
      return Unknown("Coverage line totals are missing or invalid.");
    var generatedAt = DateTimeOffset.TryParse(SourceJson.Text(report, "generatedAt"), CultureInfo.InvariantCulture,
        DateTimeStyles.AssumeUniversal, out var generated) ? generated : (DateTimeOffset?)null;
    if (generatedAt is null || generatedAt > observedAt.AddMinutes(5)) return Unknown("Coverage report time is invalid or from the future.");
    var testedCommit = SourceJson.Text(report, "testedCommit")!;
    var percentage = Math.Round((double)covered.Value / valid.Value * 100, 2, MidpointRounding.AwayFromZero);
    return new("available", observedAt, LinesCovered: covered, LinesValid: valid, Percentage: percentage,
        RunId: runId, Attempt: attempt, SourceCommit: sourceCommit, TestedCommit: testedCommit, RunUrl: runUrl,
        Scope: Scope, DataScope: dataScope);
  }

  private static bool Sha(string? value) => value is not null && System.Text.RegularExpressions.Regex.IsMatch(value, "^[a-f0-9]{40}$");
}
