using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record SourceRequestGuard(object Sync, Func<bool> IsLive, CancellationToken Stopped = default);

internal sealed partial class GitHubTransport : IDisposable
{
  private readonly HttpClient client;
  internal GitHubTransport() : this(new HttpClientHandler { AllowAutoRedirect = false, UseCookies = false }) { }
  internal GitHubTransport(HttpMessageHandler handler) => client = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(10) };

  internal Task<GitHubResponse> ExchangeAsync(Dictionary<string, string> fields, SourceRequestGuard guard, CancellationToken cancellationToken) =>
      SendAsync(new HttpRequestMessage(HttpMethod.Post, "https://github.com/login/oauth/access_token")
      { Content = new FormUrlEncodedContent(fields) }, guard, cancellationToken);

  internal Task<GitHubResponse> GetAsync(string path, string token, SourceRequestGuard guard, CancellationToken cancellationToken)
  {
    if (!path.StartsWith('/') || path.StartsWith("//", StringComparison.Ordinal) || path.Contains('\\') || path.Contains('#'))
      throw new ArgumentException("Expected a fixed GitHub API path.", nameof(path));
    var request = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com" + path);
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    request.Headers.Add("X-GitHub-Api-Version", "2026-03-10");
    return SendAsync(request, guard, cancellationToken);
  }

  internal Task<GitHubResponse> PostControlAsync(string repository, string path, JsonElement body, string? apiVersion,
      string token, SourceRequestGuard guard, CancellationToken cancellationToken)
  {
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.github.com/repos/" + repository + "/" + path)
    { Content = new ByteArrayContent(JsonSerializer.SerializeToUtf8Bytes(body)) };
    request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    request.Headers.Add("X-GitHub-Api-Version", apiVersion ?? "2026-03-10");
    return SendAsync(request, guard, cancellationToken);
  }

  private async Task<GitHubResponse> SendAsync(HttpRequestMessage request, SourceRequestGuard guard, CancellationToken cancellationToken)
  {
    using (request)
    {
      request.Headers.UserAgent.ParseAdd("SoFa-Development/1.0");
      request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
      try
      {
        using var linked = guard.Stopped.CanBeCanceled ? CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, guard.Stopped) : null;
        var token = linked?.Token ?? cancellationToken;
        var pending = BeginRequest(guard, () => client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, token));
        if (pending is null) return new GitHubResponse(0, null);
        using var response = await pending.ConfigureAwait(false);
        await response.Content.LoadIntoBufferAsync(2 * 1024 * 1024, token).ConfigureAwait(false);
        var payload = JsonDocument.Parse(await response.Content.ReadAsStringAsync(token).ConfigureAwait(false));
        return new GitHubResponse(response.StatusCode, payload);
      }
      catch (HttpRequestException) { return new GitHubResponse(0, null); }
      catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested) { return new GitHubResponse(0, null); }
      catch (JsonException) { return new GitHubResponse(0, null); }
    }
  }

  internal static Task<HttpResponseMessage>? BeginRequest(SourceRequestGuard guard, Func<Task<HttpResponseMessage>> begin)
  {
    lock (guard.Sync)
      return !guard.Stopped.IsCancellationRequested && guard.IsLive() ? begin() : null;
  }

  public void Dispose() => client.Dispose();
}

internal sealed class GitHubResponse(HttpStatusCode status, JsonDocument? payload) : IDisposable
{
  internal HttpStatusCode Status { get; } = status;
  internal JsonElement Value => payload?.RootElement ?? default;
  internal bool Successful => Status == HttpStatusCode.OK;
  public void Dispose() => payload?.Dispose();
}

internal static class SourceJson
{
  internal static string? Text(JsonElement value, string name) => value.ValueKind == JsonValueKind.Object
      && value.TryGetProperty(name, out var property) && property.ValueKind == JsonValueKind.String ? property.GetString() : null;
  internal static long? Number(JsonElement value, string name) => value.ValueKind == JsonValueKind.Object
      && value.TryGetProperty(name, out var property) && property.ValueKind == JsonValueKind.Number
      && property.TryGetInt64(out var number) ? number : null;
}
