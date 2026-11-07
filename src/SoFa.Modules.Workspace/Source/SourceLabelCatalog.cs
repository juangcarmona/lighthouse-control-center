using System.Text.Json;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

internal sealed record SourceLabelFact(string Name, string Role, string Description);

internal static class SourceLabelCatalog
{
  private static readonly Lazy<Dictionary<string, SourceLabelFact>> Reference = new(Load);
  internal static IReadOnlyList<SourceLabelFact> Describe(IReadOnlyList<string> labels) => labels.Select(name =>
      Reference.Value.TryGetValue(name, out var fact) ? fact : new(name, "unknown", "No description in the installed reference catalog.")).ToArray();

  private static Dictionary<string, SourceLabelFact> Load()
  {
    var result = new Dictionary<string, SourceLabelFact>(StringComparer.Ordinal);
    try
    {
      using var file = File.OpenRead(Path.Combine(AppContext.BaseDirectory, "workspace-tools", "lighthouse-capabilities.json"));
      if (file.Length > 512 * 1024) return result;
      using var document = JsonDocument.Parse(file);
      var labels = document.RootElement.GetProperty("capabilities").EnumerateArray()
          .Single(capability => SourceJson.Text(capability, "id") == "labels").GetProperty("configuration").GetProperty("labels");
      foreach (var label in labels.EnumerateArray())
        if (SourceJson.Text(label, "name") is { } name)
          result[name] = new(name, SourceJson.Text(label, "role") ?? "unknown", SourceJson.Text(label, "description") ?? "Description unavailable.");
    }
    catch (Exception error) when (error is IOException or UnauthorizedAccessException or JsonException or InvalidOperationException or KeyNotFoundException)
    { result.Clear(); }
    return result;
  }
}
