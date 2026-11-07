using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;
using JuanGCarmona.SoFa.Modules.Workspace.Source;

namespace JuanGCarmona.SoFa.Modules.Workspace;

public static class WorkspaceModule
{
    public static IServiceCollection AddWorkspace(this IServiceCollection services)
    {
        OwnerIdentity.Add(services);
        services.AddSingleton(_ => new GitHubTransport());
        services.AddSingleton<GitHubAuthorization>();
        services.AddSingleton<RepositoryAccess>();
        return services;
    }

    public static WebApplication UseWorkspace(this WebApplication app)
    {
        var settings = app.Services.GetRequiredService<WorkspaceOptions>();
        app.Use(async (context, next) =>
        {
            var originalCancellation = context.RequestAborted;
            using var budget = CancellationTokenSource.CreateLinkedTokenSource(originalCancellation);
            budget.CancelAfter(TimeSpan.FromSeconds(35));
            context.RequestAborted = budget.Token;
            context.Response.Headers.CacheControl = "no-store";
            context.Response.Headers["Content-Security-Policy"] = "default-src 'none'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'";
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            context.Response.Headers["Referrer-Policy"] = "no-referrer";
            if (!context.Request.IsHttps || !string.Equals(context.Request.Host.Value, settings.Origin.Authority, StringComparison.OrdinalIgnoreCase))
            { context.Response.StatusCode = 400; return; }
            if (context.Request.Headers["Sec-Fetch-Site"] == "cross-site"
                && context.Request.Path != "/signin-oidc" && context.Request.Path != "/connections/github/callback")
            { context.Response.StatusCode = 403; return; }
            try { await next(context).ConfigureAwait(false); }
            catch (OperationCanceledException) when (originalCancellation.IsCancellationRequested) { }
            catch (Exception) when (!context.Response.HasStarted)
            {
                context.Response.Clear();
                context.Response.StatusCode = 503;
                context.Response.Headers.CacheControl = "no-store";
                await context.Response.WriteAsync("The workspace is temporarily unavailable.").ConfigureAwait(false);
            }
            finally { context.RequestAborted = originalCancellation; }
        });
        app.UseRouting();
        app.UseAuthentication();
        app.Use(OwnerIdentity.Gate);
        app.UseAuthorization();
        app.MapGet("/", (HttpContext context, IAntiforgery antiforgery) =>
        {
            var token = antiforgery.GetAndStoreTokens(context).RequestToken!;
            return Html("SoFa", "<p>Sign in with your configured identity provider. Factory data requires an owner session.</p>"
                + Form("/auth/login", token, "Sign in")
                + (context.User.Identity?.IsAuthenticated == true
                    ? Form("/auth/logout", token, "Sign out locally") + Form("/connections/github/disconnect", token, "Disconnect GitHub") : ""));
        }).AllowAnonymous();
        app.MapGet("/health/live", () => Results.Text("live")).AllowAnonymous();
        app.MapPost("/auth/login", async (HttpContext context, IAntiforgery antiforgery) =>
        {
            if (!await Csrf(context, antiforgery).ConfigureAwait(false)) return;
            await context.ChallengeAsync(IdentitySchemes.Oidc, new AuthenticationProperties { RedirectUri = "/workspace" }).ConfigureAwait(false);
        }).AllowAnonymous();
        app.MapPost("/auth/logout", async (HttpContext context, IAntiforgery antiforgery, OwnerSessions sessions) =>
        {
            if (!await Csrf(context, antiforgery).ConfigureAwait(false)) return;
            var record = sessions.Get(context.User);
            if (record is not null) sessions.Remove(record.Id);
            await context.SignOutAsync(IdentitySchemes.Cookie).ConfigureAwait(false);
            context.Response.Redirect("/");
        }).WithMetadata(new OwnerIdentity.LocalSignOut());
        app.MapGet("/workspace", async (HttpContext context, IAntiforgery antiforgery, OwnerSessions sessions, GitHubAuthorization github) =>
        {
            var record = sessions.Get(context.User)!;
            sessions.TouchUserActivity(record.Id);
            var token = antiforgery.GetAndStoreTokens(context).RequestToken!;
            var connection = await github.CurrentAsync(record, context.RequestAborted).ConfigureAwait(false);
            string account;
            lock (record.Sync)
            {
                account = connection is not null ? "<p>GitHub acting account: " + Encode(connection.Login) + " · User ID "
                    + connection.UserId.ToString(System.Globalization.CultureInfo.InvariantCulture) + ". Verified at "
                    + Encode(connection.VerifiedAt.ToString("o", System.Globalization.CultureInfo.InvariantCulture)) + ".</p>"
                    : "<p>" + (record.GitHub.Current is null ? "GitHub is not connected." : "GitHub account verification is unavailable. Source operations are blocked.") + "</p>";
                if (record.GitHub.Replacement is { } candidate)
                    account += "<p>Confirm replacing the acting account with " + Encode(candidate.Login) + " · User ID "
                        + candidate.UserId.ToString(System.Globalization.CultureInfo.InvariantCulture) + ".</p>"
                        + Form("/connections/github/confirm", token, "Confirm account replacement");
            }
            return Html("Workspace", "<p>Owner identity verified. GitHub account connection is separate.</p>"
                + "<p>Identity provider: " + Encode(settings.Identity.Issuer.AbsoluteUri) + ".</p>" + account
                + (string.IsNullOrEmpty(settings.GitHubClientId) ? "<p>The development GitHub App is not configured.</p>"
                    : Form("/connections/github/start", token, "Connect GitHub account"))
                + Form("/connections/github/disconnect", token, "Disconnect GitHub")
                + "<p>Local disconnect removes this session's source credentials. To revoke the separate GitHub grant, use <a href=\"https://github.com/settings/apps/authorizations\" rel=\"noreferrer\">GitHub authorized Apps</a>.</p>"
                + "<p>Sessions expire after 15 minutes without user activity, or four hours after authentication. Provider authority is checked at least every five minutes; a failed due check blocks access.</p>"
                + "<p>Sign out ends this local session. Your identity provider may retain its own session; the next sign-in requires fresh authentication.</p>"
                + Form("/auth/logout", token, "Sign out"));
        });
        app.MapPost("/connections/github/start", async (HttpContext context, IAntiforgery antiforgery, OwnerSessions sessions, GitHubAuthorization github) =>
        {
            if (!await Csrf(context, antiforgery).ConfigureAwait(false)) return;
            var record = sessions.Get(context.User)!;
            var redirect = github.Begin(record);
            if (redirect is null) { context.Response.StatusCode = 503; return; }
            sessions.TouchUserActivity(record.Id);
            context.Response.Redirect(redirect);
        });
        app.MapGet("/connections/github/callback", async (HttpContext context, OwnerSessions sessions, GitHubAuthorization github) =>
        {
            var query = context.Request.Query;
            if (query["state"].Count != 1 || query["code"].Count > 1 || query["error"].Count > 1)
            { context.Response.StatusCode = 400; return; }
            var record = sessions.Get(context.User)!;
            var outcome = await github.CompleteAsync(record, query["state"].ToString(),
                query["error"].Count == 0 ? query["code"].ToString() : null, context.RequestAborted).ConfigureAwait(false);
            if (outcome == ConnectionOutcome.Connected) await sessions.RotateCookieAsync(context, record).ConfigureAwait(false);
            context.Response.Redirect("/workspace?connection=" + outcome.ToString().ToLowerInvariant());
        });
        app.MapPost("/connections/github/confirm", async (HttpContext context, IAntiforgery antiforgery, OwnerSessions sessions, GitHubAuthorization github) =>
        {
            if (!await Csrf(context, antiforgery).ConfigureAwait(false)) return;
            var record = sessions.Get(context.User)!;
            if (!github.Confirm(record)) { context.Response.StatusCode = 409; return; }
            await sessions.RotateCookieAsync(context, record).ConfigureAwait(false);
            sessions.TouchUserActivity(record.Id);
            context.Response.Redirect("/workspace");
        });
        app.MapPost("/connections/github/disconnect", async (HttpContext context, IAntiforgery antiforgery, OwnerSessions sessions) =>
        {
            if (!await Csrf(context, antiforgery).ConfigureAwait(false)) return;
            var record = sessions.Get(context.User)!;
            GitHubAuthorization.Disconnect(record);
            await sessions.RotateCookieAsync(context, record).ConfigureAwait(false);
            sessions.TouchUserActivity(record.Id);
            context.Response.Redirect("/workspace");
        }).WithMetadata(new OwnerIdentity.LocalSignOut());
        app.MapGet("/api/session", (HttpContext context, OwnerSessions sessions) =>
        {
            var record = sessions.Get(context.User)!;
            return Results.Json(new { authenticated = true, idleDeadline = record.IdleDeadline,
                absoluteDeadline = record.AbsoluteDeadline, providerValidatedAt = record.ProviderValidatedAt });
        });
        return app;
    }

    private static IResult Html(string title, string body) => Results.Content(
        "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>SoFa · "
        + title + "</title></head><body><main><h1>" + title + "</h1>" + body + "</main></body></html>", "text/html");

    private static string Form(string action, string token, string label) => "<form method=\"post\" action=\"" + action
        + "\"><input type=\"hidden\" name=\"__RequestVerificationToken\" value=\"" + HtmlEncoder.Default.Encode(token)
        + "\"><button type=\"submit\">" + label + "</button></form>";

    private static string Encode(string value) => HtmlEncoder.Default.Encode(value);

    private static async Task<bool> Csrf(HttpContext context, IAntiforgery antiforgery)
    {
        try { await antiforgery.ValidateRequestAsync(context).ConfigureAwait(false); return true; }
        catch (AntiforgeryValidationException) { context.Response.StatusCode = 400; return false; }
    }
}
