<!-- pdac-scope: cited -->
# Restore source-permitted public reads for #48

Actual trusted development E2E reaches the linked user but receives source-read-commits-http-403 locally: SourceControlAccess rejects the read before GitHub is consulted because the App has no Contents grant. GitHub documents public-resource exceptions for Get a commit, Get repository content and List pull requests. The current synthetic refusal prevents ordinary comments despite independent issue-write authority.

<!-- pdac:cite id="FR-ISSUE-CONVERSATION" digest="sha256:936e13fb5556657bf62b15f7b5fb8c943b1aaa00736100b5ba4bc6c51689e463" -->
<!-- pdac:cite id="BR-LAN-PRIVILEGE-BOUNDARY" digest="sha256:097bc0b8e03247590799169e30b51a946c463f327c240a9ba9d1e41d98ea63ac" -->

## Bounded correction

Preserve configured repository, owner session, intended App installation, accessible listing, matching repository ID and the exact connected-user token. Add explicit public visibility to the authority snapshot. Only when metadata explicitly states visibility public, the intended installation listing confirms that public repository identity, and the read grant is explicitly false may the existing fixed-path GET for commits/contents/pulls reach GitHub. Never allow null/unknown grants from public status. Keep variables/actions/artifact paths subject to their existing grants; never use anonymous HTTP, another token, changed endpoint or new transport. GitHub final 403/404 remains failed. Fresh final authority validation includes visibility so a public-to-private change invalidates observation facts.

CommentWrite/DispatchWrite remain the intersection of verified user/App write grants. Public status does not authorize a write, and SDK prepare/confirm/journal/current-state checks remain unchanged. A missing dispatch grant or policy still blocks stage requests while a supported ordinary comment can proceed. This corrects implementation of existing source authority; no new product or source permission is selected.

## Authorization and files

The maintainer explicitly authorized unattended completion of #48 and new regression/architecture verification on 2026-11-09. This is an operator-directed bounded fix, not a native worker rewriting its own frozen policy. Allowed edits: RepositoryAccess.cs, SourceControlAccess.cs, related SourceControlTests.cs regression fixtures, issue-specific OpenSpec files, runbook/evidence and only directly affected safe diagnostics. Preserve every existing assertion and source write boundary; no credential/provider/production settings or policy changes.

## Acceptance and verification

Regression cases must prove public false-grant reads use the same user token; private, internal, missing visibility, false public identity, wrong App and wrong repository ID remain blocked; null grants remain blocked; public visibility grants neither comment nor dispatch; final GitHub denial remains refusal; public-to-private change before final validation removes facts. Run the full workspace and repository checks. Then publish the exact candidate to the existing development service and use fresh-session Playwright to observe source capabilities; if ordinary commenting becomes eligible, perform one explicitly reviewed ordinary comment on LCC issue #116 and confirm its actual user/source ID without continuation or blind retry. Other source commands require their original grants.

## Source references

- https://docs.github.com/en/rest/commits/commits#get-a-commit
- https://docs.github.com/en/rest/repos/contents#get-repository-content
- https://docs.github.com/en/rest/pulls/pulls#list-pull-requests

## Rollback

Revert the visibility/read exception and its additive tests; retain source comment receipts and all protected stores. Rollback must not resend or delete a confirmed command. Actual source acceptance remains pending until the exact service result is observed.
