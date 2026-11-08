using System.Net;
using System.Text.Json;
using JuanGCarmona.Lighthouse.Cqrs;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;
using JuanGCarmona.SoFa.Modules.Workspace.Source;

namespace JuanGCarmona.SoFa.Modules.Workspace.Runtime;

internal sealed record GetRepositoryRunners(OwnerSession Session, string Repository);
internal sealed record RepositoryRunner(long Id, string Name, string? Os, string Status, bool? Busy,
    IReadOnlyList<string> Labels, bool LabelsComplete);
internal sealed record RepositoryRunners(string Repository, string Availability, DateTimeOffset ObservedAt,
    IReadOnlyList<RepositoryRunner> Runners, long? SourceTotal, bool Complete, string? DataScope = null, string? Reason = null);

internal sealed class GetRepositoryRunnersHandler(OwnerSessions sessions, GitHubAuthorization authorization,
    RepositoryAccess access, GitHubTransport transport, RuntimeReadSlots slots, TimeProvider clock)
    : IQueryHandler<GetRepositoryRunners, RepositoryRunners>
{
  internal static RepositoryRunners Bound(RepositoryRunners value) => JsonSerializer.SerializeToUtf8Bytes(value, JsonSerializerOptions.Web).Length <= 2 * 1024 * 1024 ? value
      : value with { Availability = "unavailable", Complete = false, Runners = [], Reason = "The projected inventory exceeded its response bound; source coverage is incomplete." };

  public async Task<RepositoryRunners> Handle(GetRepositoryRunners query, CancellationToken cancellationToken)
  {
    RepositoryRunners Failure(string state, string reason, long? total = null) => new(query.Repository, state, clock.GetUtcNow(), [], total, false, Reason: reason);
    if (!slots.GitHub.Wait(0, cancellationToken)) return Failure("busy", "Two runtime source queries are already in progress. Retry explicitly.");
    try
    {
      var record = query.Session;
      using var budget = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, record.Stopped.Token);
      budget.CancelAfter(TimeSpan.FromSeconds(30));
      try
      {
        var authority = await access.CheckAsync(record, query.Repository, budget.Token).ConfigureAwait(false);
        if (authority.Availability != SourceAvailability.Available || !authority.AdministrationRead)
        {
          lock (record.Sync)
            return Failure(record.GitHub.Current is null ? "disconnected" : authority.Availability == SourceAvailability.Denied
                || authority.AdministrationAvailability == SourceAvailability.Denied ? "denied" : "unavailable",
                "Runner reads require user admin, metadata and administration-read permission from the configured matching GitHub App installation.");
        }
        var connection = await authorization.CurrentAsync(record, budget.Token).ConfigureAwait(false);
        if (connection is null) return Failure("disconnected", "Connect and verify the GitHub account.");
        bool Live()
        {
          lock (record.Sync) return ReferenceEquals(sessions.Get(record.Id), record) && ReferenceEquals(record.GitHub.Current, connection)
              && record.GitHub.Generation == authority.Generation && connection.DataScope == authority.DataScope;
        }
        if (!Live()) return Failure("disconnected", "The account or session changed after authority was observed.");
        var guard = new SourceRequestGuard(record.Sync, Live, connection.Stopped.Token);
        using var source = await transport.GetAsync("/repos/" + query.Repository + "/actions/runners?per_page=100&page=1",
            connection.Tokens.Access, guard, budget.Token).ConfigureAwait(false);
        if (!Live()) return Failure("disconnected", "The source account or session changed.");
        if (source.Status == HttpStatusCode.Unauthorized)
        {
          GitHubAuthorization.Invalidate(record, connection);
          return Failure("disconnected", "GitHub rejected the source credential.");
        }
        if (!source.Successful) return Failure(source.Status is HttpStatusCode.Forbidden or HttpStatusCode.NotFound ? "denied" : "unavailable",
            "The bounded runner source is unavailable; no empty inventory or host health is inferred.");
        var total = SourceJson.Number(source.Value, "total_count");
        if (total is not (>= 0 and <= 9_007_199_254_740_991) || source.Value.ValueKind != JsonValueKind.Object
            || !source.Value.TryGetProperty("runners", out var rows) || rows.ValueKind != JsonValueKind.Array || rows.GetArrayLength() > 100
            || total < rows.GetArrayLength()) return Failure("unavailable", "Runner identity or source coverage is malformed.", total);
        var runners = new List<RepositoryRunner>();
        foreach (var row in rows.EnumerateArray())
        {
          if (SourceJson.Number(row, "id") is not (> 0 and <= 9_007_199_254_740_991) || SourceJson.Text(row, "name") is not { Length: > 0 and <= 256 } name)
            return Failure("unavailable", "A runner record is malformed; records were not silently omitted.", total);
          var hasLabels = row.TryGetProperty("labels", out var labels) && labels.ValueKind == JsonValueKind.Array;
          var projected = hasLabels ? labels.EnumerateArray().Take(100).Select(l => SourceJson.Text(l, "name")).Where(l => l is { Length: > 0 and <= 256 }).OfType<string>().ToArray() : [];
          var labelsComplete = hasLabels && labels.GetArrayLength() <= 100 && labels.GetArrayLength() == projected.Length;
          var busy = row.TryGetProperty("busy", out var value) && value.ValueKind is JsonValueKind.True or JsonValueKind.False ? (bool?)value.GetBoolean() : null;
          runners.Add(new(SourceJson.Number(row, "id")!.Value, name, SourceJson.Text(row, "os") is { Length: <= 64 } os ? os : null,
              SourceJson.Text(row, "status") is "online" ? "online" : SourceJson.Text(row, "status") is "offline" ? "offline" : "unknown",
              busy, labelsComplete ? projected : [], labelsComplete));
        }
        lock (record.Sync)
        {
          if (!Live()) return Failure("disconnected", "The source account or session changed.");
          return new(query.Repository, "available", clock.GetUtcNow(), runners, total, total == runners.Count, connection.DataScope);
        }
      }
      catch (OperationCanceledException)
      { return Failure(record.Stopped.IsCancellationRequested ? "disconnected" : "unavailable", "The runtime read ended or exceeded its deadline."); }
    }
    finally { slots.GitHub.Release(); }
  }
}
