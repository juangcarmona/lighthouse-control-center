using System.Net;
using System.Text.Json;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record ControlCommand(string Operation, string? Action = null, string? Body = null, string? Id = null);
internal sealed record ControlCommandResult(string Availability, DateTimeOffset ObservedAt, string? DataScope = null,
    long? ActingUserId = null, string? Id = null, string? JournalState = null, JsonElement? Intent = null,
    JsonElement? Effect = null, JsonElement? Receipt = null, string? Reason = null);

internal sealed class IssueControlCommands(WorkspaceOptions settings, SourceControlAccess source, SourceControlBridge bridge,
    ControlJournal journal, GitHubTransport transport, TimeProvider clock)
{
  internal async Task<ControlCommandResult> Handle(GetIssueControls query, ControlCommand command, CancellationToken cancellationToken)
  {
    ControlCommandResult Failure(string availability, string? reason) => new(availability, clock.GetUtcNow(), Reason: reason);
    if (command.Operation is not ("prepare" or "submit" or "reconcile" or "receipt")
        || command.Operation == "prepare" && (command.Action is not ("refine" or "propose" or "comment" or "continue")
          || command.Body is null || System.Text.Encoding.UTF8.GetByteCount(command.Body) > 12288 || command.Id is not null)
        || command.Operation == "receipt" && (command.Id is not null || command.Action is not null || command.Body is not null)
        || command.Operation is "submit" or "reconcile" && (!Guid.TryParseExact(command.Id, "N", out _) || command.Action is not null || command.Body is not null))
      return Failure("invalid", "Choose a supported action and use its prepared confirmation.");
    using var budget = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    budget.CancelAfter(TimeSpan.FromSeconds(20));
    var opened = await source.Open(query, budget.Token).ConfigureAwait(false);
    if (opened.Lease is not { } lease) return Failure(opened.Availability, opened.Reason);
    var connection = lease.Connection;
    using var issue = await transport.GetAsync("/repos/" + query.Repository + "/issues/" + query.Number,
        connection.Tokens.Access, lease.Guard, budget.Token).ConfigureAwait(false);
    if (issue.Status == HttpStatusCode.Unauthorized) GitHubAuthorization.Invalidate(query.Session, connection);
    if (!lease.Live()) return Failure("disconnected", "The source account changed.");
    if (!issue.Successful || SourceJson.Number(issue.Value, "id") is not > 0 || issue.Value.TryGetProperty("pull_request", out _))
      return Failure("unavailable", "The current issue identity could not be verified.");
    var identity = new JournalIdentity(settings.Identity.Issuer.AbsoluteUri + "#" + settings.Identity.OwnerSubject,
        connection.UserId, lease.Controls.RepositoryId, SourceJson.Number(issue.Value, "id")!.Value);
    JournalResult entry;
    if (command.Operation == "prepare")
    {
      var result = await bridge.Execute(new
      {
        version = 1,
        operation = "prepare",
        repository = query.Repository,
        number = query.Number,
        action = command.Action,
        id = Guid.NewGuid().ToString(),
        body = command.Body
      }, lease.Callback, budget.Token).ConfigureAwait(false);
      if (result.Facts is not { } prepared || SourceJson.Number(prepared, "version") != 1
          || SourceJson.Text(prepared, "key") is not { } key || SourceJson.Text(prepared, "payloadDigest") is not { } digest
          || !Bound(prepared, identity, query)) return Failure("unavailable", "The action is no longer eligible or preparation could not be verified. Refresh current controls.");
      var current = await lease.Validate(budget.Token).ConfigureAwait(false);
      if (current.Availability != "available") return Failure(current.Availability, current.Reason);
      entry = journal.Prepare(identity, key, digest, command.Action!, "0.22.0", prepared);
    }
    else entry = command.Operation == "receipt" ? journal.Latest(identity) : journal.Read(identity, command.Id!);
    if (entry.State is "unavailable" or "denied" or "conflict") return Failure(entry.State, "The protected action journal is unavailable or the confirmation belongs to another source scope.");
    if (command.Operation is "submit" or "reconcile")
    {
      if (entry.Prepared is not { } prepared || entry.Id is null || !Bound(prepared, identity, query))
        return Failure("unavailable", "The protected preparation is unavailable.");
      var claimed = false;
      var attempted = false;
      async Task<ControlCallbackResult> Callback(JsonElement value, CancellationToken token)
      {
        if (SourceJson.Text(value, "kind") == "claim")
        {
          if (command.Operation != "submit" || !Fields(value, "key", "payloadDigest", "intent")
              || SourceJson.Text(value, "key") != SourceJson.Text(prepared, "key")
              || SourceJson.Text(value, "payloadDigest") != SourceJson.Text(prepared, "payloadDigest")
              || !JsonElement.DeepEquals(value.GetProperty("intent"), prepared.GetProperty("intent"))) return new(false, Status: 409);
          var current = await lease.Validate(token).ConfigureAwait(false);
          if (current.Availability != "available") return new(false, Status: 403);
          var claim = journal.Claim(identity, entry.Id, SourceJson.Text(prepared, "key")!, SourceJson.Text(prepared, "payloadDigest")!);
          claimed = claim.State == "claimed";
          return new(true, new { state = claim.State });
        }
        if (SourceJson.Text(value, "kind") != "effect") return await lease.Callback(value, token).ConfigureAwait(false);
        if (!claimed || attempted || !Fields(value, "scope", "path", "method", "body", "apiVersion")
            || SourceJson.Text(value, "scope") != "repository" || SourceJson.Text(value, "method") != "POST"
            || !ExactEffect(prepared.GetProperty("effect"), value, query.Number)) return new(false, Status: 409);
        attempted = true;
        var final = await lease.Validate(token).ConfigureAwait(false);
        if (final.Availability != "available") return new(false, Status: 403);
        using var response = await transport.PostControlAsync(query.Repository, SourceJson.Text(value, "path")!,
            value.GetProperty("body"), SourceJson.Text(value, "apiVersion"), connection.Tokens.Access, lease.Guard, token).ConfigureAwait(false);
        if (response.Status == HttpStatusCode.Unauthorized) GitHubAuthorization.Invalidate(query.Session, connection);
        return (int)response.Status is >= 200 and < 300 && response.Value.ValueKind == JsonValueKind.Object
            ? new(true, response.Value.Clone()) : new(false, Status: (int)response.Status);
      }
      var result = await bridge.Execute(new { version = 1, operation = command.Operation, repository = query.Repository, number = query.Number, prepared }, Callback, budget.Token).ConfigureAwait(false);
      var receipt = result.Facts is { } facts && SourceJson.Text(facts, "state") is not null ? facts
          : JsonSerializer.SerializeToElement(new { state = "unknown", reason = "source-outcome-unconfirmed", retry = false });
      var recorded = journal.Record(identity, entry.Id, receipt, Terminal(receipt));
      if (recorded.State != "recorded") return new("unavailable", clock.GetUtcNow(), Id: entry.Id, Reason: "The outcome could not be stored. Reconcile this confirmation; do not prepare a replacement.");
      entry = journal.Read(identity, entry.Id);
    }
    var verified = await lease.Validate(budget.Token).ConfigureAwait(false);
    if (verified.Availability != "available") return Failure(verified.Availability, verified.Reason);
    return new("available", clock.GetUtcNow(), connection.DataScope, connection.UserId, entry.Id, entry.State,
        entry.Prepared?.GetProperty("intent"), entry.Prepared?.GetProperty("effect"), entry.Receipt);
  }

  private static bool Terminal(JsonElement receipt) => SourceJson.Text(receipt, "state") is "rejected" or "conflict" or "comment-published"
      || receipt.TryGetProperty("execution", out var execution) && SourceJson.Text(execution, "availability") == "available"
        && SourceJson.Text(execution, "result") is "passed" or "blocked" or "failed";

  private static bool Bound(JsonElement value, JournalIdentity identity, GetIssueControls query) => value.TryGetProperty("intent", out var intent)
      && SourceJson.Number(intent, "actorId") == identity.ActorId && intent.TryGetProperty("repository", out var repo)
      && SourceJson.Number(repo, "id") == identity.RepositoryId && string.Equals(SourceJson.Text(repo, "name"), query.Repository, StringComparison.OrdinalIgnoreCase)
      && intent.TryGetProperty("issue", out var issue) && SourceJson.Number(issue, "id") == identity.IssueId && SourceJson.Number(issue, "number") == query.Number
      && value.TryGetProperty("effect", out _);
  private static bool Fields(JsonElement value, params string[] fields) => value.EnumerateObject().Count() == fields.Length + 3
      && value.EnumerateObject().All(property => property.Name is "type" or "id" or "kind" || fields.Contains(property.Name, StringComparer.Ordinal));
  internal static bool ExactEffect(JsonElement effect, JsonElement value, int number) =>
      SourceJson.Text(effect, "path") == SourceJson.Text(value, "path")
      && SourceJson.Text(value, "path") == (SourceJson.Text(effect, "kind") == "comment" ? "issues/" + number + "/comments" : "actions/workflows/lighthouse-sdlc-router.yml/dispatches")
      && SourceJson.Text(value, "apiVersion") == SourceJson.Text(effect, "apiVersion")
      && JsonElement.DeepEquals(value.GetProperty("body"), effect.GetProperty("body"));
}
