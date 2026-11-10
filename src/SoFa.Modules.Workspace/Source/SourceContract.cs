using System.ComponentModel;
using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal static class SourceContract
{
  internal static async Task<bool> Validate(JsonElement request, JsonElement envelope, CancellationToken cancellationToken)
  {
    var input = JsonSerializer.SerializeToUtf8Bytes(new { request, envelope });
    if (input.Length > 2 * 1024 * 1024 + 1024) return false;
    var start = new ProcessStartInfo("node")
    {
      UseShellExecute = false,
      RedirectStandardInput = true,
      RedirectStandardOutput = true,
      RedirectStandardError = true,
      CreateNoWindow = true,
    };
    start.ArgumentList.Add(Path.Combine(AppContext.BaseDirectory, "workspace-tools", "validate-stage-result.mjs"));
    var path = Environment.GetEnvironmentVariable("PATH");
    start.Environment.Clear();
    if (path is not null) start.Environment["PATH"] = path;
    start.Environment["NODE_NO_WARNINGS"] = "1";
    using var process = new Process { StartInfo = start };
    using var budget = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    budget.CancelAfter(TimeSpan.FromSeconds(3));
    Task<byte[]?>? output = null, error = null;
    try
    {
      if (!process.Start()) return false;
      output = ReadBounded(process.StandardOutput.BaseStream, budget.Token);
      error = ReadBounded(process.StandardError.BaseStream, budget.Token);
      await process.StandardInput.BaseStream.WriteAsync(input, budget.Token).ConfigureAwait(false);
      process.StandardInput.Close();
      await process.WaitForExitAsync(budget.Token).ConfigureAwait(false);
      var stdout = await output.ConfigureAwait(false);
      await error.ConfigureAwait(false);
      if (process.ExitCode != 0 || stdout is null) return false;
      using var response = JsonDocument.Parse(stdout);
      return response.RootElement.ValueKind == JsonValueKind.Object && response.RootElement.TryGetProperty("valid", out var valid)
          && valid.ValueKind == JsonValueKind.True;
    }
    catch (Exception exception) when (exception is Win32Exception or IOException or OperationCanceledException or JsonException or InvalidOperationException)
    { return false; }
    finally
    {
      try { if (!process.HasExited) process.Kill(entireProcessTree: true); }
      catch (Exception exception) when (exception is InvalidOperationException or Win32Exception) { }
      foreach (var pending in new[] { output, error })
        if (pending is not null)
          try { await pending.ConfigureAwait(false); }
          catch (Exception exception) when (exception is IOException or OperationCanceledException or ObjectDisposedException) { }
    }
  }

  private static async Task<byte[]?> ReadBounded(Stream stream, CancellationToken cancellationToken)
  {
    using var output = new MemoryStream();
    var buffer = new byte[256];
    int count;
    while ((count = await stream.ReadAsync(buffer, cancellationToken).ConfigureAwait(false)) > 0)
    {
      if (output.Length + count > 1024) return null;
      output.Write(buffer, 0, count);
    }
    return output.ToArray();
  }
}
