using System.Text;
using System.Text.Json;
using System.Runtime.Versioning;
using JuanGCarmona.SoFa.Modules.Workspace.Source;
using Microsoft.Data.Sqlite;
using System.Diagnostics;

namespace SoFa.Web.Tests;

[SupportedOSPlatform("linux")]
public sealed class ControlJournalTests
{
  private static readonly JournalIdentity Identity = new("https://issuer.invalid/owner", 71, 22, 70);
  private static readonly string Key = new('a', 64), Digest = new('b', 64);
  private static JsonElement Payload(string text) => JsonSerializer.SerializeToElement(new { text });

  [Fact]
  public async Task IndependentConnectionsClaimOneIntentOnceAndNeverResendAfterRestart()
  {
    using var fixture = new Fixture();
    using var first = fixture.Open();
    using var second = fixture.Open();
    var prepared = first.Prepare(Identity, Key, Digest, "comment", "0.22.0", Payload("Private source comment"));
    Assert.Equal("prepared", prepared.State);
    var claims = await Task.WhenAll(Enumerable.Range(0, 8).Select(index => Task.Run(() =>
        (index % 2 == 0 ? first : second).Claim(Identity, prepared.Id!, Key, Digest))));
    Assert.Single(claims, result => result.State == "claimed");
    // An auxiliary WAL file can disappear as another connection closes; that bounded fail-closed result must never grant a second send.
    Assert.All(claims.Where(result => result.State != "claimed"), result => Assert.True(result.State is "existing" or "unavailable"));
    Assert.Equal("existing", first.Claim(Identity, prepared.Id!, Key, Digest).State);
    using var restarted = fixture.Open();
    Assert.Equal("existing", restarted.Claim(Identity, prepared.Id!, Key, Digest).State);
    Assert.Equal("Private source comment", restarted.Read(Identity, prepared.Id!).Prepared!.Value.GetProperty("text").GetString());
    Assert.Equal("conflict", restarted.Claim(Identity, prepared.Id!, Key, new string('c', 64)).State);
  }

  [Fact]
  public void AnUncertainExistingEffectBlocksFreshPreparationAndOtherActorsCannotReadItsPayload()
  {
    using var fixture = new Fixture();
    using var journal = fixture.Open();
    var prepared = journal.Prepare(Identity, Key, Digest, "refine", "0.22.0", Payload("private question"));
    Assert.Equal("claimed", journal.Claim(Identity, prepared.Id!, Key, Digest).State);
    var other = journal.Prepare(Identity, new string('c', 64), new string('d', 64), "comment", "0.22.0", Payload("different effect"));
    Assert.Equal("existing", other.State);
    Assert.Equal(prepared.Id, other.Id);
    Assert.Equal("denied", journal.Read(Identity with { ActorId = 99 }, prepared.Id!).State);
    Assert.Equal("denied", journal.Read(Identity with { Owner = "other-owner" }, prepared.Id!).State);
    Assert.Equal("denied", journal.Read(Identity with { IssueId = 999 }, prepared.Id!).State);
  }

  [Fact]
  public void RestartMakesPreviouslyPreparedIntentsReconciliationOnlyAndRetainsTombstones()
  {
    using var fixture = new Fixture();
    string id;
    using (var before = fixture.Open()) id = before.Prepare(Identity, Key, Digest, "comment", "0.22.0", Payload("not known after restore")).Id!;
    using var restored = fixture.Open();
    Assert.Equal("existing", restored.Claim(Identity, id, Key, Digest).State);
    Assert.Equal("uncertain", restored.Read(Identity, id).State);
    Assert.Equal("recorded", restored.Record(Identity, id, Payload("source-confirmed result"), terminal: true).State);
    Assert.Equal("existing", restored.Claim(Identity, id, Key, Digest).State);
    Assert.Equal("prepared", restored.Prepare(Identity, new string('c', 64), new string('d', 64), "comment", "0.22.0", Payload("intentionally new comment")).State);
  }

  [Fact]
  public void ProtectedPayloadsAreAbsentFromDatabaseAndMissingKeysCannotReinitializeHistory()
  {
    using var fixture = new Fixture();
    string id;
    using (var journal = fixture.Open())
    {
      id = journal.Prepare(Identity, Key, Digest, "continue", "0.22.0", Payload("secret-private-question-731")).Id!;
      Assert.Equal("claimed", journal.Claim(Identity, id, Key, Digest).State);
      Assert.Equal("recorded", journal.Record(Identity, id, Payload("private-source-answer-913"), terminal: false).State);
    }
    foreach (var path in Directory.GetFiles(fixture.State))
    {
      var bytes = Encoding.UTF8.GetString(File.ReadAllBytes(path));
      Assert.DoesNotContain("secret-private-question-731", bytes, StringComparison.Ordinal);
      Assert.DoesNotContain("private-source-answer-913", bytes, StringComparison.Ordinal);
      Assert.DoesNotContain(Identity.Owner, bytes, StringComparison.Ordinal);
    }
    foreach (var path in Directory.GetFiles(fixture.Keys, "*.xml")) File.Delete(path);
    using var missing = fixture.Open();
    Assert.Equal("unavailable", missing.Read(Identity, id).State);
    Assert.Equal("unavailable", missing.Prepare(Identity, new string('c', 64), Digest, "comment", "0.22.0", Payload("new")).State);
  }

  [Fact]
  public void SymlinkOrSharedStorageAndOversizedPayloadNeverProduceAClaim()
  {
    using var fixture = new Fixture();
    using var journal = fixture.Open();
    Assert.Equal("unavailable", journal.Prepare(Identity, Key, Digest, "comment", "0.22.0", Payload(new string('x', 65536))).State);
    var link = Path.Combine(fixture.Root, "redirect");
    Directory.CreateSymbolicLink(link, fixture.State);
    using var redirected = new ControlJournal(link, fixture.Keys);
    Assert.Equal("unavailable", redirected.Prepare(Identity, Key, Digest, "comment", "0.22.0", Payload("unsafe")).State);
    File.SetUnixFileMode(fixture.State, UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute | UnixFileMode.GroupRead);
    using var shared = fixture.Open();
    Assert.Equal("unavailable", shared.Prepare(Identity, Key, Digest, "comment", "0.22.0", Payload("unsafe")).State);
  }

  [Fact]
  public void RestoringABackupTakenBeforeClaimCannotAuthorizeTheOriginalEffectAgain()
  {
    using var fixture = new Fixture();
    var backup = Path.Combine(fixture.Root, "backup.sqlite");
    string id;
    using (var journal = fixture.Open())
    {
      id = journal.Prepare(Identity, Key, Digest, "comment", "0.22.0", Payload("original before backup")).Id!;
      File.Copy(Path.Combine(fixture.State, "intents.sqlite"), backup);
      Assert.Equal("claimed", journal.Claim(Identity, id, Key, Digest).State);
    }
    File.Copy(backup, Path.Combine(fixture.State, "intents.sqlite"), overwrite: true);
    using var restored = fixture.Open();
    Assert.Equal("existing", restored.Claim(Identity, id, Key, Digest).State);
    Assert.Equal("uncertain", restored.Read(Identity, id).State);
  }

  [Fact]
  public void ParentReplacementKeepsExistingHandlesBoundAndKeyMutationBlocksNewClaims()
  {
    using var fixture = new Fixture();
    using var journal = fixture.Open();
    var id = journal.Prepare(Identity, Key, Digest, "comment", "0.22.0", Payload("pinned original")).Id!;
    var moved = fixture.Root + "-moved";
    Directory.Move(fixture.Root, moved);
    try
    {
      Directory.CreateSymbolicLink(fixture.Root, moved);
      Assert.Equal("prepared", journal.Read(Identity, id).State);
      using var redirected = fixture.Open();
      Assert.Equal("unavailable", redirected.Read(Identity, id).State);
      var key = Directory.GetFiles(Path.Combine(moved, "keys"), "*.xml").Single();
      File.AppendAllText(key, "\nmutated");
      Assert.Equal("unavailable", journal.Claim(Identity, id, Key, Digest).State);
    }
    finally
    {
      Directory.Delete(fixture.Root);
      Directory.Move(moved, fixture.Root);
    }
  }

  [Fact]
  public void CapacityAndLogicalPageLimitsNeverEvictEarlierTransmissionTombstones()
  {
    using var fixture = new Fixture();
    using var journal = fixture.Open();
    var id = journal.Prepare(Identity, Key, Digest, "comment", "0.22.0", Payload("original")).Id!;
    Assert.Equal("claimed", journal.Claim(Identity, id, Key, Digest).State);
    Assert.Equal("recorded", journal.Record(Identity, id, Payload("confirmed"), terminal: true).State);
    using (var database = new SqliteConnection(new SqliteConnectionStringBuilder { DataSource = Path.Combine(fixture.State, "intents.sqlite"), Pooling = false }.ToString()))
    {
      database.Open();
      using var command = database.CreateCommand();
      command.CommandText = "WITH RECURSIVE n(i) AS (VALUES(1) UNION ALL SELECT i+1 FROM n WHERE i<9999) INSERT INTO intents SELECT printf('%032x',i),printf('%064x',i),digest,'other-owner','comment',sdk,'claimed',prepared,NULL,created,1 FROM n CROSS JOIN (SELECT digest,sdk,prepared,created FROM intents LIMIT 1)";
      command.ExecuteNonQuery();
      command.CommandText = "PRAGMA page_size"; Assert.Equal(4096L, command.ExecuteScalar());
    }
    Assert.Equal("unavailable", journal.Prepare(Identity, new string('c', 64), Digest, "comment", "0.22.0", Payload("capacity")).State);
    Assert.Equal("existing", journal.Claim(Identity, id, Key, Digest).State);
  }

  [Fact]
  public void RealWritesStopAtTheLogicalDatabaseCapWhileEarlierRecordsRemainReadable()
  {
    using var fixture = new Fixture();
    using var journal = fixture.Open();
    string? first = null;
    var stopped = false;
    var payload = Payload(new string('x', 60000));
    for (var number = 1; number <= 1000; number++)
    {
      var key = number.ToString("x64", System.Globalization.CultureInfo.InvariantCulture);
      var result = journal.Prepare(Identity with { IssueId = number }, key, Digest, "comment", "0.22.0", payload);
      if (result.State == "unavailable") { stopped = true; break; }
      Assert.Equal("prepared", result.State);
      first ??= result.Id;
    }
    Assert.True(stopped, "The real SQLite database must stop growing before1000 protected60KiB preparations.");
    Assert.Equal("prepared", journal.Read(Identity with { IssueId = 1 }, first!).State);
    using var database = new SqliteConnection(new SqliteConnectionStringBuilder { DataSource = Path.Combine(fixture.State, "intents.sqlite"), Pooling = false }.ToString());
    database.Open(); using var command = database.CreateCommand();
    command.CommandText = "SELECT page_count * page_size FROM pragma_page_count(), pragma_page_size()";
    Assert.InRange((long)command.ExecuteScalar()!, 40 * 1024 * 1024, 50 * 1024 * 1024);
  }

  [Fact]
  public void ACompetingSqliteWriterFailsWithinTheConfiguredLockBudget()
  {
    using var fixture = new Fixture();
    using var journal = fixture.Open();
    using var database = new SqliteConnection(new SqliteConnectionStringBuilder { DataSource = Path.Combine(fixture.State, "intents.sqlite"), Pooling = false }.ToString());
    database.Open(); using var transaction = database.BeginTransaction(deferred: false);
    var elapsed = Stopwatch.StartNew();
    Assert.Equal("unavailable", journal.Prepare(Identity, Key, Digest, "comment", "0.22.0", Payload("busy")).State);
    Assert.InRange(elapsed.Elapsed.TotalSeconds, 1, 4);
    transaction.Rollback();
    Assert.Equal("prepared", journal.Prepare(Identity, Key, Digest, "comment", "0.22.0", Payload("available again")).State);
  }

  private sealed class Fixture : IDisposable
  {
    internal string Root { get; } = Path.Combine(Path.GetTempPath(), "sofa-journal-" + Guid.NewGuid().ToString("N"));
    internal string State => Path.Combine(Root, "state");
    internal string Keys => Path.Combine(Root, "keys");
    internal Fixture()
    {
      Directory.CreateDirectory(Root, UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);
      Directory.CreateDirectory(State, UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);
      Directory.CreateDirectory(Keys, UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);
    }
    internal ControlJournal Open() => new(State, Keys);
    public void Dispose() => Directory.Delete(Root, recursive: true);
  }
}
