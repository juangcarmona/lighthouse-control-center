using System.IO.Compression;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record ArtifactJson(string Availability, string? Reason = null, JsonElement? Content = null);
internal sealed record TelemetryArtifact(ArtifactJson Usage, ArtifactJson Records);

internal sealed partial class GitHubTransport
{
  internal async Task<TelemetryArtifact> ReadTelemetryArtifactAsync(string repository, long artifactId, string token,
      SourceRequestGuard guard, CancellationToken cancellationToken)
  {
    if (artifactId <= 0) return Failed("Invalid artifact identity.");
    using var request = new HttpRequestMessage(HttpMethod.Get,
        "https://api.github.com/repos/" + repository + "/actions/artifacts/" + artifactId.ToString(System.Globalization.CultureInfo.InvariantCulture) + "/zip");
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    request.Headers.UserAgent.ParseAdd("Lighthouse-Control-Center/1.0");
    request.Headers.Add("X-GitHub-Api-Version", "2026-03-10");
    try
    {
      using var linked = guard.Stopped.CanBeCanceled ? CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, guard.Stopped) : null;
      var readToken = linked?.Token ?? cancellationToken;
      var pendingSource = BeginRequest(guard, () => client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, readToken));
      if (pendingSource is null) return Failed("The acting account changed.", "disconnected");
      using var source = await pendingSource.ConfigureAwait(false);
      if (source.StatusCode == HttpStatusCode.Unauthorized) return Failed("GitHub rejected the connected-user credential.", "disconnected");
      if (source.StatusCode != HttpStatusCode.Found || source.Headers.Location is not { IsAbsoluteUri: true } location
          || location.Scheme != "https" || location.UserInfo.Length != 0
          || !(location.Host.EndsWith(".blob.core.windows.net", StringComparison.OrdinalIgnoreCase)
              || location.Host.EndsWith(".githubusercontent.com", StringComparison.OrdinalIgnoreCase)))
        return Failed("The source artifact is inaccessible or its download destination is unsupported.");
      // A signed asset URL is never returned or logged, and receives no user credential.
      using var download = new HttpRequestMessage(HttpMethod.Get, location);
      var pendingDownload = BeginRequest(guard, () => client.SendAsync(download, HttpCompletionOption.ResponseHeadersRead, readToken));
      if (pendingDownload is null) return Failed("The acting account changed.", "disconnected");
      using var response = await pendingDownload.ConfigureAwait(false);
      if (response.StatusCode != HttpStatusCode.OK) return Failed("Artifact download failed or redirected again.");
      if (response.Content.Headers.ContentLength > 2 * 1024 * 1024) return Failed("Artifact exceeds 2 MiB compressed.");
      await using var stream = await response.Content.ReadAsStreamAsync(readToken).ConfigureAwait(false);
      using var compressed = new MemoryStream();
      var buffer = new byte[16 * 1024];
      int read;
      while ((read = await stream.ReadAsync(buffer, readToken).ConfigureAwait(false)) > 0)
      {
        if (compressed.Length + read > 2 * 1024 * 1024) return Failed("Artifact exceeds 2 MiB compressed.");
        compressed.Write(buffer, 0, read);
      }
      compressed.Position = 0;
      return !guard.IsLive() ? Failed("The acting account changed.", "disconnected") : ParseTelemetryArtifact(compressed);
    }
    catch (Exception error) when (error is HttpRequestException or InvalidDataException or JsonException or IOException)
    { return Failed("Artifact is malformed, inaccessible or outside the supported JSON/ZIP bounds."); }
    catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
    { return Failed("Artifact read timed out."); }
  }

  internal static TelemetryArtifact ParseTelemetryArtifact(Stream compressed)
  {
    try
    {
      using var archive = new ZipArchive(compressed, ZipArchiveMode.Read, leaveOpen: true);
      if (archive.Entries.Count > 100) return Failed("Artifact exceeds 100 archive members.");
      long expanded = 0;
      var names = new HashSet<string>(StringComparer.Ordinal);
      foreach (var entry in archive.Entries)
      {
        expanded += entry.Length;
        var path = entry.FullName.TrimEnd('/');
        if (expanded > 4 * 1024 * 1024 || entry.Length > 4 * 1024 * 1024 || path.StartsWith('/') || path.Contains('\\')
            || path.Split('/').Any(part => part is "." or "..") || !names.Add(entry.FullName)
            || ((entry.ExternalAttributes >> 16) & 0xF000) == 0xA000)
          return Failed("Artifact member paths, uniqueness or 4 MiB expanded bound are invalid.");
      }
      var usageEntry = archive.GetEntry("evidence/host/telemetry-usage.json");
      var recordsEntry = archive.GetEntry("evidence/host/telemetry.jsonl");
      if (usageEntry is null || recordsEntry is null || usageEntry.Length > 1024 * 1024 || recordsEntry.Length > 1024 * 1024)
        return Failed("The exact usage summary and correlation records are missing or exceed 1 MiB.");
      var usageBytes = ReadMember(usageEntry);
      var recordsBytes = ReadMember(recordsEntry);
      using var usage = JsonDocument.Parse(WithoutBom(usageBytes));
      var lines = Encoding.UTF8.GetString(WithoutBom(recordsBytes).Span).Split('\n', StringSplitOptions.RemoveEmptyEntries);
      if (lines.Length is 0 or > 10_000) return Failed("Telemetry record count is outside the supported bound.");
      using var records = JsonDocument.Parse("[" + string.Join(',', lines) + "]");
      return new(new("available", Content: usage.RootElement.Clone()), new("available", Content: records.RootElement.Clone()));
    }
    catch (Exception error) when (error is InvalidDataException or JsonException or IOException or ArgumentException or DecoderFallbackException)
    { return Failed("Artifact is malformed or its required telemetry members cannot be read."); }

    static byte[] ReadMember(ZipArchiveEntry entry)
    {
      using var source = entry.Open();
      using var result = new MemoryStream();
      var buffer = new byte[16 * 1024];
      int read;
      while ((read = source.Read(buffer, 0, buffer.Length)) > 0)
      {
        if (result.Length + read > 1024 * 1024) throw new InvalidDataException("Member exceeded its bound while reading.");
        result.Write(buffer, 0, read);
      }
      return result.ToArray();
    }

    static ReadOnlyMemory<byte> WithoutBom(byte[] bytes) => bytes.AsMemory(bytes.Length >= 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF ? 3 : 0);
  }

  private static TelemetryArtifact Failed(string reason, string availability = "unavailable") =>
      new(new(availability, reason), new(availability, reason));

  internal async Task<ArtifactJson> ReadArtifactAsync(string repository, long artifactId, string token, string member,
      SourceRequestGuard guard, CancellationToken cancellationToken)
  {
    if (artifactId <= 0 || member is not ("request.json" or "envelope.json" or "result.json"))
      return new("unavailable", "Unsupported artifact identity or member.");
    using var request = new HttpRequestMessage(HttpMethod.Get,
        "https://api.github.com/repos/" + repository + "/actions/artifacts/" + artifactId.ToString(System.Globalization.CultureInfo.InvariantCulture) + "/zip");
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    request.Headers.UserAgent.ParseAdd("Lighthouse-Control-Center/1.0");
    request.Headers.Add("X-GitHub-Api-Version", "2026-03-10");
    try
    {
      using var linked = guard.Stopped.CanBeCanceled ? CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, guard.Stopped) : null;
      var readToken = linked?.Token ?? cancellationToken;
      var pendingSource = BeginRequest(guard, () => client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, readToken));
      if (pendingSource is null) return new("disconnected", "The acting account changed.");
      using var source = await pendingSource.ConfigureAwait(false);
      if (source.StatusCode == HttpStatusCode.Unauthorized) return new("disconnected", "GitHub rejected the connected-user credential.");
      if (source.StatusCode != HttpStatusCode.Found || source.Headers.Location is not { IsAbsoluteUri: true } location
          || location.Scheme != "https" || location.UserInfo.Length != 0
          || !(location.Host.EndsWith(".blob.core.windows.net", StringComparison.OrdinalIgnoreCase)
              || location.Host.EndsWith(".githubusercontent.com", StringComparison.OrdinalIgnoreCase)))
        return new("unavailable", "The source artifact is inaccessible or its download destination is unsupported.");
      // A signed asset URL is never returned or logged, and receives no user credential.
      using var download = new HttpRequestMessage(HttpMethod.Get, location);
      var pendingDownload = BeginRequest(guard, () => client.SendAsync(download, HttpCompletionOption.ResponseHeadersRead, readToken));
      if (pendingDownload is null) return new("disconnected", "The acting account changed.");
      using var response = await pendingDownload.ConfigureAwait(false);
      if (response.StatusCode != HttpStatusCode.OK) return new("unavailable", "Artifact download failed or redirected again.");
      if (response.Content.Headers.ContentLength > 2 * 1024 * 1024) return new("unavailable", "Artifact exceeds 2 MiB compressed.");
      await using var stream = await response.Content.ReadAsStreamAsync(readToken).ConfigureAwait(false);
      using var compressed = new MemoryStream();
      var buffer = new byte[16 * 1024];
      int read;
      while ((read = await stream.ReadAsync(buffer, readToken).ConfigureAwait(false)) > 0)
      {
        if (compressed.Length + read > 2 * 1024 * 1024) return new("unavailable", "Artifact exceeds 2 MiB compressed.");
        compressed.Write(buffer, 0, read);
      }
      compressed.Position = 0;
      return !guard.IsLive() ? new("disconnected", "The acting account changed.") : ParseArtifact(compressed, member);
    }
    catch (Exception error) when (error is HttpRequestException or InvalidDataException or JsonException or IOException)
    { return new("unavailable", "Artifact is malformed, inaccessible or outside the supported JSON/ZIP bounds."); }
    catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
    { return new("unavailable", "Artifact read timed out."); }
  }

  internal static ArtifactJson ParseArtifact(Stream compressed, string member)
  {
    try
    {
      using var archive = new ZipArchive(compressed, ZipArchiveMode.Read, leaveOpen: true);
      if (archive.Entries.Count > 100) return new("unavailable", "Artifact exceeds 100 archive members.");
      long expanded = 0;
      var names = new HashSet<string>(StringComparer.Ordinal);
      foreach (var entry in archive.Entries)
      {
        expanded += entry.Length;
        var path = entry.FullName.TrimEnd('/');
        if (expanded > 4 * 1024 * 1024 || entry.Length > 4 * 1024 * 1024 || path.StartsWith('/') || path.Contains('\\')
            || path.Split('/').Any(part => part is "." or "..") || !names.Add(entry.FullName)
            || ((entry.ExternalAttributes >> 16) & 0xF000) == 0xA000)
          return new("unavailable", "Artifact member paths, uniqueness or 4 MiB expanded bound are invalid.");
        if (!entry.FullName.EndsWith('/') && !(path.EndsWith(".json", StringComparison.Ordinal)
            || path.EndsWith(".md", StringComparison.Ordinal) || path.EndsWith(".txt", StringComparison.Ordinal)))
          return new("unavailable", "Artifact contains an unsupported member type.");
      }
      var selected = archive.GetEntry(member);
      if (selected is null || selected.Length > 1024 * 1024) return new("unavailable", "Required JSON member missing or beyond 1 MiB.");
      using var content = selected.Open();
      using var bytes = new MemoryStream();
      var buffer = new byte[16 * 1024];
      int read;
      while ((read = content.Read(buffer, 0, buffer.Length)) > 0)
      {
        if (bytes.Length + read > 1024 * 1024) return new("unavailable", "Expanded JSON member exceeds 1 MiB.");
        bytes.Write(buffer, 0, read);
      }
      var payload = bytes.ToArray();
      ReadOnlyMemory<byte> jsonBytes = payload;
      if (payload.Length >= 3 && payload[0] == 0xEF && payload[1] == 0xBB && payload[2] == 0xBF)
        jsonBytes = payload.AsMemory(3);
      using var json = JsonDocument.Parse(jsonBytes);
      return new("available", Content: json.RootElement.Clone());
    }
    catch (Exception error) when (error is InvalidDataException or JsonException or IOException or ArgumentException)
    { return new("unavailable", "Artifact is malformed or the required JSON member cannot be read."); }
  }
}
