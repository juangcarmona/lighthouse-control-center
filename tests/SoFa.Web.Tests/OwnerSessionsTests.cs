using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;
using JuanGCarmona.SoFa.Modules.Workspace.Source;

namespace SoFa.Web.Tests;

public sealed class OwnerSessionsTests
{
  [Fact]
  public async Task OwnerAndGitHubAuthorityRestoreAcrossProcessAndOwnerSessionExpiryWithoutGitHubConsent()
  {
    using var storage = new SessionVaultFixture();
    var clock = new TestClock();
    string key;
    string survivingKey;
    string scope;
    using (var firstProcess = storage.Open(clock))
    {
      key = await firstProcess.StoreAsync(TicketWithTokens(clock));
      var owner = firstProcess.Get(key)!;
      var grant = Grant(clock);
      lock (owner.Sync) owner.GitHub.CommittingAttempt = owner.GitHub.Attempt;
      Assert.True(firstProcess.SetGitHubGrant(owner, grant, owner.GitHub.Attempt));
      scope = grant.DataScope;
      survivingKey = await firstProcess.StoreAsync(TicketWithTokens(clock));
      Assert.Same(grant, firstProcess.Get(survivingKey)!.GitHub.Current);
      firstProcess.Remove(owner);
      Assert.False(owner.Active);
    }

    using (var restarted = storage.Open(clock))
    {
      var restored = restarted.Get(key);
      Assert.Null(restored);
      restored = restarted.Get(survivingKey);
      Assert.NotNull(restored);
      Assert.Equal(DateTimeOffset.MinValue, restored.ProviderValidatedAt);
      Assert.Equal(scope, restored.GitHub.Current!.DataScope);
      Assert.True(restored.Ticket.Properties.IsPersistent);
      Assert.Contains("owner-session-test-refresh", restored.Ticket.Properties.GetTokenValue("refresh_token"));
      restarted.Remove(restored);
      var relogin = restarted.Get(await restarted.StoreAsync(Ticket(clock)))!;
      Assert.Equal(scope, relogin.GitHub.Current!.DataScope);
      var parallel = restarted.Get(await restarted.StoreAsync(Ticket(clock)))!;
      Assert.Same(relogin.GitHub.Current, parallel.GitHub.Current);
      GitHubAuthorization.Disconnect(relogin);
      Assert.Null(relogin.GitHub.Current);
      Assert.Null(parallel.GitHub.Current);
    }

    using var afterDisconnect = storage.Open(clock);
    var freshOwner = afterDisconnect.Get(await afterDisconnect.StoreAsync(Ticket(clock)))!;
    Assert.Null(freshOwner.GitHub.Current);
  }

  [Fact]
  public async Task StaleConnectionInvalidationCannotDeleteTheReplacementGrantFromDurableStorage()
  {
    using var storage = new SessionVaultFixture();
    var clock = new TestClock();
    string ownerKey;
    using (var firstProcess = storage.Open(clock))
    {
      ownerKey = await firstProcess.StoreAsync(Ticket(clock));
      var owner = firstProcess.Get(ownerKey)!;
      var previous = Grant(clock);
      SetGrant(firstProcess, owner, previous);
      var replacement = new GitHubConnection(72, "replacement-user",
          new GitHubTokens("replacement-access", "replacement-refresh", clock.GetUtcNow().AddHours(1), clock.GetUtcNow().AddDays(30)),
          clock.GetUtcNow());
      SetGrant(firstProcess, owner, replacement);

      firstProcess.RevokeGitHubGrant(previous);

      Assert.Same(replacement, owner.GitHub.Current);
    }

    using var restarted = storage.Open(clock);
    var restored = restarted.Get(ownerKey)!;
    Assert.Equal(72, restored.GitHub.Current!.UserId);
    Assert.Equal("replacement-user", restored.GitHub.Current.Login);
  }

  [Fact]
  public async Task PollingDoesNotRenewTheIdleDeadline()
  {
    var clock = new TestClock();
    var sessions = new OwnerSessions(OwnerAdmissionTests.Profile(), clock);
    var key = await sessions.StoreAsync(Ticket(clock));
    clock.Advance(TimeSpan.FromMinutes(119));
    Assert.NotNull(await sessions.RetrieveAsync(key));
    clock.Advance(TimeSpan.FromMinutes(1));
    Assert.Null(await sessions.RetrieveAsync(key));
  }

  [Fact]
  public async Task ExplicitActivityCannotExtendTheOriginalAbsoluteDeadline()
  {
    var clock = new TestClock();
    var sessions = new OwnerSessions(OwnerAdmissionTests.Profile(), clock);
    var key = await sessions.StoreAsync(Ticket(clock));
    for (var i = 0; i < 71; i++)
    {
      clock.Advance(TimeSpan.FromMinutes(10));
      Assert.True(sessions.TouchUserActivity(key));
    }
    Assert.Equal(clock.Start.AddHours(12), sessions.Get(key)!.IdleDeadline);
    clock.Advance(TimeSpan.FromMinutes(10));
    Assert.Null(await sessions.RetrieveAsync(key));
    Assert.False(sessions.TouchUserActivity(key));
  }

  [Fact]
  public async Task TicketRenewalCannotMoveSessionDeadlinesOrIdentity()
  {
    var clock = new TestClock();
    var sessions = new OwnerSessions(OwnerAdmissionTests.Profile(), clock);
    var key = await sessions.StoreAsync(Ticket(clock));
    var ticket = (await sessions.RetrieveAsync(key))!;
    clock.Advance(TimeSpan.FromMinutes(119));
    ticket.Properties.ExpiresUtc = clock.GetUtcNow().AddYears(1);
    await sessions.RenewAsync(key, ticket);
    clock.Advance(TimeSpan.FromMinutes(1));
    Assert.Null(await sessions.RetrieveAsync(key));

    key = await sessions.StoreAsync(Ticket(clock));
    await sessions.RenewAsync(key, new AuthenticationTicket(OwnerAdmissionTests.Principal(subject: "another-owner"), "owner"));
    Assert.Null(await sessions.RetrieveAsync(key));
  }

  [Fact]
  public async Task ReferencesAreLocallyGeneratedAndLogoutDestroysCredentials()
  {
    var clock = new TestClock();
    var sessions = new OwnerSessions(OwnerAdmissionTests.Profile(), clock);
    var ticket = Ticket(clock);
    ((ClaimsIdentity)ticket.Principal.Identity!).AddClaim(new Claim(OwnerSessions.SessionClaim, "provider-chosen-reference"));
    ticket.Properties.StoreTokens(new[] { new AuthenticationToken { Name = "refresh_token", Value = "provider-refresh-test-value" } });
    var key = await sessions.StoreAsync(ticket);
    Assert.NotEqual("provider-chosen-reference", key);
    Assert.Equal(key, sessions.Get(ticket.Principal)!.Id);
    var record = sessions.Get(key)!;
    await sessions.RemoveAsync(key);
    Assert.Null(await sessions.RetrieveAsync(key));
    Assert.False(record.Active);
    Assert.Null(record.Ticket.Properties.GetTokenValue("refresh_token"));
    Assert.Null(new OwnerSessions(OwnerAdmissionTests.Profile(), clock).Get(key));
  }

  [Fact]
  public async Task InvalidOwnersAndCapacityExhaustionFailClosed()
  {
    var clock = new TestClock();
    var sessions = new OwnerSessions(OwnerAdmissionTests.Profile(), clock);
    await Assert.ThrowsAsync<InvalidOperationException>(() => sessions.StoreAsync(new AuthenticationTicket(OwnerAdmissionTests.Principal(subject: "denied"), "owner")));
    for (var i = 0; i < 32; i++) await sessions.StoreAsync(Ticket(clock));
    await Assert.ThrowsAsync<InvalidOperationException>(() => sessions.StoreAsync(Ticket(clock)));
    clock.Advance(TimeSpan.FromHours(2));
    Assert.NotNull(await sessions.StoreAsync(Ticket(clock)));
  }

  private static AuthenticationTicket Ticket(TestClock clock) => new(OwnerAdmissionTests.Principal(
      authenticationTime: clock.GetUtcNow().ToUnixTimeSeconds().ToString(System.Globalization.CultureInfo.InvariantCulture)), "owner");

  private static AuthenticationTicket TicketWithTokens(TestClock clock)
  {
    var ticket = Ticket(clock);
    ticket.Properties.StoreTokens(new[]
    {
      new AuthenticationToken { Name = "id_token", Value = "owner-session-test-id" },
      new AuthenticationToken { Name = "access_token", Value = "owner-session-test-access" },
      new AuthenticationToken { Name = "refresh_token", Value = "owner-session-test-refresh" },
    });
    return ticket;
  }

  private static GitHubConnection Grant(TestClock clock) => new(71, "verified-user",
      new GitHubTokens("owner-session-test-access", "owner-session-test-refresh",
          clock.GetUtcNow().AddHours(1), clock.GetUtcNow().AddDays(30)), clock.GetUtcNow());

  private static void SetGrant(OwnerSessions sessions, OwnerSession owner, GitHubConnection connection)
  {
    long attempt;
    lock (owner.Sync) attempt = owner.GitHub.CommittingAttempt = owner.GitHub.Attempt;
    Assert.True(sessions.SetGitHubGrant(owner, connection, attempt));
  }

  private sealed class SessionVaultFixture : IDisposable
  {
    private readonly string root = Path.Combine(Path.GetTempPath(), "lcc-owner-session-" + Guid.NewGuid().ToString("N"));
    private string State => Path.Combine(root, "state");
    private string Keys => Path.Combine(root, "keys");
    internal SessionVaultFixture()
    {
      if (!OperatingSystem.IsLinux()) throw new PlatformNotSupportedException("Owner session vault tests require Linux private-directory validation.");
      const UnixFileMode mode = UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute;
      Directory.CreateDirectory(root, mode); Directory.CreateDirectory(State, mode); Directory.CreateDirectory(Keys, mode);
    }
    internal OwnerSessions Open(TestClock clock) => new(OwnerAdmissionTests.Profile(), clock, State, Keys, "owner-session-github-client", 1234);
    public void Dispose() => Directory.Delete(root, recursive: true);
  }
}

internal sealed class TestClock(DateTimeOffset? start = null) : TimeProvider
{
  public DateTimeOffset Start { get; } = start ?? DateTimeOffset.FromUnixTimeSeconds(1_800_000_000);
  private TimeSpan elapsed;
  internal Action? BeforeRead { get; set; }
  public override DateTimeOffset GetUtcNow() { BeforeRead?.Invoke(); return Start + elapsed; }
  public void Advance(TimeSpan duration) => elapsed += duration;
}
