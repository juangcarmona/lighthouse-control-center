using System.Text.Json;
using Microsoft.Extensions.Configuration;
using JuanGCarmona.SoFa.Modules.Workspace;

namespace SoFa.Web.Tests;

public sealed class WorkspaceOptionsTests
{
  [Theory]
  [InlineData("Development")]
  [InlineData("External")]
  public void ExactSelectedProfilesWorkWithoutProvisioningAnotherProvider(string mode)
  {
    var options = WorkspaceOptions.Load(Configuration(Values(mode)));
    Assert.Equal(mode, options.IdentityMode);
    Assert.Equal("owner-subject", options.Identity.OwnerSubject);
    Assert.Equal("owner/repository", Assert.Single(options.Repositories));
    Assert.Null(options.GitHubClientId);
  }

  [Theory]
  [InlineData("Development", true)]
  [InlineData("External", false)]
  public void DevelopmentUsesVerifiedPasswordWhileExternalStillRequiresMfa(string mode, bool passwordAccepted)
  {
    var options = WorkspaceOptions.Load(Configuration(Values(mode)));
    var now = new TestClock().GetUtcNow();
    Assert.Equal(passwordAccepted, IdentityAdmission(OwnerAdmissionTests.Principal(assurance: "1")));
    Assert.False(IdentityAdmission(OwnerAdmissionTests.Principal(assurance: "0")));
    Assert.False(IdentityAdmission(OwnerAdmissionTests.Principal(subject: "another-owner", assurance: "1")));
    Assert.False(IdentityAdmission(OwnerAdmissionTests.Principal(assurance: "1", authenticationTime: now.AddMinutes(-6).ToUnixTimeSeconds().ToString(System.Globalization.CultureInfo.InvariantCulture))));
    bool IdentityAdmission(System.Security.Claims.ClaimsPrincipal principal) =>
        JuanGCarmona.SoFa.Modules.Workspace.Identity.OwnerAdmission.Validate(principal, options.Identity, now, true) is not null;
  }

  [Fact]
  public void MissingMixedAndUnsafeConfigurationHasNoFallback()
  {
    foreach (var key in new[] { "SoFa:Identity:Mode", "SoFa:Origin", "SoFa:Identity:Development:OwnerSubject", "SoFa:Identity:Development:Issuer", "SoFa:Identity:Development:ClientId", "SoFa:Identity:Development:ClientSecret", "SoFa:Repositories:0" })
    {
      var values = Values(); values.Remove(key);
      Assert.Throws<InvalidOperationException>(() => WorkspaceOptions.Load(Configuration(values)));
    }
    foreach (var address in new[] { "http://workspace.invalid", "https://user:password@workspace.invalid", "https://workspace.invalid/path", "https://workspace.invalid/?query=value" })
    {
      var values = Values(); values["SoFa:Origin"] = address;
      Assert.Throws<InvalidOperationException>(() => WorkspaceOptions.Load(Configuration(values)));
    }
    var mixed = Values(); mixed["SoFa:Identity:External:ClientSecret"] = "other-environment-test-value";
    Assert.Throws<InvalidOperationException>(() => WorkspaceOptions.Load(Configuration(mixed)));
    var partial = Values(); partial["SoFa:GitHub:ClientId"] = "user-app";
    Assert.Throws<InvalidOperationException>(() => WorkspaceOptions.Load(Configuration(partial)));
  }

  [Fact]
  public void ConfigurationErrorsAndDefaultSerializationContainNoCredential()
  {
    var values = Values();
    values["SoFa:GitHub:ClientId"] = "user-app";
    values["SoFa:GitHub:ClientSecret"] = "source-client-test-value";
    var options = WorkspaceOptions.Load(Configuration(values));
    Assert.DoesNotContain("identity-client-test-value", JsonSerializer.Serialize(options));
    Assert.DoesNotContain("source-client-test-value", JsonSerializer.Serialize(options));
    Assert.DoesNotContain("identity-client-test-value", options.Identity.ToString());
    Assert.DoesNotContain("source-client-test-value", options.ToString());
    values["SoFa:Origin"] = "http://source-client-test-value.invalid";
    var error = Assert.Throws<InvalidOperationException>(() => WorkspaceOptions.Load(Configuration(values)));
    Assert.DoesNotContain("source-client-test-value", error.Message);
  }

  private static IConfiguration Configuration(Dictionary<string, string?> values) => new ConfigurationBuilder().AddInMemoryCollection(values).Build();

  internal static Dictionary<string, string?> Values(string mode = "Development") => new()
  {
    ["SoFa:Identity:Mode"] = mode,
    ["SoFa:Origin"] = "https://workspace.invalid:5443",
    [$"SoFa:Identity:{mode}:Issuer"] = "https://identity.invalid/realms/dev",
    [$"SoFa:Identity:{mode}:ClientId"] = "sofa-development",
    [$"SoFa:Identity:{mode}:ClientSecret"] = "identity-client-test-value",
    [$"SoFa:Identity:{mode}:OwnerSubject"] = "owner-subject",
    ["SoFa:Repositories:0"] = "owner/repository",
  };
}
