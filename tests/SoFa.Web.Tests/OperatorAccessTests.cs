using Microsoft.Extensions.Configuration;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;
using JuanGCarmona.SoFa.Modules.Workspace.Source;
using Microsoft.AspNetCore.Authentication;

namespace SoFa.Web.Tests;

public sealed class OperatorAccessTests
{
  private static readonly Uri Issuer = new("https://identity.invalid/realms/dev");

  [Fact]
  public void ExactOperatorsReadOnlyTheirMappedProjectsAndUnknownIdentitiesAreDenied()
  {
    var access = Load();

    Assert.True(access.Admits("operator-a"));
    Assert.True(access.Admits("operator-b"));
    Assert.False(access.Admits("operator-c"));
    Assert.True(access.CanRead("operator-a", "example/alpha"));
    Assert.False(access.CanRead("operator-a", "example/beta"));
    Assert.True(access.CanRead("operator-b", "example/beta"));
    Assert.False(access.CanRead("operator-b", "example/alpha"));
    Assert.False(access.CanRead("operator-c", "example/alpha"));
  }

  [Fact]
  public void ExplicitAdmissionDoesNotFallBackToLegacyOwnerOrEmailClaims()
  {
    var profile = Profile(Load());
    var now = DateTimeOffset.FromUnixTimeSeconds(1_800_000_000);

    Assert.NotNull(OwnerAdmission.Validate(OwnerAdmissionTests.Principal(subject: "operator-a"), profile, now, freshCeremony: true));
    Assert.Null(OwnerAdmission.Validate(OwnerAdmissionTests.Principal(subject: profile.OwnerSubject), profile, now, freshCeremony: true));
    Assert.Null(OwnerAdmission.Validate(OwnerAdmissionTests.Principal(subject: "operator-c"), profile, now, freshCeremony: true));
    Assert.Null(OwnerAdmission.Validate(OwnerAdmissionTests.Principal(issuer: "https://identity.invalid/other", subject: "operator-a"), profile, now, freshCeremony: true));
  }

  [Fact]
  public async Task ExplicitOperatorSessionsDoNotShareOrRevokeEachOthersGitHubConnection()
  {
    var clock = new TestClock();
    using var sessions = new OwnerSessions(Profile(Load()), clock);
    var alpha = sessions.Get(await sessions.StoreAsync(new AuthenticationTicket(OwnerAdmissionTests.Principal(subject: "operator-a"), "owner")))!;
    var beta = sessions.Get(await sessions.StoreAsync(new AuthenticationTicket(OwnerAdmissionTests.Principal(subject: "operator-b"), "owner")))!;
    var alphaConnection = Connection(clock, "alpha");
    var betaConnection = Connection(clock, "beta");

    alpha.GitHub.Current = alphaConnection;
    Assert.Null(beta.GitHub.Current);
    beta.GitHub.Current = betaConnection;
    Assert.NotSame(alphaConnection, beta.GitHub.Current);

    GitHubAuthorization.Disconnect(alpha);
    Assert.Null(alpha.GitHub.Current);
    Assert.Same(betaConnection, beta.GitHub.Current);
  }

  [Theory]
  [InlineData("unknown-project", "read")]
  [InlineData("project-a", "operate")]
  [InlineData("project-a", "admin")]
  public void UnsupportedOrUnknownGrantsFailStartup(string project, string permission)
  {
    var values = Values();
    values["Access:Operators:0:Grants:0:Project"] = project;
    values["Access:Operators:0:Grants:0:Permission"] = permission;

    Assert.Throws<InvalidOperationException>(() => Load(values));
  }

  private static OperatorAccess Load(Dictionary<string, string?>? values = null)
  {
    var configuration = new ConfigurationBuilder().AddInMemoryCollection(values ?? Values()).Build();
    return OperatorAccess.Load(configuration.GetSection("Access"), Issuer, ["example/alpha", "example/beta"]);
  }

  private static Dictionary<string, string?> Values() => new()
  {
    ["Access:Projects:0:Id"] = "project-a",
    ["Access:Projects:0:Repository"] = "example/alpha",
    ["Access:Projects:1:Id"] = "project-b",
    ["Access:Projects:1:Repository"] = "example/beta",
    ["Access:Operators:0:Issuer"] = Issuer.AbsoluteUri,
    ["Access:Operators:0:Subject"] = "operator-a",
    ["Access:Operators:0:Grants:0:Project"] = "project-a",
    ["Access:Operators:0:Grants:0:Permission"] = "read",
    ["Access:Operators:1:Issuer"] = Issuer.AbsoluteUri,
    ["Access:Operators:1:Subject"] = "operator-b",
    ["Access:Operators:1:Grants:0:Project"] = "project-b",
    ["Access:Operators:1:Grants:0:Permission"] = "read",
  };

  private static IdentityProfile Profile(OperatorAccess access) => new()
  {
    Issuer = Issuer,
    ClientId = "sofa-development",
    OwnerSubject = "owner-subject",
    Access = access,
  };

  private static GitHubConnection Connection(TestClock clock, string suffix) => new(71, "same-source-user",
      new GitHubTokens(suffix + "-access-test", suffix + "-refresh-test", clock.GetUtcNow().AddHours(1), clock.GetUtcNow().AddHours(4)),
      clock.GetUtcNow());
}
