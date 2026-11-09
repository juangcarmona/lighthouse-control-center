import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { loadBindings, bindingsFor, root } from './bindings.mjs';

export default class ProductBehaviourReporter {
  constructor(options = {}) { this.kind = options.kind ?? 'fixture'; this.output = options.output ?? 'test-results/product-behaviours'; this.results = []; }
  onBegin(config, suite) {
    this.ledger = loadBindings();
    this.discoveredTitles = suite.allTests().map(test => test.title);
    this.revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    this.runId = new Date().toISOString();
  }
  onTestEnd(test, result) {
    const bindings = bindingsFor(this.ledger, test.title, this.kind);
    if (!bindings.length) return;
    const outcome = result.status === 'passed' ? 'passed' : result.status === 'skipped' ? 'inconclusive' : 'failed';
    const citations = [...new Map(bindings.map(binding => [binding.requirement.id, { id: binding.requirement.id, digest: binding.requirement.digest }])).values()];
    const sourceEvidence = (result.attachments ?? []).flatMap(attachment => {
      if (!['source-authority', 'confirmed-source-comment', 'recovered-source-comment'].includes(attachment.name)
          || attachment.contentType !== 'application/json' || !attachment.body) return [];
      try {
        const data = JSON.parse(attachment.body.toString('utf8'));
        const fields = ['availability', 'reason', 'missingReadScopes', 'commentId', 'source', 'actingUserId',
          'questionResolved', 'sourceWritePerformed', 'prepareOrSubmitRequests'];
        return [{ name: attachment.name, ...Object.fromEntries(fields.filter(field => Object.hasOwn(data, field)).map(field => [field, data[field]])) }];
      } catch { return []; }
    });
    this.results.push({ testId: test.titlePath().join(' / '), outcome, durationMs: result.duration, sourceEvidence,
      citations, examples: bindings.map(binding => ({ id: binding.id, hash: binding.example.hash,
        acceptance: binding.example.acceptance, given: binding.example.given, when: binding.example.when,
        then: binding.example.then, limitations: binding.limitations })) });
  }
  onEnd(result) {
    if (!this.ledger || !this.runId) return;
    const directory = resolve(root, this.output, this.runId.replaceAll(':', '-')); mkdirSync(directory, { recursive: true });
    if (this.results.length) writeFileSync(resolve(directory, 'verification-evidence.json'), JSON.stringify({
      format: 'pdac-verification-evidence/v1alpha1', provider: 'playwright-' + this.kind,
      'run-id': this.runId, revision: this.revision,
      results: this.results.map(item => ({ 'test-id': item.testId, level: this.kind === 'live' ? 'end-to-end' : 'integration', outcome: item.outcome, citations: item.citations })),
    }, null, 2) + '\n');
    writeFileSync(resolve(directory, 'structured-behaviours.json'), JSON.stringify({
      revision: this.revision, runId: this.runId, suiteStatus: result.status, evidenceKind: this.kind,
      productChange: this.ledger.productChange, productAcceptance: 'Draft examples; execution does not approve the Product Change.',
      runProvenance: 'The revision identifies HEAD; uncommitted harness changes, if present, are not attested by this field.',
      results: this.results, uncoveredExamples: this.ledger.bindings.filter(binding => !this.results.some(item => item.examples.some(example => example.id === binding.id))).map(binding => binding.id),
    }, null, 2) + '\n');
  }
}
