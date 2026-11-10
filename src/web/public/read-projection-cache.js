const prefix = 'lcc:read-projection:v1:';
const activeKey = prefix + 'active-scope';
const maxAge = 10 * 60 * 1000;
const maxBytes = 2 * 1024 * 1024;
const views = new Set(['factory', 'operations', 'runtime']);
const keyFor = (scope, view) => typeof scope === 'string' && scope.length > 0 && scope.length <= 256 && views.has(view)
  ? prefix + encodeURIComponent(scope) + ':' + view : null;

export function readProjectionCache(scope, view = 'factory') {
  const key = keyFor(scope, view);
  if (!key) return null;
  try {
    const active = sessionStorage.getItem(activeKey);
    if (active && active !== scope) { clearProjectionCache(); return null; }
    const value = JSON.parse(sessionStorage.getItem(key));
    if (value?.version !== 1 || value.scope !== scope || !Number.isFinite(value.savedAt)
        || Date.now() - value.savedAt < 0 || Date.now() - value.savedAt > maxAge
        || !value.projection || typeof value.projection !== 'object' || Array.isArray(value.projection)) {
      sessionStorage.removeItem(key);
      return null;
    }
    return value.projection;
  } catch { return null; }
}

export function writeProjectionCache(scope, projection, view = 'factory') {
  const key = keyFor(scope, view);
  if (!key || !projection || typeof projection !== 'object' || Array.isArray(projection)) return false;
  try {
    const active = sessionStorage.getItem(activeKey);
    if (active && active !== scope) clearProjectionCache();
    const serialized = JSON.stringify({ version: 1, scope, savedAt: Date.now(), projection });
    if (new TextEncoder().encode(serialized).byteLength > maxBytes) {
      sessionStorage.removeItem(key);
      return false;
    }
    sessionStorage.setItem(key, serialized);
    sessionStorage.setItem(activeKey, scope);
    return true;
  } catch { return false; }
}

export function clearProjectionCache(scope) {
  try {
    if (scope !== undefined) {
      const prefixForScope = typeof scope === 'string' && scope.length <= 256 ? prefix + encodeURIComponent(scope) + ':' : null;
      if (prefixForScope) for (let index = sessionStorage.length - 1; index >= 0; index--) {
        const key = sessionStorage.key(index);
        if (key?.startsWith(prefixForScope)) sessionStorage.removeItem(key);
      }
      if (sessionStorage.getItem(activeKey) === scope) sessionStorage.removeItem(activeKey);
      return;
    }
    for (let index = sessionStorage.length - 1; index >= 0; index--) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(prefix)) sessionStorage.removeItem(key);
    }
  } catch { /* Session storage can be unavailable or quota-limited. */ }
}
