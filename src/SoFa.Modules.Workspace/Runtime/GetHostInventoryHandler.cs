using System.ComponentModel;
using System.Diagnostics;
using System.Text.Json;
using JuanGCarmona.Lighthouse.Cqrs;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;

namespace JuanGCarmona.SoFa.Modules.Workspace.Runtime;

internal sealed record GetHostInventory(OwnerSession Session);
internal sealed record HostInventory(string Availability, DateTimeOffset ObservedAt, int RegistrationCount, int CheckoutCount,
    bool Complete, JsonElement? Observation = null, string? Reason = null);

internal sealed class RuntimeReadSlots : IDisposable
{
  internal SemaphoreSlim Host { get; } = new(1, 1);
  internal SemaphoreSlim GitHub { get; } = new(2, 2);
  public void Dispose() { Host.Dispose(); GitHub.Dispose(); }
}

internal sealed class GetHostInventoryHandler(WorkspaceOptions settings, OwnerSessions sessions, RuntimeReadSlots slots, TimeProvider clock)
    : IQueryHandler<GetHostInventory, HostInventory>
{
  internal string HelperPath { get; init; } = Path.Combine(AppContext.BaseDirectory, "workspace-tools", "runtime-inventory.mjs");
  internal static HostInventory Bound(HostInventory value) => JsonSerializer.SerializeToUtf8Bytes(value, JsonSerializerOptions.Web).Length <= 2 * 1024 * 1024 ? value
      : value with { Availability = "unavailable", Complete = false, Observation = null, Reason = "The projected host evidence exceeded its response bound; source coverage is incomplete." };

  public async Task<HostInventory> Handle(GetHostInventory query, CancellationToken cancellationToken)
  {
    HostInventory Failure(string state) => new(state, clock.GetUtcNow(), settings.Runtime.Registrations.Count, settings.Runtime.Checkouts.Count,
        false, Reason: state == "busy" ? "Another host observation is in progress. Retry explicitly." : "Host evidence is unavailable; no empty inventory is inferred.");
    if (!slots.Host.Wait(0, cancellationToken)) return Failure("busy");
    string? scratch = null;
    HostInventory result;
    var cleanupFailed = false;
    try { result = await Observe().ConfigureAwait(false); }
    catch (Exception exception) when (exception is IOException or UnauthorizedAccessException or Win32Exception)
    { result = Failure("unavailable"); }
    finally
    {
      if (scratch is not null)
        try { Directory.Delete(scratch, true); }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException) { cleanupFailed = true; }
      slots.Host.Release();
    }
    return cleanupFailed ? Failure("unavailable") with { Reason = "Owned temporary observation files could not be removed; evidence is unavailable." } : result;

    async Task<HostInventory> Observe()
    {
      if (!OperatingSystem.IsLinux()) return Failure("unavailable");
      scratch = Directory.CreateTempSubdirectory("sofa-runtime-").FullName;
      File.SetUnixFileMode(scratch, UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);
      var input = JsonSerializer.SerializeToUtf8Bytes(new
      {
        registrations = settings.Runtime.Registrations.Select(s => new { alias = s.Alias, directory = s.Directory }),
        checkouts = settings.Runtime.Checkouts.Select(s => new { repository = s.Repository, directory = s.Directory }),
        trustedGroupIds = settings.Runtime.TrustedGroupIds,
        scratch,
      });
      if (input.Length > 128 * 1024) return Failure("unavailable");
      var start = new ProcessStartInfo("node")
      {
        UseShellExecute = false,
        RedirectStandardInput = true,
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        CreateNoWindow = true
      };
      start.ArgumentList.Add("--max-old-space-size=128");
      start.ArgumentList.Add(HelperPath);
      var path = Environment.GetEnvironmentVariable("PATH");
      start.Environment.Clear();
      if (path is not null) start.Environment["PATH"] = path;
      start.Environment["HOME"] = scratch;
      start.Environment["XDG_CONFIG_HOME"] = scratch;
      using var process = new Process { StartInfo = start };
      var record = query.Session;
      TimeSpan remaining;
      lock (record.Sync)
      {
        if (!ReferenceEquals(sessions.Get(record.Id), record)) return Failure("disconnected");
        var deadline = record.IdleDeadline < record.AbsoluteDeadline ? record.IdleDeadline : record.AbsoluteDeadline;
        remaining = deadline - clock.GetUtcNow();
      }
      if (remaining <= TimeSpan.Zero) return Failure("disconnected");
      using var deadlineStop = new CancellationTokenSource(remaining, clock);
      using var budget = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, record.Stopped.Token, deadlineStop.Token);
      budget.CancelAfter(TimeSpan.FromSeconds(10));
      using var stopRead = budget.Token.Register(() =>
      {
        try { if (!process.HasExited) process.Kill(entireProcessTree: true); }
        catch (Exception exception) when (exception is InvalidOperationException or Win32Exception) { }
      });
      Task<byte[]?>? output = null, error = null;
      try
      {
        lock (record.Sync)
        {
          if (budget.IsCancellationRequested || !ReferenceEquals(sessions.Get(record.Id), record) || !process.Start()) return Failure("disconnected");
        }
        output = ReadBounded(process.StandardOutput.BaseStream, 1024 * 1024, budget);
        error = ReadBounded(process.StandardError.BaseStream, 8192, budget);
        await process.StandardInput.BaseStream.WriteAsync(input, budget.Token).ConfigureAwait(false);
        process.StandardInput.Close();
        await process.WaitForExitAsync(budget.Token).ConfigureAwait(false);
        var bytes = await output.ConfigureAwait(false);
        var errors = await error.ConfigureAwait(false);
        if (record.Stopped.IsCancellationRequested || deadlineStop.IsCancellationRequested) return Failure("disconnected");
        if (process.ExitCode != 0 || bytes is null || errors is null) return Failure("unavailable");
        using var document = JsonDocument.Parse(bytes);
        var value = document.RootElement;
        if (value.ValueKind != JsonValueKind.Object || !value.TryGetProperty("availability", out var availability) || availability.GetString() != "available"
            || !value.TryGetProperty("registrations", out var registrations) || registrations.ValueKind != JsonValueKind.Array || registrations.GetArrayLength() != settings.Runtime.Registrations.Count
            || !value.TryGetProperty("adoptions", out var adoptions) || adoptions.ValueKind != JsonValueKind.Array || adoptions.GetArrayLength() != settings.Runtime.Checkouts.Count)
          return Failure("unavailable");
        lock (record.Sync)
        {
          if (budget.IsCancellationRequested || !ReferenceEquals(sessions.Get(record.Id), record)) return Failure("disconnected");
          return new("available", clock.GetUtcNow(), settings.Runtime.Registrations.Count, settings.Runtime.Checkouts.Count,
              value.TryGetProperty("complete", out var complete) && complete.ValueKind == JsonValueKind.True, value.Clone());
        }
      }
      catch (Exception exception) when (exception is Win32Exception or IOException or OperationCanceledException or JsonException or InvalidOperationException)
      { return Failure(record.Stopped.IsCancellationRequested || deadlineStop.IsCancellationRequested ? "disconnected" : "unavailable"); }
      finally
      {
        try { if (!process.HasExited) { process.Kill(entireProcessTree: true); await process.WaitForExitAsync(CancellationToken.None).ConfigureAwait(false); } }
        catch (Exception exception) when (exception is InvalidOperationException or Win32Exception) { }
        budget.Cancel();
        foreach (var pending in new[] { output, error })
          if (pending is not null)
            try { await pending.ConfigureAwait(false); }
            catch (Exception exception) when (exception is IOException or OperationCanceledException or ObjectDisposedException) { }
      }
    }
  }

  private static async Task<byte[]?> ReadBounded(Stream stream, int maximum, CancellationTokenSource budget)
  {
    using var output = new MemoryStream();
    var buffer = new byte[4096];
    int count;
    while ((count = await stream.ReadAsync(buffer, budget.Token).ConfigureAwait(false)) > 0)
    {
      if (output.Length + count > maximum) { budget.Cancel(); return null; }
      output.Write(buffer, 0, count);
    }
    return output.ToArray();
  }
}
