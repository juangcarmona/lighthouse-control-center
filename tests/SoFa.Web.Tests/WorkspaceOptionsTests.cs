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
    Assert.Empty(options.Runtime.Registrations);
    Assert.Empty(options.Runtime.Checkouts);
    Assert.Null(options.ControlJournalDirectory);
    Assert.Null(options.ControlJournalKeyDirectory);
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
  public void OptionalDefaultBranchesAreBoundedMetadataForConfiguredRepositoriesOnly()
  {
    var values = Values();
    values["SoFa:RepositoryBranches:owner/repository"] = "main";
    var configured = WorkspaceOptions.Load(Configuration(values));
    Assert.Equal("main", configured.RepositoryBranches["owner/repository"]);
    Assert.Null(configured.GitHubClientId);
    values["SoFa:RepositoryBranches:private/other"] = "main";
    Assert.Throws<InvalidOperationException>(() => WorkspaceOptions.Load(Configuration(values)));
    values.Remove("SoFa:RepositoryBranches:private/other");
    values["SoFa:RepositoryBranches:owner/repository"] = new string('x', 256);
    Assert.Throws<InvalidOperationException>(() => WorkspaceOptions.Load(Configuration(values)));
  }

  [Fact]
  public void ConfiguredOwnerAndJournalCustodyDirectoriesArePairwiseSeparate()
  {
    var values = Values();
    values["SoFa:Controls:JournalDirectory"] = "/private/control-journal";
    values["SoFa:Controls:KeyDirectory"] = "/private/control-journal-keys";
    Assert.NotNull(WorkspaceOptions.Load(Configuration(values)));

    values["SoFa:Controls:KeyDirectory"] = "/private/owner-session-keys";
    Assert.Throws<InvalidOperationException>(() => WorkspaceOptions.Load(Configuration(values)));
    values["SoFa:Controls:KeyDirectory"] = "/private/control-journal-keys";
    values["SoFa:Controls:JournalDirectory"] = "/private/owner-sessions/nested";
    Assert.Throws<InvalidOperationException>(() => WorkspaceOptions.Load(Configuration(values)));
    values["SoFa:Controls:JournalDirectory"] = "/private/control-journal";
    values.Remove("SoFa:Controls:KeyDirectory");
    Assert.Throws<InvalidOperationException>(() => WorkspaceOptions.Load(Configuration(values)));
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

  [Fact]
  public void OptionalRuntimeSourcesHaveExplicitTrustAndNeverSerializeTheirPrivateDirectories()
  {
    var values = Values();
    values["SoFa:Runtime:Registrations:0:Alias"] = "runner-1";
    values["SoFa:Runtime:Registrations:0:Directory"] = "/private/registration";
    values["SoFa:Runtime:Checkouts:0:Repository"] = "owner/repository";
    values["SoFa:Runtime:Checkouts:0:Directory"] = "/private/checkout";
    values["SoFa:Runtime:TrustedGroupIds:0"] = "1000";
    values["SoFa:GitHub:AppId"] = "123";
    var configured = WorkspaceOptions.Load(Configuration(values));
    Assert.Equal(123, configured.GitHubAppId);
    Assert.Equal(1000u, Assert.Single(configured.Runtime.TrustedGroupIds));
    Assert.Equal("runner-1", Assert.Single(configured.Runtime.Registrations).Alias);
    Assert.DoesNotContain("/private", JsonSerializer.Serialize(configured), StringComparison.Ordinal);
    Assert.DoesNotContain("/private", configured.Runtime.ToString(), StringComparison.Ordinal);
    foreach (var invalid in new[] { "../outside", "/private/../outside", "/private/\0value", "/" + new string('é', 2048) })
    {
      values["SoFa:Runtime:Registrations:0:Directory"] = invalid;
      Assert.Throws<InvalidOperationException>(() => WorkspaceOptions.Load(Configuration(values)));
    }
  }

  [Theory]
  [InlineData("SoFa:Runtime:Registrations:0:Alias", "bad/alias")]
  [InlineData("SoFa:Runtime:Registrations:0:Alias", "bad\n")]
  [InlineData("SoFa:Repositories:0", "owner/repository\n")]
  [InlineData("SoFa:Runtime:Checkouts:0:Repository", "other/repository")]
  [InlineData("SoFa:Runtime:TrustedGroupIds:0", "-1")]
  [InlineData("SoFa:GitHub:AppId", "0")]
  [InlineData("SoFa:GitHub:AppId", "9007199254740992")]
  public void InvalidRuntimeConfigurationIsRejectedWithoutLeakingItsValue(string key, string value)
  {
    var values = Values(); values[key] = value;
    var error = Assert.Throws<InvalidOperationException>(() => WorkspaceOptions.Load(Configuration(values)));
    Assert.DoesNotContain(value, error.Message, StringComparison.Ordinal);
  }

  internal static Dictionary<string, string?> Values(string mode = "Development") => new()
  {
    ["SoFa:Identity:Mode"] = mode,
    ["SoFa:Identity:SessionDirectory"] = "/private/owner-sessions",
    ["SoFa:Identity:SessionKeyDirectory"] = "/private/owner-session-keys",
    ["SoFa:Origin"] = "https://workspace.invalid:5443",
    [$"SoFa:Identity:{mode}:Issuer"] = "https://identity.invalid/realms/dev",
    [$"SoFa:Identity:{mode}:ClientId"] = "sofa-development",
    [$"SoFa:Identity:{mode}:ClientSecret"] = "identity-client-test-value",
    [$"SoFa:Identity:{mode}:OwnerSubject"] = "owner-subject",
    ["SoFa:Repositories:0"] = "owner/repository",
  };
}
