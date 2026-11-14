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
  public async Task UnvalidatedResultRetainsSourceExecutionTimesWithoutInventingStageAcceptance()
  {
    using var fixture = Ready("version");
    fixture.Handler.Responses["/repos/example/repository/actions/runs/500"] = _ => Json(new
    {
      id = 500,
      run_attempt = 2,
      status = "completed",
      conclusion = "skipped",
      head_sha = Revision,
      run_started_at = "2026-11-13T09:00:00Z",
      updated_at = "2026-11-13T10:00:00Z",
      path = ".github/workflows/lighthouse-sdlc-router.yml",
      repository = new { full_name = "example/repository" }
    });
    var evidence = await fixture.Evidence.Handle(new(new(await fixture.Session(), "example/repository", 7)), CancellationToken.None);
    var result = Assert.Single(evidence.Reports);
    Assert.Equal("unavailable", result.Availability);
    Assert.Null(result.Result);
    Assert.Equal("skipped", result.ExecutionConclusion);
    Assert.Equal("2026-11-13T09:00:00Z", result.RunStartedAt);
    Assert.Equal("2026-11-13T10:00:00Z", result.RunUpdatedAt);
    Assert.Equal(Revision, result.RunRevision);
    Assert.Equal(1, evidence.ConversationPage);
    Assert.NotNull(evidence.IssueId);
  }

  [Fact]
  public async Task RelatedPullRetainsCreationAndMergeButDoesNotReadReviewsWithoutGrant()
  {
    using var fixture = Ready();
    fixture.Handler.ReportBody += "\nhttps://github.com/example/repository/pull/13";
    fixture.Handler.Responses["/repos/example/repository/pulls/13"] = _ => Json(new
    {
      number = 13,
      state = "closed",
      created_at = "2026-11-12T10:00:00Z",
      merged_at = "2026-11-13T10:00:00Z",
      merge_commit_sha = Revision,
      @base = new { repo = new { full_name = "example/repository" } },
      head = new { sha = Revision }
    });
    fixture.Handler.Responses["/repos/example/repository/commits/" + Revision + "/check-runs"] = _ => Json(new
    { total_count = 0, check_runs = Array.Empty<object>() });
    var evidence = await fixture.Evidence.Handle(new(new(await fixture.Session(), "example/repository", 7)), CancellationToken.None);
    var pull = Assert.Single(evidence.PullRequests!);
    Assert.Equal("2026-11-12T10:00:00Z", pull.CreatedAt);
    Assert.Equal("2026-11-13T10:00:00Z", pull.MergedAt);
    Assert.Equal(Revision, pull.MergeRevision);
    Assert.Equal("unavailable", pull.ReviewsAvailability);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.EndsWith("/reviews", StringComparison.Ordinal));
  }

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

  [Fact]
  public async Task DisplayedPageEvidenceDoesNotFetchTheConversationTwice()
  {
    using var fixture = Ready();
    var session = await fixture.Session();
    var page = await fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None);
    var evidence = await fixture.Evidence.Handle(new(new(session, "example/repository", 7, Snapshot: page.Snapshot)), CancellationToken.None);
    Assert.Equal("available", evidence.Availability);
    Assert.Single(fixture.Handler.Paths, path => path == "/repos/example/repository/issues/7/comments");
    var calls = fixture.Handler.Paths.Count;
    var repeated = await fixture.Evidence.Handle(new(new(session, "example/repository", 7, Snapshot: page.Snapshot)), CancellationToken.None);
    Assert.Equal("unavailable", repeated.Availability);
    Assert.Equal(calls, fixture.Handler.Paths.Count);
  }

  [Fact]
  public async Task DisplayedPageEvidenceStillChecksFreshRepositoryAuthority()
  {
    using var fixture = Ready();
    var session = await fixture.Session();
    var page = await fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None);
    fixture.Handler.CanRead = false;
    var result = await fixture.Evidence.Handle(new(new(session, "example/repository", 7, Snapshot: page.Snapshot)), CancellationToken.None);
    Assert.Equal("denied", result.Availability);
    Assert.Empty(result.Reports);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.Contains("/actions/", StringComparison.Ordinal));
    Assert.Single(fixture.Handler.Paths, path => path == "/repos/example/repository/issues/7/comments");
  }

  [Theory]
  [InlineData("snapshot")]
  [InlineData("number")]
  [InlineData("account")]
  [InlineData("generation")]
  public async Task DisplayedPageCannotBeUsedForAnotherSourceIdentity(string changed)
  {
    using var fixture = Ready();
    var session = await fixture.Session();
    var page = await fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None);
    if (changed == "account")
    {
      session.GitHub.Current = new(72, "replacement", session.GitHub.Current!.Tokens, fixture.Clock.GetUtcNow());
      session.GitHub.Generation++;
    }
    if (changed == "generation") session.GitHub.Generation++;
    var calls = fixture.Handler.Paths.Count;
    var result = await fixture.Evidence.Handle(new(new(session, "example/repository", changed == "number" ? 8 : 7,
        Snapshot: changed == "snapshot" ? "another-snapshot" : page.Snapshot)), CancellationToken.None);
    Assert.Equal("unavailable", result.Availability);
    Assert.Empty(result.Reports);
    Assert.Equal(calls, fixture.Handler.Paths.Count);
  }

  [Fact]
  public async Task ExpiredDisplayedPageDoesNotSilentlyFetchAnotherConversationPage()
  {
    using var fixture = Ready();
    var session = await fixture.Session();
    var page = await fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None);
    fixture.Clock.Advance(TimeSpan.FromSeconds(31));
    var calls = fixture.Handler.Paths.Count;
    var evidence = await fixture.Evidence.Handle(new(new(session, "example/repository", 7, Snapshot: page.Snapshot)), CancellationToken.None);
    Assert.Equal("unavailable", evidence.Availability);
    Assert.Equal(calls, fixture.Handler.Paths.Count);
  }

  [Theory]
  [InlineData("issue")]
  [InlineData("attempt")]
  [InlineData("revision")]
  [InlineData("identity")]
  [InlineData("version")]
  [InlineData("request-version")]
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
  public async Task LegacyHeadersAcceptedByTheSharedContractKeepRepositoryAndAttemptAssociation()
  {
    using var fixture = Ready("legacy");
    var result = Assert.Single((await fixture.Evidence.Handle(new(new(await fixture.Session(), "example/repository", 7)), CancellationToken.None)).Reports);
    Assert.Equal("available", result.Availability);
    Assert.Equal("blocked", result.Result);
    Assert.Equal(2, result.Attempt);
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

  [Fact]
  public async Task RepositoryAuthorityLostBetweenContextAndEvidenceIsDenied()
  {
    using var fixture = Ready();
    var reads = 0;
    fixture.Handler.Responses["/repos/example/repository"] = _ => Json(new { permissions = new { pull = ++reads == 1, push = false } });
    var result = await fixture.Evidence.Handle(new(new(await fixture.Session(), "example/repository", 7)), CancellationToken.None);
    Assert.Equal("denied", result.Availability);
    Assert.Empty(result.Reports);
  }

  [Fact]
  public async Task LostActionsGrantRestrictsEvidenceWithoutClaimingIssueAuthorityWasLost()
  {
    using var fixture = Ready();
    fixture.Handler.ActionsGrant = "none";
    var session = await fixture.Session();
    var result = await fixture.Evidence.Handle(new(new(session, "example/repository", 7)), CancellationToken.None);
    Assert.Equal("restricted", result.Availability);
    Assert.Empty(result.Reports);
    Assert.NotNull(session.GitHub.Current);
  }

  [Fact]
  public async Task RelatedPullRequestsUseOnlyExactSourceReferencesAndChecksAtTheirDisplayedHead()
  {
    using var fixture = new IssueContextTests.Fixture();
    fixture.Handler.Count = 0;
    fixture.Handler.Responses["/repos/example/repository/issues/7"] = _ => Json(new
    {
      id = 70,
      number = 7,
      title = "Related changes",
      comments = 0,
      updated_at = "2026-11-07T10:00:00Z",
      body = "https://github.com/example/repository/pull/12not-a-pr "
          + "https://github.com/other/repository/pull/14 "
          + "[Proposal](https://github.com/example/repository/pull/13#discussion)"
    });
    fixture.Handler.Responses["/repos/example/repository/pulls/13"] = _ => Json(new
    {
      number = 13,
      title = "Source PR",
      state = "open",
      draft = true,
      @base = new { repo = new { full_name = "example/repository" } },
      head = new { sha = Revision }
    });
    fixture.Handler.Responses["/repos/example/repository/commits/" + Revision + "/check-runs"] = _ => Json(new
    {
      total_count = 1,
      check_runs = new[] { new { id = 901, name = "verify", status = "completed", conclusion = "failure",
        html_url = "https://github.com/example/repository/actions/runs/500/job/901" } }
    });
    var result = await fixture.Evidence.Handle(new(new(await fixture.Session(), "example/repository", 7)), CancellationToken.None);
    var pull = Assert.Single(result.PullRequests!);
    Assert.Equal(13, pull.Number);
    Assert.Equal(Revision, pull.HeadRevision);
    var check = Assert.Single(pull.Checks!);
    Assert.Equal(901, check.Id);
    Assert.Equal("failure", check.Conclusion);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.EndsWith("/pulls/12", StringComparison.Ordinal));
  }

  [Theory]
  [InlineData("/repos/example/repository/actions/runs/500")]
  [InlineData("/repos/example/repository/actions/runs/500/artifacts")]
  [InlineData("/repos/example/repository/actions/artifacts/11/zip")]
  public async Task DisconnectDuringEvidenceStopsEverySubsequentSourceRequest(string interruptedPath)
  {
    using var fixture = Ready();
    var session = await fixture.Session();
    var original = fixture.Handler.Responses[interruptedPath];
    fixture.Handler.Responses[interruptedPath] = request =>
    {
      var response = original(request);
      GitHubAuthorization.Disconnect(session);
      return response;
    };
    var result = await fixture.Evidence.Handle(new(new(session, "example/repository", 7)), CancellationToken.None);
    Assert.Equal("disconnected", result.Availability);
    Assert.Equal(interruptedPath, fixture.Handler.Paths[^1]);
    Assert.Empty(fixture.Handler.AssetReads);
  }

  [Fact]
  public async Task DisconnectDuringRelatedPullRequestReadStopsItsHeadCheckRequest()
  {
    using var fixture = Ready();
    fixture.Handler.ReportBody += "\nhttps://github.com/example/repository/pull/13";
    var session = await fixture.Session();
    fixture.Handler.Responses["/repos/example/repository/pulls/13"] = _ =>
    {
      GitHubAuthorization.Disconnect(session);
      return Json(new { number = 13, @base = new { repo = new { full_name = "example/repository" } }, head = new { sha = Revision } });
    };
    var result = await fixture.Evidence.Handle(new(new(session, "example/repository", 7)), CancellationToken.None);
    Assert.Equal("disconnected", result.Availability);
    Assert.Equal("/repos/example/repository/pulls/13", fixture.Handler.Paths[^1]);
  }

  private static IssueContextTests.Fixture Ready(string? changed = null)
  {
    var fixture = new IssueContextTests.Fixture();
    fixture.Handler.ReportBody = "## Proposal\nOutcome: blocked\nNeed owner information\n[Workflow run](https://github.com/example/repository/actions/runs/500)\n<!-- lighthouse-actions:" + RunIdentity + " -->\n<!-- lighthouse-stage:propose:blocked -->";
    fixture.Handler.Responses["/repos/example/repository/actions/runs/500"] = _ => Json(new
    { id = 500, run_attempt = 2, status = "completed", conclusion = "success", head_sha = Revision, path = ".github/workflows/lighthouse-sdlc-router.yml", repository = new { full_name = "example/repository" } });
    fixture.Handler.Responses["/repos/example/repository/actions/runs/500/artifacts"] = _ => Json(new
    { total_count = 2, artifacts = new[] { new { id = 11, name = "lighthouse-input-7-2", expired = false, size_in_bytes = 300 }, new { id = 12, name = "lighthouse-result-7-2", expired = false, size_in_bytes = 300 } } });
    foreach (var id in new[] { 11, 12 })
      fixture.Handler.Responses["/repos/example/repository/actions/artifacts/" + id + "/zip"] = request =>
      {
        var response = new HttpResponseMessage(HttpStatusCode.Found);
        response.Headers.Location = new Uri("https://fixture.blob.core.windows.net/" + request.RequestUri!.Segments[^2].Trim('/') + ".zip");
        return response;
      };
    var header = new Dictionary<string, object?>
    {
      ["schemaVersion"] = changed == "request-version" ? 99 : 1,
      ["repository"] = "example/repository",
      ["issue"] = changed == "issue" ? 8 : 7,
      ["stage"] = "propose",
      ["runId"] = RunIdentity,
      ["workflowRunId"] = "500",
      ["attempt"] = changed == "attempt" ? 1 : 2,
      ["sourceRevision"] = changed == "revision" ? new string('c', 40) : Revision
    };
    if (changed == "legacy") foreach (var key in new[] { "schemaVersion", "repository", "attempt" }) header.Remove(key);
    fixture.Handler.Assets["/11.zip"] = Archive("request.json", header);
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
