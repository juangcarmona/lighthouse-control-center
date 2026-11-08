# Design

<!-- pdac-scope: none reason="Operational documentation and evidence classification for an existing repository rename; no product-semantic or architectural change." -->

## Context

See proposal.md for motivation. The issue reports the rename and updated main origin, but also broken linked-worktree pointers. The workspace is a disposable source copy, not the moved Bastion checkout. Source inspection finds old-name metadata, setup samples and historical evidence. Verification inputs are frozen without issue-specific corrections.

## Goals / Non-Goals

**Goals:** Give the operator a bounded repair procedure and receipt checklist; distinguish supplied observations, source findings and unperformed live checks.

**Non-Goals:** Administer GitHub or Bastion; rename again; replay source requests; activate the legacy observer; change authentication, namespaces, protected identifiers, package identity, managed files or verification policy.

## Decisions

- Use documentation-only changes rather than a bulk replacement. Old names in request records and historical reports are intentional evidence, not migration targets.
- Retain preparation steps as historical guidance, but put current issue-reported status first. This preserves author content without asking operators to repeat the rename.
- Put worktree repair in a dedicated runbook. Run repair only from the actual moved main checkout, then verify each linked checkout. Do not simulate a repair in this disposable copy or infer Bastion health from local Git status.
- Record source findings with separate owners and evidence gaps. Do not modify frozen metadata/setup defaults to make a text scan look clean. Existing explicit repository configuration remains the operator's route; changing an uncertain historical request is never a substitute.
- Add no specification delta: no observable application contract changes. Preserve host metadata and append only the documentation exemption marker.

## Risks / Trade-offs

- [Live continuity cannot be established here] → Return blocked until the operator supplies actual repair and applicable integration receipts.
- [The issue's observations may age] → Attribute their date/source; require fresh receipts for completion.
- [Old-name defaults remain] → List them explicitly; use reviewed, separately authorized corrections for frozen inputs and preserve immutable evidence.
- [A successful local check could imply remote acceptance] → Report local check results separately from operational acceptance and later publication/CI.

## Migration Plan

Publish the documentation candidate for review without deployment or a lifecycle dispatch. The operator follows the runbook on the actual checkout and records safe receipts. Rollback of documentation is a reviewed revert of this change only; repository rename-back, worktree deletion, credential migration and uncertain write retries are not rollback actions authorized by this plan.
