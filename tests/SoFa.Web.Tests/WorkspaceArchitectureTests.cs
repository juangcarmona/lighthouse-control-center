using JuanGCarmona.Lighthouse.Cqrs;
using JuanGCarmona.SoFa.Modules.Workspace;

namespace SoFa.Web.Tests;

public sealed class WorkspaceArchitectureTests
{
  private static readonly System.Reflection.Assembly Module = typeof(WorkspaceModule).Assembly;

  [Fact]
  public void CompiledModuleExportsCompositionButNoCqrsHandlers()
  {
    Assert.Equal("JuanGCarmona.SoFa.Modules.Workspace", Module.GetName().Name);
    Assert.Contains(Module.GetExportedTypes(), type => type == typeof(WorkspaceModule));

    var leakedHandlers = Module.GetExportedTypes().Where(type => type.GetInterfaces().Any(IsHandler)).ToArray();
    Assert.Empty(leakedHandlers);
  }

  [Fact]
  public void CompiledModuleReferencesNoSiblingImplementationAssembly()
  {
    var name = Module.GetName().Name!;
    const string separator = ".Modules.";
    var boundary = name.IndexOf(separator, StringComparison.Ordinal);
    Assert.True(boundary >= 0);
    var family = name[..(boundary + separator.Length)];

    var forbidden = Module.GetReferencedAssemblies().Where(reference => reference.Name is { } referenced
        && referenced.StartsWith(family, StringComparison.Ordinal)
        && !referenced.EndsWith(".Contracts", StringComparison.Ordinal));
    Assert.Empty(forbidden);
  }

  private static bool IsHandler(Type contract) => contract.IsGenericType
      && (contract.GetGenericTypeDefinition() == typeof(ICommandHandler<,>)
          || contract.GetGenericTypeDefinition() == typeof(IQueryHandler<,>));
}
