using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;

namespace JuanGCarmona.SoFa.Modules.Workspace.Runtime;

internal sealed record RegistrationSource(string Alias, string Directory)
{
  public override string ToString() => "Registration source (private directory withheld)";
}
internal sealed record CheckoutSource(string Repository, string Directory)
{
  public override string ToString() => "Checkout source (private directory withheld)";
}

internal sealed class RuntimeOptions
{
  internal IReadOnlyList<RegistrationSource> Registrations { get; init; } = [];
  internal IReadOnlyList<CheckoutSource> Checkouts { get; init; } = [];
  internal IReadOnlyList<uint> TrustedGroupIds { get; init; } = [];
  public override string ToString() => "Runtime sources (private directories withheld)";

  internal static RuntimeOptions Load(IConfigurationSection section, IReadOnlyList<string> repositories)
  {
    var registrations = section.GetSection("Registrations").GetChildren().Select(s => new RegistrationSource(s["Alias"] ?? "", s["Directory"] ?? "")).ToArray();
    var checkouts = section.GetSection("Checkouts").GetChildren().Select(s => new CheckoutSource(s["Repository"] ?? "", s["Directory"] ?? "")).ToArray();
    var groups = section.GetSection("TrustedGroupIds").GetChildren().Select(s => uint.TryParse(s.Value, NumberStyles.None, CultureInfo.InvariantCulture, out var id)
        ? id : throw new InvalidOperationException("Runtime trust groups must be numeric Unix group IDs.")).ToArray();
    if (registrations.Length > 10 || checkouts.Length > 10 || groups.Length > 10 || groups.Distinct().Count() != groups.Length
        || registrations.Select(s => s.Alias).Distinct(StringComparer.OrdinalIgnoreCase).Count() != registrations.Length
        || checkouts.Select(s => s.Repository).Distinct(StringComparer.OrdinalIgnoreCase).Count() != checkouts.Length
        || registrations.Any(s => !Regex.IsMatch(s.Alias, "^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}\\z", RegexOptions.CultureInvariant, TimeSpan.FromMilliseconds(100)) || !PrivatePath(s.Directory))
        || checkouts.Any(s => !repositories.Contains(s.Repository, StringComparer.OrdinalIgnoreCase) || !PrivatePath(s.Directory)))
      throw new InvalidOperationException("Configure at most ten distinct valid runtime sources and explicitly trusted Unix groups.");
    return new() { Registrations = registrations, Checkouts = checkouts, TrustedGroupIds = groups };
  }

  private static bool PrivatePath(string value)
  {
    try
    {
      return value.Length > 0 && !value.Any(char.IsControl) && new UTF8Encoding(false, true).GetByteCount(value) <= 4096
          && Path.IsPathFullyQualified(value) && string.Equals(Path.TrimEndingDirectorySeparator(Path.GetFullPath(value)), value, StringComparison.Ordinal);
    }
    catch (Exception exception) when (exception is ArgumentException or EncoderFallbackException or NotSupportedException) { return false; }
  }
}
