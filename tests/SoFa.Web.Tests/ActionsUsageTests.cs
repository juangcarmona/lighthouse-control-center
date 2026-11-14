using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json;
using JuanGCarmona.SoFa.Modules.Workspace;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;
using JuanGCarmona.SoFa.Modules.Workspace.Source;
using Microsoft.AspNetCore.Authentication;

namespace SoFa.Web.Tests;

public sealed class ActionsUsageTests
{
  [Fact]
  public async Task StorageIsBoundedExcludesExpiredArtifactsAndNeverRequestsBilling()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    var result = await fixture.Query.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.Equal("available", result.Availability);
    Assert.Equal(session.GitHub.Current!.DataScope, result.DataScope);
    Assert.Equal(4096d, result.Cache.Value);
    Assert.Equal(128d, result.Artifacts.Value);
    Assert.Equal("partial", result.Artifacts.Availability);
    Assert.False(result.Artifacts.Complete);
    Assert.Equal(1, result.ExpiredArtifacts);
    Assert.Equal(101, result.SourceArtifacts);
    Assert.Equal("unsupported", result.Billing.Availability);
    Assert.Null(result.Billing.Value);
    Assert.DoesNotContain(fixture.Source.Paths, path => path.Contains("billing", StringComparison.Ordinal) || path.Contains("page=2", StringComparison.Ordinal));
  }

  [Fact]
  public async Task ExactAttemptDistinguishesElapsedSpanSelfHostedIntervalsAndUnknownBilling()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    var result = await fixture.Query.Handle(new(session, "example/repository", 42, 2), CancellationToken.None);
    Assert.Equal(90d, result.Duration.Value);
    Assert.True(result.Duration.Complete);
    Assert.Equal(120d, result.Jobs.Sum(job => job.Seconds));
    Assert.Contains(result.Jobs, job => job.RunnerKind == "self-hosted" && job.Seconds == 60);
    Assert.Null(result.Billing.Value);
    fixture.JobCount = 101;
    result = await fixture.Query.Handle(new(session, "example/repository", 42, 2), CancellationToken.None);
    Assert.Equal("partial", result.Duration.Availability);
    Assert.Null(result.Duration.Value);
    fixture.JobCount = 2;
    fixture.Unfinished = true;
    result = await fixture.Query.Handle(new(session, "example/repository", 42, 2), CancellationToken.None);
    Assert.Null(result.Duration.Value);
    Assert.Contains(result.Jobs, job => job.Seconds is null);
  }

  [Fact]
  public async Task FailedAuthorityCheckIsDistinctFromVerifiedContentFailureAndStopsContentReads()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    Assert.Equal("available", (await fixture.Query.Handle(new(session, "example/repository"), CancellationToken.None)).Availability);
    fixture.Source.Responses["/user/installations"] = _ => Response(new { }, HttpStatusCode.ServiceUnavailable);
    var reads = fixture.Source.Paths.Count;
    var unknown = await fixture.Query.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.Equal("authority-unverified", unknown.Availability);
    Assert.Null(unknown.DataScope);
    Assert.Null(unknown.Cache.Value);
    Assert.Empty(unknown.Jobs);
    Assert.DoesNotContain(fixture.Source.Paths.Skip(reads), path => path.Contains("/actions/", StringComparison.Ordinal));
    fixture.AuthorityResponse();
    fixture.Source.Responses["/repos/example/repository/actions/cache/usage"] = _ => Response(new { }, HttpStatusCode.ServiceUnavailable);
    var content = await fixture.Query.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.Equal("available", content.Availability);
    Assert.Equal(session.GitHub.Current!.DataScope, content.DataScope);
    Assert.Equal("unavailable", content.Cache.Availability);
    Assert.Null(content.Cache.Value);
    fixture.ActionsGrant = "none";
    reads = fixture.Source.Paths.Count;
    Assert.Equal("denied", (await fixture.Query.Handle(new(session, "example/repository"), CancellationToken.None)).Availability);
    Assert.DoesNotContain(fixture.Source.Paths.Skip(reads), path => path.Contains("/actions/", StringComparison.Ordinal));
  }

  [Fact]
  public async Task ChangedAccountAndUnconfiguredRepositoryWithholdUsage()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    Assert.Equal("denied", (await fixture.Query.Handle(new(session, "other/repository"), CancellationToken.None)).Availability);
    Assert.Empty(fixture.Source.Paths);
    fixture.Source.Responses["/repos/example/repository/actions/cache/usage"] = _ =>
    {
      GitHubAuthorization.Disconnect(session);
      return Response(new { active_caches_size_in_bytes = 4096 });
    };
    var result = await fixture.Query.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.Equal("disconnected", result.Availability);
    Assert.Null(result.Cache.Value);
    Assert.Null(result.DataScope);
  }

  private static HttpResponseMessage Response(object value, HttpStatusCode status = HttpStatusCode.OK) => new(status)
  { Content = new StringContent(JsonSerializer.Serialize(value), Encoding.UTF8, "application/json") };

  private sealed class Fixture : IDisposable
  {
    private static readonly string[] SelfHostedLabels = ["self-hosted"];
    internal IssueContextTests.Handler Source { get; } = new();
    internal TestClock Clock { get; } = new();
    internal OwnerSessions Sessions { get; }
    internal GetActionsUsageHandler Query { get; }
    internal string ActionsGrant { get; set; } = "read";
    internal int JobCount { get; set; } = 2;
    internal bool Unfinished { get; set; }
    private readonly GitHubTransport transport;
    internal Fixture()
    {
      Sessions = new(OwnerAdmissionTests.Profile(), Clock);
      transport = new(Source);
      var settings = new WorkspaceOptions
      {
        Origin = new("https://workspace.invalid"),
        IdentityMode = "Development",
        Identity = OwnerAdmissionTests.Profile(),
        Repositories = ["example/repository"]
      };
      var authorization = new GitHubAuthorization(settings, Sessions, transport, Clock);
      Query = new(Sessions, authorization, new(settings, Sessions, authorization, transport, Clock), transport, Clock);
      AuthorityResponse();
      Source.Responses["/user/installations/9/repositories"] = _ => Response(new
      { total_count = 1, repositories = new[] { new { full_name = "example/repository" } } });
      Source.Responses["/repos/example/repository"] = _ => Response(new { visibility = "private", permissions = new { pull = true } });
      Source.Responses["/repos/example/repository/actions/cache/usage"] = _ => Response(new { active_caches_size_in_bytes = 4096 });
      Source.Responses["/repos/example/repository/actions/artifacts"] = _ => Response(new
      {
        total_count = 101,
        artifacts = new[] {
          new { id = 1, size_in_bytes = 128, expired = false, expires_at = Clock.GetUtcNow().AddDays(1).ToString("o") },
          new { id = 2, size_in_bytes = 512, expired = false, expires_at = Clock.GetUtcNow().AddDays(-1).ToString("o") }
        }
      });
      Source.Responses["/repos/example/repository/actions/runs/42/attempts/2/jobs"] = _ => Response(new
      {
        total_count = JobCount,
        jobs = new[] {
          new { id = 1, run_id = 42, run_attempt = 2, name = "Self hosted", status = "completed", labels = SelfHostedLabels, started_at = Clock.GetUtcNow().AddMinutes(-2).ToString("o"), completed_at = Clock.GetUtcNow().AddMinutes(-1).ToString("o") },
          new { id = 2, run_id = 42, run_attempt = 2, name = "Parallel", status = Unfinished ? "in_progress" : "completed", labels = Array.Empty<string>(), started_at = Clock.GetUtcNow().AddSeconds(-90).ToString("o"), completed_at = Clock.GetUtcNow().AddSeconds(-30).ToString("o") }
        }
      });
    }
    internal void AuthorityResponse() => Source.Responses["/user/installations"] = _ => Response(new
    {
      total_count = 1,
      installations = new[] { new { id = 9, account = new { login = "example" }, permissions = new { metadata = "read", actions = ActionsGrant } } }
    });
    internal async Task<OwnerSession> Session()
    {
      var principal = OwnerAdmissionTests.Principal(authenticationTime: Clock.GetUtcNow().ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture));
      var session = Sessions.Get(await Sessions.StoreAsync(new AuthenticationTicket(principal, "owner")))!;
      session.GitHub.Current = new(71, "verified-user", new("isolated-source-access", "isolated-source-refresh",
        Clock.GetUtcNow().AddHours(1), Clock.GetUtcNow().AddHours(4)), Clock.GetUtcNow());
      return session;
    }
    public void Dispose() { Query.Dispose(); transport.Dispose(); }
  }
}
