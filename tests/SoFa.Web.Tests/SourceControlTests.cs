using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json;
using JuanGCarmona.SoFa.Modules.Workspace;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;
using JuanGCarmona.SoFa.Modules.Workspace.Source;
using Microsoft.AspNetCore.Authentication;

namespace SoFa.Web.Tests;

public sealed class SourceControlTests
{
  [Theory]
  [InlineData("")]
  [InlineData("issues/7")]
  [InlineData("issues/7/comments?per_page=100&page=2")]
  [InlineData("issues/comments/77")]
  [InlineData("commits/feature%2Fbranch")]
  [InlineData("pulls?state=open&per_page=100")]
  [InlineData("pulls/7/reviews?per_page=100&page=2")]
  [InlineData("actions/runs/77/attempts/2/jobs?per_page=100")]
  [InlineData("actions/runs/77/artifacts?per_page=100")]
  [InlineData("actions/variables/LIGHTHOUSE_AUTOMATION_ENABLED")]
  [InlineData("actions/workflows/lighthouse-sdlc-unattended.yml/runs?status=waiting&per_page=100")]
  [InlineData("contents/.lighthouse/issue-control.json?ref=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")]
  public void ScopedSdkReadPathsAreAvailable(string path) => Assert.True(ControlReadPaths.Allowed(path));

  [Theory]
  [InlineData("https://other.invalid/user")]
  [InlineData("/user")]
  [InlineData("../user")]
  [InlineData("commits/%252e%252e%252fuser")]
  [InlineData("commits/%5cuser")]
  [InlineData("commits/%0aheader")]
  [InlineData("issues/7#fragment")]
  [InlineData("issues/7?redirect=https://other.invalid")]
  [InlineData("issues/7/comments?per_page=100&page=0")]
  [InlineData("actions/workflows/other.yml/dispatches")]
  [InlineData("actions/runners")]
  [InlineData("actions/variables/SECRET")]
  [InlineData("contents/.env?ref=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")]
  [InlineData("contents/.lighthouse/issue-control.json?ref=main")]
  public void NonContractAndEscapingPathsAreRefused(string path) => Assert.False(ControlReadPaths.Allowed(path));

  [Theory]
  [InlineData("\n")]
  [InlineData("{}")]
  [InlineData("{}\r\n")]
  [InlineData("not-json\n")]
  public async Task InvalidOrTruncatedProtocolFramesAreRejected(string text)
  {
    using var stream = new MemoryStream(Encoding.UTF8.GetBytes(text));
    var frames = new ControlFrames(stream);
    await Assert.ThrowsAnyAsync<Exception>(async () => { using var result = await frames.Next(CancellationToken.None); });
  }

  [Fact]
  public async Task ProtocolPreservesFramesAndRejectsOversizedOrInvalidUtf8()
  {
    using var stream = new MemoryStream(Encoding.UTF8.GetBytes("{\"a\":1}\n{\"b\":2}\n"));
    var frames = new ControlFrames(stream);
    using var first = await frames.Next(CancellationToken.None);
    using var second = await frames.Next(CancellationToken.None);
    Assert.Equal(1, first!.RootElement.GetProperty("a").GetInt32());
    Assert.Equal(2, second!.RootElement.GetProperty("b").GetInt32());
    Assert.Null(await frames.Next(CancellationToken.None));
    using var large = new MemoryStream(Encoding.UTF8.GetBytes(new string(' ', 4 * 1024 * 1024 + 1) + "\n"));
    await Assert.ThrowsAsync<InvalidDataException>(async () => { using var result = await new ControlFrames(large).Next(CancellationToken.None); });
    using var invalid = new MemoryStream(new byte[] { 123, 34, 97, 34, 58, 34, 255, 34, 125, 10 });
    await Assert.ThrowsAsync<InvalidDataException>(async () => { using var result = await new ControlFrames(invalid).Next(CancellationToken.None); });
  }

  [Fact]
  public async Task ControlAuthorityCombinesIntendedAppAndActualUserWithoutGuessingUnknownGrants()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    var result = await fixture.Access.CheckControlsAsync(session, "example/repository", CancellationToken.None);
    Assert.Equal(SourceAvailability.Available, result.Availability);
    Assert.True(result.Controls!.CommentWrite);
    Assert.True(result.Controls.DispatchWrite);
    Assert.False(result.Controls.ContentsRead); // A missing App grant is not read authority.
    Assert.Equal(session.GitHub.Current!.DataScope, result.Controls.DataScope);
    Assert.Equal(session.GitHub.Generation, result.Controls.Generation);
    fixture.Handler.ActionsGrant = 17; // A malformed grant is unknown, never enabled.
    result = await fixture.Access.CheckControlsAsync(session, "example/repository", CancellationToken.None);
    Assert.Null(result.Controls!.ActionsRead);
    Assert.Null(result.Controls.DispatchWrite);
    fixture.Handler.CanWrite = false;
    result = await fixture.Access.CheckControlsAsync(session, "example/repository", CancellationToken.None);
    Assert.False(result.Controls!.CommentWrite);
    Assert.False(result.Controls.DispatchWrite);
  }

  [Theory]
  [InlineData("commits/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "commits/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")]
  [InlineData("contents/.lighthouse/issue-control.json?ref=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "contents/.lighthouse/issue-control.json")]
  [InlineData("pulls?state=open&per_page=100", "pulls")]
  public async Task ExplicitlyPublicRepositoryAllowsOnlyDocumentedReadWithoutAppReadGrant(string path, string expectedEndpoint)
  {
    using var fixture = new Fixture();
    fixture.Handler.SetPublicRepository();
    fixture.Handler.ContentsGrant = null;
    fixture.Handler.PullRequestsGrant = null;
    var session = await fixture.Session();
    var opened = await fixture.Source.Open(new(session, "example/repository", 7), CancellationToken.None);
    Assert.Equal("available", opened.Availability);
    Assert.True(opened.Lease!.Controls.PublicRepository);
    Assert.False(opened.Lease.Controls.ContentsRead);
    Assert.False(opened.Lease.Controls.PullRequestsRead);
    using var request = JsonDocument.Parse(JsonSerializer.Serialize(new
    { type = "request", id = 1, kind = "transport", scope = "repository", path }));
    var result = await opened.Lease.Callback(request.RootElement, CancellationToken.None);
    Assert.True(result.Ok);
    Assert.Contains(fixture.Handler.Paths, sent => sent.EndsWith("/" + expectedEndpoint, StringComparison.Ordinal));
    Assert.Equal("available", (await opened.Lease.Validate(CancellationToken.None)).Availability);
  }

  [Theory]
  [InlineData("private", true, "private", true)]
  [InlineData("private", false, "public", false)]
  [InlineData("public", false, "private", false)]
  [InlineData("internal", false, "internal", false)]
  [InlineData(null, false, "public", false)]
  [InlineData("public", false, null, false)]
  [InlineData("public", true, "public", false)]
  [InlineData("public", false, "public", true)]
  public async Task PublicReadRequiresExplicitConsistentPublicVisibility(string? metadataVisibility, bool metadataPrivate,
      string? listedVisibility, bool listedPrivate)
  {
    using var fixture = new Fixture();
    fixture.Handler.MetadataVisibility = metadataVisibility;
    fixture.Handler.MetadataPrivate = metadataPrivate;
    fixture.Handler.ListedVisibility = listedVisibility;
    fixture.Handler.ListedPrivate = listedPrivate;
    fixture.Handler.ContentsGrant = null;
    var session = await fixture.Session();
    var opened = await fixture.Source.Open(new(session, "example/repository", 7), CancellationToken.None);
    Assert.Equal("available", opened.Availability);
    Assert.False(opened.Lease!.Controls.PublicRepository);
    using var request = JsonDocument.Parse("{\"type\":\"request\",\"id\":1,\"kind\":\"transport\",\"scope\":\"repository\",\"path\":\"commits/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"}");
    var result = await opened.Lease.Callback(request.RootElement, CancellationToken.None);
    Assert.False(result.Ok);
    Assert.Equal(403, result.Status);
    Assert.DoesNotContain(fixture.Handler.Paths, sent => sent.Contains("/commits/", StringComparison.Ordinal));
  }

  [Fact]
  public async Task UnknownAppGrantDoesNotUsePublicReadException()
  {
    using var fixture = new Fixture();
    fixture.Handler.SetPublicRepository();
    fixture.Handler.ContentsGrant = 17;
    var session = await fixture.Session();
    var opened = await fixture.Source.Open(new(session, "example/repository", 7), CancellationToken.None);
    using var request = JsonDocument.Parse("{\"type\":\"request\",\"id\":1,\"kind\":\"transport\",\"scope\":\"repository\",\"path\":\"commits/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"}");
    var result = await opened.Lease!.Callback(request.RootElement, CancellationToken.None);
    Assert.False(result.Ok);
    Assert.Equal(503, result.Status);
    Assert.DoesNotContain(fixture.Handler.Paths, sent => sent.Contains("/commits/", StringComparison.Ordinal));

    fixture.Handler.ContentsGrant = null;
    fixture.Handler.IssuesGrant = "read";
    fixture.Handler.ActionsGrant = "read";
    fixture.Handler.CanWrite = false;
    var writeAuthority = await fixture.Access.CheckControlsAsync(session, "example/repository", CancellationToken.None);
    Assert.True(writeAuthority.Controls!.PublicRepository);
    Assert.False(writeAuthority.Controls.CommentWrite);
    Assert.False(writeAuthority.Controls.DispatchWrite);
  }

  [Fact]
  public async Task UpstreamPublicReadDenialIsReturnedAndPublicToPrivateChangeInvalidatesLease()
  {
    using var fixture = new Fixture();
    fixture.Handler.SetPublicRepository();
    fixture.Handler.ContentsGrant = null;
    var session = await fixture.Session();
    var opened = await fixture.Source.Open(new(session, "example/repository", 7), CancellationToken.None);
    using var request = JsonDocument.Parse("{\"type\":\"request\",\"id\":1,\"kind\":\"transport\",\"scope\":\"repository\",\"path\":\"commits/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"}");
    fixture.Handler.DenyPublicReads = true;
    var denied = await opened.Lease!.Callback(request.RootElement, CancellationToken.None);
    Assert.False(denied.Ok);
    Assert.Equal(403, denied.Status);
    Assert.Contains(fixture.Handler.Paths, sent => sent.Contains("/commits/", StringComparison.Ordinal));
    fixture.Handler.DenyPublicReads = false;
    fixture.Handler.MetadataVisibility = fixture.Handler.ListedVisibility = "private";
    fixture.Handler.MetadataPrivate = fixture.Handler.ListedPrivate = true;
    Assert.Equal("denied", (await opened.Lease.Validate(CancellationToken.None)).Availability);
  }

  [Fact]
  public async Task ForeignAppAndMismatchedRepositoryIdsNeverStartSharedContentReads()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    fixture.Handler.AppId = 999;
    var denied = await fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None);
    Assert.Equal("denied", denied.Availability);
    Assert.Null(denied.Facts);
    fixture.Handler.AppId = 9001;
    fixture.Handler.SetPublicRepository();
    fixture.Handler.AccessibleRepositoryId = 999;
    var unbound = await fixture.Source.Open(new(session, "example/repository", 7), CancellationToken.None);
    Assert.Equal("unavailable", unbound.Availability);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.Contains("/commits/", StringComparison.Ordinal));
    var unknown = await fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None);
    Assert.Equal("unavailable", unknown.Availability);
    Assert.Null(unknown.Facts);
    Assert.False(unknown.SubmissionAvailable);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.Contains("/issues/", StringComparison.Ordinal));
  }

  [Fact]
  public async Task MissingAppIdAndInvalidSelectionDoNotMakeCredentialBearingRequests()
  {
    using var fixture = new Fixture(appId: null);
    var session = await fixture.Session();
    var unsupported = await fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None);
    Assert.Equal("unsupported", unsupported.Availability);
    Assert.Equal(session.GitHub.Current!.DataScope, unsupported.DataScope);
    Assert.Equal("invalid", (await fixture.Query.Handle(new(session, "other/repository", 7), CancellationToken.None)).Availability);
    Assert.Equal("invalid", (await fixture.Query.Handle(new(session, "example/repository", 0), CancellationToken.None)).Availability);
    Assert.Empty(fixture.Handler.Paths);
  }

  private sealed class Fixture : IDisposable
  {
    private readonly TestClock clock = new();
    private readonly GitHubTransport transport;
    private readonly SourceControlBridge bridge = new();
    private readonly ControlJournal journal = new(null, null);
    private readonly OwnerSessions sessions;
    internal Handler Handler { get; } = new();
    internal RepositoryAccess Access { get; }
    internal SourceControlAccess Source { get; }
    internal GetIssueControlsHandler Query { get; }
    internal Fixture(long? appId = 9001)
    {
      sessions = new(OwnerAdmissionTests.Profile(), clock);
      transport = new(Handler);
      var settings = new WorkspaceOptions
      {
        Origin = new Uri("https://workspace.invalid"),
        IdentityMode = "Development",
        Identity = OwnerAdmissionTests.Profile(),
        Repositories = ["example/repository"],
        GitHubAppId = appId
      };
      var authorization = new GitHubAuthorization(settings, sessions, transport, clock);
      Access = new(settings, sessions, authorization, transport, clock);
      Source = new(settings, sessions, authorization, Access, transport);
      Query = new(new(settings, sessions, authorization, Access, transport), bridge, journal, clock);
    }
    internal async Task<OwnerSession> Session()
    {
      var principal = OwnerAdmissionTests.Principal(authenticationTime: clock.GetUtcNow().ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture));
      var session = sessions.Get(await sessions.StoreAsync(new AuthenticationTicket(principal, "owner")))!;
      session.GitHub.Current = new(71, "verified-user", new("isolated-source-access", "isolated-source-refresh",
          clock.GetUtcNow().AddHours(1), clock.GetUtcNow().AddHours(4)), clock.GetUtcNow());
      return session;
    }
    public void Dispose() { bridge.Dispose(); transport.Dispose(); journal.Dispose(); }
  }

  private sealed class Handler : HttpMessageHandler
  {
    internal long AppId { get; set; } = 9001;
    internal long AccessibleRepositoryId { get; set; } = 22;
    internal object ActionsGrant { get; set; } = "write";
    internal object? ContentsGrant { get; set; }
    internal object? PullRequestsGrant { get; set; } = "read";
    internal object IssuesGrant { get; set; } = "write";
    internal bool CanWrite { get; set; } = true;
    internal string? MetadataVisibility { get; set; } = "private";
    internal bool MetadataPrivate { get; set; } = true;
    internal string? ListedVisibility { get; set; }
    internal bool ListedPrivate { get; set; } = true;
    internal bool DenyPublicReads { get; set; }
    internal List<string> Paths { get; } = [];
    internal void SetPublicRepository()
    {
      MetadataVisibility = ListedVisibility = "public";
      MetadataPrivate = ListedPrivate = false;
    }
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
      Assert.Equal(HttpMethod.Get, request.Method);
      Assert.Equal("api.github.com", request.RequestUri!.Host);
      Assert.Equal("isolated-source-access", request.Headers.Authorization?.Parameter);
      var path = request.RequestUri.AbsolutePath; Paths.Add(path);
      if (DenyPublicReads && (path.Contains("/commits/", StringComparison.Ordinal) || path.Contains("/contents/", StringComparison.Ordinal)
          || path.EndsWith("/pulls", StringComparison.Ordinal)))
        return Task.FromResult(new HttpResponseMessage(HttpStatusCode.Forbidden) { Content = new StringContent("{}", Encoding.UTF8, "application/json") });
      var grants = new Dictionary<string, object?>
      { ["metadata"] = "read", ["issues"] = IssuesGrant, ["actions"] = ActionsGrant, ["variables"] = "read" };
      if (ContentsGrant is not null) grants["contents"] = ContentsGrant;
      if (PullRequestsGrant is not null) grants["pull_requests"] = PullRequestsGrant;
      object data = path switch
      {
        "/repos/example/repository" => new { id = 22, full_name = "example/repository", visibility = MetadataVisibility, @private = MetadataPrivate, permissions = new { pull = true, push = CanWrite, maintain = false, admin = false } },
        "/user/installations" => new
        {
          total_count = 1,
          installations = new[] { new { id = 9, app_id = AppId, account = new { login = "example" },
          permissions = grants } }
        },
        "/user/installations/9/repositories" => new { total_count = 1, repositories = new[] { new { id = AccessibleRepositoryId, full_name = "example/repository", visibility = ListedVisibility, @private = ListedPrivate } } },
        "/repos/example/repository/commits/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" => new { sha = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
        "/repos/example/repository/contents/.lighthouse/issue-control.json" => new { name = "issue-control.json" },
        "/repos/example/repository/pulls" => new { total_count = 0, items = Array.Empty<object>() },
        _ => throw new InvalidOperationException("Unexpected source read")
      };
      return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(JsonSerializer.Serialize(data), Encoding.UTF8, "application/json") });
    }
  }
}
