# Intervention inbox

<!-- pdac-scope: cited -->

## ADDED Requirements

### Requirement: Observe source-backed intervention contexts without inventing current authority

The inbox SHALL identify bounded source-backed waits by stable source context, show their question or factual reason, original source and observation times and known actor, and keep unknown, stale, incomplete or unsupported context explicit. Repeated observations SHALL reconcile one context while separate requests for one issue remain distinct. Current question and action semantics SHALL come from the shared source contract.

#### Scenario: Only source labels are available

- **WHEN** a collected issue has a human-wait label without verified current question evidence
- **THEN** the inbox shows the source label reason with unknown question/actor/currentness and a shared-context link rather than inventing an approval or pending question

#### Scenario: Repeated and distinct contexts are observed

- **WHEN** refresh returns the same source request and another verified request for that issue
- **THEN** the original key is reconciled without duplication and the distinct context remains independently visible

#### Scenario: A response is unconfirmed

- **WHEN** a user views or comments on a wait or its explicit response is rejected, failed or uncertain
- **THEN** the inbox keeps it unresolved until fresh source proof confirms resolution or supersession and preserves the historical context

#### Scenario: Source authority or coverage is lost

- **WHEN** account/repository authority is denied, old-scope data arrives late, or collection is incomplete/unavailable
- **THEN** revoked context cannot reappear and missing local rows cannot establish source resolution

<!-- pdac:cite id="UC-RESOLVE-INTERVENTION" digest="sha256:03ccd559e108d41bf3e5c9a324370b0bbd9ef3a4d914d68305f7144769be32ef" -->
<!-- pdac:cite id="FR-INTERVENTION-INBOX" digest="sha256:b60e605685fc15157ca76a876d7ee88f154b664b4cec0ec5add860c2cdb161f8" -->
<!-- pdac:cite id="BR-GITHUB-SOURCE" digest="sha256:fd8141424d5fead38ed55d54689511fc445467133706e875371cc3199af8ab1a" -->
<!-- pdac:cite id="BR-EXPLICIT-WORK-COMMANDS" digest="sha256:5d2f308b670bdf6e577d2205ebc246ec56505253d81d6a5a5efe0b92b55d735e" -->
<!-- pdac:cite id="BR-HUMAN-DECISION-BOUNDARIES" digest="sha256:e18b9a12d0dd80fe7a4f5ee7e7acc6a6329a6c07ec87cb6a59813f1eaea450f9" -->
