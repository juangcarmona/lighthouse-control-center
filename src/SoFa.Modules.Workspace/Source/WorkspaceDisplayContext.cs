using JuanGCarmona.SoFa.Modules.Workspace.Identity;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

// Only protected document rendering consumes this receipt. Source queries and commands never do.
internal sealed record WorkspaceDisplayContext(string DataScope, long ActingUserId, string Login,
    DateTimeOffset ExpiresAt, IReadOnlyList<RepositoryGrant> Repositories)
{
  internal static WorkspaceDisplayContext? Create(OwnerSession record, IReadOnlyList<string> configured, DateTimeOffset now)
  {
    lock (record.Sync)
    {
      if (!record.Active || record.GitHub.Current is not { } connection || connection.Stopped.IsCancellationRequested) return null;
      var expires = new[] { record.IdleDeadline, record.AbsoluteDeadline, record.ProviderValidatedAt.AddMinutes(5),
          connection.VerifiedAt.AddMinutes(5), connection.Tokens.AccessDeadline }.Min();
      if (now >= expires || now < connection.VerifiedAt || now < record.ProviderValidatedAt) return null;
      var rows = record.GitHub.DisplayAuthorities.Values.Where(authority => configured.Contains(authority.Repository, StringComparer.OrdinalIgnoreCase)
          && authority.Availability == SourceAvailability.Available && authority.DataScope == connection.DataScope
          && authority.Generation == record.GitHub.Generation && authority.CheckedAt <= now && authority.CheckedAt.AddMinutes(5) > now
          && (authority.IssuesRead || authority.ActionsRead)).ToArray();
      if (rows.Length == 0) return null;
      expires = rows.Select(row => row.CheckedAt.AddMinutes(5)).Append(expires).Min();
      return new(connection.DataScope, connection.UserId, connection.Login, expires,
          rows.Select(row => new RepositoryGrant(row.Repository, "available", row.IssuesRead, row.ActionsRead, false, row.CheckedAt)).ToArray());
    }
  }
}
