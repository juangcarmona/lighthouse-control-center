using System.Globalization;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record IntegrationRun(long Id, long? Attempt, string Revision, string Branch, string Event,
    string? Status, string? Conclusion, string? StartedAt, string? UpdatedAt, string SourceUrl,
    string ArtifactsAvailability, IReadOnlyList<SourceArtifact> Artifacts);
internal sealed record IntegrationObservation(string Availability, string? Revision, string? MergedAt,
    string? TargetBranch, string? DefaultBranch, string Reason, string ChecksAvailability = "unavailable",
    IReadOnlyList<SourceCheck>? Checks = null, string RunsAvailability = "unavailable", IReadOnlyList<IntegrationRun>? Runs = null);

internal sealed partial class GetIssueEvidenceHandler
{
  private static string? Commit(string? value) => value is not null && Regex.IsMatch(value, "^[a-f0-9]{40}$") ? value : null;

  private static SourceCheck[] MapChecks(JsonElement value, string repository, string revision) =>
      value.GetProperty("check_runs").EnumerateArray().Select(row =>
      {
        var head = Commit(SourceJson.Text(row, "head_sha"));
        return new SourceCheck(SourceJson.Text(row, "name") ?? "Unnamed source check", SourceJson.Text(row, "status"),
            SourceJson.Text(row, "conclusion"), SourceJson.Text(row, "started_at"), SourceJson.Text(row, "completed_at"),
            SourceJson.Number(row, "id"), CheckUrl(SourceJson.Text(row, "html_url"), repository), head,
            head is null ? "unknown" : head == revision ? "exact" : "stale");
      }).ToArray();

  private async Task<IntegrationObservation> ReadIntegration(string repository, JsonElement pull,
      GitHubConnection connection, SourceRequestGuard guard, CancellationToken cancellationToken)
  {
    var revision = Commit(SourceJson.Text(pull, "merge_commit_sha"));
    var mergedAt = SourceJson.Text(pull, "merged_at");
    var target = pull.GetProperty("base");
    var branch = SourceJson.Text(target, "ref");
    var defaultBranch = SourceJson.Text(target.GetProperty("repo"), "default_branch");
    if (!pull.TryGetProperty("merged", out var merged) || merged.ValueKind != JsonValueKind.True
        || revision is null || !DateTimeOffset.TryParse(mergedAt, CultureInfo.InvariantCulture, DateTimeStyles.None, out _))
      return new("unconfirmed", null, null, branch, defaultBranch,
          "Integration is not source-confirmed. An unmerged PR's merge SHA may be a test merge; failed or absent integration is not verified delivery.");
    if (string.IsNullOrWhiteSpace(branch) || string.IsNullOrWhiteSpace(defaultBranch) || branch != defaultBranch)
      return new("unavailable", revision, mergedAt, branch, defaultBranch,
          "The PR merge is recorded, but its target is not established as the source default branch. Post-integration verification is unavailable.");

    const string reason = "Source-confirmed merge observation, not delivery acceptance. Required-check applicability, integration authorization and artifact provenance remain unestablished. Deployment evidence is unavailable; no production delivery is claimed. Runs cover at most 10 records, retaining 3 exact default-branch push executions and 100 artifact records per execution.";
    var result = new IntegrationObservation("available", revision, mergedAt, branch, defaultBranch, reason);
    try
    {
      if (!guard.IsLive()) return result with { Availability = "disconnected" };
      using var checks = await transport.GetAsync("/repos/" + repository + "/commits/" + revision + "/check-runs?per_page=100",
          connection.Tokens.Access, guard, cancellationToken).ConfigureAwait(false);
      if (checks.Status == HttpStatusCode.Unauthorized) return result with { Availability = "disconnected" };
      if (checks.Successful && checks.Value.ValueKind == JsonValueKind.Object
          && checks.Value.TryGetProperty("check_runs", out var rows) && rows.ValueKind == JsonValueKind.Array && rows.GetArrayLength() <= 100)
      {
        var mapped = MapChecks(checks.Value, repository, revision);
        result = result with { Checks = mapped, ChecksAvailability = SourceJson.Number(checks.Value, "total_count") == mapped.Length ? "available" : "partial" };
      }
      if (!guard.IsLive()) return result with { Availability = "disconnected" };
      using var runs = await transport.GetAsync("/repos/" + repository + "/actions/runs?head_sha=" + revision
          + "&branch=" + Uri.EscapeDataString(branch) + "&event=push&per_page=10", connection.Tokens.Access, guard, cancellationToken).ConfigureAwait(false);
      if (runs.Status == HttpStatusCode.Unauthorized) return result with { Availability = "disconnected" };
      if (!runs.Successful || runs.Value.ValueKind != JsonValueKind.Object
          || !runs.Value.TryGetProperty("workflow_runs", out var executions) || executions.ValueKind != JsonValueKind.Array
          || executions.GetArrayLength() > 10) return result;
      var observed = new List<IntegrationRun>();
      var identities = new HashSet<long>();
      foreach (var run in executions.EnumerateArray())
      {
        if (observed.Count == 3) break;
        if (SourceJson.Number(run, "id") is not > 0 or > 9_007_199_254_740_991
            || SourceJson.Text(run, "head_sha") != revision || SourceJson.Text(run, "head_branch") != branch
            || SourceJson.Text(run, "event") != "push" || !run.TryGetProperty("repository", out var repo)
            || !string.Equals(SourceJson.Text(repo, "full_name"), repository, StringComparison.OrdinalIgnoreCase)) continue;
        var id = SourceJson.Number(run, "id")!.Value;
        if (!identities.Add(id)) continue;
        if (!guard.IsLive()) return result with { Availability = "disconnected" };
        using var artifacts = await transport.GetAsync("/repos/" + repository + "/actions/runs/" + id.ToString(CultureInfo.InvariantCulture)
            + "/artifacts?per_page=100", connection.Tokens.Access, guard, cancellationToken).ConfigureAwait(false);
        if (artifacts.Status == HttpStatusCode.Unauthorized) return result with { Availability = "disconnected" };
        var availability = "unavailable";
        SourceArtifact[] inventory = [];
        if (artifacts.Successful && artifacts.Value.ValueKind == JsonValueKind.Object
            && artifacts.Value.TryGetProperty("artifacts", out var items) && items.ValueKind == JsonValueKind.Array && items.GetArrayLength() <= 100)
        {
          inventory = items.EnumerateArray().Select(item =>
          {
            bool? expired = item.TryGetProperty("expired", out var flag) && flag.ValueKind is JsonValueKind.True or JsonValueKind.False ? flag.GetBoolean() : null;
            var artifactId = SourceJson.Number(item, "id");
            return new SourceArtifact(SourceJson.Text(item, "name") ?? "Unnamed artifact", artifactId, expired,
                SourceJson.Number(item, "size_in_bytes"), artifactId is not > 0 || expired is null ? "unknown" : expired == true ? "expired" : "listed");
          }).ToArray();
          availability = SourceJson.Number(artifacts.Value, "total_count") == inventory.Length ? "available" : "partial";
        }
        var attempt = SourceJson.Number(run, "run_attempt");
        observed.Add(new(id, attempt is > 0 and <= 9_007_199_254_740_991 ? attempt : null, revision, branch, "push",
            SourceJson.Text(run, "status"), SourceJson.Text(run, "conclusion"), SourceJson.Text(run, "run_started_at"),
            SourceJson.Text(run, "updated_at"), "https://github.com/" + repository + "/actions/runs/" + id.ToString(CultureInfo.InvariantCulture), availability, inventory));
      }
      return result with
      {
        Runs = observed,
        RunsAvailability = SourceJson.Number(runs.Value, "total_count") == observed.Count
          && executions.GetArrayLength() == observed.Count ? "available" : "partial"
      };
    }
    catch (OperationCanceledException)
    { return result with { Reason = result.Reason + " The evidence read budget was reached; remaining evidence is unavailable." }; }
    catch (InvalidOperationException)
    { return result with { Reason = result.Reason + " Malformed dependent source metadata was not used." }; }
  }
}
