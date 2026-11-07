using System.Collections.Concurrent;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.WebUtilities;

namespace JuanGCarmona.SoFa.Modules.Workspace.Identity;

internal sealed class OwnerSessions(IdentityProfile profile, TimeProvider clock) : ITicketStore
{
    internal const string SessionClaim = "sofa:session";
    private readonly ConcurrentDictionary<string, OwnerSession> sessions = new(StringComparer.Ordinal);
    private readonly object admissionLock = new();

    public Task<string> StoreAsync(AuthenticationTicket ticket)
    {
        var now = clock.GetUtcNow();
        var admission = OwnerAdmission.Validate(ticket.Principal, profile, now, freshCeremony: true)
            ?? throw new InvalidOperationException("The identity cannot establish an owner session.");
        lock (admissionLock)
        {
            foreach (var key in sessions.Keys) _ = Get(key);
            if (sessions.Count >= 32)
                throw new InvalidOperationException("The development session capacity is full. End an existing session or wait for expiry.");

            var id = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
            foreach (var identity in ticket.Principal.Identities)
                foreach (var claim in identity.FindAll(SessionClaim).ToArray()) identity.RemoveClaim(claim);
            ((ClaimsIdentity)ticket.Principal.Identity!).AddClaim(new Claim(SessionClaim, id));
            ticket.Properties.IssuedUtc = now;
            ticket.Properties.ExpiresUtc = admission.AbsoluteDeadline;
            ticket.Properties.AllowRefresh = false;
            ticket.Properties.IsPersistent = false;
            var record = new OwnerSession(id, ticket, admission.AuthenticationTime,
                admission.AbsoluteDeadline, Earlier(now.AddMinutes(15), admission.AbsoluteDeadline), now);
            if (!sessions.TryAdd(id, record))
                throw new InvalidOperationException("Could not establish a new session reference.");
            return Task.FromResult(id);
        }
    }

    public Task<AuthenticationTicket?> RetrieveAsync(string key) => Task.FromResult(Get(key)?.Ticket);

    public Task RenewAsync(string key, AuthenticationTicket ticket)
    {
        var record = Get(key);
        if (record is null) return Task.CompletedTask;
        lock (record.Sync)
        {
            var admission = OwnerAdmission.Validate(ticket.Principal, profile, clock.GetUtcNow(), freshCeremony: false);
            var identity = ticket.Principal.FindAll(SessionClaim).ToArray();
            if (!record.Active || admission?.AuthenticationTime != record.AuthenticationTime
                || identity.Length != 1 || identity[0].Value != key)
            {
                Remove(key);
                return Task.CompletedTask;
            }
            ticket.Properties.ExpiresUtc = record.AbsoluteDeadline;
            ticket.Properties.AllowRefresh = false;
            record.Ticket = ticket;
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
            var now = clock.GetUtcNow();
            if (record.Active && now < record.IdleDeadline && now < record.AbsoluteDeadline) return record;
            Remove(key);
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
            if (!record.Active || now >= record.IdleDeadline || now >= record.AbsoluteDeadline) return false;
            record.IdleDeadline = Earlier(now.AddMinutes(15), record.AbsoluteDeadline);
            return true;
        }
    }

    internal void Remove(string key)
    {
        if (!sessions.TryRemove(key, out var record)) return;
        lock (record.Sync)
        {
            record.Active = false;
            record.Ticket.Properties.StoreTokens([]);
        }
    }

    private static DateTimeOffset Earlier(DateTimeOffset first, DateTimeOffset second) => first < second ? first : second;
}

internal sealed class OwnerSession(string id, AuthenticationTicket ticket, DateTimeOffset authenticationTime,
    DateTimeOffset absoluteDeadline, DateTimeOffset idleDeadline, DateTimeOffset providerValidatedAt)
{
    internal object Sync { get; } = new();
    internal string Id { get; } = id;
    internal AuthenticationTicket Ticket { get; set; } = ticket;
    internal DateTimeOffset AuthenticationTime { get; } = authenticationTime;
    internal DateTimeOffset AbsoluteDeadline { get; } = absoluteDeadline;
    internal DateTimeOffset IdleDeadline { get; set; } = idleDeadline;
    internal DateTimeOffset ProviderValidatedAt { get; set; } = providerValidatedAt;
    internal bool Active { get; set; } = true;
}
