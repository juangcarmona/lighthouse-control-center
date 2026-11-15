const prefix = 'lcc:read-projection:v1:';
const activeKey = prefix + 'active-scope';
const maxAge = 10 * 60 * 1000;
const maxBytes = 2 * 1024 * 1024;
const views = new Set(['factory', 'operations', 'runtime', 'issue', 'health']);
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
  clearDrafts(scope);
  try { const navigation = JSON.parse(sessionStorage.getItem('lcc:collection-return')); if (scope === undefined || navigation?.scope === scope) sessionStorage.removeItem('lcc:collection-return'); } catch { /* Optional navigation state. */ }
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

const draftPrefix = 'lcc:draft:v1:';
function draftKey(scope, actor, repository, number) {
  return typeof scope === 'string' && scope.length > 0 && scope.length <= 256 && Number.isSafeInteger(actor) && actor > 0
    && typeof repository === 'string' && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) && Number.isSafeInteger(number) && number > 0
    ? draftPrefix + encodeURIComponent(scope) + ':' + actor + ':' + repository.toLowerCase() + '#' + number : null;
}
export function clearDrafts(scope) {
  try { for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(scope === undefined ? draftPrefix : draftPrefix + encodeURIComponent(scope) + ':')) sessionStorage.removeItem(key);
  } } catch { /* Draft storage is optional. */ }
}
export function readDraft(scope, actor, repository, number) {
  const key = draftKey(scope, actor, repository, number); if (!key) return '';
  try { const value = JSON.parse(sessionStorage.getItem(key));
    if (typeof value?.body === 'string' && value.body.length <= 10000 && Number.isFinite(value.savedAt)
        && value.savedAt <= Date.now() && Date.now() - value.savedAt < 24 * 60 * 60 * 1000) return value.body;
    sessionStorage.removeItem(key);
  } catch { /* Invalid or unavailable storage is never an empty source conversation. */ }
  return '';
}
export function writeDraft(scope, actor, repository, number, body) {
  const key = draftKey(scope, actor, repository, number); if (!key || typeof body !== 'string' || body.length > 10000) return false;
  try {
    if (!body) sessionStorage.removeItem(key);
    else {
      const keys = Object.keys(sessionStorage).filter(value => value.startsWith(draftPrefix) && value !== key)
        .sort((a, b) => { try { return JSON.parse(sessionStorage.getItem(a)).savedAt - JSON.parse(sessionStorage.getItem(b)).savedAt; } catch { return 0; } });
      while (keys.length >= 10) sessionStorage.removeItem(keys.shift());
      sessionStorage.setItem(key, JSON.stringify({ body, savedAt: Date.now() }));
    }
    return true;
  } catch { return false; }
}

export function rememberCollection(scope, url) {
  if (typeof scope !== 'string' || !/^\/workspace\/(operations|issues|repositories)(\?|\/|$)/.test(url) || url.includes('\\')) return;
  try { sessionStorage.setItem('lcc:collection-return', JSON.stringify({ scope, url })); } catch { /* Optional navigation preference. */ }
}
export function readCollection(scope) {
  try { const value = JSON.parse(sessionStorage.getItem('lcc:collection-return'));
    return value?.scope === scope && typeof value.url === 'string' && /^\/workspace\/(operations|issues|repositories)(\?|\/|$)/.test(value.url) && !value.url.includes('\\') ? value.url : null;
  } catch { return null; }
}
