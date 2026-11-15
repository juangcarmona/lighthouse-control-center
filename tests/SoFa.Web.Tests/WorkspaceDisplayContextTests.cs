using System.Security.Claims;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;
using JuanGCarmona.SoFa.Modules.Workspace.Source;
using Microsoft.AspNetCore.Authentication;

namespace SoFa.Web.Tests;

public sealed class WorkspaceDisplayContextTests
{
  private static readonly DateTimeOffset Now = DateTimeOffset.Parse("2026-11-14T12:00:00Z", System.Globalization.CultureInfo.InvariantCulture);

  private static OwnerSession Session()
  {
    var ticket = new AuthenticationTicket(new ClaimsPrincipal(new ClaimsIdentity()), "test");
    var record = new OwnerSession("test", ticket, Now, Now.AddHours(12), Now.AddHours(2), Now);
    record.GitHub.Current = new GitHubConnection(71, "owner", new GitHubTokens("not-a-token", "not-a-token", Now.AddHours(1), Now.AddDays(1)), Now);
    record.GitHub.DisplayAuthorities["example/repository"] = new RepositoryAuthority("example/repository", SourceAvailability.Available,
        true, true, true, Now, DataScope: record.GitHub.Current.DataScope, Generation: record.GitHub.Generation);
    return record;
  }

  [Fact]
  public void DisplayReceiptIsBoundedAndCannotCarryWritePermission()
  {
    var record = Session();
    var value = WorkspaceDisplayContext.Create(record, ["example/repository"], Now)!;
    Assert.Equal(Now.AddMinutes(5), value.ExpiresAt);
    Assert.Equal(record.GitHub.Current!.DataScope, value.DataScope);
    Assert.Equal(71, value.ActingUserId);
    Assert.True(Assert.Single(value.Repositories).IssuesRead);
    Assert.False(Assert.Single(value.Repositories).IssuesWrite);
    Assert.Null(WorkspaceDisplayContext.Create(record, ["unconfigured/repository"], Now));
    Assert.Null(WorkspaceDisplayContext.Create(record, ["example/repository"], Now.AddMinutes(5)));
  }

  [Fact]
  public void ChangedConnectionGenerationDenialAndEndedOwnerCannotRestoreDisplay()
  {
    var record = Session();
    record.GitHub.Generation++;
    Assert.Null(WorkspaceDisplayContext.Create(record, ["example/repository"], Now));
    record = Session();
    record.GitHub.Current = new GitHubConnection(72, "replacement", record.GitHub.Current!.Tokens, Now);
    Assert.Null(WorkspaceDisplayContext.Create(record, ["example/repository"], Now));
    record = Session(); record.GitHub.DisplayAuthorities.Clear();
    Assert.Null(WorkspaceDisplayContext.Create(record, ["example/repository"], Now));
    record = Session(); record.Active = false;
    Assert.Null(WorkspaceDisplayContext.Create(record, ["example/repository"], Now));
    record = Session(); record.IdleDeadline = Now;
    Assert.Null(WorkspaceDisplayContext.Create(record, ["example/repository"], Now));
    record = Session(); record.ProviderValidatedAt = Now.AddMinutes(-5);
    Assert.Null(WorkspaceDisplayContext.Create(record, ["example/repository"], Now));
  }
}
