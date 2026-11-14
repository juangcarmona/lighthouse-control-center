// Label observations are placeholders, never verified questions or resolution authority.
export function reconcileAttention(collections, previous = new Map()) {
  const entries = new Map(), current = new Set();
  for (const [repository, collection] of collections) {
    if (collection.availability === 'denied') continue;
    for (const issue of collection.issues ?? []) for (const label of issue.labels ?? []) {
      if (!['needs-info', 'waiting-review'].includes(label)) continue;
      const key = repository.toLowerCase() + ':' + issue.id + ':label:' + label;
      current.add(key);
      entries.set(key, { key, repository, issue, label, sourceTime: validTime(issue.updatedAt),
        observedAt: validTime(collection.observedAt), state: collection.stale || collection.availability !== 'available' ? 'stale' : 'source-label' });
    }
  }
  for (const [key, entry] of previous) {
    const collection = collections.get(entry.repository);
    if (!current.has(key) && collection && collection.availability !== 'denied') entries.set(key, { ...entry, state: 'not-observed' });
  }
  const ordered = [...entries.values()].sort((a, b) => Number(a.state !== 'source-label') - Number(b.state !== 'source-label')
    || (Date.parse(a.sourceTime) || 0) - (Date.parse(b.sourceTime) || 0) || a.key.localeCompare(b.key));
  // Retained history is bounded; eviction cannot establish source resolution.
  const retained = [], encoder = new TextEncoder(); let bytes = 0;
  for (const entry of ordered) {
    const size = encoder.encode(JSON.stringify(entry)).byteLength;
    if (retained.length >= 1000 || bytes + size > 1024 * 1024) continue;
    retained.push(entry); bytes += size;
  }
  return { entries: new Map(retained.map(entry => [entry.key, entry])), limited: retained.length !== ordered.length };
}
function validTime(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null; }
