using System.Globalization;
using System.IO.Compression;
using System.Net;
using System.Text;
using System.Text.Json;

namespace SoFa.Web.Tests;

public sealed class RunOutputTokensTests
{
  private const string Revision = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

  [Fact]
  public async Task ShowsTokensOnlyFromTheExactRunAttemptAndMatchingCorrelationRecords()
  {
    using var fixture = Ready();
    var result = await fixture.OutputTokens.Handle(new(await fixture.Session(), "example/repository", 500, 2), CancellationToken.None);
    Assert.Equal("available", result.Availability);
    Assert.Equal(11760, result.OutputTokens);
    Assert.Equal("https://github.com/example/repository/actions/runs/500/attempts/2", result.SourceUrl);
    Assert.Contains("/repos/example/repository/actions/runs/500/attempts/2", fixture.Handler.Paths);
    Assert.Contains("/repos/example/repository/actions/runs/500/artifacts", fixture.Handler.Paths);
    Assert.Equal(["/13.zip"], fixture.Handler.AssetReads);
  }

  [Theory]
  [InlineData("revision")]
  [InlineData("attempt")]
  [InlineData("issue")]
  [InlineData("session")]
  [InlineData("coverage")]
  public async Task MismatchedOrIncompleteTelemetryRemainsUnknown(string changed)
  {
    using var fixture = Ready(changed);
    var result = await fixture.OutputTokens.Handle(new(await fixture.Session(), "example/repository", 500, 2), CancellationToken.None);
    Assert.Equal("unavailable", result.Availability);
    Assert.Null(result.OutputTokens);
  }

  [Fact]
  public async Task CurrentActionsDenialPreventsRunAndArtifactReads()
  {
    using var fixture = Ready();
    fixture.Handler.ActionsGrant = "none";
    var result = await fixture.OutputTokens.Handle(new(await fixture.Session(), "example/repository", 500, 2), CancellationToken.None);
    Assert.Equal("denied", result.Availability);
    Assert.Null(result.OutputTokens);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.Contains("/actions/runs/", StringComparison.Ordinal));
    Assert.Empty(fixture.Handler.AssetReads);
  }

  [Fact]
  public async Task ExpiredArtifactIsUnknownAndNeverDownloaded()
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/actions/runs/500/artifacts"] = _ => Json(new
    {
      total_count = 1,
      artifacts = new[] { Artifact(fixture, expired: true) }
    });
    var result = await fixture.OutputTokens.Handle(new(await fixture.Session(), "example/repository", 500, 2), CancellationToken.None);
    Assert.Equal("unavailable", result.Availability);
    Assert.Null(result.OutputTokens);
    Assert.Empty(fixture.Handler.AssetReads);
  }

  [Fact]
  public async Task MissingArtifactIsUnknown()
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/actions/runs/500/artifacts"] = _ => Json(new { total_count = 0, artifacts = Array.Empty<object>() });
    var result = await fixture.OutputTokens.Handle(new(await fixture.Session(), "example/repository", 500, 2), CancellationToken.None);
    Assert.Equal("unavailable", result.Availability);
    Assert.Null(result.OutputTokens);
    Assert.Empty(fixture.Handler.AssetReads);
  }

  [Fact]
  public async Task RunSpecificArtifactNameIsNotAcceptedAsTelemetry()
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/actions/runs/500/artifacts"] = _ => Json(new
    {
      total_count = 1,
      artifacts = new[] { Artifact(fixture, name: "lighthouse-500-2") }
    });
    var result = await fixture.OutputTokens.Handle(new(await fixture.Session(), "example/repository", 500, 2), CancellationToken.None);
    Assert.Equal("unavailable", result.Availability);
    Assert.Null(result.OutputTokens);
    Assert.Empty(fixture.Handler.AssetReads);
  }

  [Theory]
  [InlineData("malformed")]
  [InlineData("oversized")]
  public async Task MalformedOrOversizedArchiveIsUnknown(string kind)
  {
    using var fixture = Ready();
    fixture.Handler.Assets["/13.zip"] = kind == "malformed" ? [0x01, 0x02, 0x03] : OversizedArchive();
    var result = await fixture.OutputTokens.Handle(new(await fixture.Session(), "example/repository", 500, 2), CancellationToken.None);
    Assert.Equal("unavailable", result.Availability);
    Assert.Null(result.OutputTokens);
  }

  [Fact]
  public async Task AccountChangeDuringTheExactRunReadDiscardsTheResult()
  {
    using var fixture = Ready();
    var session = await fixture.Session();
    fixture.Handler.Responses["/repos/example/repository/actions/runs/500/attempts/2"] = _ =>
    {
      JuanGCarmona.SoFa.Modules.Workspace.Source.GitHubAuthorization.Disconnect(session);
      return Json(new { id = 500, run_attempt = 2, head_sha = Revision, repository = new { full_name = "example/repository" } });
    };
    var result = await fixture.OutputTokens.Handle(new(session, "example/repository", 500, 2), CancellationToken.None);
    Assert.Equal("disconnected", result.Availability);
    Assert.Null(result.OutputTokens);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.EndsWith("/artifacts", StringComparison.Ordinal));
  }

  private static IssueContextTests.Fixture Ready(string? changed = null)
  {
    var fixture = new IssueContextTests.Fixture();
    fixture.Handler.Responses["/repos/example/repository/actions/runs/500/attempts/2"] = _ => Json(new
    {
      id = 500,
      run_attempt = 2,
      head_sha = Revision,
      repository = new { full_name = "example/repository" },
      updated_at = fixture.Clock.GetUtcNow().ToString("O", CultureInfo.InvariantCulture)
    });
    fixture.Handler.Responses["/repos/example/repository/actions/runs/500/artifacts"] = _ => Json(new
    {
      total_count = 1,
      artifacts = new[] { Artifact(fixture) }
    });
    fixture.Handler.Responses["/repos/example/repository/actions/artifacts/13/zip"] = request =>
    {
      var response = new HttpResponseMessage(HttpStatusCode.Found);
      response.Headers.Location = new Uri("https://fixture.blob.core.windows.net/13.zip");
      return response;
    };
    fixture.Handler.Assets["/13.zip"] = Archive(
      changed == "coverage" ? "partial" : "observed",
      changed == "revision" ? new string('b', 40) : Revision,
      changed == "attempt" ? "1" : "2",
      changed == "session" ? "ses_other" : "ses_test",
      changed == "session" ? "ses_test" : "ses_test",
      changed == "issue" ? "8" : "7");
    return fixture;

  }

  private static object Artifact(IssueContextTests.Fixture fixture, bool expired = false, string name = "lighthouse-telemetry-agent-2") => new
  {
    id = 13,
    name,
    expired,
    size_in_bytes = 500,
    created_at = fixture.Clock.GetUtcNow().AddDays(-1).ToString("O", CultureInfo.InvariantCulture),
    expires_at = (expired ? fixture.Clock.GetUtcNow().AddDays(-1) : fixture.Clock.GetUtcNow().AddDays(13)).ToString("O", CultureInfo.InvariantCulture),
    workflow_run = new { id = 500 }
  };

  private static byte[] Archive(string coverage, string revision, string attempt, string sessionId, string secondSessionId, string secondIssue)
  {
    using var bytes = new MemoryStream();
    using (var archive = new ZipArchive(bytes, ZipArchiveMode.Create, leaveOpen: true))
    {
      using (var writer = new StreamWriter(archive.CreateEntry("evidence/host/telemetry-usage.json").Open(), new UTF8Encoding(false)))
        writer.Write(JsonSerializer.Serialize(new
        {
          schemaVersion = 1,
          source = "opencode-native",
          coverage,
          tokens = new { inputTokens = 20, outputTokens = 11760 }
        }));
      using (var writer = new StreamWriter(archive.CreateEntry("evidence/host/telemetry.jsonl").Open(), new UTF8Encoding(false)))
        for (var index = 0; index < 2; index++)
          writer.WriteLine(JsonSerializer.Serialize(new
          {
            schemaVersion = 1,
            correlation = new
            {
              repository = "example/repository",
              issue = index == 0 ? "7" : secondIssue,
              revision,
              workflowRunId = "500",
              workflowAttempt = attempt,
              sessionId = index == 0 ? sessionId : secondSessionId
            }
          }));
    }
    return bytes.ToArray();
  }

  private static byte[] OversizedArchive()
  {
    using var bytes = new MemoryStream();
    using (var archive = new ZipArchive(bytes, ZipArchiveMode.Create, leaveOpen: true))
    {
      using (var writer = new StreamWriter(archive.CreateEntry("evidence/host/telemetry-usage.json").Open(), new UTF8Encoding(false)))
        writer.Write("{}");
      using (var writer = new StreamWriter(archive.CreateEntry("evidence/host/telemetry.jsonl").Open(), new UTF8Encoding(false)))
        writer.Write(new string('x', 1024 * 1024 + 1));
    }
    return bytes.ToArray();
  }

  private static HttpResponseMessage Json(object value) => new(HttpStatusCode.OK)
  { Content = new StringContent(JsonSerializer.Serialize(value), Encoding.UTF8, "application/json") };
}
