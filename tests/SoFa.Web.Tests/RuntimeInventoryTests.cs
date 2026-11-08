using System.Collections.Concurrent;
using System.Diagnostics;
using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json;
using JuanGCarmona.SoFa.Modules.Workspace;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;
using JuanGCarmona.SoFa.Modules.Workspace.Runtime;
using JuanGCarmona.SoFa.Modules.Workspace.Source;
using Microsoft.AspNetCore.Authentication;

namespace SoFa.Web.Tests;

public sealed class RuntimeInventoryTests
{
  [Theory]
  [InlineData("admin")]
  [InlineData("metadata")]
  [InlineData("administration")]
  [InlineData("app")]
  [InlineData("account")]
  [InlineData("repository")]
  [InlineData("repository-id")]
  [InlineData("pull")]
  public async Task RunnerReadsRequireTheWholeCurrentMatchingAuthority(string missing)
  {
    using var fixture = new Fixture();
    switch (missing)
    {
      case "admin": fixture.Source.Admin = false; break;
      case "metadata": fixture.Source.Metadata = "none"; break;
      case "administration": fixture.Source.Administration = "none"; break;
      case "app": fixture.Source.AppId = 999; break;
      case "account": fixture.Source.Account = "different"; break;
      case "repository": fixture.Source.Repository = "example/different"; break;
      case "repository-id": fixture.Source.RepositoryId = 999; break;
      case "pull": fixture.Source.Pull = false; break;
    }
    var result = await fixture.Runners.Handle(new(await fixture.Session(), "example/repository"), CancellationToken.None);
    Assert.Equal("denied", result.Availability);
    Assert.False(result.Complete);
    Assert.Empty(result.Runners);
    Assert.Equal(0, fixture.Source.RunnerCalls);
  }

  [Theory]
  [InlineData("read")]
  [InlineData("write")]
  public async Task MatchingPermissionExposesOnlyBoundedSourceFacts(string grant)
  {
    using var fixture = new Fixture();
    fixture.Source.Administration = grant;
    var session = await fixture.Session();
    var result = await fixture.Runners.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.Equal("available", result.Availability);
    Assert.True(result.Complete);
    Assert.Equal(session.GitHub.Current!.DataScope, result.DataScope);
    var runner = Assert.Single(result.Runners);
    Assert.Equal(22, runner.Id);
    Assert.True(runner.Busy);
    Assert.Equal("online", runner.Status);
    Assert.Contains("self-hosted", runner.Labels);
    Assert.DoesNotContain("token", JsonSerializer.Serialize(result), StringComparison.OrdinalIgnoreCase);
    Assert.Equal(1, fixture.Source.RunnerCalls);
  }

  [Fact]
  public async Task MissingAppIdentityAndMalformedAuthorityStayUnknownWithoutRunnerCalls()
  {
    using (var missing = new Fixture(null))
    {
      Assert.Equal("unavailable", (await missing.Runners.Handle(new(await missing.Session(), "example/repository"), CancellationToken.None)).Availability);
      Assert.Equal(0, missing.Source.RunnerCalls);
    }
    using var fixture = new Fixture(); var session = await fixture.Session();
    fixture.Source.MissingAdmin = true;
    Assert.Equal("unavailable", (await fixture.Runners.Handle(new(session, "example/repository"), CancellationToken.None)).Availability);
    fixture.Source.MissingAdmin = false; fixture.Source.Administration = "malformed";
    Assert.Equal("unavailable", (await fixture.Runners.Handle(new(session, "example/repository"), CancellationToken.None)).Availability);
    Assert.Equal(0, fixture.Source.RunnerCalls);
  }

  [Fact]
  public async Task UnknownBusyAndStatusPartialCoverageAndActualEmptyRemainDistinct()
  {
    using var fixture = new Fixture();
    var session = await fixture.Session();
    fixture.Source.Rows = [new { id = 21, name = "unknown-fields" }]; fixture.Source.Total = 300;
    var partial = await fixture.Runners.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.Equal("available", partial.Availability);
    Assert.False(partial.Complete);
    Assert.Equal(300, partial.SourceTotal);
    Assert.Null(Assert.Single(partial.Runners).Busy);
    Assert.Equal("unknown", partial.Runners[0].Status);
    Assert.False(partial.Runners[0].LabelsComplete);
    fixture.Source.Rows = []; fixture.Source.Total = 0;
    var empty = await fixture.Runners.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.True(empty.Complete); Assert.Equal(0, empty.SourceTotal); Assert.Empty(empty.Runners);
    fixture.Source.Rows = [new { id = -1, name = "malformed" }]; fixture.Source.Total = 1;
    var invalid = await fixture.Runners.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.Equal("unavailable", invalid.Availability); Assert.False(invalid.Complete); Assert.Equal(1, invalid.SourceTotal);
    fixture.Source.Rows = [null!];
    var nonObject = await fixture.Runners.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.Equal("unavailable", nonObject.Availability); Assert.False(nonObject.Complete); Assert.Equal(1, nonObject.SourceTotal);
  }

  [Theory]
  [InlineData(HttpStatusCode.Forbidden, "denied")]
  [InlineData(HttpStatusCode.NotFound, "denied")]
  [InlineData(HttpStatusCode.Unauthorized, "disconnected")]
  [InlineData(HttpStatusCode.ServiceUnavailable, "unavailable")]
  public async Task FailedSourceNeverBecomesAnEmptyInventory(HttpStatusCode status, string state)
  {
    using var fixture = new Fixture(); var session = await fixture.Session();
    fixture.Source.Status = status;
    var result = await fixture.Runners.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.Equal(state, result.Availability); Assert.False(result.Complete); Assert.Null(result.SourceTotal);
    if (status == HttpStatusCode.Unauthorized) Assert.Null(session.GitHub.Current);
  }

  [Fact]
  public async Task RuntimeQueriesShareTwoNonQueuingSlotsAndCancellationReleasesThem()
  {
    using var fixture = new Fixture(); var session = await fixture.Session();
    fixture.Source.Hold = new(TaskCreationOptions.RunContinuationsAsynchronously);
    using var cancel = new CancellationTokenSource();
    var first = fixture.Runners.Handle(new(session, "example/repository"), cancel.Token);
    var second = fixture.Runners.Handle(new(session, "example/repository"), cancel.Token);
    await Until(() => fixture.Source.RunnerCalls == 2);
    var calls = fixture.Source.Paths.Count;
    var busy = await fixture.Runners.Handle(new(session, "example/repository"), CancellationToken.None);
    Assert.Equal("busy", busy.Availability); Assert.Equal(calls, fixture.Source.Paths.Count);
    cancel.Cancel();
    await Task.WhenAll(first, second).WaitAsync(TimeSpan.FromSeconds(5));
    Assert.Equal(2, fixture.Slots.GitHub.CurrentCount);
    fixture.Source.Hold = null;
    Assert.Equal("available", (await fixture.Runners.Handle(new(session, "example/repository"), CancellationToken.None)).Availability);
  }

  [Fact]
  public async Task ConnectionReplacementCancelsTheOldReadAndCannotPublishItsInventory()
  {
    using var fixture = new Fixture(); var session = await fixture.Session();
    fixture.Source.Hold = new(TaskCreationOptions.RunContinuationsAsynchronously);
    var pending = fixture.Runners.Handle(new(session, "example/repository"), CancellationToken.None);
    await Until(() => fixture.Source.RunnerCalls == 1);
    GitHubAuthorization.Disconnect(session);
    var result = await pending.WaitAsync(TimeSpan.FromSeconds(5));
    Assert.Equal("disconnected", result.Availability); Assert.Empty(result.Runners);
    Assert.Equal(2, fixture.Slots.GitHub.CurrentCount);
  }

  [Theory]
  [InlineData(false)]
  [InlineData(true)]
  public async Task HostReadStopsItsOwnedProcessTreeOnLogoutOrAdmittedDeadline(bool expire)
  {
    using var fixture = new Fixture(); var session = await fixture.Session();
    var root = Directory.CreateTempSubdirectory("sofa-host-process-test-").FullName;
    var marker = Path.Combine(root, "started.json");
    var helper = Path.Combine(root, "held.mjs");
    try
    {
      await File.WriteAllTextAsync(helper, "import{writeFileSync}from'node:fs';import{spawn}from'node:child_process';"
          + "const chunks=[];for await(const b of process.stdin)chunks.push(b);const input=JSON.parse(Buffer.concat(chunks));"
          + "const child=spawn(process.execPath,['-e','setInterval(()=>{},1000)']);writeFileSync(" + JsonSerializer.Serialize(marker)
          + ",JSON.stringify({pid:process.pid,child:child.pid,scratch:input.scratch}));setInterval(()=>{},1000);");
      if (expire) session.IdleDeadline = fixture.Clock.GetUtcNow().AddSeconds(1);
      var handler = new GetHostInventoryHandler(fixture.Settings, fixture.Sessions, fixture.Slots, fixture.Clock) { HelperPath = helper };
      var pending = handler.Handle(new(session), CancellationToken.None);
      await Until(() => File.Exists(marker));
      using var started = JsonDocument.Parse(await File.ReadAllTextAsync(marker));
      var pid = started.RootElement.GetProperty("pid").GetInt32();
      var child = started.RootElement.GetProperty("child").GetInt32();
      var scratch = started.RootElement.GetProperty("scratch").GetString()!;
      Assert.Equal("busy", (await handler.Handle(new(await fixture.Session()), CancellationToken.None)).Availability);
      if (!expire) fixture.Sessions.Remove(session);
      var result = await pending.WaitAsync(TimeSpan.FromSeconds(5));
      Assert.Equal("disconnected", result.Availability);
      Assert.Null(result.Observation);
      await Until(() => !Running(pid) && !Running(child));
      Assert.False(Directory.Exists(scratch));
      Assert.Equal(1, fixture.Slots.Host.CurrentCount);
    }
    finally { Directory.Delete(root, true); }
  }

  [Theory]
  [InlineData(false)]
  [InlineData(true)]
  public async Task HostBridgeBoundsStdoutAndStderrAndReleasesItsSlot(bool stderr)
  {
    using var fixture = new Fixture(); var root = Directory.CreateTempSubdirectory("sofa-host-output-test-").FullName;
    try
    {
      var helper = Path.Combine(root, "oversized.mjs");
      await File.WriteAllTextAsync(helper, "process.stdin.resume();process." + (stderr ? "stderr" : "stdout") + ".write('x'.repeat(" + (stderr ? 8193 : 1024 * 1024 + 1).ToString(CultureInfo.InvariantCulture) + "));setInterval(()=>{},1000);");
      var handler = new GetHostInventoryHandler(fixture.Settings, fixture.Sessions, fixture.Slots, fixture.Clock) { HelperPath = helper };
      var result = await handler.Handle(new(await fixture.Session()), CancellationToken.None).WaitAsync(TimeSpan.FromSeconds(5));
      Assert.Equal("unavailable", result.Availability); Assert.Null(result.Observation); Assert.False(result.Complete);
      Assert.Equal(1, fixture.Slots.Host.CurrentCount);
    }
    finally { Directory.Delete(root, true); }
  }

  [Theory]
  [InlineData(false)]
  [InlineData(true)]
  public async Task HostBridgeRemovesSecretEnvironmentAndRefusesFailedCleanup(bool blockCleanup)
  {
    if (!OperatingSystem.IsLinux()) return;
    using var fixture = new Fixture();
    var root = Directory.CreateTempSubdirectory("sofa-host-boundary-test-").FullName;
    var marker = Path.Combine(root, "result.json");
    var helper = Path.Combine(root, "observe.mjs");
    var environmentKey = "SOFA_RUNTIME_TEST_SECRET_" + Guid.NewGuid().ToString("N", CultureInfo.InvariantCulture);
    string? scratch = null;
    Environment.SetEnvironmentVariable(environmentKey, "private-test-value");
    try
    {
      await File.WriteAllTextAsync(helper, "import{writeFileSync,mkdirSync,chmodSync}from'node:fs';"
          + "const chunks=[];for await(const b of process.stdin)chunks.push(b);const input=JSON.parse(Buffer.concat(chunks));"
          + "writeFileSync(" + JsonSerializer.Serialize(marker) + ",JSON.stringify({scratch:input.scratch,keys:Object.keys(process.env),home:process.env.HOME}));"
          + (blockCleanup ? "mkdirSync(input.scratch+'/blocked');writeFileSync(input.scratch+'/blocked/file','owned');chmodSync(input.scratch+'/blocked',0);" : "")
          + "process.stdout.write(JSON.stringify({availability:'available',registrations:[],adoptions:[],complete:false}));");
      var handler = new GetHostInventoryHandler(fixture.Settings, fixture.Sessions, fixture.Slots, fixture.Clock) { HelperPath = helper };
      var result = await handler.Handle(new(await fixture.Session()), CancellationToken.None);
      using var observed = JsonDocument.Parse(await File.ReadAllTextAsync(marker));
      scratch = observed.RootElement.GetProperty("scratch").GetString()!;
      Assert.Equal(scratch, observed.RootElement.GetProperty("home").GetString());
      var keys = observed.RootElement.GetProperty("keys").EnumerateArray().Select(item => item.GetString()).ToArray();
      Assert.DoesNotContain(environmentKey, keys);
      Assert.All(keys, key => Assert.True(key is "PATH" or "HOME" or "XDG_CONFIG_HOME", "Unexpected inherited environment key: " + key));
      Assert.Equal(blockCleanup ? "unavailable" : "available", result.Availability);
      if (blockCleanup) { Assert.Null(result.Observation); Assert.Contains("could not be removed", result.Reason!); }
      else Assert.False(Directory.Exists(scratch));
      Assert.Equal(1, fixture.Slots.Host.CurrentCount);
    }
    finally
    {
      Environment.SetEnvironmentVariable(environmentKey, null);
      if (scratch is not null && Directory.Exists(scratch))
      {
        if (Directory.Exists(Path.Combine(scratch, "blocked")))
          File.SetUnixFileMode(Path.Combine(scratch, "blocked"), UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);
        Directory.Delete(scratch, true);
      }
      Directory.Delete(root, true);
    }
  }

  [Fact]
  public void SerializedProjectionOverflowPreservesKnownCoverageAndOriginalTime()
  {
    var at = DateTimeOffset.UtcNow;
    using var oversized = JsonDocument.Parse(JsonSerializer.Serialize(new { value = new string('<', 400000) }));
    var host = GetHostInventoryHandler.Bound(new("available", at, 2, 3, true, oversized.RootElement.Clone()));
    Assert.Equal("unavailable", host.Availability); Assert.Equal(2, host.RegistrationCount); Assert.Equal(3, host.CheckoutCount);
    Assert.Equal(at, host.ObservedAt); Assert.False(host.Complete); Assert.Null(host.Observation);
    var runner = new RepositoryRunner(1, new string('<', 256), null, "unknown", null, Enumerable.Repeat(new string('<', 256), 100).ToArray(), true);
    var source = GetRepositoryRunnersHandler.Bound(new("example/repository", "available", at, Enumerable.Repeat(runner, 100).ToArray(), 700, false));
    Assert.Equal("unavailable", source.Availability); Assert.Equal(700, source.SourceTotal); Assert.Equal(at, source.ObservedAt); Assert.Empty(source.Runners);
  }

  [Fact]
  public void ExitedProcessMayLoseItsProcDirectoryBetweenExistenceCheckAndRead()
  {
    if (!OperatingSystem.IsLinux()) return;
    Assert.False(Running(Environment.ProcessId, _ => throw new DirectoryNotFoundException()));
    Assert.False(Running(Environment.ProcessId, _ => throw new FileNotFoundException()));
    Assert.Throws<UnauthorizedAccessException>(() => Running(Environment.ProcessId, _ => throw new UnauthorizedAccessException()));
    Assert.Throws<IOException>(() => Running(Environment.ProcessId, _ => throw new IOException("Unrelated read failure")));
  }

  [Fact]
  public void ExitedProcessCanDisappearAfterItsProcStatHandleWasOpened()
  {
    if (!OperatingSystem.IsLinux()) return;
    using var process = Process.Start(new ProcessStartInfo("node") { ArgumentList = { "-e", "setInterval(() => {}, 1000)" } })!;
    try
    {
      Assert.False(Running(process.Id, path =>
      {
        using var reader = new StreamReader(path);
        process.Kill();
        Assert.True(process.WaitForExit(5000));
        return reader.ReadToEnd();
      }));
      Assert.True(process.HasExited);
    }
    finally { if (!process.HasExited) { process.Kill(); process.WaitForExit(5000); } }
  }

  private static async Task Until(Func<bool> predicate)
  {
    using var deadline = new CancellationTokenSource(TimeSpan.FromSeconds(5));
    while (!predicate()) await Task.Delay(20, deadline.Token);
  }
  private static bool Running(int pid, Func<string, string>? readProcStat = null)
  {
    try
    {
      if (OperatingSystem.IsLinux() && File.Exists("/proc/" + pid.ToString(CultureInfo.InvariantCulture) + "/stat"))
        return !(readProcStat ?? File.ReadAllText)("/proc/" + pid.ToString(CultureInfo.InvariantCulture) + "/stat").Split(')')[1].StartsWith(" Z", StringComparison.Ordinal);
      using var process = Process.GetProcessById(pid); return !process.HasExited;
    }
    catch (ArgumentException) { return false; }
    catch (FileNotFoundException) { return false; }
    catch (DirectoryNotFoundException) { return false; }
    catch (IOException) when (OperatingSystem.IsLinux() && !File.Exists("/proc/" + pid.ToString(CultureInfo.InvariantCulture) + "/stat")) { return false; }
  }

  private sealed class Fixture : IDisposable
  {
    internal TestClock Clock { get; } = new();
    internal OwnerSessions Sessions { get; }
    internal RuntimeReadSlots Slots { get; } = new();
    internal RunnerSource Source { get; } = new();
    internal WorkspaceOptions Settings { get; }
    private readonly GitHubTransport transport;
    internal GetRepositoryRunnersHandler Runners { get; }
    internal Fixture(long? appId = 123)
    {
      Settings = new()
      {
        Origin = new("https://workspace.invalid"),
        IdentityMode = "Development",
        Identity = OwnerAdmissionTests.Profile(),
        Repositories = ["example/repository"],
        GitHubAppId = appId,
        GitHubClientId = "test-client"
      };
      Sessions = new(Settings.Identity, Clock); transport = new(Source);
      var authorization = new GitHubAuthorization(Settings, Sessions, transport, Clock);
      Runners = new(Sessions, authorization, new(Settings, Sessions, authorization, transport, Clock), transport, Slots, Clock);
    }
    internal async Task<OwnerSession> Session()
    {
      var principal = OwnerAdmissionTests.Principal(authenticationTime: Clock.GetUtcNow().ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture));
      var record = Sessions.Get(await Sessions.StoreAsync(new AuthenticationTicket(principal, "owner")))!;
      record.GitHub.Current = new(71, "verified-user", new("fixture-token", "fixture-refresh", Clock.GetUtcNow().AddHours(1), Clock.GetUtcNow().AddHours(4)), Clock.GetUtcNow());
      return record;
    }
    public void Dispose() { transport.Dispose(); Slots.Dispose(); }
  }

  private sealed class RunnerSource : HttpMessageHandler
  {
    internal ConcurrentQueue<string> Paths { get; } = new();
    internal bool Admin { get; set; } = true;
    internal bool MissingAdmin { get; set; }
    internal bool Pull { get; set; } = true;
    internal string Metadata { get; set; } = "read";
    internal string Administration { get; set; } = "read";
    internal long AppId { get; set; } = 123;
    internal long RepositoryId { get; set; } = 42;
    internal string Account { get; set; } = "example";
    internal string Repository { get; set; } = "example/repository";
    internal object[] Rows { get; set; } = [new { id = 22, name = "source-runner", os = "linux", status = "online", busy = true, labels = new[] { new { name = "self-hosted" } } }];
    internal long Total { get; set; } = 1;
    internal HttpStatusCode Status { get; set; } = HttpStatusCode.OK;
    internal TaskCompletionSource? Hold { get; set; }
    internal int RunnerCalls;
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
      Assert.Equal(HttpMethod.Get, request.Method); Assert.Equal("api.github.com", request.RequestUri!.Host);
      var path = request.RequestUri.AbsolutePath; Paths.Enqueue(path);
      object payload;
      if (path == "/repos/example/repository")
      {
        var permissions = new Dictionary<string, bool> { ["pull"] = Pull };
        if (!MissingAdmin) permissions["admin"] = Admin;
        payload = new { id = 42, full_name = "example/repository", permissions };
      }
      else if (path == "/user/installations")
      {
        var permissions = new Dictionary<string, string> { ["metadata"] = Metadata, ["issues"] = "read", ["actions"] = "read" };
        if (Administration != "none") permissions["administration"] = Administration;
        payload = new { total_count = 1, installations = new[] { new { id = 9, app_id = AppId, account = new { login = Account }, permissions } } };
      }
      else if (path == "/user/installations/9/repositories") payload = new { total_count = 1, repositories = new[] { new { id = RepositoryId, full_name = Repository } } };
      else if (path == "/repos/example/repository/actions/runners")
      {
        Assert.Equal("?per_page=100&page=1", request.RequestUri.Query);
        Interlocked.Increment(ref RunnerCalls);
        if (Hold is not null) await Hold.Task.WaitAsync(cancellationToken);
        return Response(new { total_count = Total, runners = Rows }, Status);
      }
      else throw new InvalidOperationException("Unexpected fixture path");
      return Response(payload);
    }
    private static HttpResponseMessage Response(object payload, HttpStatusCode status = HttpStatusCode.OK) => new(status)
    { Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json") };
  }
}
