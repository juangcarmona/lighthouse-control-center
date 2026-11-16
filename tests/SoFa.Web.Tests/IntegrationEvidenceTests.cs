using System.Net;
using System.Text;
using System.Text.Json;
using JuanGCarmona.SoFa.Modules.Workspace.Source;

namespace SoFa.Web.Tests;

// Controlled source responses, not connected-user acceptance or evidence of a real merge.
public sealed class IntegrationEvidenceTests
{
  private const string Head = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  private const string Merged = "cccccccccccccccccccccccccccccccccccccccc";
  private const string Later = "dddddddddddddddddddddddddddddddddddddddd";

  [Fact]
  public async Task SquashResultReadsExactCommitNotHeadOrLaterBranchTip()
  {
    using var fixture = Ready();
    var queries = new List<string>();
    fixture.Handler.Responses["/repos/example/repository/actions/runs"] = request =>
    {
      queries.Add(request.RequestUri!.Query);
      return Runs(Run(900, Merged), Run(901, Later)); // Do not trust source-side filtering alone.
    };
    var pull = await Read(fixture);
    Assert.Equal(Head, pull.HeadRevision);
    Assert.Equal(Merged, pull.MergeRevision);
    var integration = pull.Integration!;
    Assert.Equal("available", integration.Availability);
    Assert.Equal(Merged, integration.Revision);
    var check = Assert.Single(integration.Checks!);
    Assert.Equal(Merged, check.HeadRevision);
    Assert.Equal("exact", check.RevisionBinding);
    Assert.Equal("partial", integration.RunsAvailability);
    var run = Assert.Single(integration.Runs!);
    Assert.Equal(900, run.Id);
    Assert.Equal(2, run.Attempt);
    Assert.Equal(Merged, run.Revision);
    Assert.Contains("head_sha=" + Merged, Assert.Single(queries), StringComparison.Ordinal);
    Assert.Contains("branch=main", queries[0], StringComparison.Ordinal);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.Contains(Later, StringComparison.Ordinal));
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.Contains("901/artifacts", StringComparison.Ordinal));
    Assert.Contains("not delivery acceptance", integration.Reason, StringComparison.Ordinal);
  }

  [Fact]
  public async Task VersionedPullResponseRetainsTheConfirmedMergeRevision()
  {
    using var fixture = Ready();
    // GitHub 2026-03-10 removes merge_commit_sha; the supported 2022 response retains it.
    fixture.Handler.Responses["/repos/example/repository/pulls/13"] = request =>
        Pull(includeMergeRevision: request.Headers.GetValues("X-GitHub-Api-Version").Single() == "2022-11-28");
    var pull = await Read(fixture);
    Assert.Equal(Merged, pull.MergeRevision);
    Assert.Equal("available", pull.Integration!.Availability);
    Assert.Equal(Merged, pull.Integration.Revision);
    Assert.Equal(Merged, Assert.Single(pull.Integration.Runs!).Revision);
  }

  [Fact]
  public async Task MissingMergeRevisionCannotFallBackToHeadEvenWhenMergedIsTrue()
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/pulls/13"] = _ => Pull(includeMergeRevision: false);
    var pull = await Read(fixture);
    Assert.NotNull(pull.MergedAt);
    Assert.Null(pull.MergeRevision);
    Assert.Equal("unconfirmed", pull.Integration!.Availability);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.Contains("/commits/" + Merged, StringComparison.Ordinal));
    Assert.DoesNotContain(fixture.Handler.Paths, path => path == "/repos/example/repository/actions/runs");
  }

  [Theory]
  [InlineData(Head, "stale")]
  [InlineData(null, "unknown")]
  [InlineData("malformed", "unknown")]
  public async Task GreenChecksWithWrongOrMissingRevisionCannotVerifyIntegratedCommit(string? revision, string binding)
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/commits/" + Merged + "/check-runs"] = _ => Checks(revision);
    var integration = (await Read(fixture)).Integration!;
    Assert.Equal(binding, Assert.Single(integration.Checks!).RevisionBinding);
    Assert.Contains("Required-check applicability", integration.Reason, StringComparison.Ordinal);
  }

  [Fact]
  public async Task ChangedHeadRetainsOldCheckBindingWithoutTreatingGreenAsAuthority()
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/commits/" + Head + "/check-runs"] = _ => Checks(Later);
    var pull = await Read(fixture);
    Assert.Equal("stale", Assert.Single(pull.Checks!).RevisionBinding);
    Assert.Equal(Later, pull.Checks![0].HeadRevision);
  }

  [Theory]
  [InlineData(false, Merged, "2026-11-16T00:00:00Z")]
  [InlineData(true, "invalid", "2026-11-16T00:00:00Z")]
  [InlineData(true, Merged, null)]
  public async Task UnconfirmedOrMalformedMergeNeverReadsPostIntegrationEvidence(bool merged, string revision, string? mergedAt)
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/pulls/13"] = _ => Pull(merged, revision, mergedAt);
    var integration = (await Read(fixture)).Integration!;
    Assert.Equal("unconfirmed", integration.Availability);
    Assert.Null(integration.Revision);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.Contains("/commits/" + Merged, StringComparison.Ordinal));
    Assert.DoesNotContain(fixture.Handler.Paths, path => path == "/repos/example/repository/actions/runs");
  }

  [Theory]
  [InlineData("feature", "main")]
  [InlineData("main", null)]
  public async Task NonDefaultOrUnknownTargetRetainsMergeFactButNotDefaultBranchVerification(string branch, string? defaultBranch)
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/pulls/13"] = _ => Pull(branch: branch, defaultBranch: defaultBranch);
    var integration = (await Read(fixture)).Integration!;
    Assert.Equal("unavailable", integration.Availability);
    Assert.Equal(Merged, integration.Revision);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.Contains("/commits/" + Merged, StringComparison.Ordinal));
  }

  [Fact]
  public async Task FailedCheckAndExpiredArtifactRemainFactsNotVerifiedDelivery()
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/commits/" + Merged + "/check-runs"] = _ => Checks(Merged, "failure");
    fixture.Handler.Responses["/repos/example/repository/actions/runs/900/artifacts"] = _ => Json(new
    { total_count = 1, artifacts = new[] { new { id = 12, name = "result", expired = true, size_in_bytes = 10 } } });
    var integration = (await Read(fixture)).Integration!;
    Assert.Equal("failure", Assert.Single(integration.Checks!).Conclusion);
    var artifact = Assert.Single(Assert.Single(integration.Runs!).Artifacts);
    Assert.Equal("expired", artifact.Availability);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.EndsWith("/zip", StringComparison.Ordinal));
    Assert.Contains("provenance remain unestablished", integration.Reason, StringComparison.Ordinal);
  }

  [Fact]
  public async Task MissingArtifactAndCheckReadsDoNotEraseConfirmedMerge()
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/commits/" + Merged + "/check-runs"] = _ => new(HttpStatusCode.Forbidden);
    fixture.Handler.Responses["/repos/example/repository/actions/runs/900/artifacts"] = _ => new(HttpStatusCode.NotFound);
    var integration = (await Read(fixture)).Integration!;
    Assert.Equal("available", integration.Availability);
    Assert.Equal("unavailable", integration.ChecksAvailability);
    Assert.Equal("unavailable", Assert.Single(integration.Runs!).ArtifactsAvailability);
    Assert.Empty(integration.Runs![0].Artifacts);
  }

  [Fact]
  public async Task RunAndArtifactBoundsExposePartialCoverage()
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/actions/runs"] = _ => Runs(Enumerable.Range(900, 10).Select(id => Run(id, Merged)).ToArray());
    foreach (var id in Enumerable.Range(900, 3))
      fixture.Handler.Responses["/repos/example/repository/actions/runs/" + id + "/artifacts"] = _ => Json(new { total_count = 101, artifacts = Array.Empty<object>() });
    var integration = (await Read(fixture)).Integration!;
    Assert.Equal(3, integration.Runs!.Count);
    Assert.Equal("partial", integration.RunsAvailability);
    Assert.All(integration.Runs, run => Assert.Equal("partial", run.ArtifactsAvailability));
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.EndsWith("903/artifacts", StringComparison.Ordinal));
  }

  [Fact]
  public async Task WrongRepositoryEventBranchAndDuplicateRunsAreNotCorrelated()
  {
    using var fixture = Ready();
    fixture.Handler.Responses["/repos/example/repository/actions/runs"] = _ => Runs(Run(900, Merged), Run(900, Merged),
        Run(901, Merged, repository: "other/repo"), Run(902, Merged, branch: "feature"), Run(903, Merged, sourceEvent: "pull_request"));
    var integration = (await Read(fixture)).Integration!;
    Assert.Single(integration.Runs!);
    Assert.Equal("partial", integration.RunsAvailability);
    Assert.Single(fixture.Handler.Paths, path => path.EndsWith("900/artifacts", StringComparison.Ordinal));
  }

  [Theory]
  [InlineData("/repos/example/repository/commits/" + Merged + "/check-runs")]
  [InlineData("/repos/example/repository/actions/runs")]
  [InlineData("/repos/example/repository/actions/runs/900/artifacts")]
  public async Task RevocationDuringDependentReadsClearsEvidenceAndStopsFurtherRequests(string path)
  {
    using var fixture = Ready();
    fixture.Handler.Responses[path] = _ => new(HttpStatusCode.Unauthorized)
    { Content = new StringContent("{}", Encoding.UTF8, "application/json") };
    var session = await fixture.Session();
    var result = await fixture.Evidence.Handle(new(new(session, "example/repository", 7)), CancellationToken.None);
    Assert.Equal("disconnected", result.Availability);
    Assert.Null(session.GitHub.Current);
    Assert.Empty(result.Reports);
    Assert.Null(result.PullRequests);
    Assert.Equal(path, fixture.Handler.Paths[^1]);
  }

  [Fact]
  public async Task ConnectionReplacementAfterCheckReadCannotStartRunRead()
  {
    using var fixture = Ready();
    var session = await fixture.Session();
    var path = "/repos/example/repository/commits/" + Merged + "/check-runs";
    fixture.Handler.Responses[path] = _ => { GitHubAuthorization.Disconnect(session); return Checks(Merged); };
    var result = await fixture.Evidence.Handle(new(new(session, "example/repository", 7)), CancellationToken.None);
    Assert.Equal("disconnected", result.Availability);
    Assert.Equal(path, fixture.Handler.Paths[^1]);
  }

  private static async Task<RelatedPullRequest> Read(IssueContextTests.Fixture fixture) =>
      Assert.Single((await fixture.Evidence.Handle(new(new(await fixture.Session(), "example/repository", 7)), CancellationToken.None)).PullRequests!);

  private static IssueContextTests.Fixture Ready()
  {
    var fixture = new IssueContextTests.Fixture();
    fixture.Handler.Count = 0;
    fixture.Handler.Responses["/repos/example/repository/issues/7"] = _ => Json(new
    { id = 70, number = 7, title = "Delivery evidence", body = "https://github.com/example/repository/pull/13", comments = 0 });
    fixture.Handler.Responses["/repos/example/repository/pulls/13"] = _ => Pull();
    fixture.Handler.Responses["/repos/example/repository/commits/" + Head + "/check-runs"] = _ => Checks(Head);
    fixture.Handler.Responses["/repos/example/repository/commits/" + Merged + "/check-runs"] = _ => Checks(Merged);
    fixture.Handler.Responses["/repos/example/repository/actions/runs"] = _ => Runs(Run(900, Merged));
    fixture.Handler.Responses["/repos/example/repository/actions/runs/900/artifacts"] = _ => Json(new { total_count = 0, artifacts = Array.Empty<object>() });
    return fixture;
  }

  private static HttpResponseMessage Pull(bool merged = true, string revision = Merged, string? mergedAt = "2026-11-16T00:00:00Z",
      string branch = "main", string? defaultBranch = "main", bool includeMergeRevision = true)
  {
    var value = new Dictionary<string, object?>
    {
      ["number"] = 13, ["merged"] = merged, ["merged_at"] = mergedAt,
      ["base"] = new { @ref = branch, repo = new { full_name = "example/repository", default_branch = defaultBranch } },
      ["head"] = new { sha = Head }
    };
    if (includeMergeRevision) value["merge_commit_sha"] = revision;
    return Json(value);
  }
  private static HttpResponseMessage Checks(string? revision, string conclusion = "success") => Json(new
  { total_count = 1, check_runs = new[] { new { id = 800, name = "verify", head_sha = revision, status = "completed", conclusion } } });
  private static object Run(int id, string revision, string branch = "main", string sourceEvent = "push", string repository = "example/repository") => new
  { id, run_attempt = 2, head_sha = revision, head_branch = branch, @event = sourceEvent, status = "completed", conclusion = "success", repository = new { full_name = repository } };
  private static HttpResponseMessage Runs(params object[] runs) => Json(new { total_count = runs.Length, workflow_runs = runs });
  private static HttpResponseMessage Json(object value) => new(HttpStatusCode.OK)
  { Content = new StringContent(JsonSerializer.Serialize(value), Encoding.UTF8, "application/json") };
}
