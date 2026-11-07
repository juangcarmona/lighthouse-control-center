using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record SourceCheck(string Name, string? Status, string? Conclusion, string? StartedAt, string? CompletedAt);
internal sealed record RelatedPullRequest(int Number, string Availability, string SourceUrl, IReadOnlyList<string> ReferencedBy,
    string? Title = null, string? State = null, bool? Draft = null, string? HeadRevision = null, string? UpdatedAt = null,
    string? ChecksAvailability = null, IReadOnlyList<SourceCheck>? Checks = null, string? Reason = null);

internal sealed partial class GetIssueEvidenceHandler
{
  private async Task<IReadOnlyList<RelatedPullRequest>> ReadRelatedPullRequests(string repository, IssueContext page,
      GitHubConnection connection, CancellationToken cancellationToken)
  {
    var references = new Dictionary<int, List<string>>();
    var rows = new[] { (Body: page.Issue!.Body, Url: page.Issue.SourceUrl) }
        .Concat(page.Conversation!.Items.Select(comment => (comment.Body, Url: comment.SourceUrl)));
    var pattern = @"https://github\.com/" + Regex.Escape(repository) + @"/pull/([1-9][0-9]*)(?=[^0-9]|$)";
    foreach (var row in rows)
      foreach (Match match in Regex.Matches(row.Body, pattern))
        if (int.TryParse(match.Groups[1].Value, out var number))
        {
          if (!references.TryGetValue(number, out var sources))
          {
            if (references.Count >= 10) continue;
            references[number] = sources = [];
          }
          if (!sources.Contains(row.Url) && sources.Count < 10) sources.Add(row.Url);
        }
    var related = new List<RelatedPullRequest>();
    foreach (var (number, sources) in references)
    {
      var source = "https://github.com/" + repository + "/pull/" + number.ToString(CultureInfo.InvariantCulture);
      if (cancellationToken.IsCancellationRequested)
      { related.Add(new(number, "unavailable", source, sources, Reason: "The evidence read budget was reached.")); continue; }
      try
      {
        using var pull = await transport.GetAsync("/repos/" + repository + "/pulls/" + number.ToString(CultureInfo.InvariantCulture), connection.Tokens.Access, cancellationToken).ConfigureAwait(false);
        if (pull.Status == System.Net.HttpStatusCode.Unauthorized)
        { related.Add(new(number, "disconnected", source, sources)); break; }
        if (!pull.Successful || SourceJson.Number(pull.Value, "number") != number
            || !pull.Value.TryGetProperty("base", out var target) || !target.TryGetProperty("repo", out var targetRepo)
            || !string.Equals(SourceJson.Text(targetRepo, "full_name"), repository, StringComparison.OrdinalIgnoreCase)
            || !pull.Value.TryGetProperty("head", out var head) || SourceJson.Text(head, "sha") is not { } revision
            || !Regex.IsMatch(revision, "^[a-f0-9]{40}$"))
        { related.Add(new(number, "unavailable", source, sources, Reason: "The source-referenced PR identity or revision could not be verified.")); continue; }
        var title = SourceJson.Text(pull.Value, "title"); var state = SourceJson.Text(pull.Value, "state");
        bool? draft = pull.Value.TryGetProperty("draft", out var flag) && flag.ValueKind is JsonValueKind.True or JsonValueKind.False ? flag.GetBoolean() : null;
        using var checks = await transport.GetAsync("/repos/" + repository + "/commits/" + revision + "/check-runs?per_page=100", connection.Tokens.Access, cancellationToken).ConfigureAwait(false);
        if (checks.Status == System.Net.HttpStatusCode.Unauthorized)
        { related.Add(new(number, "disconnected", source, sources)); break; }
        var available = checks.Successful && checks.Value.ValueKind == JsonValueKind.Object
            && checks.Value.TryGetProperty("check_runs", out var checkRows) && checkRows.ValueKind == JsonValueKind.Array && checkRows.GetArrayLength() <= 100;
        var mapped = available ? checks.Value.GetProperty("check_runs").EnumerateArray().Select(row => new SourceCheck(
            SourceJson.Text(row, "name") ?? "Unnamed source check", SourceJson.Text(row, "status"), SourceJson.Text(row, "conclusion"),
            SourceJson.Text(row, "started_at"), SourceJson.Text(row, "completed_at"))).ToArray() : [];
        var complete = available && SourceJson.Number(checks.Value, "total_count") == mapped.Length;
        related.Add(new(number, "available", source, sources, title, state, draft, revision, SourceJson.Text(pull.Value, "updated_at"),
            available ? complete ? "available" : "partial" : "unavailable", mapped,
            "PR referenced explicitly by this issue/conversation. Check observations bind to the displayed head revision; missing permissions or incomplete inventory do not imply passing checks."));
      }
      catch (OperationCanceledException) { related.Add(new(number, "unavailable", source, sources, Reason: "The evidence read budget was reached.")); break; }
      catch (InvalidOperationException) { related.Add(new(number, "unavailable", source, sources, Reason: "Source PR/check metadata is malformed.")); }
    }
    return related;
  }
}
