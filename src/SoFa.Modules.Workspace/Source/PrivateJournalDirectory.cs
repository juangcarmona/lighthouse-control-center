using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;
using Microsoft.Win32.SafeHandles;

namespace JuanGCarmona.SoFa.Modules.Workspace.Source;

// Linux descriptors keep the selected private directory pinned across parent replacement.
internal sealed partial class PrivateJournalDirectory : IDisposable
{
  private const int DirectoryFlags = 0x80000 | 0x20000 | 0x10000;
  private const int FileFlags = 0x80000 | 0x20000 | 0x800;
  private readonly SafeFileHandle directory;
  internal string Path => "/proc/self/fd/" + directory.DangerousGetHandle().ToInt64().ToString(System.Globalization.CultureInfo.InvariantCulture);

  internal PrivateJournalDirectory(string path)
  {
    if (!OperatingSystem.IsLinux() || string.IsNullOrEmpty(path) || path != System.IO.Path.GetFullPath(path)
        || !System.IO.Path.IsPathFullyQualified(path) || Encoding.UTF8.GetByteCount(path) > 4096 || path.Any(char.IsControl))
      throw new IOException("Unsupported private journal directory.");
    var parts = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
    if (parts.Length is 0 or > 64 || parts.Any(part => part is "." or "..")) throw new IOException("Unsupported private journal directory.");
    var current = Handle(Open("/", DirectoryFlags, 0));
    try
    {
      for (var index = 0; index < parts.Length; index++)
      {
        var next = Handle(OpenAt(current, parts[index], DirectoryFlags, 0));
        try { Validate(next, leaf: index == parts.Length - 1, file: false); }
        catch { next.Dispose(); throw; }
        current.Dispose(); current = next;
      }
      directory = current;
    }
    catch { current.Dispose(); throw; }
  }

  internal void Verify() => Validate(directory, leaf: true, file: false);
  internal void Sync()
  {
    if (Flush(directory) != 0) throw new IOException("Journal directory could not be synchronized.");
  }
  internal SafeFileHandle File(string name, bool create = false)
  {
    if (string.IsNullOrEmpty(name) || name.Contains('/') || name.Contains('\\') || name is "." or "..") throw new IOException("Invalid journal member.");
    var handle = Handle(OpenAt(directory, name, FileFlags | (create ? 2 | 0x40 | 0x80 : 0), 0x180));
    try { Validate(handle, leaf: true, file: true); return handle; }
    catch { handle.Dispose(); throw; }
  }
  internal void SameFile(string name, SafeFileHandle expected)
  {
    using var current = File(name);
    var first = Status(expected); var second = Status(current);
    if (first.Inode != second.Inode || first.DeviceMajor != second.DeviceMajor || first.DeviceMinor != second.DeviceMinor)
      throw new IOException("Journal file identity changed.");
  }
  internal void HardenNewKey(string name)
  {
    using var handle = Handle(OpenAt(directory, name, FileFlags, 0));
    var status = Status(handle);
    if (status.Uid != GetUid() || status.Links != 1 || (status.Mode & 0xF000) != 0x8000) throw new IOException("Invalid journal key.");
    if (ChangeMode(handle, 0x180) != 0) throw new IOException("Journal key protection failed.");
    if (Flush(handle) != 0) throw new IOException("Journal key could not be synchronized.");
  }
  public void Dispose() => directory.Dispose();
  private static SafeFileHandle Handle(int descriptor) => descriptor < 0
      ? throw new IOException("Private journal storage cannot be opened.", new Win32Exception(Marshal.GetLastPInvokeError()))
      : new SafeFileHandle((IntPtr)descriptor, ownsHandle: true);
  private static FileStatus Status(SafeFileHandle handle) => Stat(handle, "", 0x1000, 0x7FF, out var status) == 0
      ? status : throw new IOException("Private journal storage cannot be verified.");
  private static void Validate(SafeFileHandle handle, bool leaf, bool file)
  {
    var value = Status(handle);
    if (value.Links == 0 || file && value.Links != 1 || (value.Mode & 0xF000) != (file ? 0x8000 : 0x4000)
        || (leaf ? value.Uid != GetUid() || (value.Mode & 0xFFF) != (file ? 0x180 : 0x1C0)
            : value.Uid != 0 && value.Uid != GetUid() || (value.Mode & 0x12) != 0 && !(value.Uid == 0 && (value.Mode & 0x200) != 0)))
      throw new IOException("Private journal ownership or permissions are unsafe.");
  }

  [StructLayout(LayoutKind.Explicit, Size = 256)]
  private struct FileStatus
  {
    [FieldOffset(16)] public uint Links;
    [FieldOffset(20)] public uint Uid;
    [FieldOffset(28)] public ushort Mode;
    [FieldOffset(32)] public ulong Inode;
    [FieldOffset(136)] public uint DeviceMajor;
    [FieldOffset(140)] public uint DeviceMinor;
  }
  [LibraryImport("libc", EntryPoint = "geteuid")] private static partial uint GetUid();
  [LibraryImport("libc", EntryPoint = "open", SetLastError = true, StringMarshalling = StringMarshalling.Utf8)]
  private static partial int Open(string path, int flags, uint mode);
  [LibraryImport("libc", EntryPoint = "openat", SetLastError = true, StringMarshalling = StringMarshalling.Utf8)]
  private static partial int OpenAt(SafeFileHandle parent, string name, int flags, uint mode);
  [LibraryImport("libc", EntryPoint = "statx", SetLastError = true, StringMarshalling = StringMarshalling.Utf8)]
  private static partial int Stat(SafeFileHandle handle, string path, int flags, uint mask, out FileStatus status);
  [LibraryImport("libc", EntryPoint = "fchmod", SetLastError = true)]
  private static partial int ChangeMode(SafeFileHandle handle, uint mode);
  [LibraryImport("libc", EntryPoint = "fsync", SetLastError = true)]
  private static partial int Flush(SafeFileHandle handle);
}
