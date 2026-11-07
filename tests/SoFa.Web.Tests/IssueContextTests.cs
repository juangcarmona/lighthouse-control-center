using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json;
using JuanGCarmona.SoFa.Modules.Workspace;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;
using JuanGCarmona.SoFa.Modules.Workspace.Source;
using Microsoft.AspNetCore.Authentication;

namespace SoFa.Web.Tests;

public sealed class IssueContextTests
{
  [Fact]
  public async Task OrdinaryUnlabelledIssueAndSecondConversationPageKeepSourceIdentityAndCoverage()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    var first = await fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None);
    Assert.Equal("available", first.Availability);
    Assert.Equal("open", first.Issue!.State);
    Assert.Empty(first.Issue.Labels);
    Assert.Equal(100, first.Conversation!.Items.Count);
    Assert.Equal(2, first.Conversation.NextPage);
    Assert.False(first.Conversation.Complete);
    var second = await fixture.Query.Handle(new(session, "example/repository", 7, 2, first.Snapshot), CancellationToken.None);
    Assert.Equal(101, Assert.Single(second.Conversation!.Items).Id);
    Assert.True(second.Conversation.Complete);
    Assert.Null(second.Conversation.NextPage);
    Assert.Equal(71, second.ActingUserId);
    Assert.Contains("#issuecomment-101", second.Conversation.Items[0].SourceUrl, StringComparison.Ordinal);
    Assert.Contains("<script>", second.Issue!.Body, StringComparison.Ordinal); // Inert source text, never pre-rendered HTML.
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.EndsWith("/actions/runs", StringComparison.Ordinal));
  }

  [Fact]
  public async Task UnconfiguredDeniedOrDisconnectedScopesNeverReadIssueContent()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    var result = await fixture.Query.Handle(new(session, "other/repository", 7), CancellationToken.None);
    Assert.Equal("denied", result.Availability);
    Assert.Empty(fixture.Handler.Paths);
    fixture.Handler.CanRead = false;
    Assert.Equal("denied", (await fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None)).Availability);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.Contains("/issues/", StringComparison.Ordinal));
    fixture.Handler.CanRead = true;
    GitHubAuthorization.Disconnect(session);
    Assert.Equal("unavailable", (await fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None)).Availability);
    Assert.DoesNotContain(fixture.Handler.Paths, path => path.Contains("/issues/", StringComparison.Ordinal));
  }

  [Fact]
  public async Task PaginationRejectsSourceChangesAndTheHardPageCapBeforeReadingComments()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    var first = await fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None);
    fixture.Handler.Count = 102;
    Assert.Equal("changed", (await fixture.Query.Handle(new(session, "example/repository", 7, 2, first.Snapshot), CancellationToken.None)).Availability);
    Assert.Single(fixture.Handler.Paths, path => path.EndsWith("/comments", StringComparison.Ordinal));
    fixture.Handler.Paths.Clear();
    Assert.Equal("invalid", (await fixture.Query.Handle(new(session, "example/repository", 7, 11), CancellationToken.None)).Availability);
    Assert.Empty(fixture.Handler.Paths);
  }

  [Fact]
  public async Task PullRequestsAndUnavailableConversationsAreNeverOrdinaryIssuesOrEmptyCollections()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    fixture.Handler.PullRequest = true;
    Assert.Equal("invalid", (await fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None)).Availability);
    fixture.Handler.PullRequest = false;
    fixture.Handler.ConversationUnavailable = true;
    var result = await fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None);
    Assert.Equal("available", result.Availability);
    Assert.Equal("unavailable", result.Conversation!.Availability);
    Assert.False(result.Conversation.Complete);
    Assert.Contains("not an empty conversation", result.Conversation.Reason, StringComparison.Ordinal);
  }

  [Fact]
  public async Task LogoutDuringSourceReadCannotReturnTheOldAccountsIssue()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    var release = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
    fixture.Handler.Wait = release.Task;
    var read = fixture.Query.Handle(new(session, "example/repository", 7), CancellationToken.None);
    fixture.Sessions.Remove(session);
    release.SetResult();
    var result = await read;
    Assert.Equal("disconnected", result.Availability);
    Assert.Null(result.Issue);
    Assert.Null(result.Conversation);
  }

  internal sealed class Fixture : IDisposable
  {
    internal TestClock Clock { get; } = new();
    internal Handler Handler { get; } = new();
    internal OwnerSessions Sessions { get; }
    internal GetIssueContextHandler Query { get; }
    internal GetIssueEvidenceHandler Evidence { get; }
    private readonly GitHubTransport transport;
    internal Fixture()
    {
      Sessions = new(OwnerAdmissionTests.Profile(), Clock);
      transport = new(Handler);
      var settings = new WorkspaceOptions
      {
        Origin = new Uri("https://workspace.invalid"),
        IdentityMode = "Development",
        Identity = OwnerAdmissionTests.Profile(),
        Repositories = ["example/repository"]
      };
      var authorization = new GitHubAuthorization(settings, Sessions, transport, Clock);
      var access = new RepositoryAccess(settings, Sessions, authorization, transport, Clock);
      Query = new(Sessions, authorization, access, transport, Clock);
      Evidence = new(Sessions, Query, authorization, access, transport, Clock);
    }
    internal async Task<OwnerSession> Session()
    {
      var principal = OwnerAdmissionTests.Principal(authenticationTime: Clock.GetUtcNow().ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture));
      var record = Sessions.Get(await Sessions.StoreAsync(new AuthenticationTicket(principal, "owner")))!;
      record.GitHub.Current = new(71, "verified-user", new("isolated-source-access", "isolated-source-refresh",
        Clock.GetUtcNow().AddHours(1), Clock.GetUtcNow().AddHours(4)), Clock.GetUtcNow());
      return record;
    }
    public void Dispose() => transport.Dispose();
  }

  internal sealed class Handler : HttpMessageHandler
  {
    internal List<string> Paths { get; } = [];
    internal bool CanRead { get; set; } = true;
    internal int Count { get; set; } = 101;
    internal bool PullRequest { get; set; }
    internal bool ConversationUnavailable { get; set; }
    internal Task? Wait { get; set; }
    internal string? ReportBody { get; set; }
    internal Dictionary<string, Func<HttpRequestMessage, HttpResponseMessage>> Responses { get; } = [];
    internal Dictionary<string, byte[]> Assets { get; } = [];
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
      Assert.Equal(HttpMethod.Get, request.Method);
      if (request.RequestUri!.Host == "fixture.blob.core.windows.net")
      {
        Assert.Null(request.Headers.Authorization);
        return new(HttpStatusCode.OK) { Content = new ByteArrayContent(Assets[request.RequestUri.AbsolutePath]) };
      }
      Assert.Equal("api.github.com", request.RequestUri.Host);
      Assert.Equal("isolated-source-access", request.Headers.Authorization?.Parameter);
      var path = request.RequestUri.AbsolutePath; Paths.Add(path);
      if (Responses.TryGetValue(path, out var overridden)) return overridden(request);
      object value;
      switch (path)
      {
        case "/repos/example/repository": value = new { permissions = new { pull = CanRead, push = false } }; break;
        case "/user/installations": value = new { total_count = 1, installations = new[] { new { id = 9, account = new { login = "example" }, permissions = new { metadata = "read", issues = "read", actions = "read" } } } }; break;
        case "/user/installations/9/repositories": value = new { total_count = 1, repositories = new[] { new { full_name = "example/repository" } } }; break;
        case "/repos/example/repository/issues/7":
          if (Wait is not null) await Wait;
          value = new Dictionary<string, object?>
          {
            ["id"] = 70,
            ["number"] = 7,
            ["title"] = "Ordinary issue",
            ["body"] = "# Context\n<script>alert(1)</script>",
            ["state"] = "open",
            ["comments"] = Count,
            ["updated_at"] = "2026-11-07T10:00:00Z",
            ["user"] = new { login = "source-author" },
            ["labels"] = Array.Empty<object>()
          };
          if (PullRequest) ((Dictionary<string, object?>)value)["pull_request"] = new { url = "https://api.github.com/repos/example/repository/pulls/7" };
          break;
        case "/repos/example/repository/issues/7/comments":
          if (ConversationUnavailable) return Response(new { message = "Unavailable" }, HttpStatusCode.ServiceUnavailable);
          var second = request.RequestUri.Query.Contains("page=2", StringComparison.Ordinal);
          value = Enumerable.Range(second ? 101 : 1, second ? 1 : 100).Select(id => new { id, body = id == 1 && ReportBody is not null ? ReportBody : "Comment " + id, user = new { login = id == 1 && ReportBody is not null ? "github-actions[bot]" : "participant", type = id == 1 && ReportBody is not null ? "Bot" : "User" }, updated_at = "2026-11-07T10:00:00Z" }).ToArray(); break;
        default: throw new InvalidOperationException("Unexpected test source path.");
      }
      return Response(value);
    }
    private static HttpResponseMessage Response(object value, HttpStatusCode status = HttpStatusCode.OK) => new(status)
    { Content = new StringContent(JsonSerializer.Serialize(value), Encoding.UTF8, "application/json") };
  }
}
