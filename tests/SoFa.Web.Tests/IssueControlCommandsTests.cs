using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Runtime.Versioning;
using JuanGCarmona.SoFa.Modules.Workspace;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;
using JuanGCarmona.SoFa.Modules.Workspace.Source;
using Microsoft.AspNetCore.Authentication;

namespace SoFa.Web.Tests;

[SupportedOSPlatform("linux")]
public sealed class IssueControlCommandsTests
{
  [Theory]
  [InlineData(false)]
  [InlineData(true)]
  public async Task ReleasedSdkPublishesOneCommentAndReconcilesLostResponsesWithoutResending(bool loseResponse)
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    var query = new GetIssueControls(session, "example/repository", 7);
    var prepared = await fixture.Commands.Handle(query, new("prepare", "comment", "Private ordinary reply"), CancellationToken.None);
    Assert.Equal("available", prepared.Availability);
    Assert.Equal("prepared", prepared.JournalState);
    Assert.Empty(fixture.Handler.Writes);
    fixture.Handler.LoseResponse = loseResponse;
    var sent = await fixture.Commands.Handle(query, new("submit", Id: prepared.Id), CancellationToken.None);
    Assert.Equal("available", sent.Availability);
    Assert.Equal(loseResponse ? "unknown" : "comment-published", SourceJson.Text(sent.Receipt!.Value, "state"));
    Assert.Single(fixture.Handler.Writes);
    var duplicate = await fixture.Commands.Handle(query, new("submit", Id: prepared.Id), CancellationToken.None);
    Assert.Equal("comment-published", SourceJson.Text(duplicate.Receipt!.Value, "state"));
    Assert.False(duplicate.Receipt.Value.GetProperty("questionResolved").GetBoolean());
    Assert.Single(fixture.Handler.Writes);
    fixture.Restart();
    var recovered = await fixture.Commands.Handle(query, new("receipt"), CancellationToken.None);
    Assert.Equal(prepared.Id, recovered.Id);
    Assert.Equal("Private ordinary reply", SourceJson.Text(recovered.Intent!.Value, "body"));
    var reconciled = await fixture.Commands.Handle(query, new("reconcile", Id: recovered.Id), CancellationToken.None);
    Assert.Equal("comment-published", SourceJson.Text(reconciled.Receipt!.Value, "state"));
    Assert.Single(fixture.Handler.Writes);
  }

  [Fact]
  public async Task RestoredPreparationIsReadOnlyAndRevokedOrReplacedAccountCannotSendOrReadIt()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session(); var query = new GetIssueControls(session, "example/repository", 7);
    var prepared = await fixture.Commands.Handle(query, new("prepare", "comment", "Do not resend after restart"), CancellationToken.None);
    Assert.Equal("prepared", prepared.JournalState);
    fixture.Restart();
    var submit = await fixture.Commands.Handle(query, new("submit", Id: prepared.Id), CancellationToken.None);
    Assert.Equal("unknown", SourceJson.Text(submit.Receipt!.Value, "state"));
    Assert.Empty(fixture.Handler.Writes);
    var fresh = await fixture.Commands.Handle(query, new("prepare", "comment", "A replacement is blocked"), CancellationToken.None);
    Assert.Equal(prepared.Id, fresh.Id);
    fixture.Handler.CanWrite = false;
    Assert.Equal("unavailable", (await fixture.Commands.Handle(query, new("prepare", "comment", "Denied"), CancellationToken.None)).Availability);
    GitHubAuthorization.Disconnect(session);
    Assert.Equal("disconnected", (await fixture.Commands.Handle(query, new("receipt"), CancellationToken.None)).Availability);
    Assert.Empty(fixture.Handler.Writes);
  }

  [Fact]
  public async Task ConcurrentSubmitsAndSourceGrantLossAtEffectBoundaryNeverDuplicateWrites()
  {
    using var fixture = new Fixture(); var session = await fixture.Session(); var query = new GetIssueControls(session, "example/repository", 7);
    var prepared = await fixture.Commands.Handle(query, new("prepare", "comment", "Once"), CancellationToken.None);
    var results = await Task.WhenAll(Enumerable.Range(0, 2).Select(_ => fixture.Commands.Handle(query, new("submit", Id: prepared.Id), CancellationToken.None)));
    Assert.Single(fixture.Handler.Writes);
    Assert.All(results, result => Assert.True(result.Availability is "available" or "unavailable"));
  }

  [Fact]
  public async Task RefineDispatchUsesTheSharedTypedIntentAndNeverResendsOnReconciliation()
  {
    using var fixture = new Fixture(); var session = await fixture.Session(); var query = new GetIssueControls(session, "example/repository", 7);
    var prepared = await fixture.Commands.Handle(query, new("prepare", "refine", ""), CancellationToken.None);
    Assert.Equal("prepared", prepared.JournalState);
    Assert.Equal("stage-only", SourceJson.Text(prepared.Intent!.Value, "scope"));
    Assert.Empty(fixture.Handler.Writes);
    var sent = await fixture.Commands.Handle(query, new("submit", Id: prepared.Id), CancellationToken.None);
    Assert.Equal("submitted", SourceJson.Text(sent.Receipt!.Value, "state"));
    Assert.False(sent.Receipt.Value.GetProperty("sourceAcknowledged").GetBoolean());
    await fixture.Commands.Handle(query, new("submit", Id: prepared.Id), CancellationToken.None);
    Assert.Single(fixture.Handler.Writes);
  }

  [Fact]
  public async Task RevokedWriteAuthorityAfterPreparationCannotPublishAComment()
  {
    using var fixture = new Fixture(); var session = await fixture.Session(); var query = new GetIssueControls(session, "example/repository", 7);
    var prepared = await fixture.Commands.Handle(query, new("prepare", "comment", "Withdrawn"), CancellationToken.None);
    fixture.Handler.CanWrite = false;
    var result = await fixture.Commands.Handle(query, new("submit", Id: prepared.Id), CancellationToken.None);
    Assert.Equal("rejected", SourceJson.Text(result.Receipt!.Value, "state"));
    Assert.Empty(fixture.Handler.Writes);
  }

  [Fact]
  public void EffectMatchingRejectsChangedBodyVersionOrTarget()
  {
    var effect = JsonSerializer.SerializeToElement(new { kind = "comment", path = "issues/7/comments", body = new { body = "one" } });
    Assert.True(IssueControlCommands.ExactEffect(effect, JsonSerializer.SerializeToElement(new { path = "issues/7/comments", body = new { body = "one" } }), 7));
    foreach (var value in new[] {
      new { path = "issues/8/comments", body = new { body = "one" }, apiVersion = (string?)null },
      new { path = "issues/7/comments", body = new { body = "two" }, apiVersion = (string?)null },
      new { path = "issues/7/comments", body = new { body = "one" }, apiVersion = (string?)"2099-01-01" } })
      Assert.False(IssueControlCommands.ExactEffect(effect, JsonSerializer.SerializeToElement(value), 7));
  }

  private sealed class Fixture : IDisposable
  {
    private readonly TestClock clock = new();
    private readonly string root = Path.Combine(Path.GetTempPath(), "sofa-command-" + Guid.NewGuid().ToString("N"));
    private readonly SourceControlBridge bridge = new();
    private readonly GitHubTransport transport;
    private readonly OwnerSessions sessions;
    private readonly WorkspaceOptions settings;
    private readonly SourceControlAccess source;
    private ControlJournal journal;
    internal Handler Handler { get; } = new();
    internal IssueControlCommands Commands { get; private set; }
    internal Fixture()
    {
      Directory.CreateDirectory(root, UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);
      foreach (var name in new[] { "state", "keys" }) Directory.CreateDirectory(root + "/" + name, UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);
      sessions = new(OwnerAdmissionTests.Profile(), clock); transport = new(Handler);
      settings = new() { Origin = new("https://workspace.invalid"), IdentityMode = "Development", Identity = OwnerAdmissionTests.Profile(), Repositories = ["example/repository"], GitHubAppId = 9001 };
      var authorization = new GitHubAuthorization(settings, sessions, transport, clock);
      var access = new RepositoryAccess(settings, sessions, authorization, transport, clock);
      source = new(settings, sessions, authorization, access, transport);
      journal = new(root + "/state", root + "/keys"); Commands = new(settings, source, bridge, journal, transport, clock);
    }
    internal void Restart() { journal.Dispose(); journal = new(root + "/state", root + "/keys"); Commands = new(settings, source, bridge, journal, transport, clock); }
    internal async Task<OwnerSession> Session()
    {
      var principal = OwnerAdmissionTests.Principal(authenticationTime: clock.GetUtcNow().ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture));
      var session = sessions.Get(await sessions.StoreAsync(new AuthenticationTicket(principal, "owner")))!;
      session.GitHub.Current = new(71, "verified-user", new("isolated-source-access", "isolated-source-refresh", clock.GetUtcNow().AddHours(1), clock.GetUtcNow().AddHours(4)), clock.GetUtcNow()); return session;
    }
    public void Dispose() { journal.Dispose(); bridge.Dispose(); transport.Dispose(); Directory.Delete(root, recursive: true); }
  }

  private sealed class Handler : HttpMessageHandler
  {
    internal bool CanWrite { get; set; } = true;
    internal bool LoseResponse { get; set; }
    internal List<string> Writes { get; } = [];
    private JsonElement? comment;
    private readonly object sync = new();
    private static readonly object Owner = new { id = 71, login = "verified-user", type = "User" };
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
      Assert.Equal("api.github.com", request.RequestUri!.Host);
      Assert.Equal("isolated-source-access", request.Headers.Authorization?.Parameter);
      var path = request.RequestUri.AbsolutePath;
      if (request.Method == HttpMethod.Post)
      {
        if (path == "/repos/example/repository/actions/workflows/lighthouse-sdlc-router.yml/dispatches")
        {
          using var dispatch = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(cancellationToken));
          var inputs = dispatch.RootElement.GetProperty("inputs");
          Assert.Equal("refine", inputs.GetProperty("stage").GetString());
          using var intent = JsonDocument.Parse(inputs.GetProperty("client_request").GetString()!);
          Assert.Equal("stage-only", intent.RootElement.GetProperty("scope").GetString());
          Assert.False(inputs.TryGetProperty("merge", out _));
          lock (sync) Writes.Add(dispatch.RootElement.GetRawText());
          return Reply(new { workflow_run_id = 500, html_url = "https://github.com/example/repository/actions/runs/500" }, HttpStatusCode.Created);
        }
        Assert.Equal("/repos/example/repository/issues/7/comments", path);
        using var posted = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(cancellationToken));
        var body = posted.RootElement.GetProperty("body").GetString()!;
        lock (sync) { Writes.Add(body); comment = JsonSerializer.SerializeToElement(new { id = 91, user = Owner, body, html_url = "https://github.com/example/repository/issues/7#issuecomment-91", issue_url = "https://api.github.com/repos/example/repository/issues/7" }); }
        if (LoseResponse) throw new HttpRequestException("Response lost after the provider accepted the fixture effect");
        return Reply(comment, HttpStatusCode.Created);
      }
      Assert.Equal(HttpMethod.Get, request.Method);
      if (path.Contains("/contents/", StringComparison.Ordinal))
      {
        var root = new DirectoryInfo(AppContext.BaseDirectory);
        while (root is not null && !File.Exists(Path.Combine(root.FullName, "lighthouse.json"))) root = root.Parent;
        var relative = path.Split("/contents/", StringSplitOptions.None)[1];
        return Reply(Blob(File.ReadAllBytes(Path.Combine(root!.FullName, relative))));
      }
      object? data = path switch
      {
        "/user" => Owner,
        "/repos/example/repository" => new { id = 22, full_name = "example/repository", owner = Owner, default_branch = "main", permissions = new { pull = true, push = CanWrite, maintain = false, admin = false } },
        "/user/installations" => new { total_count = 1, installations = new[] { new { id = 9, app_id = 9001, account = new { login = "example" }, permissions = new { metadata = "read", issues = "write", contents = "read", actions = "write", pull_requests = "read", variables = "read" } } } },
        "/user/installations/9/repositories" => new { total_count = 1, repositories = new[] { new { id = 22, full_name = "example/repository" } } },
        "/repos/example/repository/issues/7" => new { id = 70, number = 7, title = "Ordinary fixture", body = "Requested work", state = "open", labels = Array.Empty<string>(), user = Owner, updated_at = "2026-11-08T07:00:00Z" },
        "/repos/example/repository/commits/main" => new { sha = new string('a', 40) },
        "/repos/example/repository/issues/7/comments" => comment is { } value ? new[] { value } : Array.Empty<JsonElement>(),
        "/repos/example/repository/actions/variables/LIGHTHOUSE_AUTOMATION_ENABLED" => new { name = "LIGHTHOUSE_AUTOMATION_ENABLED", value = "true" },
        "/repos/example/repository/actions/variables/LIGHTHOUSE_EPIC_ENABLED" => new { name = "LIGHTHOUSE_EPIC_ENABLED", value = "false" },
        "/repos/example/repository/actions/workflows/lighthouse-sdlc-unattended.yml/runs" => new { total_count = 0, workflow_runs = Array.Empty<object>() },
        _ => throw new InvalidOperationException("Unexpected source read: " + path)
      };
      return Reply(data);
    }
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Security", "CA5350:Do Not Use Weak Cryptographic Algorithms", Justification = "GitHub Contents fixtures require the Git blob SHA-1 identifier; no credential or security signature is produced.")]
    private static object Blob(byte[] bytes) => new { type = "file", encoding = "base64", size = bytes.Length, content = Convert.ToBase64String(bytes), sha = Convert.ToHexStringLower(SHA1.HashData(Encoding.UTF8.GetBytes("blob " + bytes.Length + "\0").Concat(bytes).ToArray())) };
    private static HttpResponseMessage Reply(object? data, HttpStatusCode status = HttpStatusCode.OK) => new(status) { Content = new StringContent(JsonSerializer.Serialize(data), Encoding.UTF8, "application/json") };
  }
}
