import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import { parse } from 'yaml';

export const root = fileURLToPath(new URL('../../', import.meta.url));
const hash = value => 'sha256:' + createHash('sha256').update(value).digest('hex');
const clauses = value => Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'string' && item.trim());
export function validateBindings(ledger, read = path => readFileSync(resolve(root, path), 'utf8')) {
  if (ledger?.version !== 1 || !Array.isArray(ledger.bindings) || !ledger.bindings.length) throw Error('Missing product behaviour bindings');
  const seen = new Set();
  for (const binding of ledger.bindings) {
    if (!/^SB-[A-Z0-9-]+$/.test(binding.id) || seen.has(binding.id)) throw Error('Invalid or duplicate behaviour identity');
    seen.add(binding.id);
    for (const item of [binding.example, binding.requirement]) {
      if (!item || typeof item.path !== 'string' || !item.path.startsWith('docs/product/')
          || relative(resolve(root, 'docs/product'), resolve(root, item.path)).startsWith('..')) throw Error('Invalid product source path');
      const text = read(item.path);
      if (hash(text) !== item.hash) throw Error('Product source changed: ' + item.path);
      const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const model = front && parse(front[1]);
      if (item === binding.example) {
        if (model?.id !== binding.id || model.type !== 'structured-behaviour'
            || !clauses(model.given) || typeof model.when !== 'string' || !model.when.trim() || !clauses(model.then)
            || JSON.stringify([model.given, model.when, model.then]) !== JSON.stringify([item.given, item.when, item.then])
            || item.acceptance !== 'draft-overlay') throw Error('Structured behaviour binding changed: ' + binding.id);
      } else if (model?.id !== item.id || !/^sha256:[a-f0-9]{64}$/.test(item.digest)) throw Error('Invalid requirement citation');
    }
    for (const kind of ['fixture', 'live']) {
      if (!Array.isArray(binding.cases?.[kind]) || binding.cases[kind].some(value => typeof value !== 'string' || !value.trim()))
        throw Error('Missing case declarations for ' + binding.id);
    }
    if (!binding.limitations?.trim()) throw Error('Missing evidence limitations');
  }
  return ledger;
}
export const loadBindings = () => validateBindings(JSON.parse(readFileSync(new URL('./bindings.json', import.meta.url), 'utf8')));
export const bindingsFor = (ledger, title, kind) => ledger.bindings.filter(binding => binding.cases[kind].some(prefix => title.startsWith(prefix)));
export function validateCaseCoverage(ledger, titles, kind) {
  for (const binding of ledger.bindings) for (const prefix of binding.cases[kind]) {
    if (!titles.some(title => title.startsWith(prefix))) throw Error('Declared product case was not discovered: ' + prefix);
  }
}
