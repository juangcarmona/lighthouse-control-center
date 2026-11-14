using System.Globalization;
using System.Net;
using System.Text.Json;
using JuanGCarmona.Lighthouse.Cqrs;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record GetActionsUsage(OwnerSession Session, string Repository, long? Run = null, long? Attempt = null);
internal sealed record UsageMeasure(string Availability, double? Value, string Unit, string Source,
    string Definition, string Scope, DateTimeOffset ObservedAt, bool Complete, string? Reason = null);
internal sealed record UsageJob(long Id, string? Name, string RunnerKind, string? StartedAt, string? CompletedAt, double? Seconds);
internal sealed record ActionsUsage(string Repository, string Availability, DateTimeOffset ObservedAt, string? DataScope,
    long? Run, long? Attempt, string Visibility, IReadOnlyList<UsageJob> Jobs, long? SourceJobs,
    UsageMeasure Duration, UsageMeasure Cache, UsageMeasure Artifacts, long? SourceArtifacts, int? ExpiredArtifacts,
    UsageMeasure Billing, string? Reason = null);

internal sealed class GetActionsUsageHandler(OwnerSessions sessions, GitHubAuthorization authorization,
    RepositoryAccess access, GitHubTransport transport, TimeProvider clock) : IQueryHandler<GetActionsUsage, ActionsUsage>, IDisposable
{
  private readonly SemaphoreSlim slots = new(2, 2);
  private const long Maximum = 9_007_199_254_740_991;

  public async Task<ActionsUsage> Handle(GetActionsUsage query, CancellationToken cancellationToken)
  {
    var now = clock.GetUtcNow();
    var prefix = "/repos/" + query.Repository + "/actions";
    UsageMeasure Measure(string state, string unit, string path, string definition, string scope, double? value = null, bool complete = false, string? reason = null) =>
        new(state, value, unit, "https://api.github.com" + path, definition, scope, now, complete, reason);
    var duration = Measure("unsupported", "seconds", prefix + "/runs", "v1: elapsed span from earliest completed job start to latest completion; not summed job time or billed minutes", "Select an exact run attempt");
    var cache = Measure("unavailable", "bytes", prefix + "/cache/usage", "GitHub current active cache size; approximately five-minute source refresh, not a bill", "Repository cache snapshot");
    var artifacts = Measure("unavailable", "bytes", prefix + "/artifacts?per_page=100&page=1", "v1: sum of nonexpired listed artifact size_in_bytes, not billed storage", "First 100 repository artifact records");
    var billing = Measure("unsupported", "minutes", prefix + "/runs", "Attributable GitHub billed minutes only; never derived from duration", "No verified account Plan authority or repository-attributable billing report",
        reason: "Actions-read does not grant billing access. Public/private and self-hosted billing differ; host and model-provider costs are unknown even if billed Actions minutes are zero.")
        with
    { Source = "No billing report collected" };
    ActionsUsage Failure(string state, string reason) => new(query.Repository, state, now, null, query.Run, query.Attempt, "unknown", [], null,
        duration with { Availability = state, Value = null, Complete = false }, cache with { Availability = state, Value = null, Complete = false }, artifacts with { Availability = state, Value = null, Complete = false }, null, null, billing, reason);
    if (query.Run is not null && query.Run is not (> 0 and <= Maximum) || query.Attempt is not null && query.Attempt is not (> 0 and <= Maximum)
        || (query.Run is null) != (query.Attempt is null)) return Failure("invalid", "Supply both an exact positive run and attempt, or neither.");
    if (!slots.Wait(0, cancellationToken)) return Failure("busy", "Two Actions reads are in progress. Retry explicitly.");
    try
    {
      var record = query.Session;
      using var budget = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, record.Stopped.Token);
      budget.CancelAfter(TimeSpan.FromSeconds(25));
      try
      {
        var authority = await access.CheckAsync(record, query.Repository, budget.Token).ConfigureAwait(false);
        if (authority.Availability != SourceAvailability.Available || !authority.ActionsRead)
          return Failure(authority.Availability == SourceAvailability.Denied || authority.Availability == SourceAvailability.Available ? "denied" : "authority-unverified", "Current repository Actions-read authority is required.");
        var connection = await authorization.CurrentAsync(record, budget.Token).ConfigureAwait(false);
        if (connection is null) return Failure("disconnected", "Connect and verify the GitHub account.");
        bool Live()
        {
          lock (record.Sync) return ReferenceEquals(sessions.Get(record.Id), record) && ReferenceEquals(record.GitHub.Current, connection)
              && record.GitHub.Generation == authority.Generation && connection.DataScope == authority.DataScope;
        }
        var guard = new SourceRequestGuard(record.Sync, Live, connection.Stopped.Token);
        async Task<GitHubResponse> Read(string path)
        {
          var response = await transport.GetAsync(path, connection.Tokens.Access, guard, budget.Token).ConfigureAwait(false);
          if (response.Status == HttpStatusCode.Unauthorized) GitHubAuthorization.Invalidate(record, connection);
          return response;
        }
        if (!Live()) return Failure("disconnected", "Source scope changed.");
        using var repository = await Read("/repos/" + query.Repository).ConfigureAwait(false);
        if (!repository.Successful) return Failure(State(repository), "Repository metadata unavailable; no usage inferred.");
        var visibility = SourceJson.Text(repository.Value, "visibility") is "public" ? "public"
            : SourceJson.Text(repository.Value, "visibility") is "private" ? "private" : "unknown";
        var jobs = new List<UsageJob>(); long? totalJobs = null; long? totalArtifacts = null; int? expired = null;
        if (query.Run is { } run && query.Attempt is { } attempt)
        {
          var path = prefix + "/runs/" + run.ToString(CultureInfo.InvariantCulture) + "/attempts/" + attempt.ToString(CultureInfo.InvariantCulture) + "/jobs?per_page=100&page=1";
          using var source = await Read(path).ConfigureAwait(false);
          duration = Measure(State(source), "seconds", path, duration.Definition, "First 100 jobs of exact run " + run + " attempt " + attempt);
          if (source.Successful && Rows(source.Value, "jobs", out var rows, out totalJobs))
          {
            var valid = true; var ids = new HashSet<long>();
            foreach (var row in rows.EnumerateArray())
            {
              var id = Number(row, "id");
              if (id is not > 0 || !ids.Add(id.Value) || SourceJson.Number(row, "run_id") != run || SourceJson.Number(row, "run_attempt") != attempt) { valid = false; break; }
              var start = Timestamp(row, "started_at"); var end = Timestamp(row, "completed_at");
              var seconds = SourceJson.Text(row, "status") == "completed" && start is not null && end is not null && end >= start && end <= now ? (end.Value - start.Value).TotalSeconds : (double?)null;
              var selfHosted = row.TryGetProperty("labels", out var labels) && labels.ValueKind == JsonValueKind.Array
                  && labels.EnumerateArray().Any(label => label.ValueKind == JsonValueKind.String && label.GetString() == "self-hosted");
              jobs.Add(new(id.Value, SourceJson.Text(row, "name") is { Length: <= 256 } name ? name : null, selfHosted ? "self-hosted" : "unknown",
                  start?.ToString("o", CultureInfo.InvariantCulture), end?.ToString("o", CultureInfo.InvariantCulture), seconds));
            }
            if (!valid) { jobs.Clear(); duration = duration with { Availability = "unavailable", Reason = "Malformed or mismatched job identity; no duration inferred." }; }
            else
            {
              var complete = totalJobs == jobs.Count;
              var known = complete && jobs.Count > 0 && jobs.All(job => job.Seconds is not null);
              duration = duration with
              {
                Availability = complete ? "available" : "partial",
                Complete = complete,
                Value = known ? (jobs.Max(job => DateTimeOffset.Parse(job.CompletedAt!, CultureInfo.InvariantCulture)) - jobs.Min(job => DateTimeOffset.Parse(job.StartedAt!, CultureInfo.InvariantCulture))).TotalSeconds : null,
                Reason = "Only completed valid intervals have seconds. Parallel job seconds are not wall time; omitted or unfinished jobs prevent an attempt span."
              };
            }
          }
          else if (source.Successful) duration = duration with { Availability = "unavailable", Reason = "Malformed job page; coverage unknown." };
        }
        else
        {
          using var sourceCache = await Read(prefix + "/cache/usage").ConfigureAwait(false);
          cache = cache with { Availability = State(sourceCache) };
          if (sourceCache.Successful)
          {
            var bytes = Number(sourceCache.Value, "active_caches_size_in_bytes");
            cache = cache with { Availability = bytes is null ? "unavailable" : "available", Value = bytes, Complete = bytes is not null };
          }
          using var sourceArtifacts = await Read(prefix + "/artifacts?per_page=100&page=1").ConfigureAwait(false);
          artifacts = artifacts with { Availability = State(sourceArtifacts) };
          if (sourceArtifacts.Successful && Rows(sourceArtifacts.Value, "artifacts", out var rows, out totalArtifacts))
          {
            double sum = 0; var valid = true; expired = 0; var ids = new HashSet<long>();
            foreach (var row in rows.EnumerateArray())
            {
              var id = Number(row, "id"); var bytes = Number(row, "size_in_bytes"); var expires = Timestamp(row, "expires_at");
              if (id is not > 0 || !ids.Add(id.Value) || bytes is null || !row.TryGetProperty("expired", out var flag)
                  || flag.ValueKind is not (JsonValueKind.True or JsonValueKind.False) || expires is null) { valid = false; break; }
              if (flag.GetBoolean() || expires <= now) expired++; else sum += bytes.Value;
            }
            var complete = totalArtifacts == rows.GetArrayLength();
            artifacts = artifacts with
            {
              Availability = !valid || sum > Maximum ? "unavailable" : complete ? "available" : "partial",
              Complete = valid && sum <= Maximum && complete,
              Value = valid && sum <= Maximum ? sum : null,
              Reason = "Listed active bytes only; expired artifacts excluded. Malformed or overflowing bytes, omitted records and billed storage are unknown."
            };
            if (!valid) expired = null;
          }
          else if (sourceArtifacts.Successful) artifacts = artifacts with { Availability = "unavailable", Reason = "Malformed artifact page; coverage unknown." };
        }
        lock (record.Sync)
        {
          if (!Live()) return Failure("disconnected", "Source account or session changed during collection.");
          return new(query.Repository, "available", now, connection.DataScope, query.Run, query.Attempt, visibility, jobs, totalJobs,
              duration, cache, artifacts, totalArtifacts, expired, billing);
        }
      }
      catch (OperationCanceledException) { return Failure(record.Stopped.IsCancellationRequested ? "disconnected" : "unavailable", "Actions collection ended or exceeded its deadline."); }
    }
    finally { slots.Release(); }
  }

  private static string State(GitHubResponse response) => response.Successful ? "available" : response.Status is HttpStatusCode.Forbidden or HttpStatusCode.NotFound ? "denied"
      : response.Status == HttpStatusCode.Gone ? "unsupported" : "unavailable";
  private static long? Number(JsonElement row, string name) => SourceJson.Number(row, name) is >= 0 and <= Maximum ? SourceJson.Number(row, name) : null;
  private static DateTimeOffset? Timestamp(JsonElement row, string name) => DateTimeOffset.TryParse(SourceJson.Text(row, name), CultureInfo.InvariantCulture,
      DateTimeStyles.None, out var time) ? time.ToUniversalTime() : null;
  private static bool Rows(JsonElement root, string name, out JsonElement rows, out long? total)
  {
    rows = default; total = Number(root, "total_count");
    return total is not null && root.ValueKind == JsonValueKind.Object && root.TryGetProperty(name, out rows)
        && rows.ValueKind == JsonValueKind.Array && rows.GetArrayLength() <= 100 && total >= rows.GetArrayLength();
  }
  public void Dispose() => slots.Dispose();
}
