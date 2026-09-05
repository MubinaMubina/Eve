# Eve - To-do After MVP

Features deferred from the MVP. Items here are for later review, not current build commitments.

## Verification Upgrades

- [ ] Revisit identity/age/liveness verification after MVP if admission abuse or team-review workload warrants it (D59).
- [ ] Evaluate provider-hosted capture, cost, coverage, accessibility, retention/deletion and minimal returned data before choosing any vendor. Do not store IDs, verification selfies or face templates in Eve.
- [ ] Design admission and appeal rules separately from identity checks; do not use AI gender classification, appearance, voice or document sex markers as definitive proof of membership eligibility.

Launch uses personal vouching plus Request team review. Upgrades require a new decision; no vendor integration or automatic vendor-based admission is approved for MVP.

## Saved Posts / Bookmarks

- [ ] Revisit and design an in-app save-post option after MVP (D49).

Proposed behaviour to review:

- Private saved-post list, visible only to the member who saved it.
- Saving creates an in-app bookmark, not a download or external export.
- Access follows the post's current audience, blocking and moderation rules. A bookmark cannot preserve access after deletion or loss of eligibility, including removal from close friends.
- Anonymous posts retain their Author-number labels without revealing the author.

No bookmark UI, storage or implementation is included in the MVP.

## DMs and In-App Post Sharing

- [ ] Revisit DMs after MVP under the existing deferred messaging scope.
- [ ] Apply D57 to shared posts: a recipient can view them only while eligible under the original post's current audience, admission and blocking rules.
- [ ] Keep shares as references to the source post, not independent content copies.
- [ ] Deleting a source post must remove every shared-post item and preview from DMs while preserving unrelated messages. Verify stale/offline shares cannot restore it.

Post deletion also deletes its comments/replies and cannot be undone. Messaging remains outside MVP; this records the approved future deletion behaviour, not a full messaging specification.
