# Eve - Release Readiness

*6 Sep 2026. Canonical release gates and lifecycle policy. D62 lifecycle defaults were explicitly approved by the user; they are product rules, subject to legal review, not a claim of legal compliance. Nothing here is implemented yet.*

## Document Authority

- [product-v1.md](product-v1.md): current member-facing behaviour.
- [architecture.md](architecture.md): implementation contracts, not runnable migrations.
- This file: release gates and lifecycle defaults.
- [todo.md](todo.md): work tracking; checked decisions are not checked implementations.
- [roadmap.md](roadmap.md): target sequencing; dates never override these gates.
- [conversation-log.md](conversation-log.md) and [questions-before-code.md](questions-before-code.md): history, not instructions to restore superseded features.
- [to-do-after-MVP.md](to-do-after-MVP.md): deferred features requiring later approval.

## Release Gates

### Local Development

Use synthetic accounts and content until the real-member gate passes. A partial local demo may omit unfinished features but must not be presented as proof that privacy, anonymity or admission are enforced. Test against a local database before connecting production data.

### First Real-Member Cohort

All approved MVP commitments remain in scope. In particular, follower removal, people search, voucher safeguards and close-friends capture alerts are not silently deferred past the launch date.

- [ ] Admission/onboarding, private follow approval and account/circle transitions work end to end.
- [ ] Database privileges, API projections, anonymity, both-direction blocking and all audience checks pass negative-access tests through every enabled transport.
- [ ] Private media delivery, notification payloads and public/auth/vouch pages cannot expose member content outside authorized requests.
- [ ] Image and video posts (D64) work end to end: validated uploads, processing/error states, private playback and derivatives, metadata stripping, current-access checks for thumbnails/ranges/segments and irreversible cleanup. A local attachment preview does not satisfy this gate.
- [ ] Named/anonymous posting, feeds, comments, likes, profiles, search and follower/circle management meet the current product contract.
- [ ] Report handling, reviewer roles, appeals, vouch budgets/restrictions, three-strike suspension and D62 expiry/reinstatement are usable by the team.
- [ ] Post/account deletion, evidence cleanup and backup recovery have been tested against the D62 deadlines below.
- [ ] In-app Activity and optional generic push work; no like notifications are emitted.
- [ ] Capture alerts pass physical-device tests on claimed supported methods/platforms; unsupported detection is disclosed without promising complete coverage.
- [ ] Terms, privacy/retention notices, community rules and a working support/report contact accurately describe the implemented product. Do not assume invitation-only access creates a legal exemption.
- [ ] Founding invitations are explicitly controlled by the team; applicants without approval cannot access member content.

If a gate is not ready, delay real-member access. Do not weaken a privacy promise to meet a calendar target. A future scope reduction needs an explicit product decision and matching changes across these documents.

### Store Submission

Complete the real-member gate first, then verify current store requirements, account permissions, signing, disclosures and review materials. Store acceptance is not a substitute for the privacy/security tests. Budget time for review; no guaranteed approval date or fixed number of rejection rounds.

### Expansion Beyond the Founding Cohort

Complete the cohort gate, assess observed moderation capacity and retention, and obtain the planned legal review before expansion. Use a server-side cohort-only admission flag and team-approved invitations, not merely a maximum-active-member count: a count cap does not establish who is in the cohort and can admit replacements indefinitely.

An optional capacity cap may supplement this gate, never replace it. Both personal-vouch and team-admission paths must respect cohort/expansion state atomically. Changing the flag is privileged and audited. Vendor checks, external phone vouchers and business access remain deferred until separately reviewed.

## D62 Lifecycle Defaults

### Ordinary Deletion and Backups

- Confirmed deletion immediately hides the account/content and ends the access required by D57/D60. There is no undo or member restoration.
- Permanently remove ordinary deleted data, related media and derived copies within 30 days of the deletion request. This is a maximum cleanup deadline, not a 30-day grace period.
- Backups containing that ordinary deleted data must expire or be erased within the same 30-day window. Retries, copying a backup or delayed cleanup must not restart the deadline.
- Configure providers, exports, replicas, logs and caches to meet that deadline before launch. Do not claim a vendor default already does so. If a provider cannot meet it, change the configuration/provider or keep the release gate closed.
- Maintain a restricted deletion ledger through the recovery window. Before any restored system serves traffic, reapply deletions and verify that obsolete content, accounts, sessions and tokens cannot reappear. Remove no-longer-needed identifying ledger data after cleanup and backup expiry are verified.
- Necessary report/strike evidence follows the separate rules below; it is not a recoverable copy of the member's profile or feed. Bytes a member already captured outside Eve cannot be recalled.

### Reports and Evidence

- Retain only evidence necessary for an open case or appeal, accessible to authorized reviewers. Review open cases and retention necessity at least every 30 days; inactivity must not silently justify indefinite storage.
- Delete closed-case reports and evidence 180 days after both the case and associated appeals are closed, unless a documented hold applies. Apply the deadline to evidence copies/backups too; do not add another backup-retention period afterward.
- A hold records its specific purpose, affected records, responsible reviewer, expiry and next review date. Review holds at least every 30 days; renewal requires a recorded continuing reason. No blanket hold on all deleted accounts or content.
- Evidence necessary to support an active strike may have a documented hold through that strike's expiry or reversal. When a hold ends, use the original retention deadline; if it has already passed, erase the evidence rather than restarting 180 days.
- Expiration or deletion must never publish evidence, reveal reporters or connect anonymous aliases to real profiles. Keep only non-identifying operational metrics once the identifying records are no longer necessary.

### Voucher Strikes and Suspension

- A valid strike expires 12 months after its original issuance. Appeals, duplicate reports and job retries do not reset that date. Reversed or expired strikes do not count toward the three-active-strike threshold.
- Preserve D39: one strike per distinct confirmed offending account, including honest mistakes, and no recursive cascade. An expired strike is not reissued for the same finding merely to restart the clock.
- At three active strikes, suspend the voucher's entire account immediately. The suspension remains until fewer than three active strikes remain **and** an authorized human approves reinstatement.
- Expiry alone does not reactivate the account. Prompt a reinstatement review when the active count drops below three. The reviewer checks the current count and any independent restrictions; approve only when no other restriction prevents restoration. Record the decision and explanation.
- Reinstatement does not erase remaining valid strikes or restore independently revoked vouching rights. Apply the existing vouch eligibility/clean-standing rules separately from account access.
- Calculate active counts using server time on every relevant decision/read, not only a nightly job. Use idempotent scheduled processing to update notices and queue reviews. Serialize new strikes against reinstatement to prevent reopening an account with three active strikes.
- Keep a minimal private strike ledger during its active period and for 180 days after expiry/reversal for review/audit, then erase it unless a documented case hold applies. Account deletion removes public identity, not necessary private case evidence during its permitted lifecycle.
- External phone-voucher consequences remain deferred with that feature. These defaults do not change sanctions for unrelated misconduct.

## Verification Checklist

- [ ] Test immediate deletion denial, 30-day cleanup deadlines and restoration from an older backup; verify deadlines are not reset by retries or fresh snapshots.
- [ ] Test 180-day case closure, reopened appeals, hold expiry/review, and removal from all evidence copies without revealing reporter/anonymous identities.
- [ ] Test exact 12-month strike expiry, reversed strikes, duplicate findings, third-strike concurrency, expired strikes not being reissued, and reinstatement races.
- [ ] Test expiry dropping the count below three without automatic reactivation, manual approval, and independent sanctions remaining in force.
- [ ] Alert the team on overdue cleanup, expired holds and pending reinstatement reviews; cleanup errors cannot silently extend policy deadlines.

## Remaining Implementation Edges

These are tracked edge cases, not another general product-review round. They must be resolved before enabling the affected workflow, with conservative access behaviour and tests:

- An unsent named draft when account privacy changes: never silently widen its audience or publish it automatically.
- Deleting an individual comment that has replies: do not silently erase other members' contributions or leave deleted text visible.
- Deleting a circle with existing posts: reject the destructive action until an explicit content disposition is confirmed; do not widen posts or cascade-delete them implicitly.

No app code, deployment, provider configuration or legal review is claimed complete by this document.
