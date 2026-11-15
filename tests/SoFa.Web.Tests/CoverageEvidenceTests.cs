using System.Text.Json;
using JuanGCarmona.SoFa.Modules.Workspace.Source;

namespace SoFa.Web.Tests;

public sealed class CoverageEvidenceTests
{
  private static readonly DateTimeOffset ObservedAt = DateTimeOffset.Parse("2026-11-14T18:00:00Z", System.Globalization.CultureInfo.InvariantCulture);
  private static readonly string Commit = new('a', 40);

  [Fact]
  public void AcceptsCoverageOnlyWhenRepositoryCommitRunAttemptAndScopeMatch()
  {
    using var report = JsonDocument.Parse(JsonSerializer.Serialize(new
    {
      schemaVersion = 1,
      definitionVersion = "coverage-lines-v1",
      repository = "example/repository",
      repositoryId = 1425429121,
      runId = 71,
      attempt = 2,
      sourceHeadCommit = Commit,
      testedCommit = new string('b', 40),
      workflowPath = ".github/workflows/verify.yml",
      scope = "SoFa.Web.Tests exercising SoFa.Modules.Workspace and SoFa.Web",
      tool = "coverlet.collector 6.0.4 / Cobertura",
      generatedAt = ObservedAt.AddMinutes(-1),
      linesCovered = 165,
      linesValid = 200
    }));
    var result = GetCoverageEvidenceHandler.ValidateReport(report.RootElement, "example/repository", 1425429121,
        71, 2, Commit, "https://github.com/example/repository/actions/runs/71", "actor-scope", ObservedAt);
    Assert.Equal("available", result.Availability);
    Assert.Equal(82.5, result.Percentage);
    Assert.Equal(165, result.LinesCovered);
    Assert.Equal(200, result.LinesValid);
    Assert.Equal("actor-scope", result.DataScope);
  }

  [Theory]
  [InlineData("repositoryId")]
  [InlineData("runId")]
  [InlineData("attempt")]
  [InlineData("sourceHeadCommit")]
  [InlineData("scope")]
  [InlineData("workflowPath")]
  public void RejectsReportWhenExactSourceIdentityOrScopeDiffers(string field)
  {
    var payload = new Dictionary<string, object>
    {
      ["schemaVersion"] = 1,
      ["definitionVersion"] = "coverage-lines-v1",
      ["repository"] = "example/repository",
      ["repositoryId"] = 1425429121,
      ["runId"] = 71,
      ["attempt"] = 2,
      ["sourceHeadCommit"] = Commit,
      ["testedCommit"] = new string('b', 40),
      ["workflowPath"] = ".github/workflows/verify.yml",
      ["scope"] = "SoFa.Web.Tests exercising SoFa.Modules.Workspace and SoFa.Web",
      ["tool"] = "coverlet.collector 6.0.4 / Cobertura",
      ["generatedAt"] = ObservedAt.AddMinutes(-1),
      ["linesCovered"] = 165,
      ["linesValid"] = 200
    };
    payload[field] = field switch
    {
      "repositoryId" => 99,
      "runId" => 72,
      "attempt" => 1,
      "sourceHeadCommit" => new string('c', 40),
      "scope" => "all repository files",
      _ => "other/workflow.yml"
    };
    using var report = JsonDocument.Parse(JsonSerializer.Serialize(payload));
    var result = GetCoverageEvidenceHandler.ValidateReport(report.RootElement, "example/repository", 1425429121,
        71, 2, Commit, "https://github.com/example/repository/actions/runs/71", "actor-scope", ObservedAt);
    Assert.Equal("unknown", result.Availability);
    Assert.Null(result.Percentage);
  }

  [Theory]
  [InlineData(201, 200)]
  [InlineData(-1, 200)]
  [InlineData(1, 0)]
  public void RejectsInvalidCoverageTotals(long covered, long valid)
  {
    using var report = JsonDocument.Parse(JsonSerializer.Serialize(new
    {
      schemaVersion = 1,
      definitionVersion = "coverage-lines-v1",
      repository = "example/repository",
      repositoryId = 1425429121,
      runId = 71,
      attempt = 2,
      sourceHeadCommit = Commit,
      testedCommit = new string('b', 40),
      workflowPath = ".github/workflows/verify.yml",
      scope = "SoFa.Web.Tests exercising SoFa.Modules.Workspace and SoFa.Web",
      tool = "coverlet.collector 6.0.4 / Cobertura",
      generatedAt = ObservedAt.AddMinutes(-1),
      linesCovered = covered,
      linesValid = valid
    }));
    var result = GetCoverageEvidenceHandler.ValidateReport(report.RootElement, "example/repository", 1425429121,
        71, 2, Commit, "https://github.com/example/repository/actions/runs/71", "actor-scope", ObservedAt);
    Assert.Equal("unknown", result.Availability);
    Assert.Null(result.LinesValid);
  }
}
