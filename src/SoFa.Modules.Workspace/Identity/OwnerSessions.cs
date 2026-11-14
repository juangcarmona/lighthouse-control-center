using System.Collections.Concurrent;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.AspNetCore.Http;
using JuanGCarmona.SoFa.Modules.Workspace.Source;

namespace JuanGCarmona.SoFa.Modules.Workspace.Identity;

internal sealed class OwnerSessions(IdentityProfile profile, TimeProvider clock) : ITicketStore, IDisposable
{
  private readonly OwnerSessionVault? vault;
  internal const string SessionClaim = "sofa:session";
  private readonly ConcurrentDictionary<string, OwnerSession> sessions = new(StringComparer.Ordinal);
  private readonly object admissionLock = new();
  private readonly ConditionalWeakTable<ClaimsPrincipal, OwnerSession> rotations = new();
  private GitHubConnection? durableGitHub;
  internal Action? BeforeGitHubGrantCommit { get; set; }

  internal OwnerSessions(IdentityProfile profile, TimeProvider clock, string dataDirectory, string keyDirectory,
      string? githubClientId = null, long? githubAppId = null)
      : this(profile, clock)
  {
    if (profile.Access is not null) return; // Explicit mode never opens/restores the legacy vault.
    vault = new OwnerSessionVault(dataDirectory, keyDirectory, profile, githubClientId, githubAppId);
    durableGitHub = RestoreGrant(vault.ReadGrant());
    foreach (var stored in vault.ReadSessions())
    {
      if (stored.Id.Length != 43 || stored.Id.Any(c => !(char.IsAsciiLetterOrDigit(c) || c is '-' or '_'))
          || stored.Ticket.Length is < 1 or > 65536) throw new IOException("Owner session checkpoint is invalid.");
      var ticket = TicketSerializer.Default.Deserialize(stored.Ticket);
      if (ticket is null) throw new IOException("Owner session checkpoint is invalid.");
      var reference = ticket.Principal.FindAll(SessionClaim).Take(2).ToArray();
      if (reference.Length != 1 || reference[0].Value != stored.Id) throw new IOException("Owner session checkpoint is invalid.");
      var now = clock.GetUtcNow();
      if (stored.IdleDeadline <= now || stored.AbsoluteDeadline <= now)
      { vault.DeleteSession(stored.Id); continue; }
      var admission = OwnerAdmission.Validate(ticket.Principal, profile, now, freshCeremony: false);
      if (admission?.AuthenticationTime != stored.AuthenticationTime
          || admission.AbsoluteDeadline != stored.AbsoluteDeadline || stored.IdleDeadline > stored.AbsoluteDeadline)
      { vault.DeleteSession(stored.Id); continue; }
      if (sessions.Count >= 32)
        throw new IOException("Owner session checkpoint exceeds its live-session bound.");
      var record = new OwnerSession(stored.Id, ticket, stored.AuthenticationTime, stored.AbsoluteDeadline,
          stored.IdleDeadline, DateTimeOffset.MinValue);
      record.Sessions = this;
      record.GitHub.Current = durableGitHub;
      if (!sessions.TryAdd(stored.Id, record)) throw new IOException("Owner session checkpoint contains duplicate references.");
    }
  }

  public Task<string> StoreAsync(AuthenticationTicket ticket)
  {
    if (rotations.TryGetValue(ticket.Principal, out var original))
    {
      lock (original.Sync)
      {
        rotations.Remove(ticket.Principal);
        if (!ReferenceEquals(Get(original.Id), original)
            || ticket.Principal.FindFirst("sub")?.Value != original.Subject
            || OwnerAdmission.Validate(ticket.Principal, profile, clock.GetUtcNow(), false)?.AuthenticationTime != original.AuthenticationTime)
          throw new InvalidOperationException("The session can no longer change its reference.");
        var previous = original.Id;
        var replacement = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
        // A provider refresh can finish after preparation but before issuance.
        // Transfer its latest tokens atomically, never the prepared snapshot's tokens.
        ticket.Properties.StoreTokens(original.Ticket.Properties.GetTokens());
        ticket.Properties.IssuedUtc = original.Ticket.Properties.IssuedUtc;
        SetReference(ticket, replacement);
        ticket.Properties.ExpiresUtc = original.AbsoluteDeadline;
        ticket.Properties.AllowRefresh = false;
        ticket.Properties.IsPersistent = true;
        if (vault is not null)
          vault.RotateSession(previous, new StoredOwnerSession(replacement, TicketSerializer.Default.Serialize(ticket),
              original.AuthenticationTime, original.AbsoluteDeadline, original.IdleDeadline));
        if (!sessions.TryRemove(previous, out _) || !sessions.TryAdd(replacement, original))
          throw new InvalidOperationException("Could not rotate the session reference.");
        original.Id = replacement;
        original.Ticket = ticket;
        return Task.FromResult(replacement);
      }
    }
    var now = clock.GetUtcNow();
    var admission = OwnerAdmission.Validate(ticket.Principal, profile, now, freshCeremony: true)
        ?? throw new InvalidOperationException("The identity cannot establish an owner session.");
    lock (admissionLock)
    {
      foreach (var key in sessions.Keys) _ = Get(key);
      if (sessions.Count >= 32)
        throw new InvalidOperationException("The development session capacity is full. End an existing session or wait for expiry.");

      var id = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
      SetReference(ticket, id);
      ticket.Properties.IssuedUtc = now;
      ticket.Properties.ExpiresUtc = admission.AbsoluteDeadline;
      ticket.Properties.AllowRefresh = false;
      ticket.Properties.IsPersistent = true;
      var record = new OwnerSession(id, ticket, admission.AuthenticationTime,
          admission.AbsoluteDeadline, Earlier(now.AddHours(2), admission.AbsoluteDeadline), now);
      record.Sessions = this;
      record.GitHub.Current = durableGitHub;
      if (!sessions.TryAdd(id, record))
        throw new InvalidOperationException("Could not establish a new session reference.");
      Persist(record);
      return Task.FromResult(id);
    }
  }

  internal async Task RotateCookieAsync(HttpContext context, OwnerSession record)
  {
    ClaimsPrincipal principal;
    AuthenticationProperties properties;
    lock (record.Sync)
    {
      if (!ReferenceEquals(Get(record.Id), record)) throw new InvalidOperationException("The session has ended.");
      principal = new ClaimsPrincipal(record.Ticket.Principal.Identities.Select(identity => new ClaimsIdentity(identity)));
      properties = new AuthenticationProperties(new Dictionary<string, string?>(record.Ticket.Properties.Items));
      rotations.Add(principal, record);
    }
    try { await context.SignInAsync(IdentitySchemes.Issuance, principal, properties).ConfigureAwait(false); }
    finally { rotations.Remove(principal); }
  }

  private static void SetReference(AuthenticationTicket ticket, string reference)
  {
    foreach (var identity in ticket.Principal.Identities)
      foreach (var claim in identity.FindAll(SessionClaim).ToArray()) identity.RemoveClaim(claim);
    ((ClaimsIdentity)ticket.Principal.Identity!).AddClaim(new Claim(SessionClaim, reference));
  }

  public Task<AuthenticationTicket?> RetrieveAsync(string key) => Task.FromResult(Get(key)?.Ticket);

  public Task RenewAsync(string key, AuthenticationTicket ticket)
  {
    var record = Get(key);
    if (record is null) return Task.CompletedTask;
    lock (record.Sync)
    {
      if (record.Id != key || !ReferenceEquals(Get(key), record)) return Task.CompletedTask;
      var admission = OwnerAdmission.Validate(ticket.Principal, profile, clock.GetUtcNow(), freshCeremony: false);
      var identity = ticket.Principal.FindAll(SessionClaim).ToArray();
      if (!record.Active || ticket.Principal.FindFirst("sub")?.Value != record.Subject || admission?.AuthenticationTime != record.AuthenticationTime
          || identity.Length != 1 || identity[0].Value != key)
      {
        Remove(record);
        return Task.CompletedTask;
      }
      ticket.Properties.ExpiresUtc = record.AbsoluteDeadline;
      ticket.Properties.AllowRefresh = false;
      record.Ticket = ticket;
      Persist(record);
    }
    return Task.CompletedTask;
  }

  public Task RemoveAsync(string key)
  {
    Remove(key);
    return Task.CompletedTask;
  }

  internal OwnerSession? Get(ClaimsPrincipal principal)
  {
    var identities = principal.FindAll(SessionClaim).Take(2).ToArray();
    return principal.Identity?.IsAuthenticated == true && identities.Length == 1 ? Get(identities[0].Value) : null;
  }

  internal OwnerSession? Get(string key)
  {
    if (!sessions.TryGetValue(key, out var record)) return null;
    lock (record.Sync)
    {
      if (record.Id != key || !sessions.TryGetValue(key, out var current) || !ReferenceEquals(record, current)) return null;
      var now = clock.GetUtcNow();
      if (record.Active && now < record.IdleDeadline && now < record.AbsoluteDeadline) return record;
      Remove(record);
      return null;
    }
  }

  internal bool TouchUserActivity(string key)
  {
    var record = Get(key);
    if (record is null) return false;
    lock (record.Sync)
    {
      var now = clock.GetUtcNow();
      if (record.Id != key || !record.Active || now >= record.IdleDeadline || now >= record.AbsoluteDeadline) return false;
      record.IdleDeadline = Earlier(now.AddHours(2), record.AbsoluteDeadline);
      Persist(record);
      return true;
    }
  }

  internal void Remove(string key)
  {
    if (!sessions.TryGetValue(key, out var record)) return;
    lock (record.Sync)
      if (record.Id == key) Remove(record);
  }

  internal OwnerSession? GetAuthenticatedRequest(HttpContext context)
  {
    if (!context.Items.TryGetValue(typeof(OwnerSession), out var value) || value is not OwnerSession record) return null;
    lock (record.Sync) return ReferenceEquals(Get(record.Id), record) ? record : null;
  }

  internal void Remove(OwnerSession record)
  {
    lock (record.Sync)
    {
      if (!record.Active) return;
      vault?.DeleteSession(record.Id);
      record.Active = false;
      record.Stopped.Cancel();
      if (sessions.TryGetValue(record.Id, out var current) && ReferenceEquals(record, current))
        sessions.TryRemove(record.Id, out _);
      record.Ticket.Properties.StoreTokens([]);
      record.GitHub.Clear(cancelConnection: profile.Access is not null);
    }
  }

  private static DateTimeOffset Earlier(DateTimeOffset first, DateTimeOffset second) => first < second ? first : second;

  internal void Persist(OwnerSession record)
  {
    if (vault is null) return;
    try
    {
      lock (record.Sync)
      {
        var current = record.GitHub.Current;
        var stored = new StoredOwnerSession(record.Id, TicketSerializer.Default.Serialize(record.Ticket),
            record.AuthenticationTime, record.AbsoluteDeadline, record.IdleDeadline);
        if (current is not null)
        {
          durableGitHub = current;
          vault.StoreSessionAndGrant(stored, ToStored(current));
        }
        else vault.StoreSession(stored);
      }
    }
    catch
    {
      Remove(record);
      throw new InvalidOperationException("Protected owner session storage is unavailable.");
    }
  }

  internal void RevokeGitHubGrant(GitHubConnection? connection)
  {
    lock (admissionLock)
    {
      // An invalidation belongs to the connection that failed verification. If a
      // replacement won the owner-level transition first, its grant must survive.
      if (connection is not null && (durableGitHub is not null
          ? !ReferenceEquals(connection, durableGitHub)
          : !sessions.Values.Any(record => ReferenceEquals(record.GitHub.Current, connection)))) return;
      connection ??= durableGitHub ?? sessions.Values.Select(record => record.GitHub.Current).FirstOrDefault(value => value is not null);
      if (connection is null) { vault?.DeleteGrant(); durableGitHub = null; return; }
      var matching = sessions.Values.Where(record => ReferenceEquals(record.GitHub.Current, connection))
          .OrderBy(record => record.Id, StringComparer.Ordinal).ToArray();
      foreach (var record in matching) Monitor.Enter(record.Sync);
      try
      {
        vault?.DeleteGrant();
        connection.Stopped.Cancel();
        foreach (var record in matching)
          if (ReferenceEquals(record.GitHub.Current, connection)) record.GitHub.Clear();
        durableGitHub = null;
      }
      finally { foreach (var record in matching.Reverse()) Monitor.Exit(record.Sync); }
    }
  }

  internal void DisconnectGitHubGrant(OwnerSession? actor = null)
  {
    if (profile.Access is not null)
    {
      if (actor is not null) lock (actor.Sync) actor.GitHub.Clear();
      return;
    }
    lock (admissionLock)
    {
      var active = sessions.Values.OrderBy(record => record.Id, StringComparer.Ordinal).ToArray();
      foreach (var record in active) Monitor.Enter(record.Sync);
      try
      {
        vault?.DeleteGrant();
        durableGitHub?.Stopped.Cancel();
        foreach (var record in active) record.GitHub.Clear();
        durableGitHub = null;
      }
      finally { foreach (var record in active.Reverse()) Monitor.Exit(record.Sync); }
    }
  }

  internal bool SetGitHubGrant(OwnerSession actor, GitHubConnection connection, long expectedAttempt)
  {
    BeforeGitHubGrantCommit?.Invoke();
    if (profile.Access is not null)
    {
      lock (actor.Sync)
      {
        if (!ReferenceEquals(Get(actor.Id), actor) || actor.GitHub.Attempt != expectedAttempt
            || actor.GitHub.CommittingAttempt != expectedAttempt) return false;
        actor.GitHub.Clear();
        actor.GitHub.Current = connection;
        return true;
      }
    }
    lock (admissionLock)
    {
      var active = sessions.Values.OrderBy(record => record.Id, StringComparer.Ordinal).ToArray();
      foreach (var record in active) Monitor.Enter(record.Sync);
      try
      {
        if (!actor.Active || !sessions.TryGetValue(actor.Id, out var current) || !ReferenceEquals(current, actor)
            || actor.GitHub.Attempt != expectedAttempt || actor.GitHub.CommittingAttempt != expectedAttempt) return false;
        var oldConnections = active.ToDictionary(record => record, record => record.GitHub.Current);
        var previous = oldConnections.Values.Where(value => value is not null && !ReferenceEquals(value, connection))
            .Distinct(ReferenceEqualityComparer.Instance).Cast<GitHubConnection>().ToArray();
        foreach (var record in active)
        {
          if (!record.Active) continue;
          record.GitHub.Current = connection;
          record.GitHub.Replacement?.Stopped.Cancel();
          record.GitHub.Replacement = null;
          record.GitHub.Authorization = null;
          record.GitHub.CommittingAttempt = 0;
          record.GitHub.Attempt++;
          record.GitHub.Observations.Clear();
          record.GitHub.Generation++;
        }
        try { vault?.StoreGrant(ToStored(connection)); }
        catch
        {
          foreach (var record in active)
          {
            record.GitHub.Current = oldConnections[record];
            record.GitHub.Generation++;
          }
          throw new InvalidOperationException("Protected owner session storage is unavailable.");
        }
        durableGitHub = connection;
        foreach (var old in previous) old.Stopped.Cancel();
        return true;
      }
      finally { foreach (var record in active.Reverse()) Monitor.Exit(record.Sync); }
    }
  }

  private GitHubConnection? RestoreGrant(StoredGitHubConnection? stored)
  {
    var now = clock.GetUtcNow();
    if (stored is null || stored.UserId is not (> 0 and <= 9_007_199_254_740_991)
        || stored.Login.Length is < 1 or > 39 || !System.Text.RegularExpressions.Regex.IsMatch(stored.Login,
            "^[A-Za-z0-9][A-Za-z0-9-]{0,38}$", System.Text.RegularExpressions.RegexOptions.CultureInvariant, TimeSpan.FromMilliseconds(100))
        || stored.Access.Length is < 1 or > 4096 || stored.Refresh.Length is < 1 or > 4096
        || stored.DataScope.Length != 32 || !stored.DataScope.All(Uri.IsHexDigit) || stored.RefreshDeadline <= now)
    { if (stored is not null) vault?.DeleteGrant(); return null; }
    return new GitHubConnection(stored.UserId, stored.Login,
        new GitHubTokens(stored.Access, stored.Refresh, stored.AccessDeadline, stored.RefreshDeadline), DateTimeOffset.MinValue, stored.DataScope);
  }

  private static StoredGitHubConnection ToStored(GitHubConnection connection) => new(connection.UserId, connection.Login,
      connection.Tokens.Access, connection.Tokens.Refresh, connection.Tokens.AccessDeadline, connection.Tokens.RefreshDeadline, connection.DataScope);

  public void Dispose()
  {
    if (profile.Access is not null)
      foreach (var record in sessions.Values) Remove(record);
    vault?.Dispose();
  }
}

internal sealed class OwnerSession(string id, AuthenticationTicket ticket, DateTimeOffset authenticationTime,
    DateTimeOffset absoluteDeadline, DateTimeOffset idleDeadline, DateTimeOffset providerValidatedAt)
{
  internal object Sync { get; } = new();
  internal string Subject { get; } = ticket.Principal.FindFirst("sub")?.Value ?? "";
  internal OwnerSessions? Sessions { get; set; }
  internal string Id { get; set; } = id;
  internal AuthenticationTicket Ticket { get; set; } = ticket;
  internal DateTimeOffset AuthenticationTime { get; } = authenticationTime;
  internal DateTimeOffset AbsoluteDeadline { get; } = absoluteDeadline;
  internal DateTimeOffset IdleDeadline { get; set; } = idleDeadline;
  internal DateTimeOffset ProviderValidatedAt { get; set; } = providerValidatedAt;
  internal DateTimeOffset ProviderRetryAfter { get; set; }
  internal Task<ProviderAuthority>? ProviderRefresh { get; set; }
  internal bool Active { get; set; } = true;
  internal CancellationTokenSource Stopped { get; } = new();
  internal GitHubSession GitHub { get; } = new();
}
