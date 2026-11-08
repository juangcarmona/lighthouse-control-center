---
id: UC-OPERATE-ISSUE
type: use-case
title: Understand and act on one repository issue
status: draft
primary-actor: ACT-OPERATOR
supporting-actors: [ACT-GITHUB-BACKLOG]
bounded-context: BC-BACKLOG-TRIAGE
governed-by: [BR-GITHUB-SOURCE, BR-WORK-AUTHORIZATION, BR-LAN-PRIVILEGE-BOUNDARY, BR-EXPLICIT-WORK-COMMANDS, BR-HUMAN-DECISION-BOUNDARIES]
uses-terms: [TERM-PROJECT, TERM-WORK-UNIT, TERM-WORK-COMMAND, TERM-EXECUTION-RUN, TERM-DELIVERY-EVIDENCE]
---

## Goal

Understand what an issue needs and perform an allowed action from Lighthouse Control Center while following its source-backed outcome.

## Trigger

The operator selects an issue from a configured repository.

## Preconditions

The operator is signed in. Repository access is verified or its absence is explicit. Reading the issue does not require all delivery prerequisites to have passed.

## Main Flow

1. Lighthouse Control Center presents the issue description, conversation, lifecycle evidence, related work, current execution or reservation and any pending human information or decision.
2. Lighthouse Control Center explains the recommended next action and other permitted actions using the repository's capabilities and shared Lighthouse rules. It shows reasons for unavailable actions and limitations of the evidence.
3. The operator selects Refine, Propose or a conversation action and sees the intended effect and acting GitHub identity before submitting.
4. Lighthouse Control Center verifies current authority and relevant source state on the server and submits the explicit action through the supported source entrypoint.
5. Lighthouse Control Center distinguishes the submitted command, source admission or rejection, any exactly correlated execution, human waits and published outcome.
6. The operator reads the result and related proposal, PR, checks or evidence within Lighthouse Control Center and decides whether another explicit action is appropriate.

## Alternative Flows

The operator posts an ordinary comment without requesting continuation. A reply to a pending question may request continuation only through an explicit, explained action supported by the repository contract. Changed source state can make an earlier recommendation unavailable. A repeated submission resolves to the existing request; an uncertain submission is reconciled before a retry can create work.

## Failure Conditions

Missing permission, unsupported capabilities, conflicting reservations, stale evidence or a human gate prevent dependent actions with a specific explanation. Missing execution evidence remains unknown. A run selected merely because it is recent cannot establish correlation. A request rejected by GitHub is not displayed as admitted work.

## Postconditions

The operator sees a confirmed source result, an active or waiting execution, a rejection, or an explicitly uncertain request with a recovery path. Closing Lighthouse Control Center does not interrupt work already admitted by the repository.
