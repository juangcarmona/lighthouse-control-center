using System.Net;
using System.Text;
using System.Text.Json;
using JuanGCarmona.SoFa.Modules.Workspace;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;
using JuanGCarmona.SoFa.Modules.Workspace.Source;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.WebUtilities;

namespace SoFa.Web.Tests;

public sealed class GitHubAuthorizationTests
{
  private static readonly string[] ExpectedCalls = ["POST /login/oauth/access_token", "GET /user"];
  private static readonly string[] SelectedRepositories = ["example/repository"];
  [Fact]
  public async Task ExplicitAuthorizationUsesPkceAndRecordsTheVerifiedNumericUserOnlyOnce()
  {
    using var fixture = new SourceFixture();
    var record = await fixture.Session();
    var state = fixture.Begin(record);
    Assert.Equal(ConnectionOutcome.Connected, await fixture.Authorization.CompleteAsync(record, state, "isolated-code", CancellationToken.None));
    Assert.Equal(71, record.GitHub.Current!.UserId);
    Assert.Equal("verified-user", record.GitHub.Current.Login);
    Assert.Equal(ConnectionOutcome.Rejected, await fixture.Authorization.CompleteAsync(record, state, "isolated-code", CancellationToken.None));
    Assert.Equal(ExpectedCalls, fixture.Handler.Calls);
  }

  [Fact]
  public async Task CallbackCannotChangeSessionOrSurviveExpiryCancellationOrLogout()
  {
    using var fixture = new SourceFixture();
    var record = await fixture.Session();
    var other = await fixture.Session();
    var state = fixture.Begin(record);
    Assert.Equal(ConnectionOutcome.Rejected, await fixture.Authorization.CompleteAsync(other, state, "isolated-code", CancellationToken.None));
    Assert.Equal(ConnectionOutcome.Rejected, await fixture.Authorization.CompleteAsync(record, state, null, CancellationToken.None));
    Assert.Equal(ConnectionOutcome.Rejected, await fixture.Authorization.CompleteAsync(record, state, "isolated-code", CancellationToken.None));
    state = fixture.Begin(record);
    fixture.Clock.Advance(TimeSpan.FromMinutes(5));
    Assert.Equal(ConnectionOutcome.Rejected, await fixture.Authorization.CompleteAsync(record, state, "isolated-code", CancellationToken.None));
    state = fixture.Begin(record);
    fixture.Sessions.Remove(record.Id);
    Assert.Equal(ConnectionOutcome.Rejected, await fixture.Authorization.CompleteAsync(record, state, "isolated-code", CancellationToken.None));
    Assert.Empty(fixture.Handler.Calls);
  }

  [Fact]
  public async Task NewAccountRequiresConfirmationAndAFailedReplacementPreservesTheCurrentAccount()
  {
    using var fixture = new SourceFixture();
    var record = await fixture.Session();
    await fixture.Connect(record);
    var original = record.GitHub.Current;
    fixture.Handler.UserId = 72;
    Assert.Equal(ConnectionOutcome.ConfirmationRequired, await fixture.Connect(record));
    Assert.Same(original, record.GitHub.Current);
    fixture.Begin(record); // Cancels an unconfirmed candidate, without disconnecting the current account.
    Assert.False(fixture.Authorization.Confirm(record));
    Assert.Same(original, record.GitHub.Current);
    fixture.Handler.FailExchange = true;
    Assert.Equal(ConnectionOutcome.Unavailable, await fixture.Connect(record));
    Assert.Same(original, record.GitHub.Current);
    fixture.Handler.FailExchange = false;
    Assert.Equal(ConnectionOutcome.ConfirmationRequired, await fixture.Connect(record));
    Assert.True(fixture.Authorization.Confirm(record));
    Assert.Equal(72, record.GitHub.Current!.UserId);
    Assert.False(fixture.Authorization.Confirm(record));
  }

  [Fact]
  public async Task AuthorizationAlreadyInFlightCannotRestoreDisconnectedOrLoggedOutAuthority()
  {
    using var fixture = new SourceFixture();
    var record = await fixture.Session();
    var release = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
    fixture.Handler.ExchangeWait = release.Task;
    var pending = fixture.Connect(record);
    GitHubAuthorization.Disconnect(record);
    release.SetResult();
    Assert.Equal(ConnectionOutcome.Rejected, await pending);
    Assert.Null(record.GitHub.Current);
    fixture.Handler.ExchangeWait = null;
    await fixture.Connect(record);
    fixture.Sessions.Remove(record.Id);
    Assert.Null(record.GitHub.Current);
    Assert.Null(record.GitHub.Authorization);
  }

  [Fact]
  public async Task ConcurrentTokenRefreshCannotExtendTheOwnerSessionAndRevocationClearsTheConnection()
  {
    using var fixture = new SourceFixture();
    var record = await fixture.Session();
    await fixture.Connect(record);
    var absolute = record.AbsoluteDeadline;
    var idle = record.IdleDeadline;
    fixture.Clock.Advance(TimeSpan.FromMinutes(4));
    var connections = await Task.WhenAll(Enumerable.Range(0, 10).Select(_ => fixture.Authorization.CurrentAsync(record, CancellationToken.None)));
    Assert.All(connections, connection => Assert.Same(record.GitHub.Current, connection));
    Assert.Equal(2, fixture.Handler.Calls.Count(c => c == "POST /login/oauth/access_token"));
    Assert.Equal(absolute, record.AbsoluteDeadline);
    Assert.Equal(idle, record.IdleDeadline);
    fixture.Clock.Advance(TimeSpan.FromMinutes(5));
    fixture.Handler.Revoked = true;
    Assert.Null(await fixture.Authorization.CurrentAsync(record, CancellationToken.None));
    Assert.Null(record.GitHub.Current);
  }

  [Fact]
  public async Task RepositoryAuthorityIntersectsUserAndAppGrantsAndTraversesBothSecondPages()
  {
    using var fixture = new SourceFixture();
    var record = await fixture.Session();
    await fixture.Connect(record);
    fixture.Handler.Paginated = true;
    var authority = await fixture.Access.CheckAsync(record, "example/repository", CancellationToken.None);
    Assert.Equal(SourceAvailability.Available, authority.Availability);
    Assert.True(authority.IssuesRead);
    Assert.True(authority.ActionsRead);
    Assert.True(authority.IssuesWrite);
    Assert.Equal(2, fixture.Handler.Calls.Count(c => c == "GET /user/installations"));
    Assert.Equal(2, fixture.Handler.Calls.Count(c => c == "GET /user/installations/9/repositories"));
    fixture.Handler.CanWrite = false;
    Assert.False((await fixture.Access.CheckAsync(record, "example/repository", CancellationToken.None)).IssuesWrite);
    fixture.Handler.CanWrite = true;
    fixture.Handler.IssueGrant = "read";
    Assert.False((await fixture.Access.CheckAsync(record, "example/repository", CancellationToken.None)).IssuesWrite);
    fixture.Handler.CanRead = false;
    Assert.Equal(SourceAvailability.Denied, (await fixture.Access.CheckAsync(record, "example/repository", CancellationToken.None)).Availability);
    var calls = fixture.Handler.Calls.Count;
    Assert.Equal(SourceAvailability.Denied, (await fixture.Access.CheckAsync(record, "other/repository", CancellationToken.None)).Availability);
    Assert.Equal(calls, fixture.Handler.Calls.Count);
  }

  [Theory]
  [InlineData("/repos/example/repository", false)]
  [InlineData("/user/installations?per_page=100&page=1", false)]
  [InlineData("/user/installations/9/repositories?per_page=100&page=1", false)]
  [InlineData("/repos/example/repository", true)]
  [InlineData("/user/installations?per_page=100&page=1", true)]
  [InlineData("/user/installations/9/repositories?per_page=100&page=1", true)]
  public async Task AuthorityEnumerationStopsAfterDisconnectOrAccountReplacement(string boundary, bool replace)
  {
    using var fixture = new SourceFixture();
    var record = await fixture.Session();
    await fixture.Connect(record);
    fixture.Handler.Paginated = true;
    var stoppedAt = 0;
    GitHubConnection? replacement = null;
    fixture.Handler.OnRequest = request =>
    {
      if (request.RequestUri!.PathAndQuery != boundary) return;
      stoppedAt = fixture.Handler.Calls.Count;
      lock (record.Sync)
      {
        if (replace)
        {
          replacement = new GitHubConnection(72, "replacement", record.GitHub.Current!.Tokens, fixture.Clock.GetUtcNow());
          record.GitHub.Current = replacement;
          record.GitHub.Generation++;
        }
        else GitHubAuthorization.Disconnect(record);
      }
    };
    var authority = await fixture.Access.CheckAsync(record, "example/repository", CancellationToken.None);
    Assert.True(stoppedAt > 0);
    Assert.Equal(stoppedAt, fixture.Handler.Calls.Count);
    Assert.Equal(SourceAvailability.Unavailable, authority.Availability);
    Assert.Same(replacement, record.GitHub.Current);
  }

  [Theory]
  [InlineData(true)]
  [InlineData(false)]
  public async Task DueCredentialVerificationDoesNotStartAfterCapturedConnectionWasDisconnected(bool refresh)
  {
    using var fixture = new SourceFixture();
    var record = await fixture.Session();
    await fixture.Connect(record);
    if (!refresh) record.GitHub.Current!.Tokens = new GitHubTokens("isolated-user-access", "isolated-user-refresh",
        fixture.Clock.GetUtcNow().AddHours(1), fixture.Clock.GetUtcNow().AddHours(2));
    fixture.Clock.Advance(TimeSpan.FromMinutes(5));
    var calls = fixture.Handler.Calls.Count;
    var reads = 0;
    fixture.Clock.BeforeRead = () =>
    {
      if (++reads != (refresh ? 2 : 3)) return;
      fixture.Clock.BeforeRead = null;
      GitHubAuthorization.Disconnect(record);
    };
    Assert.Null(await fixture.Authorization.CurrentAsync(record, CancellationToken.None));
    Assert.Equal(calls, fixture.Handler.Calls.Count);
    Assert.Null(record.GitHub.Current);
  }

  [Fact]
  public async Task ObservationReadsCoalesceButRecheckAuthorityBeforeUsingTheCache()
  {
    using var fixture = new SourceFixture();
    var record = await fixture.Session();
    await fixture.Connect(record);
    var release = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
    fixture.Handler.DataWait = release.Task;
    var reads = Enumerable.Range(0, 10).Select(_ => fixture.Observations.Handle(new GetObservations(record), CancellationToken.None)).ToArray();
    Assert.Single(fixture.Handler.Calls, c => c == "GET /repos/example/repository/actions/runs");
    release.SetResult();
    var snapshots = await Task.WhenAll(reads);
    Assert.All(snapshots, snapshot =>
    {
      Assert.Equal(record.GitHub.Current!.DataScope, snapshot!.DataScope);
      var repo = Assert.Single(snapshot!.Repositories);
      Assert.Equal("available", repo.Availability);
      Assert.Equal(71, Assert.Single(repo.Runs!).Id);
      Assert.Equal(1, Assert.Single(repo.Attention!).Number);
    });
    Assert.Single(fixture.Handler.Calls, c => c == "GET /repos/example/repository/issues");
    fixture.Handler.CanRead = false;
    var denied = await fixture.Observations.Handle(new GetObservations(record), CancellationToken.None);
    Assert.Equal("unavailable", Assert.Single(denied!.Repositories).Availability);
    Assert.Empty(record.GitHub.Observations);
    Assert.Single(fixture.Handler.Calls, c => c == "GET /repos/example/repository/actions/runs");
    fixture.Handler.CanRead = true;
    fixture.Handler.DataUnavailable = true;
    var unavailable = Assert.Single((await fixture.Observations.Handle(new GetObservations(record), CancellationToken.None))!.Repositories);
    Assert.Equal("unavailable", unavailable.Availability);
    Assert.Null(unavailable.Runs);
    Assert.Null(unavailable.Attention);
  }

  [Theory]
  [InlineData(503, true)]
  [InlineData(429, true)]
  [InlineData(403, false)]
  [InlineData(404, false)]
  public async Task TemporaryCollectionFailureRetainsOnlySameScopeEvidenceAfterFreshAuthority(int status, bool retained)
  {
    using var fixture = new SourceFixture();
    var record = await fixture.Session();
    await fixture.Connect(record);
    var first = Assert.Single((await fixture.Observations.Handle(new GetObservations(record), CancellationToken.None))!.Repositories);
    fixture.Handler.DataStatus = (HttpStatusCode)status;
    for (var attempt = 0; attempt < 2; attempt++)
    {
      fixture.Clock.Advance(TimeSpan.FromSeconds(16));
      var result = Assert.Single((await fixture.Observations.Handle(new GetObservations(record), CancellationToken.None))!.Repositories);
      Assert.Equal(retained ? "stale" : "unavailable", result.Availability);
      if (retained)
      {
        Assert.Equal(first.ObservedAt, result.ObservedAt);
        Assert.Equal(first.Runs, result.Runs);
        Assert.Equal(first.Attention, result.Attention);
      }
      else Assert.Null(result.Runs);
    }
    fixture.Handler.CanRead = false;
    var denied = Assert.Single((await fixture.Observations.Handle(new GetObservations(record), CancellationToken.None))!.Repositories);
    Assert.Equal("unavailable", denied.Availability);
    Assert.Null(denied.Runs);
    Assert.Empty(record.GitHub.Observations);
    fixture.Handler.CanRead = true;
    fixture.Handler.DataStatus = HttpStatusCode.ServiceUnavailable;
    var afterDenial = Assert.Single((await fixture.Observations.Handle(new GetObservations(record), CancellationToken.None))!.Repositories);
    Assert.Equal("unavailable", afterDenial.Availability);
    Assert.Null(afterDenial.Runs);
  }

  [Fact]
  public async Task InFlightObservationCannotSurviveDisconnectAndSessionCachesAreIndependent()
  {
    using var fixture = new SourceFixture();
    var record = await fixture.Session();
    await fixture.Connect(record);
    var release = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
    fixture.Handler.DataWait = release.Task;
    var pending = fixture.Observations.Handle(new GetObservations(record), CancellationToken.None);
    GitHubAuthorization.Disconnect(record);
    release.SetResult();
    Assert.Null(await pending);
    Assert.DoesNotContain("GET /repos/example/repository/issues", fixture.Handler.Calls);
    fixture.Handler.DataWait = null;
    await fixture.Connect(record);
    await fixture.Observations.Handle(new GetObservations(record), CancellationToken.None);
    var other = await fixture.Session();
    await fixture.Connect(other);
    await fixture.Observations.Handle(new GetObservations(other), CancellationToken.None);
    Assert.Equal(3, fixture.Handler.Calls.Count(c => c == "GET /repos/example/repository/actions/runs"));
    fixture.Sessions.Remove(record.Id);
    Assert.Empty(record.GitHub.Observations);
    Assert.Single(other.GitHub.Observations);
  }

  [Theory]
  [InlineData("1", 1L)]
  [InlineData("2", 2L)]
  [InlineData("1.0", 1L)]
  [InlineData("1e0", 1L)]
  [InlineData("20e-1", 2L)]
  [InlineData("0.02e2", 2L)]
  [InlineData("1.00000000000000000", 1L)]
  [InlineData("9007199254740991", 9007199254740991L)]
  [InlineData("90071992547409910e-1", 9007199254740991L)]
  [InlineData("1e+0000000000000000000000000000000", 1L)]
  [InlineData(null, null)]
  [InlineData("null", null)]
  [InlineData("\"2\"", null)]
  [InlineData("true", null)]
  [InlineData("{}", null)]
  [InlineData("[]", null)]
  [InlineData("0", null)]
  [InlineData("-0", null)]
  [InlineData("-1", null)]
  [InlineData("1.5", null)]
  [InlineData("1.00000000000000001", null)]
  [InlineData("9007199254740991.00000000000000001", null)]
  [InlineData("9007199254740992", null)]
  [InlineData("1e999999999999999999999999999", null)]
  [InlineData("1e-999999999999999999999999999", null)]
  [InlineData("1e309", null)]
  [InlineData("1e-309", null)]
  [InlineData("100e-3", null)]
  public async Task ObservationAttemptsUseExactRawTransportNumbers(string? token, long? expected)
  {
    using var fixture = new SourceFixture();
    var record = await fixture.Session();
    await fixture.Connect(record);
    fixture.Handler.RunMetadata = (token is null ? "" : ",\"run_attempt\":" + token) + ",\"event\":\"workflow_dispatch\"";
    var snapshot = await fixture.Observations.Handle(new GetObservations(record), CancellationToken.None);
    var run = Assert.Single(Assert.Single(snapshot!.Repositories).Runs!);
    Assert.Equal(71, run.Id);
    Assert.Equal(expected, run.RunAttempt);
    Assert.Equal("workflow_dispatch", run.Event);
    using var serialized = JsonDocument.Parse(JsonSerializer.Serialize(snapshot, JsonSerializerOptions.Web));
    var json = serialized.RootElement.GetProperty("repositories")[0].GetProperty("runs")[0];
    if (expected is { } known) Assert.Equal(known, json.GetProperty("runAttempt").GetInt64());
    else Assert.Equal(JsonValueKind.Null, json.GetProperty("runAttempt").ValueKind);
    Assert.Equal("workflow_dispatch", json.GetProperty("event").GetString());
    Assert.Equal("observed-revision", run.SourceRevision);
    Assert.Equal("https://github.com/example/repository/actions/runs/71", run.Url);
  }

  [Theory]
  [InlineData(null, null)]
  [InlineData("null", null)]
  [InlineData("\"\"", null)]
  [InlineData("\" \\t\\n\"", null)]
  [InlineData("false", null)]
  [InlineData("2", null)]
  [InlineData("{}", null)]
  [InlineData("\"push\"", "push")]
  [InlineData("\" workflow_dispatch \"", " workflow_dispatch ")]
  [InlineData("\"<img src=x onerror=alert(1)>\"", "<img src=x onerror=alert(1)>")]
  public async Task ObservationEventsPreserveOnlyNonblankSourceText(string? token, string? expected)
  {
    using var fixture = new SourceFixture();
    var record = await fixture.Session();
    await fixture.Connect(record);
    fixture.Handler.RunMetadata = token is null ? "" : ",\"event\":" + token;
    var snapshot = await fixture.Observations.Handle(new GetObservations(record), CancellationToken.None);
    var run = Assert.Single(Assert.Single(snapshot!.Repositories).Runs!);
    Assert.Null(run.RunAttempt);
    Assert.Equal(expected, run.Event);
    using var serialized = JsonDocument.Parse(JsonSerializer.Serialize(snapshot, JsonSerializerOptions.Web));
    var json = serialized.RootElement.GetProperty("repositories")[0].GetProperty("runs")[0];
    Assert.Equal(JsonValueKind.Null, json.GetProperty("runAttempt").ValueKind);
    if (expected is null) Assert.Equal(JsonValueKind.Null, json.GetProperty("event").ValueKind);
    else Assert.Equal(expected, json.GetProperty("event").GetString());
  }

  private sealed class SourceFixture : IDisposable
  {
    private readonly GitHubTransport transport;
    internal TestClock Clock { get; } = new();
    internal SourceHandler Handler { get; } = new();
    internal OwnerSessions Sessions { get; }
    internal GitHubAuthorization Authorization { get; }
    internal RepositoryAccess Access { get; }
    internal GetObservationsHandler Observations { get; }

    internal SourceFixture()
    {
      Sessions = new OwnerSessions(OwnerAdmissionTests.Profile(), Clock);
      transport = new GitHubTransport(Handler);
      var settings = new WorkspaceOptions
      {
        Origin = new Uri("https://workspace.invalid"),
        IdentityMode = "Development",
        Identity = OwnerAdmissionTests.Profile(),
        Repositories = SelectedRepositories,
        GitHubClientId = "development-user-app",
        GitHubClientSecret = "isolated-user-app-value",
      };
      Authorization = new GitHubAuthorization(settings, Sessions, transport, Clock);
      Access = new RepositoryAccess(settings, Sessions, Authorization, transport, Clock);
      Observations = new GetObservationsHandler(settings, Sessions, Authorization, Access, transport, Clock);
    }

    internal async Task<OwnerSession> Session()
    {
      var principal = OwnerAdmissionTests.Principal(authenticationTime: Clock.GetUtcNow().ToUnixTimeSeconds().ToString(System.Globalization.CultureInfo.InvariantCulture));
      return Sessions.Get(await Sessions.StoreAsync(new AuthenticationTicket(principal, "owner")))!;
    }

    internal string Begin(OwnerSession record)
    {
      var url = new Uri(Authorization.Begin(record)!);
      Assert.Equal("https://github.com/login/oauth/authorize", url.GetLeftPart(UriPartial.Path));
      var query = QueryHelpers.ParseQuery(url.Query);
      Assert.Equal("S256", query["code_challenge_method"]);
      Assert.Equal(43, query["code_challenge"].ToString().Length);
      Assert.Equal("https://workspace.invalid/connections/github/callback", query["redirect_uri"]);
      Assert.Equal("select_account", query["prompt"]);
      Assert.Equal("offline_access", query["scope"]);
      Handler.ExpectedChallenge = query["code_challenge"].ToString();
      return query["state"].ToString();
    }

    internal Task<ConnectionOutcome> Connect(OwnerSession record) => Authorization.CompleteAsync(record, Begin(record), "isolated-code", CancellationToken.None);
    public void Dispose() => transport.Dispose();
  }

  internal sealed class SourceHandler : HttpMessageHandler
  {
    internal List<string> Calls { get; } = new();
    internal string? ExpectedChallenge { get; set; }
    internal long UserId { get; set; } = 71;
    internal bool FailExchange { get; set; }
    internal bool Revoked { get; set; }
    internal bool CanRead { get; set; } = true;
    internal bool CanWrite { get; set; } = true;
    internal string IssueGrant { get; set; } = "write";
    internal bool Paginated { get; set; }
    internal Task? ExchangeWait { get; set; }
    internal Task? DataWait { get; set; }
    internal bool DataUnavailable { get; set; }
    internal HttpStatusCode? DataStatus { get; set; }
    internal string? RunMetadata { get; set; }
    internal Action<HttpRequestMessage>? OnRequest { get; set; }

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
      Calls.Add(request.Method + " " + request.RequestUri!.AbsolutePath);
      OnRequest?.Invoke(request);
      if (request.RequestUri.Host == "github.com")
      {
        Assert.Equal(HttpMethod.Post, request.Method);
        Assert.Equal("/login/oauth/access_token", request.RequestUri.AbsolutePath);
        Assert.Null(request.Headers.Authorization);
        var fields = QueryHelpers.ParseQuery(await request.Content!.ReadAsStringAsync(cancellationToken));
        if (!fields.TryGetValue("grant_type", out var grant) || grant != "refresh_token")
        {
          var verifier = fields["code_verifier"].ToString();
          Assert.Equal(ExpectedChallenge, WebEncoders.Base64UrlEncode(System.Security.Cryptography.SHA256.HashData(Encoding.ASCII.GetBytes(verifier))));
        }
        if (ExchangeWait is not null) await ExchangeWait;
        if (FailExchange) return Response(HttpStatusCode.BadRequest, new { error = "bad_verification_code" });
        return Response(HttpStatusCode.OK, new { access_token = "isolated-user-access", refresh_token = "isolated-user-refresh", expires_in = 300, refresh_token_expires_in = 3600, token_type = "bearer" });
      }
      Assert.Equal("api.github.com", request.RequestUri.Host);
      Assert.Equal(HttpMethod.Get, request.Method);
      Assert.Equal("isolated-user-access", request.Headers.Authorization?.Parameter);
      if (request.RequestUri.AbsolutePath == "/repos/example/repository")
        return Response(HttpStatusCode.OK, new { permissions = new { pull = CanRead, push = CanWrite } });
      QueryHelpers.ParseQuery(request.RequestUri.Query).TryGetValue("page", out var pageValue);
      var page = pageValue.ToString();
      if (request.RequestUri.AbsolutePath == "/repos/example/repository/actions/runs")
      {
        if (DataWait is not null) await DataWait;
        if (DataStatus is { } status) return Response(status, new { message = "Unavailable" });
        if (!DataUnavailable && RunMetadata is not null)
          return new HttpResponseMessage(HttpStatusCode.OK)
          {
            Content = new StringContent("{\"workflow_runs\":[{\"id\":71,\"name\":\"CI\",\"status\":\"in_progress\",\"head_sha\":\"observed-revision\",\"html_url\":\"https://github.com/example/repository/actions/runs/71\",\"updated_at\":\"2026-11-07T12:00:00Z\"" + RunMetadata + "}]}", Encoding.UTF8, "application/json")
          };
        return DataUnavailable ? Response(HttpStatusCode.ServiceUnavailable, new { message = "Unavailable" })
            : Response(HttpStatusCode.OK, new { workflow_runs = new[] { new { id = UserId, name = "CI", status = "in_progress", head_sha = "observed-revision", html_url = "https://github.com/example/repository/actions/runs/71", updated_at = "2026-11-07T12:00:00Z" } } });
      }
      if (request.RequestUri.AbsolutePath == "/repos/example/repository/issues")
        return Response(HttpStatusCode.OK, new object[] {
                    new { number = 1, title = "Owner decision", labels = new[] { new { name = "needs-info" } }, html_url = "https://github.com/example/repository/issues/1" },
                    new { number = 2, title = "Pull request", pull_request = new { url = "https://api.github.com/repos/example/repository/pulls/2" }, labels = new[] { new { name = "needs-info" } } } });
      if (request.RequestUri.AbsolutePath == "/user/installations")
        return Response(HttpStatusCode.OK, new
        {
          total_count = Paginated ? 101 : 1,
          installations = Paginated && page == "1"
            ? Enumerable.Range(1, 100).Select(i => (object)new { id = i, account = new { login = "other-account" } }).ToArray()
            : [(object)new { id = 9, account = new { login = "example" }, permissions = new { metadata = "read", issues = IssueGrant, actions = "read" } }]
        });
      if (request.RequestUri.AbsolutePath == "/user/installations/9/repositories")
        return Response(HttpStatusCode.OK, new
        {
          total_count = Paginated ? 101 : 1,
          repositories = Paginated && page == "1"
            ? Enumerable.Range(1, 100).Select(i => (object)new { full_name = "example/other-" + i }).ToArray()
            : [(object)new { full_name = "example/repository" }]
        });
      Assert.Equal("/user", request.RequestUri.AbsolutePath);
      Assert.Equal("Bearer", request.Headers.Authorization?.Scheme);
      Assert.Equal("isolated-user-access", request.Headers.Authorization?.Parameter);
      return Revoked ? Response(HttpStatusCode.Unauthorized, new { message = "Bad credentials" })
          : Response(HttpStatusCode.OK, new { id = UserId, login = "verified-user", type = "User" });
    }

    private static HttpResponseMessage Response(HttpStatusCode status, object value) => new(status)
    { Content = new StringContent(JsonSerializer.Serialize(value), Encoding.UTF8, "application/json") };
  }
}
