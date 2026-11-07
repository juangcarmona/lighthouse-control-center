using System.IO.Compression;
using System.Net;
using System.Text;
using System.Text.Json;
using JuanGCarmona.SoFa.Modules.Workspace.Source;

namespace SoFa.Web.Tests;

public sealed class IssueEvidenceTests
{
  private const string Revision = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  private static readonly string[] MissingEvidence = ["Need owner information"];
  private static readonly string RunIdentity = new('b', 64);

  [Fact]
  public async Task SourceAssociatedBlockedProposalRemainsDistinctFromItsSuccessfulWorkflow()
  {
    using var fixture = Ready();
    var session = await fixture.Session();
    var evidence = await fixture.Evidence.Handle(new(new(session, "example/repository", 7)), CancellationToken.None);
    var result = Assert.Single(evidence.Reports);
    Assert.Equal("available", result.Availability);
    Assert.Equal("blocked", result.Result);
    Assert.Equal("propose", result.Stage);
    Assert.Equal("success", result.ExecutionConclusion);
    Assert.Equal(2, result.Attempt);
    Assert.Equal(Revision, result.SourceRevision);
    Assert.Equal("Need owner information", Assert.Single(result.MissingEvidence!));
    Assert.Contains("does not validate current admission", result.Reason, StringComparison.Ordinal);
  }

  [Theory]
  [InlineData("issue")]
  [InlineData("attempt")]
  [InlineData("revision")]
  [InlineData("identity")]
  [InlineData("version")]
  public async Task MismatchedArtifactBindingsNeverBecomeAStageResult(string changed)
  {
    using var fixture = Ready(changed);
    var session = await fixture.Session();
    var result = Assert.Single((await fixture.Evidence.Handle(new(new(session, "example/repository", 7)), CancellationToken.None)).Reports);
    Assert.Equal("unavailable", result.Availability);
    Assert.Null(result.Result);
    Assert.Equal(500, result.RunId); // Referenced workflow is still a separate source fact.
  }

  [Fact]
  public async Task ExpiredArtifactIsExplicitAndNeverDownloaded()
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/actions/runs/500/artifacts"] = _ => Json(new
    { total_count = 1, artifacts = new[] { new { id = 11, name = "lighthouse-input-7-2", expired = true, size_in_bytes = 100 } } });
    var result = Assert.Single((await fixture.Evidence.Handle(new(new(await fixture.Session(), "example/repository", 7)), CancellationToken.None)).Reports);
    Assert.Equal("unavailable", result.Availability);
    Assert.Contains("expired", result.Reason, StringComparison.Ordinal);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.EndsWith("/zip", StringComparison.Ordinal));
  }

  [Fact]
  public async Task SourceRevocationDuringEvidenceReadDestroysTheConnection()
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/actions/runs/500"] = _ => new(HttpStatusCode.Unauthorized)
    { Content = new StringContent("{}", Encoding.UTF8, "application/json") };
    var session = await fixture.Session();
    var result = await fixture.Evidence.Handle(new(new(session, "example/repository", 7)), CancellationToken.None);
    Assert.Equal("disconnected", result.Availability);
    Assert.Empty(result.Reports);
    Assert.Null(session.GitHub.Current);
  }

  private static IssueContextTests.Fixture Ready(string? changed = null)
  {
    var fixture = new IssueContextTests.Fixture();
    fixture.Handler.ReportBody = "## Proposal\nOutcome: blocked\nNeed owner information\n[Workflow run](https://github.com/example/repository/actions/runs/500)\n<!-- lighthouse-actions:" + RunIdentity + " -->\n<!-- lighthouse-stage:propose:blocked -->";
    fixture.Handler.Responses["/repos/example/repository/actions/runs/500"] = _ => Json(new
    { id = 500, run_attempt = 2, status = "completed", conclusion = "success", head_sha = Revision, path = ".github/workflows/lighthouse-sdlc-router.yml" });
    fixture.Handler.Responses["/repos/example/repository/actions/runs/500/artifacts"] = _ => Json(new
    { total_count = 2, artifacts = new[] { new { id = 11, name = "lighthouse-input-7-2", expired = false, size_in_bytes = 300 }, new { id = 12, name = "lighthouse-result-7-2", expired = false, size_in_bytes = 300 } } });
    foreach (var id in new[] { 11, 12 })
      fixture.Handler.Responses["/repos/example/repository/actions/artifacts/" + id + "/zip"] = request =>
      {
        var response = new HttpResponseMessage(HttpStatusCode.Found);
        response.Headers.Location = new Uri("https://fixture.blob.core.windows.net/" + request.RequestUri!.Segments[^2].Trim('/') + ".zip");
        return response;
      };
    fixture.Handler.Assets["/11.zip"] = Archive("request.json", new
    {
      schemaVersion = 1,
      repository = "example/repository",
      issue = changed == "issue" ? 8 : 7,
      stage = "propose",
      runId = RunIdentity,
      workflowRunId = "500",
      attempt = changed == "attempt" ? 1 : 2,
      sourceRevision = changed == "revision" ? new string('c', 40) : Revision
    });
    fixture.Handler.Assets["/12.zip"] = Archive("envelope.json", new
    {
      schemaVersion = changed == "version" ? 99 : 1,
      result = new
      { schemaVersion = 1, runId = changed == "identity" ? new string('c', 64) : RunIdentity, stage = "propose", status = "blocked", gate = "planned", evidence = Array.Empty<object>(), missingEvidence = MissingEvidence, unavailableChecks = Array.Empty<string>(), pendingReview = Array.Empty<string>(), nextAction = "Await source information", output = new { } },
      effect = new { type = "issue-comment", body = "Proposal blocked pending owner information." }
    });
    return fixture;
  }
  private static HttpResponseMessage Json(object value) => new(HttpStatusCode.OK)
  { Content = new StringContent(JsonSerializer.Serialize(value), Encoding.UTF8, "application/json") };
  private static byte[] Archive(string name, object value)
  {
    using var bytes = new MemoryStream();
    using (var archive = new ZipArchive(bytes, ZipArchiveMode.Create, leaveOpen: true))
    {
      using var writer = new StreamWriter(archive.CreateEntry(name).Open(), new UTF8Encoding(false));
      writer.Write(JsonSerializer.Serialize(value));
    }
    return bytes.ToArray();
  }
}
