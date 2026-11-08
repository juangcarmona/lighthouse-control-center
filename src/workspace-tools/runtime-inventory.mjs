import { constants } from 'node:fs';
import { open, mkdir, readdir, symlink } from 'node:fs/promises';
import { resolve, isAbsolute, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';

const MiB = 1024 * 1024;
const safeText = (s, max) => typeof s === 'string' && s.length > 0 && s.length <= max && s.isWellFormed() && !/[\x00-\x1f\x7f]/u.test(s);
const repository = s => safeText(s, 201) && /^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}\/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$/.test(s);
const privatePath = s => safeText(s, 4096) && Buffer.byteLength(s) <= 4096 && isAbsolute(s) && resolve(s) === s;
const sha = s => typeof s === 'string' && s.length === 40 && /^[a-f0-9]{40}$/.test(s);
const decoder = new TextDecoder('utf-8', { fatal: true });

export function validateRuntimeInput(input) {
  if (process.platform !== 'linux' || !input || Object.keys(input).some(k => !['registrations', 'checkouts', 'trustedGroupIds', 'scratch'].includes(k))
      || !privatePath(input.scratch) || !Array.isArray(input.trustedGroupIds) || input.trustedGroupIds.length > 10
      || new Set(input.trustedGroupIds).size !== input.trustedGroupIds.length
      || input.trustedGroupIds.some(g => !Number.isSafeInteger(g) || g < 0 || g > 0xffff_ffff)) throw Error('Unsupported local configuration');
  for (const kind of ['registrations', 'checkouts']) {
    if (!Array.isArray(input[kind]) || input[kind].length > 10) throw Error('Invalid source count');
    for (const source of input[kind]) {
      if (!source || Object.keys(source).some(k => !['alias', 'repository', 'directory'].includes(k)) || !privatePath(source.directory)
          || (kind === 'registrations' ? !safeText(source.alias, 64) || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/.test(source.alias) : !repository(source.repository)))
        throw Error('Invalid local source');
    }
    const key = kind === 'registrations' ? 'alias' : 'repository';
    if (new Set(input[kind].map(s => s[key].toLowerCase())).size !== input[kind].length) throw Error('Duplicate source');
  }
}

class PinnedSource {
  constructor(groups, hook) { this.groups = groups; this.hook = hook; this.handles = []; }
  path(handle, child = '') { return `/proc/self/fd/${handle.fd}${child ? '/' + child : ''}`; }
  async hold(path, directory = false) {
    const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK | (directory ? constants.O_DIRECTORY : 0));
    this.handles.push(handle);
    const stat = await handle.stat();
    if (stat.uid !== 0 && stat.uid !== process.getuid()) throw Error('Untrusted source owner');
    const stickyRoot = directory && stat.uid === 0 && (stat.mode & 0o1000) !== 0;
    if (!stickyRoot && ((stat.mode & 0o002) || (stat.mode & 0o020) && !this.groups.includes(stat.gid))) throw Error('Untrusted source writers');
    if (directory ? !stat.isDirectory() : !stat.isDirectory() && !stat.isFile()) throw Error('Unsupported source file');
    await this.hook?.(path, handle);
    return handle;
  }
  async directory(path, base = null) {
    if (!safeText(path, 4096) || Buffer.byteLength(path) > 4096) throw Error('Invalid directory');
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 64) throw Error('Directory traversal bound');
    let current = isAbsolute(path) ? await this.hold('/', true) : base;
    if (!current) throw Error('Relative directory without base');
    for (const part of parts) {
      if (part === '.') continue;
      current = await this.hold(this.path(current, part), true);
    }
    return current;
  }
  async bytes(handle, maximum) {
    const before = await handle.stat();
    if (!before.isFile() || before.size > maximum) throw Error('Source byte bound');
    const bytes = Buffer.alloc(maximum + 1);
    let length = 0;
    while (length <= maximum) {
      const read = await handle.read(bytes, length, maximum + 1 - length, length);
      if (!read.bytesRead) break;
      length += read.bytesRead;
    }
    const after = await handle.stat();
    if (length > maximum || before.size !== after.size || before.mtimeMs !== after.mtimeMs || length !== after.size) throw Error('Source changed or exceeded bound');
    return bytes.subarray(0, length);
  }
  async text(directory, name, maximum) {
    return decoder.decode(await this.bytes(await this.hold(this.path(directory, name)), maximum));
  }
  async close() { await Promise.allSettled(this.handles.map(handle => handle.close())); }
}

function githubRepository(remote) {
  if (!safeText(remote, 256)) return null;
  const match = /^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([A-Za-z0-9][A-Za-z0-9_.-]{0,99}\/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}?)(?:\.git)?\/?$/i.exec(remote);
  return match?.[1] ?? null;
}

function literalOrigin(config) {
  let origin = false, section = false;
  const values = [];
  for (const original of config.split(/\r?\n/)) {
    const line = original.trim();
    if (!line || /^[#;]/.test(line)) continue;
    if (line.startsWith('[')) {
      if (!/^\[[A-Za-z][A-Za-z0-9.-]*(?: "[^"\\\x00-\x1f]+")?\]$/.test(line)) throw Error('Unsupported config syntax');
      origin = /^\[remote "origin"\]$/i.test(line); section = true; continue;
    }
    if (!section) throw Error('Unsupported config syntax');
    if (origin && /^url\s*=/i.test(line)) {
      const value = line.replace(/^url\s*=\s*/i, '');
      if (/[\s"\\#;]/.test(value)) throw Error('Unsupported literal origin');
      values.push(value);
    }
  }
  if (values.length !== 1) throw Error('Missing or ambiguous origin');
  return githubRepository(values[0]);
}

async function gitMetadata(files, checkout) {
  const root = await files.directory(checkout);
  const entry = await files.hold(files.path(root, '.git'));
  let selected;
  if ((await entry.stat()).isDirectory()) selected = entry;
  else {
    const target = decoder.decode(await files.bytes(entry, 8192)).trim().match(/^gitdir: ([^\r\n]+)$/)?.[1];
    if (!target) throw Error('Unsupported worktree metadata');
    selected = await files.directory(target, root);
  }
  let common = selected;
  let commonTarget;
  try { commonTarget = (await files.text(selected, 'commondir', 8192)).trim(); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (commonTarget !== undefined) common = await files.directory(commonTarget, selected);
  let head = (await files.text(selected, 'HEAD', 8192)).trim();
  const seen = new Set();
  for (let hop = 0; !sha(head); hop++) {
    if (hop >= 5 || !head.startsWith('ref: ')) throw Error('Unsupported reference');
    const ref = head.slice(5);
    if (!/^refs\/[A-Za-z0-9_.\/-]+$/.test(ref) || ref.split('/').some(p => !p || p === '.' || p === '..') || seen.has(ref)) throw Error('Invalid reference');
    seen.add(ref);
    try {
      const parts = ref.split('/'); const name = parts.pop();
      head = (await files.text(await files.directory(parts.join('/'), common), name, 1024)).trim();
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const rows = (await files.text(common, 'packed-refs', 2 * MiB)).split(/\r?\n/).filter(l => !/^[#^]/.test(l));
      const matches = rows.filter(l => l.endsWith(' ' + ref));
      if (matches.length !== 1 || !/^[a-f0-9]{40} refs\//.test(matches[0])) throw Error('Reference not observed');
      head = matches[0].slice(0, 40);
    }
  }
  return { common, head, origin: literalOrigin(await files.text(common, 'config', 65536)) };
}

class CommittedObjects {
  constructor(files, common, scratch, end) { Object.assign(this, { files, common, scratch, end }); this.descriptors = []; this.loose = new Set(); this.cache = new Map(); }
  async command(args) {
    const timeout = Math.min(2000, this.end - performance.now());
    if (timeout <= 0) throw Error('Local observation deadline');
    return new Promise((resolveCommand, reject) => {
      const child = spawn('/usr/bin/git', ['-c', 'protocol.allow=never', '-c', 'core.hooksPath=/dev/null', '-c', 'core.fsmonitor=false', ...args], {
        cwd: this.scratch, env: { PATH: process.env.PATH, HOME: this.scratch, XDG_CONFIG_HOME: this.scratch,
          GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_NO_REPLACE_OBJECTS: '1', GIT_NO_LAZY_FETCH: '1',
          GIT_TERMINAL_PROMPT: '0', GIT_OBJECT_DIRECTORY: join(this.scratch, 'objects') },
        stdio: ['ignore', 'pipe', 'pipe', ...this.descriptors.map(h => h.fd)],
      });
      const chunks = []; let output = 0, error = 0, failed = false;
      const stop = () => { failed = true; child.kill('SIGKILL'); };
      const timer = setTimeout(stop, timeout);
      child.stdout.on('data', bytes => { output += bytes.length; if (output > 2 * MiB) stop(); else chunks.push(bytes); });
      child.stderr.on('data', bytes => { error += bytes.length; if (error > 8192) stop(); });
      child.once('error', () => { clearTimeout(timer); reject(Error('Git unavailable')); });
      child.once('close', code => { clearTimeout(timer); if (failed || code !== 0) reject(Error('Committed object unavailable')); else resolveCommand(Buffer.concat(chunks)); });
    });
  }
  async link(handle, path) {
    if (this.descriptors.length >= 128 || !(await handle.stat()).isFile() || (await handle.stat()).size > 512 * MiB) throw Error('Object storage bound');
    const descriptor = this.descriptors.push(handle) + 2;
    await symlink(`/proc/self/fd/${descriptor}`, path);
  }
  async initialize() {
    await mkdir(this.scratch, { mode: 0o700 });
    await this.command(['init', '--bare', '--template=', '--object-format=sha1', this.scratch]);
    this.objects = await this.files.directory('objects', this.common);
    try {
      const pack = await this.files.directory('pack', this.objects);
      const names = await readdir(this.files.path(pack));
      if (names.length > 128) throw Error('Object storage count');
      const selected = names.filter(n => /^pack-[a-f0-9]{40}\.(idx|pack)$/.test(n));
      if (selected.length > 64) throw Error('Pack count');
      for (const name of selected) await this.link(await this.files.hold(this.files.path(pack, name)), join(this.scratch, 'objects/pack', name));
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  async object(id, type) {
    if (!sha(id)) throw Error('Invalid object identity');
    if (this.cache.has(id)) { const saved = this.cache.get(id); if (saved.type !== type) throw Error('Object type mismatch'); return saved.bytes; }
    if (!this.loose.has(id)) {
      this.loose.add(id);
      try {
        const directory = await this.files.directory(id.slice(0, 2), this.objects);
        const source = await this.files.hold(this.files.path(directory, id.slice(2)));
        const target = join(this.scratch, 'objects', id.slice(0, 2));
        await mkdir(target, { recursive: true, mode: 0o700 });
        await this.link(source, join(target, id.slice(2)));
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    const prefix = ['--git-dir=' + this.scratch, 'cat-file'];
    if ((await this.command([...prefix, '-t', id])).toString().trim() !== type) throw Error('Object type mismatch');
    const size = Number((await this.command([...prefix, '-s', id])).toString().trim());
    if (!Number.isSafeInteger(size) || size < 0 || size > 2 * MiB) throw Error('Committed file byte bound');
    const bytes = await this.command([...prefix, type, id]);
    if (bytes.length !== size || createHash('sha1').update(`${type} ${size}\0`).update(bytes).digest('hex') !== id) throw Error('Object integrity');
    this.cache.set(id, { type, bytes }); return bytes;
  }
  async file(commit, path) {
    const data = (await this.object(commit, 'commit')).toString('utf8');
    let id = /^tree ([a-f0-9]{40})\n/.exec(data)?.[1];
    const parts = path.split('/');
    for (let i = 0; i < parts.length; i++) {
      const tree = await this.object(id, 'tree');
      let offset = 0, found;
      while (offset < tree.length) {
        const space = tree.indexOf(32, offset), zero = tree.indexOf(0, space + 1);
        if (space < offset || zero < space || zero + 21 > tree.length) throw Error('Malformed committed tree');
        if (tree.subarray(space + 1, zero).equals(Buffer.from(parts[i]))) {
          if (found) throw Error('Ambiguous committed path');
          found = { mode: tree.subarray(offset, space).toString(), id: tree.subarray(zero + 1, zero + 21).toString('hex') };
        }
        offset = zero + 21;
      }
      if (!found) return null;
      if (i < parts.length - 1 ? found.mode !== '40000' : !['100644', '100755'].includes(found.mode)) throw Error('Unsupported committed path');
      id = found.id;
    }
    return decoder.decode(await this.object(id, 'blob'));
  }
}

export async function observeRuntime(input, hooks = {}) {
  validateRuntimeInput(input);
  const end = performance.now() + 9500, registrations = [], adoptions = [];
  const observedAt = new Date().toISOString();
  for (const entry of input.registrations) {
    const result = { alias: entry.alias, availability: 'unavailable', collectedAt: new Date().toISOString() };
    const files = new PinnedSource(input.trustedGroupIds, hooks.opened);
    try {
      if (performance.now() > end) throw Error('Observation deadline');
      const root = await files.directory(entry.directory);
      const handle = await files.hold(files.path(root, '.runner'));
      const row = JSON.parse(decoder.decode(await files.bytes(handle, 32768)));
      const scope = typeof row.gitHubUrl === 'string' && /^https:\/\/github\.com\//i.test(row.gitHubUrl) ? githubRepository(row.gitHubUrl) : null;
      if (!scope || !Number.isSafeInteger(row.agentId) || row.agentId <= 0 || !safeText(row.agentName, 256)) throw Error('Invalid registration');
      Object.assign(result, { availability: 'available', repository: scope, id: row.agentId, name: row.agentName, modifiedAt: (await handle.stat()).mtime.toISOString() });
    } catch { result.reason = 'The configured registration could not be verified; process health is unobserved.'; }
    finally { await files.close(); }
    registrations.push(result);
  }
  for (const [index, entry] of input.checkouts.entries()) {
    const result = { repository: entry.repository, availability: 'unavailable', collectedAt: new Date().toISOString() };
    const files = new PinnedSource(input.trustedGroupIds, hooks.opened);
    try {
      if (performance.now() > end) throw Error('Observation deadline');
      const metadata = await gitMetadata(files, entry.directory);
      if (metadata.origin?.toLowerCase() !== entry.repository.toLowerCase()) throw Error('Origin mismatch');
      const objects = new CommittedObjects(files, metadata.common, join(input.scratch, 'objects-' + index), end);
      await objects.initialize();
      const values = {};
      for (const path of ['package.json', 'package-lock.json', '.lighthouse/sdlc.json', '.github/workflows/lighthouse-sdlc-unattended.yml']) {
        const text = await objects.file(metadata.head, path);
        if (text !== null) { try { values[path] = path.endsWith('.json') ? JSON.parse(text) : text; } catch { /* Missing/invalid values remain unknown. */ } }
      }
      const version = value => safeText(value, 128) ? value : null;
      const workflow = values['.github/workflows/lighthouse-sdlc-unattended.yml'];
      const refs = typeof workflow === 'string' ? [...workflow.matchAll(/repository: juangcarmona\/lighthouse\s*\n\s*ref: ([a-f0-9]{40})(?:\s|$)/g)].map(m => m[1]) : [];
      Object.assign(result, { availability: 'available', revision: metadata.head,
        declaredCli: version(values['package.json']?.devDependencies?.['@juangcarmona/lighthouse']),
        lockedCli: version(values['package-lock.json']?.packages?.['node_modules/@juangcarmona/lighthouse']?.version),
        sdlcVersion: version(values['.lighthouse/sdlc.json']?.package?.name === '@juangcarmona/lighthouse-sdlc' ? values['.lighthouse/sdlc.json']?.package?.version : null),
        workflowRef: refs.length && new Set(refs).size === 1 ? refs[0] : null,
        sourceUrl: `https://github.com/${entry.repository}/tree/${metadata.head}`, complete: Object.keys(values).length === 4 });
      result.complete &&= [result.declaredCli, result.lockedCli, result.sdlcVersion, result.workflowRef].every(value => value !== null);
    } catch { result.reason = 'Committed adoption could not be verified within the supported local metadata/storage bounds.'; }
    finally { await files.close(); }
    adoptions.push(result);
  }
  const response = { availability: 'available', observedAt, registrationCount: input.registrations.length, checkoutCount: input.checkouts.length,
    configured: registrations.length + adoptions.length > 0, complete: registrations.concat(adoptions).length > 0 && registrations.concat(adoptions).every(s => s.availability === 'available' && s.complete !== false), registrations, adoptions };
  if (Buffer.byteLength(JSON.stringify(response)) > MiB) throw Error('Host projection bound');
  return response;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const chunks = []; let length = 0;
    for await (const bytes of process.stdin) { length += bytes.length; if (length > 128 * 1024) throw Error('Input bound'); chunks.push(bytes); }
    process.stdout.write(JSON.stringify(await observeRuntime(JSON.parse(decoder.decode(Buffer.concat(chunks))))));
  } catch { process.stdout.write(JSON.stringify({ availability: 'unavailable', complete: false, reason: 'The bounded host observation could not be completed.' })); process.exitCode = 1; }
}
