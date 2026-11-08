using System.ComponentModel;
using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record ControlCallbackResult(bool Ok, object? Value = null, int? Status = null);
internal sealed record ControlReadResult(string Availability, JsonElement? Facts = null, string? Reason = null);

internal sealed class SourceControlBridge : IDisposable
{
  private readonly SemaphoreSlim slots = new(2, 2);
  public void Dispose() => slots.Dispose();
  internal async Task<ControlReadResult> Observe(string repository, int number,
      Func<JsonElement, CancellationToken, Task<ControlCallbackResult>> callback, CancellationToken cancellationToken)
  {
    if (!await slots.WaitAsync(0, cancellationToken).ConfigureAwait(false))
      return new("unavailable", Reason: "Source observation slots are occupied.");
    try { return await Run(repository, number, callback, cancellationToken).ConfigureAwait(false); }
    finally { slots.Release(); }
  }

  private static async Task<ControlReadResult> Run(string repository, int number,
      Func<JsonElement, CancellationToken, Task<ControlCallbackResult>> callback, CancellationToken cancellationToken)
  {
    var start = new ProcessStartInfo("node")
    {
      UseShellExecute = false,
      RedirectStandardInput = true,
      RedirectStandardOutput = true,
      RedirectStandardError = true,
      CreateNoWindow = true,
    };
    start.ArgumentList.Add("--max-old-space-size=128");
    start.ArgumentList.Add(Path.Combine(AppContext.BaseDirectory, "workspace-tools", "issue-control-read.mjs"));
    var path = Environment.GetEnvironmentVariable("PATH");
    start.Environment.Clear();
    if (path is not null) start.Environment["PATH"] = path;
    start.Environment["NODE_NO_WARNINGS"] = "1";
    using var budget = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    budget.CancelAfter(TimeSpan.FromSeconds(20));
    using var process = new Process { StartInfo = start };
    Task<bool>? stderr = null;
    try
    {
      if (!process.Start()) return new("unavailable", Reason: "Shared source reader could not start.");
      stderr = DrainError(process.StandardError.BaseStream, budget.Token);
      var frames = new ControlFrames(process.StandardOutput.BaseStream);
      await Send(process, new { version = 1, operation = "observe", repository, number }, budget.Token).ConfigureAwait(false);
      var sequence = 0;
      JsonElement? result = null;
      while (true)
      {
        using var document = await frames.Next(budget.Token).ConfigureAwait(false);
        if (document is null) break;
        var value = document.RootElement;
        if (result is not null || value.ValueKind != JsonValueKind.Object
            || value.EnumerateObject().Select(property => property.Name).Distinct(StringComparer.Ordinal).Count() != value.EnumerateObject().Count())
          throw new InvalidDataException("Invalid source frame.");
        if (SourceJson.Text(value, "type") == "result")
        {
          if (value.EnumerateObject().Count() != 2 || !value.TryGetProperty("result", out var facts)
              || facts.ValueKind != JsonValueKind.Object || SourceJson.Text(facts, "availability") is not ("available" or "unavailable" or "unsupported" or "denied"))
            throw new InvalidDataException("Invalid observation result.");
          result = facts.Clone();
          process.StandardInput.Close();
          continue;
        }
        if (SourceJson.Text(value, "type") != "request" || SourceJson.Number(value, "id") != ++sequence || sequence > 64)
          throw new InvalidDataException("Invalid source callback.");
        var answer = await callback(value, budget.Token).ConfigureAwait(false);
        await Send(process, new { type = "response", id = sequence, ok = answer.Ok, value = answer.Value, status = answer.Status }, budget.Token).ConfigureAwait(false);
      }
      await process.WaitForExitAsync(budget.Token).ConfigureAwait(false);
      if (result is null || process.ExitCode != 0 || !await stderr.ConfigureAwait(false))
        return new("unavailable", Reason: "Shared source reader did not return a complete observation.");
      return new(SourceJson.Text(result.Value, "availability")!, result, SourceJson.Text(result.Value, "reason"));
    }
    catch (Exception error) when (error is Win32Exception or IOException or InvalidOperationException or JsonException or OperationCanceledException or ArgumentException)
    { return new("unavailable", Reason: "Shared source observation failed or exceeded its bounds."); }
    finally
    {
      budget.Cancel();
      try { if (!process.HasExited) process.Kill(entireProcessTree: true); }
      catch (Exception error) when (error is InvalidOperationException or Win32Exception) { }
      try
      {
        using var cleanup = new CancellationTokenSource(TimeSpan.FromSeconds(2));
        await process.WaitForExitAsync(cleanup.Token).ConfigureAwait(false);
      }
      catch (Exception error) when (error is InvalidOperationException or OperationCanceledException) { }
      if (stderr is not null)
        try { await stderr.ConfigureAwait(false); }
        catch (Exception error) when (error is IOException or OperationCanceledException or ObjectDisposedException) { }
    }
  }

  private static async Task Send(Process process, object value, CancellationToken cancellationToken)
  {
    var bytes = JsonSerializer.SerializeToUtf8Bytes(value);
    if (bytes.Length > 4 * 1024 * 1024) throw new InvalidDataException("Source frame too large.");
    await process.StandardInput.BaseStream.WriteAsync(bytes, cancellationToken).ConfigureAwait(false);
    await process.StandardInput.BaseStream.WriteAsync(new byte[] { 10 }, cancellationToken).ConfigureAwait(false);
    await process.StandardInput.BaseStream.FlushAsync(cancellationToken).ConfigureAwait(false);
  }

  private static async Task<bool> DrainError(Stream stream, CancellationToken cancellationToken)
  {
    var bytes = new byte[4096];
    long count = 0;
    int read;
    while ((read = await stream.ReadAsync(bytes, cancellationToken).ConfigureAwait(false)) > 0) count += read;
    return count <= 8192;
  }
}

internal sealed class ControlFrames(Stream stream)
{
  private static readonly UTF8Encoding Utf8 = new(false, true);
  private readonly byte[] buffer = new byte[16384];
  private int position, length;
  internal async Task<JsonDocument?> Next(CancellationToken cancellationToken)
  {
    using var line = new MemoryStream();
    while (true)
    {
      if (position == length)
      {
        length = await stream.ReadAsync(buffer, cancellationToken).ConfigureAwait(false);
        position = 0;
        if (length == 0)
        {
          if (line.Length != 0) throw new InvalidDataException("Truncated source frame.");
          return null;
        }
      }
      var newline = Array.IndexOf(buffer, (byte)10, position, length - position);
      var count = (newline < 0 ? length : newline) - position;
      if (line.Length + count > 4 * 1024 * 1024) throw new InvalidDataException("Oversized source frame.");
      line.Write(buffer, position, count);
      position += count;
      if (newline < 0) continue;
      position++;
      if (line.Length == 0) throw new InvalidDataException("Empty source frame.");
      var bytes = line.ToArray();
      if (bytes.Contains((byte)13)) throw new InvalidDataException("Invalid source frame delimiter.");
      try { Utf8.GetCharCount(bytes); }
      catch (DecoderFallbackException) { throw new InvalidDataException("Invalid source frame encoding."); }
      return JsonDocument.Parse(bytes);
    }
  }
}
