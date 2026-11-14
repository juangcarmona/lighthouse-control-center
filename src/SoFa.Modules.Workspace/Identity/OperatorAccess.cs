using System.Collections.Frozen;
using Microsoft.Extensions.Configuration;

namespace JuanGCarmona.SoFa.Modules.Workspace.Identity;

// Compiled once at startup. Never infer authority from email, groups or source account IDs.
internal sealed class OperatorAccess
{
  private readonly FrozenDictionary<string, FrozenSet<string>> reads;
  private OperatorAccess(Dictionary<string, FrozenSet<string>> reads) => this.reads = reads.ToFrozenDictionary(StringComparer.Ordinal);
  internal bool Admits(string subject) => reads.ContainsKey(subject);
  internal bool CanRead(string subject, string repository) => reads.TryGetValue(subject, out var allowed) && allowed.Contains(repository);

  internal static OperatorAccess Load(IConfigurationSection section, Uri issuer, IReadOnlyList<string> repositories)
  {
    InvalidOperationException Invalid() => new("Explicit access requires exact identities, distinct configured project mappings and valid read grants; unsupported provider/action grants are unavailable.");
    if (section.Value is not null || section.GetChildren().Any(c => c.Key is not ("Operators" or "Projects"))) throw Invalid();
    var projects = new Dictionary<string, string>(StringComparer.Ordinal);
    foreach (var project in section.GetSection("Projects").GetChildren())
    {
      var id = project["Id"];
      var repository = project["Repository"];
      if (project.GetChildren().Any(c => c.Key is not ("Id" or "Repository"))
          || !Identifier(id) || repository is null || !repositories.Contains(repository, StringComparer.OrdinalIgnoreCase)
          || projects.Values.Contains(repository, StringComparer.OrdinalIgnoreCase) || !projects.TryAdd(id!, repository)) throw Invalid();
    }
    if (projects.Count is < 1 or > 10) throw Invalid();
    var operators = new Dictionary<string, FrozenSet<string>>(StringComparer.Ordinal);
    foreach (var entry in section.GetSection("Operators").GetChildren())
    {
      var subject = entry["Subject"];
      if (entry.GetChildren().Any(c => c.Key is not ("Issuer" or "Subject" or "Grants"))
          || entry.GetSection("Grants").Value is not null
          || entry["Issuer"] != issuer.AbsoluteUri || string.IsNullOrWhiteSpace(subject)
          || subject.Length > 1024 || subject.Any(char.IsControl)) throw Invalid();
      var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
      foreach (var grant in entry.GetSection("Grants").GetChildren())
      {
        if (grant.GetChildren().Any(c => c.Key is not ("Project" or "Permission"))
            || grant["Permission"] != "read" || grant["Project"] is not { } target
            || !projects.TryGetValue(target, out var repository)) throw Invalid();
        allowed.Add(repository);
      }
      if (!operators.TryAdd(subject, allowed.ToFrozenSet(StringComparer.OrdinalIgnoreCase))) throw Invalid();
    }
    if (operators.Count is < 1 or > 32) throw Invalid();
    return new(operators);
  }

  private static bool Identifier(string? value) => value is { Length: > 0 and <= 100 }
      && value.All(c => char.IsAsciiLetterOrDigit(c) || c is '-' or '_');
}
