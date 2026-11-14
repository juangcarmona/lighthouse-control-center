using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json;
using JuanGCarmona.SoFa.Modules.Workspace;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;
using JuanGCarmona.SoFa.Modules.Workspace.Source;
using Microsoft.AspNetCore.Authentication;

namespace SoFa.Web.Tests;

public sealed class FactoryDiscoveryTests
{
  [Fact]
  public async Task TwoRepositoriesAndSecondPageKeepOrdinaryClosedIssuesAndCoverage()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    var first = await fixture.Query.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.Equal("available", first.Availability);
    Assert.Equal(25, first.SourceRecords);
    Assert.Equal(24, first.Issues.Count);
    Assert.Equal(2, first.NextPage);
    Assert.False(first.Complete);
    Assert.Contains(first.Issues, issue => issue.State == "closed" && issue.Labels.Count == 0);
    Assert.DoesNotContain(first.Issues, issue => issue.Number == 25);
    Assert.Equal("expected", first.ConfiguredBranch);
    Assert.Equal("main", first.ObservedBranch);
    var second = await fixture.Query.Handle(new(session, "example/repository", 2), CancellationToken.None);
    Assert.Equal(26, Assert.Single(second.Issues).Number);
    Assert.True(second.Complete);
    Assert.Null(second.NextPage);
    var other = await fixture.Query.Handle(new(session, "example/other"), CancellationToken.None);
    Assert.Equal("available", other.Availability);
    Assert.All(other.Issues, issue => Assert.StartsWith("https://github.com/example/other/issues/", issue.SourceUrl, StringComparison.Ordinal));
    Assert.Equal(first.DataScope, other.DataScope);
  }

  [Fact]
  public async Task ExactNumberBypassesCollectionWithoutLoadingConversationAndRejectsPullRequests()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    var exact = await fixture.Query.Handle(new(session, "example/repository", Number: 701), CancellationToken.None);
    Assert.Equal(701, Assert.Single(exact.Issues).Number);
    Assert.True(exact.Complete);
    Assert.DoesNotContain(fixture.Source.Paths, p => p.EndsWith("/comments", StringComparison.Ordinal));
    fixture.Source.Responses["/repos/example/repository/issues/701"] = _ => Response(new { pull_request = new { } });
    Assert.Equal("invalid", (await fixture.Query.Handle(new(session, "example/repository", Number: 701), CancellationToken.None)).Availability);
  }

  [Fact]
  public async Task SourceFailureAndPermissionLossNeverBecomeAnEmptyOrAuthorizedCollection()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    fixture.Source.Responses["/repos/example/repository/issues"] = _ => Response(new { }, HttpStatusCode.ServiceUnavailable);
    var failed = await fixture.Query.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.Equal("unavailable", failed.Availability);
    Assert.False(failed.Complete);
    fixture.IssueGrant = "none";
    var reads = fixture.Source.Paths.Count;
    Assert.Equal("denied", (await fixture.Query.Handle(new(session, "example/repository"), CancellationToken.None)).Availability);
    Assert.DoesNotContain(fixture.Source.Paths.Skip(reads), p => p == "/repos/example/repository/issues");
    fixture.IssueGrant = "read";
    fixture.Source.Responses["/repos/example/repository/issues"] = _ => Response(new { }, HttpStatusCode.Unauthorized);
    Assert.Equal("disconnected", (await fixture.Query.Handle(new(session, "example/repository"), CancellationToken.None)).Availability);
    Assert.Null(session.GitHub.Current);
    Assert.Equal("disconnected", (await fixture.Query.Handle(new(session, "example/repository"), CancellationToken.None)).Availability);
  }

  [Fact]
  public async Task BoundsInvalidScopeAndChangingIdentityStopReadsWithoutSilentlyOmittingRows()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    Assert.Equal("invalid", (await fixture.Query.Handle(new(session, "example/repository", 11), CancellationToken.None)).Availability);
    Assert.Equal("denied", (await fixture.Query.Handle(new(session, "private/unconfigured"), CancellationToken.None)).Availability);
    Assert.Empty(fixture.Source.Paths);
    fixture.Source.Responses["/repos/example/repository/issues"] = _ => Response(Enumerable.Range(1, 25).Select(Fixture.Issue));
    var last = await fixture.Query.Handle(new(session, "example/repository", 10), CancellationToken.None);
    Assert.False(last.Complete);
    Assert.Null(last.NextPage);
    fixture.Source.Responses["/repos/example/repository/issues"] = _ => Response(new object[] { new { number = 2, title = "Malformed" } });
    Assert.Equal("unavailable", (await fixture.Query.Handle(new(session, "example/repository"), CancellationToken.None)).Availability);
    fixture.Source.Responses["/repos/example/repository/issues"] = _ => { GitHubAuthorization.Disconnect(session); return Response(new[] { Fixture.Issue(2) }); };
    var ended = await fixture.Query.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.Equal("disconnected", ended.Availability);
    Assert.Empty(ended.Issues);
  }

  private static HttpResponseMessage Response(object value, HttpStatusCode status = HttpStatusCode.OK) => new(status)
  { Content = new StringContent(JsonSerializer.Serialize(value), Encoding.UTF8, "application/json") };

  private sealed class Fixture : IDisposable
  {
    internal IssueContextTests.Handler Source { get; } = new();
    internal TestClock Clock { get; } = new();
    internal OwnerSessions Sessions { get; }
    internal GetFactoryPageHandler Query { get; }
    internal string IssueGrant { get; set; } = "read";
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
        Repositories = ["example/repository", "example/other"],
        RepositoryBranches = new Dictionary<string, string> { ["example/repository"] = "expected" }
      };
      var authorization = new GitHubAuthorization(settings, Sessions, transport, Clock);
      Query = new(settings, Sessions, authorization, new(settings, Sessions, authorization, transport, Clock), transport, Clock);
      Source.Responses["/user/installations"] = _ => Response(new
      {
        total_count = 1,
        installations = new[] {
        new { id = 9, account = new { login = "example" }, permissions = new { metadata = "read", issues = IssueGrant, actions = "read" } } }
      });
      Source.Responses["/user/installations/9/repositories"] = _ => Response(new
      {
        total_count = 2,
        repositories = new[] { new { full_name = "example/repository" }, new { full_name = "example/other" } }
      });
      foreach (var repo in settings.Repositories)
      {
        Source.Responses["/repos/" + repo] = _ => Response(new { full_name = repo, default_branch = "main", permissions = new { pull = true } });
        Source.Responses["/repos/" + repo + "/issues"] = request =>
          Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(request.RequestUri!.Query)["page"] == "1"
            ? Response(Enumerable.Range(1, 24).Select(Issue).Append((object)new { pull_request = new { }, number = 25 }))
            : Response(new[] { Issue(26) });
        Source.Responses["/repos/" + repo + "/issues/701"] = _ => Response(Issue(701));
      }
    }
    internal static object Issue(int number) => new
    {
      id = number + 1000,
      number,
      title = "Ordinary " + number,
      state = number == 1 ? "closed" : "open",
      labels = Array.Empty<object>(),
      updated_at = "2026-11-07T10:00:00Z"
    };
    internal async Task<OwnerSession> Session()
    {
      var principal = OwnerAdmissionTests.Principal(authenticationTime: Clock.GetUtcNow().ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture));
      var session = Sessions.Get(await Sessions.StoreAsync(new AuthenticationTicket(principal, "owner")))!;
      session.GitHub.Current = new(71, "verified-user", new("isolated-source-access", "isolated-source-refresh",
        Clock.GetUtcNow().AddHours(1), Clock.GetUtcNow().AddHours(4)), Clock.GetUtcNow());
      return session;
    }
    public void Dispose() => transport.Dispose();
  }
}
