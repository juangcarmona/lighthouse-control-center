// A deliberately small text-node renderer. Source HTML and images are always inert.
export function safeSourceUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
export function sourceLink(label, href) {
  const safe = safeSourceUrl(href);
  const node = document.createElement(safe ? 'a' : 'span');
  node.textContent = label;
  if (safe) { node.href = safe; node.rel = 'noreferrer noopener'; }
  return node;
}
function inline(parent, text, budget) {
  const pattern = /\[([^\]\n]{1,500})\]\(([^)\s]{1,2048})\)|`([^`\n]+)`|\*\*([^*\n]+)\*\*/g;
  let position = 0;
  for (const match of text.matchAll(pattern)) {
    if (budget.remaining <= 0) break;
    budget.remaining--;
    parent.append(document.createTextNode(text.slice(position, match.index)));
    if (match[1]) parent.append(sourceLink(match[1], match[2]));
    else { const node = document.createElement(match[3] ? 'code' : 'strong'); node.textContent = match[3] ?? match[4]; parent.append(node); }
    position = match.index + match[0].length;
  }
  parent.append(document.createTextNode(text.slice(position)));
}
export function markdown(text = '', budget = { remaining: 500 }) {
  const root = document.createElement('div'); root.className = 'source-markdown';
  let fence = null, list = null;
  for (const source of text.matchAll(/[^\r\n]*(?:\r\n|\n|\r|$)/g)) {
    if (!source[0]) continue;
    const line = source[0].replace(/\r?\n$|\r$/, '');
    if (budget.remaining <= 0) {
      const plain = document.createElement('pre'); plain.tabIndex = 0;
      plain.textContent = text.slice(source.index); root.append(plain); break;
    }
    budget.remaining--;
    if (/^\s*```/.test(line)) {
      if (fence) { fence = null; } else { const pre = document.createElement('pre'); pre.tabIndex = 0; fence = document.createElement('code'); pre.append(fence); root.append(pre); }
      list = null; continue;
    }
    if (fence) { fence.append(document.createTextNode(line + '\n')); continue; }
    if (!line.trim()) { list = null; continue; }
    const heading = line.match(/^#{1,6}\s+(.+)$/);
    const item = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/);
    let node;
    if (heading) { list = null; node = document.createElement('h3'); inline(node, heading[1], budget); }
    else if (item) {
      if (!list) { list = document.createElement('ul'); root.append(list); }
      node = document.createElement('li'); inline(node, item[1], budget); list.append(node); continue;
    } else { list = null; node = document.createElement('p'); inline(node, line, budget); }
    root.append(node);
  }
  if (!root.childNodes.length) { const empty = document.createElement('p'); empty.textContent = 'No source text.'; root.append(empty); }
  const details = document.createElement('details'), summary = document.createElement('summary'), raw = document.createElement('pre');
  summary.textContent = 'Original Markdown'; raw.tabIndex = 0; raw.textContent = text; details.append(summary, raw); root.append(details);
  return root;
}
