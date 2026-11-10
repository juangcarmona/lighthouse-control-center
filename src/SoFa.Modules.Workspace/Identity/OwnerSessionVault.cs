using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Data.Sqlite;
using Microsoft.Win32.SafeHandles;
using JuanGCarmona.SoFa.Modules.Workspace.Source;

namespace JuanGCarmona.SoFa.Modules.Workspace.Identity;

// Credential payloads are protected independently; SQLite transactions make each
// session mutation atomic without taking locks on any other OwnerSession.
internal sealed class OwnerSessionVault : IDisposable
{
  private const string Database = "owner-sessions.sqlite";
  private readonly object sync = new();
  private readonly PrivateJournalDirectory data, keys;
  private readonly SafeFileHandle database;
  private readonly IDataProtector sessionProtector, grantProtector;
  private readonly string issuer, clientId, subject;
  private readonly string githubClientId, githubAppId;

  internal OwnerSessionVault(string dataDirectory, string keyDirectory, IdentityProfile profile, string? githubClientId, long? githubAppId)
  {
    if (dataDirectory == keyDirectory || dataDirectory.StartsWith(keyDirectory + "/", StringComparison.Ordinal)
        || keyDirectory.StartsWith(dataDirectory + "/", StringComparison.Ordinal))
      throw new IOException("Owner session and key directories must be separate.");
    data = new(dataDirectory); keys = new(keyDirectory);
    issuer = profile.Issuer.AbsoluteUri; clientId = profile.ClientId; subject = profile.OwnerSubject;
    this.githubClientId = githubClientId ?? ""; this.githubAppId = githubAppId?.ToString(System.Globalization.CultureInfo.InvariantCulture) ?? "";
    CheckDataMembers();
    database = data.File(Database, create: !File.Exists(Path.Combine(data.Path, Database))); data.Sync();
    var provider = DataProtectionProvider.Create(new DirectoryInfo(keys.Path), options => options.SetApplicationName("LighthouseControlCenter.OwnerSessions.v1"));
    sessionProtector = provider.CreateProtector("LighthouseControlCenter.OwnerSessions.Session.v1", issuer, clientId, subject);
    grantProtector = provider.CreateProtector("LighthouseControlCenter.OwnerSessions.GitHubGrant.v1", issuer, clientId, subject, this.githubClientId, this.githubAppId);
    CheckKeys();
    using var connection = Connect();
    Execute(connection, null, "PRAGMA page_size=4096; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA trusted_schema=OFF; PRAGMA max_page_count=12800; CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY, payload BLOB NOT NULL); CREATE TABLE IF NOT EXISTS owner_grant(id INTEGER PRIMARY KEY CHECK(id=1), payload BLOB NOT NULL);");
  }

  internal IReadOnlyList<StoredOwnerSession> ReadSessions() => Run((connection, transaction) =>
  {
    var records = new List<StoredOwnerSession>();
    var incompatible = new List<string>();
    using var command = connection.CreateCommand(); command.Transaction = transaction; command.CommandText = "SELECT id,payload FROM sessions ORDER BY id";
    using (var reader = command.ExecuteReader())
    {
      while (reader.Read())
      {
        if (records.Count + incompatible.Count == 1024) throw new IOException("Owner session checkpoint is outside its bound.");
        var id = reader.GetString(0);
        try { records.Add(Unprotect<StoredOwnerSession>((byte[])reader[1], sessionProtector)); }
        catch (CryptographicException) { incompatible.Add(id); }
      }
    }
    foreach (var id in incompatible) Execute(connection, transaction, "DELETE FROM sessions WHERE id=$id", ("$id", id));
    return records;
  });

  internal StoredGitHubConnection? ReadGrant() => Run((connection, transaction) =>
  {
    using var command = connection.CreateCommand(); command.Transaction = transaction; command.CommandText = "SELECT payload FROM owner_grant WHERE id=1";
    var value = command.ExecuteScalar();
    if (value is not byte[] payload) return null;
    StoredOwnerGrant grant;
    try { grant = Unprotect<StoredOwnerGrant>(payload, grantProtector); }
    catch (CryptographicException)
    { Execute(connection, transaction, "DELETE FROM owner_grant WHERE id=1"); return null; }
    return grant.Issuer == issuer && grant.ClientId == clientId && grant.Subject == subject
        && grant.GitHubClientId == githubClientId && grant.GitHubAppId == githubAppId ? grant.Connection : null;
  });

  internal void StoreSession(StoredOwnerSession record) => Run((connection, transaction) =>
  {
    var payload = Protect(record, sessionProtector);
    Execute(connection, transaction, "INSERT INTO sessions(id,payload) VALUES($id,$payload) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
        ("$id", record.Id), ("$payload", payload)); return true;
  });

  internal void StoreSessionAndGrant(StoredOwnerSession record, StoredGitHubConnection grant) => Run((connection, transaction) =>
  {
    var sessionPayload = Protect(record, sessionProtector);
    var grantPayload = Protect(new StoredOwnerGrant(issuer, clientId, subject, githubClientId, githubAppId, grant), grantProtector);
    Execute(connection, transaction, "INSERT INTO sessions(id,payload) VALUES($id,$payload) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
        ("$id", record.Id), ("$payload", sessionPayload));
    Execute(connection, transaction, "INSERT INTO owner_grant(id,payload) VALUES(1,$payload) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
        ("$payload", grantPayload));
    return true;
  });

  internal void RotateSession(string previousId, StoredOwnerSession record) => Run((connection, transaction) =>
  {
    var payload = Protect(record, sessionProtector);
    Execute(connection, transaction, "DELETE FROM sessions WHERE id=$previous", ("$previous", previousId));
    Execute(connection, transaction, "INSERT INTO sessions(id,payload) VALUES($id,$payload)", ("$id", record.Id), ("$payload", payload));
    return true;
  });

  internal void DeleteSession(string id) => Run((connection, transaction) =>
  { Execute(connection, transaction, "DELETE FROM sessions WHERE id=$id", ("$id", id)); return true; });

  internal void StoreGrant(StoredGitHubConnection connection) => Run((db, transaction) =>
  {
    var payload = Protect(new StoredOwnerGrant(issuer, clientId, subject, githubClientId, githubAppId, connection), grantProtector);
    Execute(db, transaction, "INSERT INTO owner_grant(id,payload) VALUES(1,$payload) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
        ("$payload", payload)); return true;
  });

  internal void DeleteGrant() => Run((connection, transaction) => { Execute(connection, transaction, "DELETE FROM owner_grant WHERE id=1"); return true; });

  private T Run<T>(Func<SqliteConnection, SqliteTransaction, T> operation)
  {
    lock (sync)
    {
      CheckDataMembers(); CheckKeys();
      using var connection = Connect();
      using var transaction = connection.BeginTransaction(deferred: false);
      var result = operation(connection, transaction);
      transaction.Commit();
      data.Sync(); CheckDataMembers(); CheckKeys();
      return result;
    }
  }

  private SqliteConnection Connect()
  {
    data.Verify(); keys.Verify(); data.SameFile(Database, database);
    var connection = new SqliteConnection(new SqliteConnectionStringBuilder
    { DataSource = data.Path + "/" + Database, Mode = SqliteOpenMode.ReadWrite, Cache = SqliteCacheMode.Private, Pooling = false, DefaultTimeout = 2 }.ToString());
    try
    {
      connection.Open(); data.SameFile(Database, database);
      Execute(connection, null, "PRAGMA trusted_schema=OFF; PRAGMA synchronous=FULL; PRAGMA max_page_count=12800;");
      using var page = connection.CreateCommand(); page.CommandText = "PRAGMA page_size";
      if ((long)page.ExecuteScalar()! != 4096) throw new IOException("Unsupported owner session storage.");
      return connection;
    }
    catch { connection.Dispose(); throw; }
  }

  private void CheckDataMembers()
  {
    data.Verify();
    foreach (var path in Directory.GetFileSystemEntries(data.Path))
    {
      var name = Path.GetFileName(path);
      if (name != Database && name != Database + "-wal" && name != Database + "-shm" && name != Database + "-journal")
        throw new IOException("Unexpected owner session storage member.");
      using var handle = data.File(name);
    }
  }

  private void CheckKeys()
  {
    keys.Verify();
    foreach (var path in Directory.GetFileSystemEntries(keys.Path))
    {
      var name = Path.GetFileName(path);
      if (!name.StartsWith("key-", StringComparison.Ordinal) || !name.EndsWith(".xml", StringComparison.Ordinal))
        throw new IOException("Unexpected owner session key member.");
      using var stream = new FileStream(keys.File(name), FileAccess.Read);
      if (stream.Length > 65536) throw new IOException("Owner session key exceeds its bound.");
      keys.HardenNewKey(name);
    }
    keys.Sync();
  }

  private static byte[] Protect<T>(T value, IDataProtector protector)
  {
    var clear = JsonSerializer.SerializeToUtf8Bytes(value);
    if (clear.Length > 65536) throw new IOException("Owner session record is outside its bound.");
    var encrypted = protector.Protect(clear);
    if (encrypted.Length > 65536) throw new IOException("Protected owner session record is outside its bound.");
    return encrypted;
  }
  private static T Unprotect<T>(byte[] payload, IDataProtector protector)
  {
    if (payload.Length > 65536) throw new IOException("Owner session record is outside its bound.");
    var clear = protector.Unprotect(payload);
    if (clear.Length > 65536) throw new IOException("Owner session record is outside its bound.");
    return JsonSerializer.Deserialize<T>(clear) ?? throw new IOException("Owner session record is invalid.");
  }
  private static void Execute(SqliteConnection connection, SqliteTransaction? transaction, string sql,
      params (string Name, object Value)[] parameters)
  {
    using var command = connection.CreateCommand(); command.Transaction = transaction; command.CommandText = sql;
    foreach (var (name, value) in parameters) command.Parameters.AddWithValue(name, value);
    command.ExecuteNonQuery();
  }
  public void Dispose() { database.Dispose(); data.Dispose(); keys.Dispose(); }
}

internal sealed record StoredOwnerSession(string Id, byte[] Ticket, DateTimeOffset AuthenticationTime,
    DateTimeOffset AbsoluteDeadline, DateTimeOffset IdleDeadline);
internal sealed record StoredOwnerGrant(string Issuer, string ClientId, string Subject, string GitHubClientId, string GitHubAppId, StoredGitHubConnection Connection);
internal sealed record StoredGitHubConnection(long UserId, string Login, string Access, string Refresh,
    DateTimeOffset AccessDeadline, DateTimeOffset RefreshDeadline, string DataScope);
