# Issue 49 retrospective

Date: 2026-11-07

Work item: [Development identity and separate GitHub connection](https://github.com/juangcarmona/sofa/issues/49). Delivered through [PR #84](https://github.com/juangcarmona/sofa/pull/84), reviewed head `4bd1f84863bd91e5d60656c3e939b2c0a2e129d0`, merge `6a94e6fc1e0f07b1b2298b1275c62f92e5739013`.

## What worked

The isolated real provider, exact owner identity, separate user GitHub connection and bounded process-local sessions were exercised beyond mocked claims. Atomic request initiation and disconnect/replacement share a gate; focused counterfactual tests caught the earlier check-to-send race. The final independent LunaHigh correction review accepted every Done dimension with no findings, and hosted verification passed. The owner confirmed desktop sign-in, GitHub connection and repository/operations data.

The owner requested password-only development login. Development assurance1 was implemented and verified without changing External assurance2. A live disposable account with an enrolled OTP reached the explicit assurance2 OTP challenge, while normal development login skipped it and still rejected that different owner. The synthetic account and probe input were removed; the real owner's credentials and enrolled factor were preserved.

## What did not

The first empty operations screen exposed missing App configuration rather than useful data, and a later403 needed diagnosis before the owner could connect. Repeated requests for physical-phone rehearsal delayed progress despite the owner's explicit deferral. An initial incomplete synthetic provider profile did not finish the enrolled-OTP probe; it was retained as a failed attempt and replaced with a complete-profile account, not called a pass. Source-permission and stale-data behavior needed several independent corrections before integration.

## What to do next time

Diagnose the actual account/App state before asking the owner to retry. Keep automated narrow-layout/provider proof separate from physical-device proof and respect a recorded owner deferral. Use the existing central atomic guard for every credentialed or signed-asset request. Qualify exact source access without operator-token substitution and preserve stale timestamps and known authority loss as separate states. Test source setup and a completed provider profile before presenting a manual acceptance step.

## Post-merge evidence

[Required PR verification](https://github.com/juangcarmona/sofa/actions/runs/42404934254) and [postmerge verification](https://github.com/juangcarmona/sofa/actions/runs/42406179996) passed. Full local verification covered39Node,74web,38retained-runtime and17browser tests. Actual provider acceptance covered password/refresh/revocation/outage, and the [postmerge enrolled-OTP observation](https://github.com/juangcarmona/sofa/issues/49#issuecomment-6712232451) passed against trusted development HTTPS. The later #50/#52 development preview includes this merged identity behavior and responds on its health endpoint; it is a separate development artifact, not a production release.

Physical-phone rehearsal was owner-deferred and is not claimed tested. Desktop operations confirmation qualifies this identity delivery; it does not prove later issue-conversation, command or discovery acceptance. Production custody/recovery/TLS and deployment remain [#58](https://github.com/juangcarmona/sofa/issues/58).

## Effort

Human active time, agent active time, tokens and cost: not captured in a consolidated session-bound record for this item. The project's lifecycle/metrics documentation supplies no session-to-item usage mapping. CI duration, elapsed chat time and engine queue time are not substituted for those measurements.

## Amendments

No lifecycle amendment. The existing source guard and focused request-initiation, stale/denied, provider and account regressions carry the concrete security lessons. The owner-deferred device limitation is durable acceptance evidence, not a new mandatory verification step. A new SoFa-specific process gate is not warranted.
