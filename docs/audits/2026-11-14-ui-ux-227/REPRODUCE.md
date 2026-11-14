# Reproduce the audit and proposals

Scripts ran from an isolated temporary directory. Their absolute paths identify that session; adjust root/origin/private storage-state paths before rerunning. Browser session data and sign-in credentials are excluded.

Audit-only dependencies: `playwright@1.64.1`, `@axe-core/playwright@4.14.0`, Chromium. Repository dependencies were unchanged.

- `audit.mjs`: nine current-app routes, screenshots and desktop/light Axe checks; source writes blocked.
- `flows.mjs`: search, board, reader, unsent draft, navigation, controlled read delay and 503.
- `secondary-flows.mjs`: pagination, evidence read, Health/project/run and initial focus.
- `render-proposals.mjs`: first board/reader prototype checks.
- `check-workspace.mjs`: expanded workspace captures, Axe, filters/return/draft/dialog/mobile/state checks.
- `reference-scan.mjs`, `reference-flows.mjs`, `reference-deep.mjs`: public Platform and Health captures. `references/*.json` retain route/control metadata, selected tabs and limitations; third-party article body text is excluded. Health's numbers are generated demo data.

Serve this evidence directory through a local HTTP server and open `index.html` or `workspace.html`. GitHub displays HTML source and does not run the prototype. No application sign-in is required. `workspace-standalone.html` also opens directly from disk with all CSS, JavaScript and branding embedded. The new proposal supports `?view=work`, `projects`, `issues`, `issue`, `attention`, `health`, `health-detail`, `runtime`, `account`; `theme=light|dark|system`; `project`, `q`, `group`, and a presentation-only `state` selector.

The demo stores its own appearance preference and fixed-identity draft/filter state locally. It performs no GitHub or application API calls. Clear site storage to reset the demo. Real authorization, retention and source actions need separate qualification.

Retained JSON files are receipts of these audit runs. Live records can change between screenshots. Original screenshots are immutable evidence and may include source-authored Spanish content; all newly authored review text is English. No HAR, cookies, tokens or private Orbion material are included.
