using System.IO.Compression;
using System.Net;
using System.Text;
using JuanGCarmona.SoFa.Modules.Workspace.Source;

namespace SoFa.Web.Tests;

public sealed class ArtifactSafetyTests
{
  [Fact]
  public void RequiredJsonIsReadWithoutExtractingOrAcceptingOtherMembersAsTheResult()
  {
    using var archive = Archive(("request.json", "{\"issue\":7}"), ("envelope.json", "{\"schemaVersion\":1}"));
    var result = GitHubTransport.ParseArtifact(archive, "envelope.json");
    Assert.Equal("available", result.Availability);
    Assert.Equal(1, result.Content!.Value.GetProperty("schemaVersion").GetInt32());
  }

  [Theory]
  [InlineData("../envelope.json")]
  [InlineData("/envelope.json")]
  [InlineData("nested\\envelope.json")]
  [InlineData("nested.zip")]
  public void UnsafePathsAndArchiveMemberTypesCannotBecomeEvidence(string name)
  {
    using var archive = Archive((name, "{}"), ("envelope.json", "{}"));
    Assert.Equal("unavailable", GitHubTransport.ParseArtifact(archive, "envelope.json").Availability);
  }

  [Fact]
  public void DuplicateOversizedExpandedAndMalformedMembersRemainUnavailable()
  {
    using var duplicate = Archive(("envelope.json", "{}"), ("envelope.json", "{}"));
    Assert.Equal("unavailable", GitHubTransport.ParseArtifact(duplicate, "envelope.json").Availability);
    using var large = Archive(("envelope.json", new string(' ', 1024 * 1024 + 1)));
    Assert.Equal("unavailable", GitHubTransport.ParseArtifact(large, "envelope.json").Availability);
    using var bomb = Archive(("other.txt", new string(' ', 4 * 1024 * 1024 + 1)), ("envelope.json", "{}"));
    Assert.Equal("unavailable", GitHubTransport.ParseArtifact(bomb, "envelope.json").Availability);
    using var malformed = Archive(("envelope.json", "not-json"));
    Assert.Equal("unavailable", GitHubTransport.ParseArtifact(malformed, "envelope.json").Availability);
    using var many = Archive(Enumerable.Range(0, 101).Select(index => (index + ".json", "{}")).ToArray());
    Assert.Equal("unavailable", GitHubTransport.ParseArtifact(many, "envelope.json").Availability);
  }

  [Fact]
  public async Task SignedAssetDownloadNeverReceivesTheGitHubUserCredential()
  {
    using var transport = new GitHubTransport(new AssetHandler());
    var result = await transport.ReadArtifactAsync("example/repository", 9, "isolated-user-access", "envelope.json", new(new object(), () => true), CancellationToken.None);
    Assert.Equal("available", result.Availability);
  }

  private static MemoryStream Archive(params (string Name, string Value)[] files)
  {
    var bytes = new MemoryStream();
    using (var archive = new ZipArchive(bytes, ZipArchiveMode.Create, leaveOpen: true))
      foreach (var (name, value) in files)
      {
        using var writer = new StreamWriter(archive.CreateEntry(name, CompressionLevel.SmallestSize).Open(), Encoding.UTF8);
        writer.Write(value);
      }
    bytes.Position = 0;
    return bytes;
  }

  private sealed class AssetHandler : HttpMessageHandler
  {
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
      if (request.RequestUri!.Host == "api.github.com")
      {
        Assert.Equal("isolated-user-access", request.Headers.Authorization?.Parameter);
        var response = new HttpResponseMessage(HttpStatusCode.Found);
        response.Headers.Location = new Uri("https://fixture.blob.core.windows.net/signed-asset?capability=isolated-fixture");
        return Task.FromResult(response);
      }
      Assert.Equal("fixture.blob.core.windows.net", request.RequestUri.Host);
      Assert.Null(request.Headers.Authorization);
      using var archive = Archive(("envelope.json", "{\"schemaVersion\":1}"));
      return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new ByteArrayContent(archive.ToArray()) });
    }
  }
}
