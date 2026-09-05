# Eve — Architecture & Interaction Spec

*Written 1 Sep 2026. Covers the composer, the feed, and the authorization model. Decisions here are load-bearing: per-post visibility is the product, so the read path is the security boundary.*

**Companion docs:** [product-v1.md](product-v1.md) · [conversation-log.md](conversation-log.md) · [roadmap.md](roadmap.md)

**Reconciled 6 Sep:** This is the current implementation contract for D30-D63, not an executable migration or evidence of tested enforcement. The historical schema, unsafe admission predicate and client-facing anonymous view have been removed. [product-v1.md](product-v1.md) defines behaviour; [release-readiness.md](release-readiness.md) defines release gates and approved lifecycle defaults. Older designs live in decision history, not in the implementation path.

---

## 0. The governing principle

Every post carries an audience. Every read must prove the reader belongs to it.

Authorization lives in the database through explicit privileges, row-level security and narrowly scoped database functions. The client is untrusted. Member requests must not use an unrestricted service-role query as a substitute for authorization.

Private identity/content tables are not directly exposed to clients. Database API functions derive the actor from the authenticated session, apply the common authorization contract, and return only a permitted projection. RLS is defence in depth, not a promise that table owners, service roles or security-definer functions cannot bypass it. All such privileged paths require explicit review and tests.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| App | Expo (React Native) + TypeScript. One codebase: native iOS first, Android next, web export for the pages non-members touch | Native was your call (D28). Expo keeps iOS, Android and the voucher web page in one repo |
| Web pages | Expo static web export on Cloudflare Pages, subject to deployment/terms checks before launch | Waitlist, authentication callback and vouch-link pages; launch member vouchers sign in, even on the web |
| Distribution | A friend's Apple Developer account: TestFlight public link for the cohort, App Store after. App Transfer to your own account later | Zero cost now. §1.1 lists what this forbids |
| Data & auth | Supabase (Postgres 15+) | **RLS is the reason.** Auth, storage and Postgres in one, and RLS gives us database-level authorization |
| Images and videos (D64) | Private Supabase Storage behind authenticated media delivery; video processing needs implementation/provider validation | Recheck source access on each request, including thumbnails, renditions, manifests, segments and byte ranges; never return a standalone bearer download URL |
| SMS | Twilio Verify + Lookup — **off until funded (D27)** | Lookup blocks VoIP and virtual numbers |
| Email | Supabase Auth over Gmail SMTP at launch → Resend once there's a domain | Magic links, vouch notifications |
| Analytics | PostHog | Cohort retention — instrument from commit one |
| Fingerprint | FingerprintJS (open-source build) on web; device install id + `expo-application` on native | Anti-self-vouch signal only, never an identity |
| Push | `expo-notifications` | Optional generic push plus recipient-private Activity under D61 |

### 1.1 What shipping through someone else's Apple account forbids

The app will be transferred to your own account later. To keep that possible and painless:

- **No Sign in with Apple.** Its user identifiers are team-scoped; after a transfer every user silently gets a new account unless migrated inside a 60-day window (TN3159). Email and phone auth mean the problem never exists. Apple only mandates Sign in with Apple when you offer other social logins, and we don't.
- **No iCloud, Game Center, Wallet or in-app purchase entitlements.** Some block a transfer outright, all complicate it. Entitlements are exactly two: push notifications and associated domains.
- **The bundle ID travels with the app.** Name it as if you'll keep it forever, because you will.
- **A transfer needs at least one released App Store version.** TestFlight alone doesn't count. The week-5 App Store submission is also what makes the app yours to move.
- **The vouch page can be web.** At launch an established member must authenticate before vouching; an applicant token is not proof of voucher identity. External phone vouchers remain deferred. Universal links open the app when installed and otherwise the content-free web flow.
- **App Review Guideline 1.2 (user-generated content)** requires filtering, reporting, blocking and a published contact address *before* the first submission, not after. Report and block ship in the submission build, not in v1.1. Anonymous posting draws extra scrutiny, so the moderation queue must visibly exist.
Vendor verification is deferred under D59; no vendor tables, admission branch or integration is required for MVP.

---

## 2. Data model

This data dictionary replaces the old partial SQL. Build versioned migrations and tests from it; do not copy historical SQL from the conversation log. Use UUIDv4 public identifiers, immutable server-assigned creation timestamps, foreign keys and explicit lifecycle states. UUIDs do not replace authorization.

### Storage and privileges

Store base tables in a non-exposed `private` schema. Revoke schema/table access from `PUBLIC`, `anon` and `authenticated`; apply restrictive default privileges to future objects too. Expose only an allowlist of API functions. Do not publish private tables through GraphQL, Realtime replication, storage metadata, analytics or generated relationship joins.

Use separate least-privileged roles for member-facing functions, moderation and cleanup. No client can write account eligibility, status, strike counts, vouch budgets or reviewer roles. RLS policies on base tables and privileged function bodies share the same authorization helpers. Never assume RLS protects a security-definer function owned by a bypass-capable role.

### Required records

| Record | Required fields / invariants |
|---|---|
| Accounts | ID linked to Supabase Auth identity; self-declared DOB/18+ gate; eligibility attestation; explicit public/private choice with no implicit default; onboarding state; admission time; tier; active/suspended/banned/deleting state; timestamps. Email changes go through verified Auth flows, not a profile-column update. |
| Profiles | Account reference, normalized unique handle, display name, avatar reference, bio, stats-public setting. Reserve `anonymous` at signup/rename. Return only D51/D52 fields; never DOB, contact details or admission evidence. |
| Follow requests | Requester, target, pending/approved/declined/cancelled state; one current request per pair; owner-only approval. No request grants audience access. |
| Follows | Unique follower/followee pair representing established follows only; no self-follow. |
| Circles and memberships | Circle owner/name; unique circle/member pair. Owner-authorized mutations and active admitted membership. Removal immediately revokes historical access. Do not let deleting a circle silently delete posts; use a restrictive reference until an explicit content disposition is confirmed. |
| Posts | ID, private author reference, text, media references, `audience_type` (everyone/followers/mutuals/circle), circle reference iff circle audience, immutable named/anonymous identity, comments-enabled state, creation/edit/deletion timestamps. Anonymous implies everyone and no circle reference. |
| Comments | Private author, root post, optional parent comment, text, immutable identity, edited/deleted state. Parent reply belongs to the same post; one level of replies. No independent audience. |
| Likes | Unique post/member pair, private liker reference; count/own-like projections obey D55. |
| Thread identities | Unique post/member mapping to random label/avatar; unique participant numbers within thread and distinct Author-number per post. Never exposed as account mappings. |
| Blocks | Directed private account pair; deny activity both ways. Opaque client reference plus original named/anonymous presentation; never expose anonymous targets' real identities. |
| Admission requests and decisions | Applicant, pending/approved/declined state, reviewer, decision time, private notes; one current request per applicant. Idempotent approved team admission. |
| Vouches and admission receipts | Applicant, authenticated member/team voucher, hashed expiring token, status, declaration affirmation and decision audit. Distinct voucher/applicant; unique qualifying affirmation per pair. Preserve minimal admission provenance independently of profile deletion so invitees do not lose admission. |
| Vouch policy and restrictions | Versioned launch threshold (one member vouch or approved team admission), budgets, waiting period, independent vouching restrictions; privileged updates only. Phone-vouch/vendor policy is not enabled at launch. |
| Reports, cases and strikes | Target/reporter private references, reason, review/appeal state, evidence references, outcome; one active strike per voucher/offending-account pair, issuance/expiry/reversal timestamps. D39/D62 apply. |
| Activity and devices | Recipient, source event/reference, read state, safe presentation; unique event/recipient key; owner-controlled push preference and private device tokens. |
| Media and deletion jobs | Private object ownership/source references, deleting/deleted state, idempotent cleanup progress and deadline, restricted deletion ledger for recovery. |
| Retention holds | Case/evidence scope, documented reason, reviewer, expiration and next review; not a blanket exemption from deletion. D62 lifecycle in release-readiness. |

Account privacy is not the old personal/business `account_type`. Business features and vendor verification remain deferred; no business signup or unused vendor schema is needed to implement the launch contract.

### Mutations and lifecycle

**D64 media scope:** Text, image and video posts are MVP requirements, with optional captions on media posts. Treat media as owned post attachments, not as an independent audience or public URL. Apply the same named/anonymous rules; no identifying original filenames, EXIF/location metadata or author-bearing storage paths in member projections. Validate actual file contents, dimensions/codecs and server-enforced upload limits; unprocessed/rejected files never become member-readable. Private thumbnails and video derivatives inherit the source post's authorization and D62 cleanup deadline. Range requests and streaming segments must reauthorize access just like full-file requests. Define production limits separately from provisional local-preview limits.

Create member accounts only through the validated signup flow; require email verification, adult self-declaration and explicit account privacy before completing onboarding. Email verification and DOB declaration do not prove membership eligibility.

Changing an eligibility declaration must suspend admission pending review, not silently expand access or erase moderation evidence. No public self-edit may increase tier or lift restrictions. D60 account deletion must not fail because a voucher is referenced by an invitee: retain only the minimal private provenance needed under D62 rather than cascading into invitee accounts.

Comment-parent removal and draft/account-switch edge cases remain explicit implementation items in [release-readiness.md](release-readiness.md). They are not permission to widen access or restore removed content.

---

## 3. Authorization

### Blocking requirements (D40)

Store a directed block from blocker account to blocked account, but deny member-content visibility and interaction when a block exists in either direction. For a post, evaluate the viewer against its real author before applying any audience grant. For a comment, require access to the parent and independently check the viewer against the comment's real author. This covers comments on third-party posts as well as named and anonymous posts. App-wide access, follows, mutuals, circles and any future audience exceptions cannot bypass a block.

For an anonymous target, accept an authorized post/comment reference and resolve its author privately on the server. Do not require or return a real account identifier. Enforce ownership of block mutations and use an opaque block reference for management. The blocker-facing record retains only the originating anonymous label/avatar presentation, not the real profile or other aliases. Do not notify the blocked member of the blocker's identity. Removing one member's block must not remove the other member's independent block.

Apply the rule to feeds, profiles, search, direct post/comment reads, media authorization, follow requests, replies, likes, mentions and notification generation/delivery. Invalidate affected cached content and suppress queued previews after a block; content already seen or downloaded cannot be recalled. Do not link hidden named and anonymous activity in API responses or block-management UI. Access changes can still permit inference, so this is not a guarantee of unlinkability.

Keep block records independent of moderation bans, voucher strikes and admission review. The shared contract below must be implemented and verified for posts and comments. Verify both directions, cross-thread anonymous aliases, comments on third-party posts, all audience types, direct endpoints, notifications, anonymous block management, and independent unblock behaviour when implementing it.

### Shared authorization contract

Apply mandatory checks before *every* audience grant, including ownership. Helpers are internal database functions, not client-callable probes accepting an arbitrary viewer ID.

```text
may_read_post(session, post):
    viewer = validated authenticated session account
    deny unless viewer has completed onboarding, is admitted (tier >= 2),
                meets launch eligibility and has active status
    deny unless post exists, is not deleted, and its author/content
                remains available under admission and moderation rules
    deny if either viewer or the real author has blocked the other
    allow if viewer owns the post
    otherwise allow only:
        everyone: admitted viewer already passed all mandatory checks
        followers: established follow of author
        mutuals: established follows in both directions
        circle: current membership of this post's circle
    deny all other cases
```

Comments require this parent check plus availability and a two-way block check against the comment's real author. Media, counts, profiles, search and notifications must apply the corresponding current-access checks. No extra-viewer or future audience feature may bypass these gates. D30's four audiences are the launch surface; additional per-post exceptions need a separate product decision.

Post creation requires an active admitted actor, server-derived ownership, a valid audience and circle ownership, authorized media references and D41 anonymity invariants. Reject unadmitted/suspended authors even when they supply their own account ID. Apply operation-specific ownership checks on edits/deletes, immutable identity and server-controlled metadata. Serialize relationship/privacy/deletion changes against dependent writes.

Account management is separate from reading member content: pending applicants can see their own admission status; suspended members can see their decision and appeal; account deletion uses reauthentication and ownership. None is a shortcut into member feeds.

Required negative tests: each audience with pending, suspended, banned and deleting viewers; unavailable authors; both block directions; former circle members; pending follows; forged author/viewer IDs; direct table reads/writes and concurrent access changes.

### Why evaluation happens at read time

**D53 owner-initiated follower removal:** Authorize the action as the followee/account owner, then atomically delete the target's established follow and all `circle_members` rows joining that target to circles owned by the removing account. Do not delete the reverse follow, other owners' circles, unrelated content, or create a block/strike. Apply this on both public and private accounts and invalidate affected relationship/feed/profile/media access state. Recheck parent-post access for comments and notifications under D35.

Do not send a follower/circle-removal notification. Ensure stale accepted requests cannot recreate the removed follow without a fresh authorized action: private accounts require a new request/approval, public accounts allow refollowing. Never restore circle memberships on refollow or approval; require an explicit owner addition. Serialize removal against relevant relationship writes and make retries safe. Voluntary unfollowing is outside this owner-removal decision. Verify both account privacy modes, multiple owner circles, preserved unrelated circles/reverse follows, historical content access, refollow without circle restoration and unauthorized removal attempts when implementing D53.

**D36 circle-write eligibility:** Active admitted women at Tier 2 or above can create circles immediately and manage circles they own. Enforce ownership on circle and membership writes. Do not apply the seven-day / Tier 3 requirement to these operations; it continues to govern member vouching. Circle creation does not bypass admission checks for the owner or added members.

Circle membership, follows, and tier all change. **D34 confirms that adding someone to a circle grants access to all existing posts in that circle**, plus future posts while membership continues. Evaluate current membership at read time, not membership at publication. Removing someone revokes circle-based access to all of that circle's past and future posts. Admission and other applicable restrictions still apply. Precomputed grants must not preserve access after removal or omit historical posts after addition.

Read-time evaluation costs performance. That trade is correct here, and §5 covers how to keep it fast.

---

### 3.1 Reaching Tier 2 — one function, two doors

**D59 launch override (5 Sep):** The launch routes are qualifying personal vouching and approved team admission. Offer Request team review to applicants without an existing member connection. Persist applicant, pending/approved/declined state, authorized reviewer, decision time and private review notes. Applicants may read their own status, not internal notes or other applications; only authorized team reviewers may decide. Do not accept client-written admission state. Pending/declined applications grant no member-content access and review requests cannot bypass onboarding or moderation restrictions.

An approved review uses the existing team-admission/vouch mechanism and the same server-controlled admission transition as a qualifying member vouch. Make approval idempotent and preserve reviewer attribution; retries must not create duplicate admission records. Member-vouch budgets, eligibility and D39 accountability remain unchanged. Test unauthorized approval, status/notes isolation, pending and declined access denial, duplicate approvals and attempts to admit a suspended account.

No ID/selfie verification or AI gender classification ships in MVP. Appearance, voice and document sex markers are not automatic eligibility gates. Future verification requires separate design review; no historical vendor or sex-marker branch may grant launch admission. Keep the no-verification-media-storage constraint.

### Admission transition

There is no vendor-pass branch in MVP. The server-controlled transition locks the applicant and relevant policy/vouch records, then checks completed onboarding, current eligibility and account restrictions. It accepts either an approved authorized team decision or the required distinct eligible member affirmation. Member eligibility, vouching restrictions, budget consumption and token use are validated atomically; caller-supplied counts or reviewer identities are never trusted.

Create one durable admission receipt and set Tier 2 idempotently. Ordinary voucher deletion must not revoke that receipt. Reviewed fraud or a change of eligibility requires an explicit admission decision; background jobs cannot restore a suspended, banned or deleting account.

Tier 3 retains the existing seven-day account-age and clean-standing requirement for vouching, with server-controlled budget accrual. Circle creation is allowed at Tier 2 immediately. Jobs must evaluate current admission/status and independent restrictions, not simply increment tier from account age.

All admission/status writes are privileged operations. No public tier recomputation endpoint, automatic vendor webhook or client profile edit may confer admission.

### 3.2 Vouch abuse review, restrictions and strikes (D38-D39)

Keep investigation-only vouching restrictions separate from account `status`, trust `tier`, and individual vouch status. Such a pause does not itself suspend the account or invalidate everyone she admitted. D39 separately requires account suspension at three active voucher strikes, including strikes for honest mistakes. Do not automatically blacklist phones or sanction other connected members.

Before implementation, add private moderation records for the subject (member ID or a verified phone-voucher identity when that path is funded), implicated vouches/accounts, evidence references, reviewer, reason, decision timestamps, restriction state, next review date, and appeal outcome. Restrictions need explicit active/paused/revoked transitions and an audited restoration path. Restrict access to authorized reviewers and expose only the subject's own decision summary and appeal status, without reporter identities or private reports.

Check applicable restrictions, established-member eligibility and available budget on every vouch issuance and affirmation, including pending requests created before a pause. Enforce these checks atomically so concurrent actions cannot spend budget or affirm a vouch after restrictions take effect. The admission transition, the Tier 3 job and clean-standing budget accrual must not clear a moderation restriction. A restriction blocks further vouching; existing affirmed vouches remain valid unless individually reviewed and revoked. If an admission relied on a confirmed fraudulent vouch, review that account's eligibility explicitly; do not revoke unrelated invitees or use a routine recomputation as a moderation decision.

An offending account's conduct and a voucher's intent are separate findings. Confirmed fake-account patterns or evidence of knowing ban evasion justify review; device/IP/timing overlap and report volume are only supporting signals. Record private voucher context, pause further vouching when credible coordinated-misuse evidence warrants it, restore investigation-only restrictions when concerns are resolved, and allow human appeal. Honest intent does not prevent D39's outcome-based strikes.

**D39 strike ledger and threshold:** record the voucher, distinct offending applicant, affirmed vouch reference, confirmed moderation finding, reviewer, timestamps, active/reversed status and reversal reason. Enforce one active strike per voucher/applicant pair; repeated reports, duplicate moderation events and job retries must not increase the count. Ordinary deletion, an unconfirmed report and a suspension caused solely by voucher strikes are not qualifying findings. Do not infer guilt from shared IP/device signals. If several members affirmed the same offending account, apply the one-strike rule to each responsible voucher.

Issue a strike and evaluate the threshold atomically, serializing concurrent updates for the voucher so the third active strike sets `accounts.status = 'suspended'` with a recorded D39 reason. This is an account-wide restriction: deny member content and participation through every access path, while retaining access to the decision notice and appeal. Vouch-token handling and tier/budget jobs must respect the suspension and must not reactivate the account. Suspension must not recursively penalize the suspended voucher's own vouchers or invalidate unrelated invitees.

On a successful factual or attribution appeal, reverse affected strikes, recompute the count and review any D39 suspension; do not clear unrelated sanctions. An honest-mistake explanation alone does not reverse a valid strike. D62 in [release-readiness.md](release-readiness.md) defines strike expiry and third-strike suspension/reinstatement. External phone-voucher handling remains deferred with that feature. Required checks include honest mistakes still counting, first/second strikes, suspension at the third distinct account, duplicate/concurrent events, overturned findings, unrelated restrictions, no recursive cascade, and no access or pending-token bypass after suspension.

### Business accounts (after MVP)

Business features are a separate future design, not an admission exception. Do not ship business membership, browsing, anonymous posting or a vendor/KYB integration in MVP. Revisit their data model when that work is approved; speculative schema stubs are not a guarantee against future migrations.

## 4. Anonymity

### Published post invariants (D41)

On post creation and update, enforce `is_anonymous` implies `audience_type = 'everyone'`, with no circle reference or narrower audience. Deny changes to a published post's `is_anonymous` value in either direction, including through bulk operations and direct API access. Content edits must preserve identity; named-post audience edits remain supported. These requirements must be enforced on the server/database, not only by hiding controls. The migration and mutation tests must implement these invariants.

D41 narrows D33's account-privacy transition operation to named posts: anonymous posts stay app-wide even when their account becomes private. Do not rewrite them to followers-only or reveal the author's identity. App-wide anonymous access still requires membership eligibility, no applicable block, and an available, non-deleted post. Comments inherit this parent audience under D35. D56 also fixes published comment identity; only its text can be edited by its author.

### Private authorship boundary

The member API must never return a real author ID/profile on an anonymous post or comment. This includes the owner's ordinary feed: ownership actions can be represented by booleans while the private My anonymous posts endpoint authenticates ownership internally.

Keep posts, real authorship and profile joins in the private schema from section 2. Expose narrowly scoped database functions for feeds, detail views and mutations, returning explicit typed fields and D37 aliases. Do not return whole base rows, private circle IDs or nested author objects from anonymous results.

Where a security-definer function is needed to read private tables, use a dedicated non-login owner with only necessary privileges, a fixed empty `search_path`, schema-qualified references, no caller-controlled SQL, and explicit authorization before projecting any data. Revoke default execution from `PUBLIC`/`anon`; grant only reviewed member functions to `authenticated`. Reviewer/cleanup functions must not be executable by member roles. Audit function ownership, grants and RLS behaviour in migrations.

A redacting `security_invoker` view is not the chosen boundary: it requires the invoking role's underlying relation permissions. Switching that flag off without an authorization design is not a fix either. See [PostgreSQL view permissions](https://www.postgresql.org/docs/current/sql-createview.html) and [Supabase function security](https://supabase.com/docs/guides/database/functions).

Test REST/RPC, GraphQL, Realtime, joins, filters, errors, logs and media metadata for disclosure and cross-thread identity linkage. Block management also uses opaque references. Staff access is separate, least-privileged and audited; anonymous means anonymous to members, not untraceable to authorized Eve reviewers.


**Three leaks to close:**

1. **Post counts.** A profile showing "24 posts" when 19 are visible tells you five are hidden. Count only non-anonymous posts in public profile stats.
2. **Ordering and IDs.** UUIDv4, not v7 or sequential — v7 embeds a timestamp, which correlates an anonymous post with anything else posted at that moment.
3. **Style and timing.** Unsolvable technically. A small community will sometimes recognise a voice. Say so in the UI copy — "anonymous to other members" is honest; "completely anonymous" is not.

### Comment visibility and identity (D35)

Comments derive visibility from the parent post's current audience; do not store an independent comment audience or a snapshot of viewers. Apply the parent authorization check to comment reads and creation, alongside applicable account and moderation restrictions. Account privacy and circle membership changes therefore affect existing comments as well as posts. A removed or inaccessible parent must not leave a readable comment endpoint or notification preview.

Enforce on the server that an anonymous comment can be created only when the parent post is anonymous. Named posts offer named comments only; anonymous posts offer named or anonymous comments. The client must mirror this rule by showing the identity control only for anonymous parents. Use the same identity-redaction boundary as anonymous posts and preserve comment anonymity when audiences change. D41 prohibits published posts changing identity modes, so a parent edit cannot turn an anonymous thread into a named one.

**D55 explicit identity selection:** For each new comment/reply on an anonymous parent, present Post as anonymous / I don't care before submission and require a deliberate selection for that draft. Map Post as anonymous to anonymous identity and I don't care to the member's normal named profile identity, not an unspecified or random choice. Do not carry a named selection forward into the next new comment. Preserve the selected value on retry of the same unsent draft, but do not submit automatically. Require an explicit identity value in the write request rather than defaulting an omitted value to named; keep D35 server validation and comment-closure/admission/block checks. Anonymous choices reuse D37's per-thread label and avatar.

### Anonymous-post likes (D55)

Keep real liker membership private for uniqueness, unlike actions and access enforcement. Member-facing reads for anonymous posts return only an authorized aggregate count under the existing visibility policy and the viewer's own liked/unliked state. Neither the author nor another reader may enumerate liker IDs, names, avatars or per-person timestamps through lists, filters, realtime events, notifications or related profile queries. Do not emit a named like notification for an anonymous post. A count-publication opt-in never grants access to liker identities. Named-post rules are unchanged.

Verify author/reader denial of liker enumeration, count visibility, the viewer's own like/unlike, notification payloads, and explicit identity selection on new anonymous-parent comments alongside D35/D37/D43 checks when implementing D55.

### Comment controls (D43)

Persist a per-post comments-enabled state on creation and allow the post owner to close or reopen it afterward, for both named and anonymous posts. Enforce ownership on changes and check the current state server-side on every new comment/reply, including author replies, direct API requests and retries. Serialize new-comment creation against closure so a request cannot commit after the closure operation using a stale permission check. Preserve an unsent draft when rejected; do not automatically publish rejected replies when comments reopen.

Do not use this state in comment-read authorization: existing comments remain visible under parent audience, blocking and moderation rules. Closure does not delete comments, change identity/audience or disable reporting/blocking. Reflect the state in the composer, owner post actions and reply controls. Verify disabled-at-publication, close/reopen, unauthorized changes, concurrent submissions and preserved existing comments for both post types when implementing this requirement.

### Comment deletion permissions (D44)

**D56 comment edits:** Permit text edits only by the comment's authenticated real author, under applicable account, block and parent-access restrictions. Post ownership alone never grants text-edit rights. Keep the comment's author, parent reference and named/anonymous identity immutable on member-facing updates; do not regenerate anonymous labels or avatars. Persist a server-controlled edited timestamp/flag only when text actually changes and render Edited wherever that comment is shown. Do not offer D55's identity prompt during editing. Deny attempts to edit removed comments or revive them through an update. Verify owner edits, unrelated-member/post-owner denial, no-op updates, fixed identity in both directions and retained deletion permissions when implementing D56.

Authorize member-initiated comment removal when the authenticated account is either the comment's real author or the parent post's real author, subject to applicable account restrictions. Resolve ownership privately for anonymous activity. Do not accept client-supplied author IDs as proof, and do not reveal them in responses. Post ownership grants removal permission only, never permission to edit someone else's comment text or identity. Closed comments still allow authorized removal.

Exclude removed comment content from member-facing lists, direct reads, media access and future/queued notification previews; invalidate relevant cached views. Keep report handling separate: removal must not automatically issue moderation or voucher strikes, and must not cancel or expose an existing report. Evidence follows D62 in [release-readiness.md](release-readiness.md), not indefinite retention. The display/treatment of replies attached to a removed comment remains a tracked implementation edge; do not silently delete other members' contributions.

Verify removal by the commenter and post owner, denial for an unrelated member, no editing rights over another writer's text, both identity modes, closed-comment management, excluded removed content and unchanged report/strike state when implementing D44.

### Irreversible post and conversation deletion (D57)

Authorize post deletion as the real post owner, including anonymous ownership without revealing identity. Atomically make the source post and all descendant comments/replies inaccessible, then complete removal of associated media and derived records with idempotent cleanup. Serialize deletion against new comments, edits and any future sharing so no operation can resurrect or create an accessible child of a deleted post. A deletion marker is an internal cleanup/access mechanism, not a reversible archive; do not expose an undelete operation or allow member writes to clear it. Apply irreversible deletion to individual comments under D44 as well.

Invalidate feeds, profiles, owner anonymous collections, counts, media access, in-app activity and queued previews. Recheck source existence/access on subsequent reads; disconnected clients must discard deleted content on reconciliation, and bytes already captured outside Eve cannot be recalled. Deletion confirmation must state that the post and its comments are deleted without undo. Preserve report handling under D44, implement D62 deadlines and prevent backups or synchronization from republishing user-deleted content.

**After-MVP DM contract:** Store shared-post references, not independent copies of post text, media or comments. Every recipient read requires current source audience, admission and block authorization. On source deletion, remove all related shared-post message items and previews, leaving unrelated conversation messages untouched. Ensure a stale/offline share cannot recreate the item. Any cleanup delay must not make the referenced content readable. This is a future messaging requirement, not new MVP scope.

Verify owner-only deletion, named/anonymous posts, all comment descendants, irreversible update/restore denial, concurrent writes, unavailable media/previews and no restoration on reconnect when implementing MVP deletion. Verify DM reference removal, recipient authorization and unchanged unrelated messages when messaging is built later.

### Account deletion requirements (D60)

Provide an owner-only Settings action with recent reauthentication and explicit irreversible confirmation. Atomically mark the account as deleting, deny account access and hide its profile, named/anonymous posts, comments and other activity from member-facing reads before acknowledging success. Revoke sessions and pending authentication/admission tokens; authorization must reject the deleting account even while credentials or cleanup jobs remain outstanding. Prevent concurrent writes, vouches, admission recomputation or profile updates from restoring access or publishing new activity.

Use retryable, idempotent cleanup for the account's posts and all their comment descendants under D57, its own comments/likes elsewhere, media, follows in both directions, pending follow requests, circle memberships and owned circles. Invalidate search, feeds, counts, notifications and cached previews. Do not cascade deletion into unrelated members' posts or accounts. Remove private anonymous identity mappings when no longer needed by the defined evidence lifecycle, without exposing the real account behind an alias. Future DM shares of removed source posts follow D57; this does not add messaging to MVP.

Preserve admission for members previously vouched for by the deleting account. Do not let foreign-key cascades, nightly tier recomputation or removal of vouch records implicitly revoke their membership or generate strikes. Separate necessary private admission/audit records from the deleted member-facing profile. Ordinary account deletion is not a moderation finding and must not trigger D39 penalties; existing reports remain reviewable under restricted access.

Implement the approved D62 evidence and backup retention/deletion lifecycles. Retain only necessary private evidence, not a restorable account archive. Cleanup and backup recovery must preserve deletion decisions rather than republish deleted data. Test reauthentication/ownership, immediate read/write denial including existing sessions, named/anonymous cleanup, comments elsewhere, relationship cleanup, retry/concurrency safety, unaffected invitees and no restore on reconnect or backup recovery. D62 deadlines and approved suspension/retention rules are centralized in [release-readiness.md](release-readiness.md). These are requirements, not an implemented deletion pipeline.

### Thread identities and username reservation (D37)

Maintain a private mapping from root post and member to a random display number and cartoon avatar asset. Assign once on the first anonymous participation, persist across reloads and replies, and allocate independently in each thread. Enforce uniqueness of the participant mapping and of display numbers within a thread, with collision retries under concurrent creation. Do not derive display numbers or avatar choices from account identifiers, handles, real avatars, or signup order.

At anonymous post creation, assign and persist a random author display number unique across anonymous posts, with collision handling. Render `Author <number>` on the post and on the owner's anonymous replies. Allocate a new number for every new post, including posts by the same member. Ownership determines the Author role; the number identifies the thread, not a public account.

Return only the display label and cartoon asset reference to authorized readers, never the mapping's member ID or a real-profile link. Reuse the thread's Author-number label for the original poster instead of allocating an Anonymous-number commenter label. Keep named comments separate from anonymous presentation; do not expose their shared mapping to clients. The cartoon asset must carry no real-account identifier.

Reject the exact normalized username `anonymous` case-insensitively at signup and on any later username write, using server/database enforcement as well as form validation. A case-insensitive uniqueness constraint alone does not reserve names. Implement both reservation and uniqueness in the database.

### Profile counts (7.4)

**D52 people search:** Provide an authenticated, admission-gated search over real handles and display names. Only eligible active member profiles may appear. Filter blocks in both directions before results or result counts are returned. Return the D51 basic result projection (avatar, display name, handle, and authorized profile navigation reference), never email, phone, DOB, verification data or anonymous identity mappings. Private-account status does not prevent basic discovery but does not grant access to restricted posts or create a follow.

Use bounded paginated queries and apply the same restrictions to suggestions/autocomplete if implemented. Search must not join anonymous thread labels or numbers to real profiles. Enforce visibility on the server as well as result rendering. Verify username/display-name matches, duplicate display names distinguished by handle, private-profile navigation, pending follows, blocked accounts in both directions and denial for unadmitted viewers when implementing D52.

**D51 private profile preview:** For eligible admitted viewers with no block in either direction, expose avatar, display name, handle and bio before follow approval. Show Request to follow or Requested based on the viewer's actual request state. Include authorized app-wide named posts; apply the existing follower, mutual and circle checks independently to restricted named posts. Do not gate the entire named-post list on follower approval, and do not expose restricted posts merely because the viewer can see the profile. Keep anonymous posts excluded under D42 and preserve existing private-statistics rules. The data dictionary includes avatar/bio and separate follow requests; implement their projections and permissions together. Verify non-followers, pending requests, approved followers, eligible circle members, blocked viewers and unadmitted users on both UI and direct profile/post queries.

**D42 profile separation:** Profile post lists and their visible counts exclude anonymous posts, regardless of account privacy, follow approval, circle membership or public-statistics opt-in. Do not expose anonymous posts through real-author profile queries, username search, profile activity lists or author-filtered count endpoints. An authorized reader may see an anonymous post in the anonymous section without being allowed to discover its real author through a query filter.

Provide a separate My anonymous posts collection bound to the authenticated owner, rather than a caller-supplied author ID. Only the owner can list and manage that collection through the member-facing API; apply existing ownership, account eligibility and immutable-identity rules to edits/deletion. Its responses must not be placed in shared/public caches. The public profile surface remains separate even when viewed by its owner. Verify anonymous posts and counts stay absent for strangers, followers and circle members, and that requesting another owner's collection fails.

Follower and like counts are private to the owner by default. The profile API exposes them only when `stats_public_at is not null` or the viewer is the owner; its database mutation prevents opting in during the first 30 days. Enforce this in database projections, not the client — a public count is the one scoreboard 7.5 says we don't copy, so leaking it through an API is a product bug, not a cosmetic one.

---

## 5. The feed

**D48 feed contracts:** Implement Following, Community and Anonymous as distinct chronological queries over the same authorized posts. Following requires a named post and an established follow of its author, plus current post access; permitted Circle posts from followed accounts are included. Community requires a named post with audience `everyone`. Anonymous requires `is_anonymous` and audience `everyone` under D41. Apply membership, block, deletion and moderation checks in every path. Sort newest first with stable cursor pagination; paginate each feed independently.

Never use anonymous authorship or the viewer's follow graph to route anonymous posts into Following. Never include restricted named posts in Community. The query/cursor contract below replaces the old combined-feed sketch. Verify feed separation with named/anonymous posts, all named audiences, pending/approved follows, circle access and blocks.

### Query and cursor contract

Each feed endpoint runs inside the authorized database boundary, deriving viewer identity, follows and circle membership from server state. Never trust client-supplied membership flags or relationship arrays. Apply visibility and feed selection before pagination, then project only safe fields. Following filters named authors internally; Community filters named/everyone; Anonymous filters anonymous/everyone.

Order by immutable `(created_at DESC, id DESC)`. A cursor contains both values from the last returned row and the feed identifier; validate its shape and feed before use. First page has no cursor. Subsequent pages use lexicographic `(created_at, id) < (cursor_created_at, cursor_id)`. UUID is only a tie-breaker, not an access token.

Do not query a redacted view for private relationship fields. Circle filtering uses the base post's private circle reference *inside* the authorized function; the client does not need `audience_circle_id` to filter its own feed.

Create indexes beginning with relevant author/audience/circle fields and ending in `created_at DESC, id DESC`, filtered to non-deleted rows where appropriate. Measure query plans with realistic data; RLS does not automatically imply a sequential scan. Fan-out-on-read is the starting approach, to be revisited from measured latency.

Test more than one page of equal-timestamp posts, first/last pages, deleted cursor rows, malformed/wrong-feed cursors and access changes between pages. No timestamp-tie omissions or duplicated IDs in an unchanged dataset. Current-access rechecks take precedence over preserving a frozen snapshot.


### The Anonymous feed uses the same posts (D48)

Use the same posts table and anonymous index, filtered to `is_anonymous` with the app-wide invariant from D41 and all applicable authorization checks. D48 names this feed Anonymous and separates it from the two named-post feeds, Following and Community.

---

## 6. The composer

### Layout

```
┌───────────────────────────────────────────┐
│  ◆ Everyone on Eve                   ▾    │   ← audience, always visible, at the top
│  ────────────────────────────────────     │
│                                           │
│   What's on your mind?                    │
│                                           │
│                                           │
│  ────────────────────────────────────     │
│  🖼  Photo        Posting as: You     ▾   │
│                                    [Post] │
└───────────────────────────────────────────┘
```

### Rules, and why each exists

**The audience control sits above the text field, always visible.** Facebook spent years learning this: when the audience selector lives *after* the composition, people write for an imagined audience, then discover the setting. Choosing the room before you speak is the correct order, and it's the whole thesis of the product — putting it at the bottom would contradict the thing being built.

**D32: new-post defaults follow account privacy.** Private accounts default to Followers; public accounts default to Everyone on Eve. Each post can override that audience without changing the next new post's default. There is no preferred-audience setting and no last-used audience persistence. Changing account privacy changes the default. Persist account privacy explicitly in the account record. D33/D41 below settle existing-post behaviour; unsent drafts remain a tracked implementation edge in release-readiness.

**D33/D41: account privacy transitions affect named posts only.** Private to public changes named non-circle posts to `everyone`, including explicit Followers/Mutuals posts. Public to private changes app-wide named posts to Followers and preserves narrower audiences. Circle posts stay circle-only and anonymous posts stay app-wide. Perform the privacy change, named-post updates and D54 pending-request acceptance atomically. Preserve identities, invalidate affected reads/media, and apply D35's inherited comment visibility. A private account may deliberately publish a new app-wide named post afterward.

**Widening asks for confirmation; narrowing never does.** Moving from Followers to Everyone on Eve shows a one-line confirm. Switching an account to public must explain that existing non-circle posts become app-wide (D33). This confirmation does not change the chosen transition rule.

**D54 pending requests on account transitions:** Within the authorized private-to-public transition, accept currently pending requests from eligible admitted accounts with no block in either direction and create their established follow relationships. Couple request-state and follow updates atomically with the privacy transition, serialize against cancellation/removal/block changes, and make retries idempotent. Do not revive cancelled/declined/previously removed requests or create/restore circle memberships. Public-to-private transitions preserve established follows. The confirmation must disclose pending-request acceptance alongside the D33/D41 named-post effects. Verify pending acceptance, blocked/ineligible request exclusion, cancellation races, no duplicate follows, no circle restoration and persistence after returning to private.

**Use the four approved audiences.** Close friends are selected through Circle membership. The historical mixed-membership "+ add specific people" exception is not part of the launch composer.

**The identity dial shows a live preview.** Switching to Anonymous re-renders the avatar and name in the composer as they'll appear to others. People need to *see* their name disappear, not read that it will.

**D41's anonymous composer rules:** Anonymous mode fixes the audience to Everyone on Eve and removes the audience selector, displaying the fixed audience instead. Named drafts use D32 defaults and audience choices. Published-post editing never offers an identity switch, and anonymous-post editing never offers an audience switch. Apply D33 account privacy transitions only to named posts. Verify anonymous creation from both private and public accounts, attempted narrower audiences, identity edits in both directions, account privacy switches, and continued block/admission enforcement.

**Published posts keep a persistent audience badge**, visible to the author on her own posts forever. She should never have to remember who could see something — she should be able to look.

**D35 resolves comment visibility:** comments follow their parent's current audience, including widening under D33 and history access under D34. The reply composer has no audience dial. Its identity dial appears only on anonymous posts. This applies to both direct edits and account-privacy transitions.

---

## 7. Empty states

Day one is a design problem, not a content problem. Your 4.5 answer already had it right; this is the implementation.

**Never render a blank feed.** A first-run feed shows the Founders' Board — real posts and real anonymous rants from the founding cohort, seeded before anyone else is admitted. Admit the founding cohort first; do not expand beyond it until the readiness gates pass and the Founders' Board is seeded.

**Pending applicants see admission status, not a feed.** Offer personal vouching or Request team review, and owner-only updates. Never show member-content placeholders, counts, previews or a public-post lobby before admission.

**Every empty state names the next action.** No illustrations of empty boxes, no "Nothing here yet."

---

## 8. Security checklist

### Reporting and review status (D58)

Provide authenticated report creation for posts, comments and accounts using a validated reason (harassment, exposed private information, impersonation/fake account, spam, another concern) plus an optional explanation. Derive the reporter from the session and resolve anonymous targets privately; never accept a claimed reporter ID or expose the target's real identity. Validate access to the reported target at submission under the applicable membership/access rules.

Persist the target reference, reporter, reason, optional explanation, received/reviewed timestamps, reviewer and final outcome. Expose only the reporter's own receipt/status projection to member clients: Received, Reviewed, then Action taken or No action taken. Keep reviewer notes, other reporters and identity mappings restricted to authorized reviewers. Do not give the reported member access to reports or reporter identities. Use generic external status notifications under D45.

Report submission must not directly mutate content visibility, account status or voucher strikes. Authorized human review determines findings and any D38/D39 action, with an audited outcome. Deletion does not cancel reports or allow status links to restore deleted content; use the approved D62 evidence-retention lifecycle. Verify target types, optional explanations, report ownership, reviewer-only transitions, anonymous identity protection and no submission-triggered penalties when implementing D58.

### MVP Activity and optional push (D61)

Implement a recipient-private Activity stream for comments/replies, follow requests and approvals, vouch requests, admission updates, report outcomes and D46 capture alerts. Derive recipients from authorized source events, not client-supplied recipient/actor identities. Make event handling idempotent and allow only the recipient to read or mark her own activity as read. Do not emit like notifications in-app or through push; D55 like storage and count rules are unchanged.

Check current access at event generation, Activity rendering, push dispatch and destination opening. Suppress inaccessible social activity and invalidate cached previews after blocks, audience changes or deletion. Notification references are not access grants. Resolve anonymous post/comment actors using the existing thread identity, never by exposing private member IDs, real profiles or cross-thread mappings. Preserve deliberately named comment identities and D46's in-app capture-viewer identification. Admission/status notices use owner-only access without granting pending applicants access to member content; report outcomes expose only D58's recipient-safe projection.

Persist an owner-controlled social-push preference in Settings; declining or disabling push does not remove in-app Activity. Use generic external text with no names, content snippets, images or identity-bearing metadata. Route via an opaque notification reference and fetch authorized details inside Eve. Recheck preference and account state before dispatch, and invalidate device tokens on logout/account deletion as applicable. In-app admission and review updates remain available without push permission.

Verify recipient isolation, read-state ownership, duplicate events, preference changes while queued, anonymous versus deliberately named comments, capture alerts, pending-applicant isolation, generic external payloads, stale destinations, revoked access and absence of all like notifications. Implementation remains pending.

### No external member-content sharing (D45)

Do not implement external share sheets, copyable post links, public post rendering, embeds, cross-posting or save/download actions for posts, comments or media. Public web routes and link-preview responses expose no member content, author identity, protected post metadata or media. App-internal navigation and authorized content requests remain necessary, but their references are not externally shareable access grants. Public invitation/authentication/vouch routes must not embed or preview member posts.

Use generic push/email notifications that open the relevant authorized view in Eve; do not put member text, media or author identity in notification payloads or previews outside the app. Recheck current membership, audience, block and moderation state when the destination opens. In-app forwarding remains out of scope unless separately approved.

Use authenticated, authorized media delivery: a standalone bearer URL is not an audience check and must not become an external viewing path. Keep storage credentials and internal delivery URLs out of member responses and sharing/preview surfaces. No public buckets or public content caches. Authorized device rendering still cannot guarantee that a member will not capture or manually copy content.

Verify absence of external-sharing controls, member content on public pages/link previews, and sensitive notification payloads, plus denial of unauthenticated post/comment/media reads. Keep evidence-based reporting/moderation for redistribution separate from claims of complete technical prevention.

**Authentication**
- Launch (D27, zero budget): email magic link only. Single-use, 10-minute expiry, max 5 per address per hour, 10 per IP per hour
- When SMS is funded — OTP: 6 digits, 10-minute expiry, max 5 per phone per hour, 10 per IP per hour, lockout after 5 failed attempts
- **Never leak registration status.** "We've sent a link" (or "a code") is the response whether or not the address or number exists — anything else is a user-enumeration oracle
- Future SMS path only: validate supported number types when phone verification is approved and funded; no phone check blocks launch email/team admission

**Vouch tokens**
- 32 bytes from a CSPRNG, **stored hashed** (SHA-256) — a database read must not yield working links
- Single-use, 24-hour expiry, bound to one applicant and one slot
- Rate-limited per applicant; a burst of vouch requests is itself a signal

**Anti-self-vouch**
- Future phone-vouch path only: enforce distinct verified phone identities; launch member vouches use authenticated member identities
- Shared device fingerprints are review signals, not proof of self-vouching or intent; do not automatically sanction shared-device households (D38)
- Same IP within 10 minutes → flag for human review, never auto-block (households and carrier NAT share IPs legitimately)

**Data**
- Private schemas, restrictive grants/default privileges and reviewed database API functions as specified in sections 2-4; test each role and every exposed transport.
- Authenticated media delivery must check source authorization on every request, including thumbnails/range requests. No redirects to bearer URLs, public buckets or shared caches. Already downloaded bytes cannot be recalled.
- Keep verification media out of Eve; vendor checks and external phone vouchers are deferred. Do not collect unused phone/vendor data in anticipation of later features.
- Apply [D62 lifecycle rules](release-readiness.md) to operational data, reports, strikes, deletion jobs and backups. Prove recovery cannot republish deleted content.

### Close-friends capture detection and alerts (D46)

Track currently visible Circle posts/media/comment views while the app is foregrounded. On a supported screenshot callback, record the authenticated viewing account, relevant visible post IDs, event type and time; do not attribute off-screen/preloaded content. For recording/capture-state callbacks, handle both state transitions and an already-active session when protected content becomes visible. Deduplicate repeated callbacks per viewer/post/capture session, while treating separate screenshots as separate events. Scope owner alerts to the Circle content actually displayed, excluding the owner's own captures.

Submit through an authenticated endpoint that derives the actor from the session, verifies the target/owner and authorized viewing context, validates the payload and rate-limits/deduplicates delivery. Preserve event-time visibility context for delayed delivery and do not treat a client report as tamper-proof evidence. Store only event metadata needed for the owner notice; do not access/upload captured image or video files. Only the relevant owner can read the member-facing capture notice. Use generic external pushes and fetch event details inside Eve under D45; recheck applicable block/account restrictions before delivery.

Detecting capture does not prove which pixels were saved, whether a recording file exists, who physically held the device or whether anything was redistributed. Wording must distinguish screenshot events from recording/mirroring state. Expose supported/unsupported detection accurately, give viewers notice of close-friends capture alerts, and issue no automatic moderation or voucher strike from an event alone. No new capture-prevention requirement is introduced.

**Platform references checked for this specification:**

- [Apple screenshot notification](https://developer.apple.com/documentation/uikit/uiapplication/userdidtakescreenshotnotification): event fires after capture and contains no screenshot payload.
- [Apple scene capture state](https://developer.apple.com/documentation/swiftui/environmentvalues/isscenecaptured): state covers recording, mirroring and other scene capture. Use the appropriate supported native API for the app's iOS target; do not call it proof of a saved recording.
- [Android screenshot detection](https://developer.android.com/about/versions/14/features/screenshot-detection): Android 14+ activity callbacks, with documented method limitations and no image payload. Observe lifecycle and declare the required permission.
- [Android recording detection](https://developer.android.com/about/versions/15/features#screen-recording-detection): Android 15+ visibility callbacks; inspect initial state as well as changes and configure required permission/lifecycle handling.
- [Expo ScreenCapture](https://docs.expo.dev/versions/latest/sdk/screen-capture/): use screenshot listeners where supported; recording-state support may require a native bridge. Do not assume the screenshot listener detects recording. Avoid adding broad photo-library access solely for legacy screenshot detection; mark unsupported coverage instead.

Before shipping, verify on physical supported iOS/Android devices: screenshots, recording started before/after opening a Circle post, feed visibility changes, mirroring wording, foreground/background transitions, duplicate/offline events, owner-only notices, unsupported methods, and no alerts for non-circle content. Neither generic Expo support nor a simulator check establishes complete capture coverage.

**Honest limits — write these in the product copy, don't hide them**
- **Content capture cannot be completely prevented.** D45 removes external sharing surfaces, but screenshots, manual copying or photographing a screen remain possible. State the community rule and reporting path without promising that content can never leave a device. Platform capture controls, if later added, are only an additional deterrent.
- **Widening a post's audience is retroactive; narrowing it is not.** People who already saw it, saw it
- Anonymous means anonymous to other members, not to Eve

---

## 9. What to build in what order

1. Auth/onboarding, private schema migrations, grants, authorization helpers and negative-access tests.
2. Synthetic test-account admission, named posting, all audience rules and stable feeds.
3. Anonymous projections/thread identities, comments, likes, profiles, search, circles and relationship transitions.
4. Real admission/vouch/team-review workflows, report/moderation/appeal tools, strikes and D62 expiry.
5. Deletion/media protection, lifecycle jobs, Activity/push preferences and device-tested capture alerts.
6. Verify every gate in [release-readiness.md](release-readiness.md), then seed and open the real-member cohort.
7. Meet App Store submission requirements, measure retention and expand only after the separate expansion gate.

These steps may overlap; no date authorizes skipping a release gate. Local demos use synthetic data until real-member protections pass.
