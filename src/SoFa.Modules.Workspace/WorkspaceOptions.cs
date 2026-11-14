using Microsoft.Extensions.Configuration;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;
using JuanGCarmona.SoFa.Modules.Workspace.Runtime;

namespace JuanGCarmona.SoFa.Modules.Workspace;

internal sealed class WorkspaceOptions
{
  public required Uri Origin { get; init; }
  public required string IdentityMode { get; init; }
  public required IdentityProfile Identity { get; init; }
  public required IReadOnlyList<string> Repositories { get; init; }
  public IReadOnlyDictionary<string, string> RepositoryBranches { get; init; } = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
  public string? GitHubClientId { get; init; }
  public long? GitHubAppId { get; init; }
  [System.Text.Json.Serialization.JsonIgnore]
  public RuntimeOptions Runtime { get; init; } = new();
  [System.Text.Json.Serialization.JsonIgnore]
  public string? GitHubClientSecret { get; init; }
  [System.Text.Json.Serialization.JsonIgnore]
  public string? ControlJournalDirectory { get; init; }
  [System.Text.Json.Serialization.JsonIgnore]
  public string? ControlJournalKeyDirectory { get; init; }
  [System.Text.Json.Serialization.JsonIgnore]
  public string? OwnerSessionDirectory { get; init; }
  [System.Text.Json.Serialization.JsonIgnore]
  public string? OwnerSessionKeyDirectory { get; init; }

  public override string ToString() => "WorkspaceOptions (credentials withheld)";

  internal bool CanRead(OwnerSession session, string repository) => Repositories.Contains(repository, StringComparer.OrdinalIgnoreCase)
      && (Identity.Access is null || Identity.Access.CanRead(session.Subject, repository));
  internal IEnumerable<string> ReadableRepositories(OwnerSession session) => Repositories.Where(repository => CanRead(session, repository));

  public static WorkspaceOptions Load(IConfiguration configuration)
  {
    var section = configuration.GetSection("SoFa");
    var mode = section["Identity:Mode"];
    if (mode is not ("Development" or "External"))
      throw new InvalidOperationException("Select the Development or External identity profile.");

    var selected = section.GetSection("Identity:" + mode);
    var other = section.GetSection("Identity:" + (mode == "Development" ? "External" : "Development"));
    if (other.GetChildren().Any(c => !string.IsNullOrEmpty(c.Value)))
      throw new InvalidOperationException("Do not mix active identity profiles or their credentials.");

    var origin = HttpsUri(section["Origin"], originOnly: true);
    var issuer = HttpsUri(selected["Issuer"], originOnly: false);
    var subject = selected["OwnerSubject"];
    var client = selected["ClientId"];
    var secret = selected["ClientSecret"];
    if (string.IsNullOrWhiteSpace(subject) || subject.Length > 1024
        || string.IsNullOrWhiteSpace(client) || client.Length > 256
        || string.IsNullOrWhiteSpace(secret) || secret.Length > 4096)
      throw new InvalidOperationException("Configure the selected identity client, secret and exact owner subject.");

    var repositories = section.GetSection("Repositories").GetChildren().Select(c => c.Value ?? "").ToArray();
    if (repositories.Length is < 1 or > 10 || repositories.Distinct(StringComparer.OrdinalIgnoreCase).Count() != repositories.Length
        || repositories.Any(r => !System.Text.RegularExpressions.Regex.IsMatch(r,
            "^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}\\z", System.Text.RegularExpressions.RegexOptions.CultureInvariant,
            TimeSpan.FromMilliseconds(100))))
      throw new InvalidOperationException("Configure one to ten distinct, valid repository names.");

    var branches = section.GetSection("RepositoryBranches").GetChildren().ToDictionary(c => c.Key, c => c.Value ?? "", StringComparer.OrdinalIgnoreCase);
    if (branches.Any(pair => !repositories.Contains(pair.Key, StringComparer.OrdinalIgnoreCase)
        || pair.Value.Length is < 1 or > 255 || pair.Value.Any(char.IsControl)))
      throw new InvalidOperationException("Default branches must name configured repositories with bounded nonempty values.");

    var githubClient = section["GitHub:ClientId"];
    var githubSecret = section["GitHub:ClientSecret"];
    if (string.IsNullOrWhiteSpace(githubClient) != string.IsNullOrWhiteSpace(githubSecret))
      throw new InvalidOperationException("Complete both GitHub user App settings or leave the connection unconfigured.");
    var sessionDirectory = section["Identity:SessionDirectory"];
    var sessionKeyDirectory = section["Identity:SessionKeyDirectory"];
    if (!PrivateDirectory(sessionDirectory) || !PrivateDirectory(sessionKeyDirectory)
        || sessionDirectory == sessionKeyDirectory || sessionDirectory!.StartsWith(sessionKeyDirectory + "/", StringComparison.Ordinal)
        || sessionKeyDirectory!.StartsWith(sessionDirectory + "/", StringComparison.Ordinal))
      throw new InvalidOperationException("Configure separate absolute private owner session and key directories.");
    var journalDirectory = section["Controls:JournalDirectory"];
    var journalKeyDirectory = section["Controls:KeyDirectory"];
    if (string.IsNullOrWhiteSpace(journalDirectory) != string.IsNullOrWhiteSpace(journalKeyDirectory))
      throw new InvalidOperationException("Configure both control journal directories or leave the journal unconfigured.");
    if (!string.IsNullOrWhiteSpace(journalDirectory))
    {
      if (!PrivateDirectory(journalDirectory) || !PrivateDirectory(journalKeyDirectory)
          || new[] { sessionDirectory!, sessionKeyDirectory!, journalDirectory!, journalKeyDirectory! }
              .Select(Path.GetFullPath).Any(path => new[] { sessionDirectory!, sessionKeyDirectory!, journalDirectory!, journalKeyDirectory! }
                  .Select(Path.GetFullPath).Count(other => PathsOverlap(path, other)) != 1))
        throw new InvalidOperationException("Configure four separate absolute private owner-session and control-journal directories.");
    }

    return new WorkspaceOptions
    {
      ControlJournalDirectory = section["Controls:JournalDirectory"],
      ControlJournalKeyDirectory = section["Controls:KeyDirectory"],
      OwnerSessionDirectory = section["Identity:SessionDirectory"],
      OwnerSessionKeyDirectory = section["Identity:SessionKeyDirectory"],
      Origin = origin,
      IdentityMode = mode,
      Identity = new IdentityProfile
      {
        Issuer = issuer,
        ClientId = client,
        ClientSecret = secret,
        OwnerSubject = subject,
        RequiredAssurance = mode == "Development" ? "1" : "2",
        Access = section.GetChildren().Any(child => child.Key.Equals("Access", StringComparison.OrdinalIgnoreCase))
          ? OperatorAccess.Load(section.GetSection("Access"), issuer, repositories) : null
      },
      Repositories = repositories,
      RepositoryBranches = branches,
      GitHubClientId = githubClient,
      GitHubClientSecret = githubSecret,
      GitHubAppId = section["GitHub:AppId"] is { } appId
          ? long.TryParse(appId, System.Globalization.NumberStyles.None, System.Globalization.CultureInfo.InvariantCulture, out var parsed) && parsed is > 0 and <= 9_007_199_254_740_991
              ? parsed : throw new InvalidOperationException("Configure a valid numeric GitHub App ID.") : null,
      Runtime = RuntimeOptions.Load(section.GetSection("Runtime"), repositories),
    };
  }

  private static Uri HttpsUri(string? value, bool originOnly)
  {
    if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || uri.Scheme != "https"
        || !string.IsNullOrEmpty(uri.UserInfo) || !string.IsNullOrEmpty(uri.Query)
        || !string.IsNullOrEmpty(uri.Fragment) || originOnly && uri.AbsolutePath != "/")
      throw new InvalidOperationException("Configure exact HTTPS application and issuer addresses without credentials, queries or fragments.");
    return uri;
  }

  private static bool PrivateDirectory(string? value) => !string.IsNullOrWhiteSpace(value)
      && Path.IsPathFullyQualified(value) && value == Path.GetFullPath(value)
      && !value.Any(char.IsControl) && System.Text.Encoding.UTF8.GetByteCount(value) <= 4096;

  private static bool PathsOverlap(string first, string second)
  {
    var comparison = OperatingSystem.IsWindows() ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal;
    var separator = Path.DirectorySeparatorChar;
    return string.Equals(first, second, comparison) || first.StartsWith(second.TrimEnd(separator) + separator, comparison)
        || second.StartsWith(first.TrimEnd(separator) + separator, comparison);
  }
}
