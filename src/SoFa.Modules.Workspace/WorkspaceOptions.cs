using Microsoft.Extensions.Configuration;
using JuanGCarmona.SoFa.Modules.Workspace.Identity;

namespace JuanGCarmona.SoFa.Modules.Workspace;

internal sealed class WorkspaceOptions
{
  public required Uri Origin { get; init; }
  public required string IdentityMode { get; init; }
  public required IdentityProfile Identity { get; init; }
  public required IReadOnlyList<string> Repositories { get; init; }
  public IReadOnlyDictionary<string, string> RepositoryBranches { get; init; } = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
  public string? GitHubClientId { get; init; }
  [System.Text.Json.Serialization.JsonIgnore]
  public string? GitHubClientSecret { get; init; }

  public override string ToString() => "WorkspaceOptions (credentials withheld)";

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
            "^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$", System.Text.RegularExpressions.RegexOptions.CultureInvariant,
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

    return new WorkspaceOptions
    {
      Origin = origin,
      IdentityMode = mode,
      Identity = new IdentityProfile { Issuer = issuer, ClientId = client, ClientSecret = secret, OwnerSubject = subject, RequiredAssurance = mode == "Development" ? "1" : "2" },
      Repositories = repositories,
      RepositoryBranches = branches,
      GitHubClientId = githubClient,
      GitHubClientSecret = githubSecret,
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
}
