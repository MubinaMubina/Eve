# Eve — Conversation Log

*Working sessions, 30 Aug – 4 Sep 2026. This is a record of what was decided and why, not a transcript. The reasoning is the valuable part — the conclusions alone won't survive contact with a co-founder or an investor question.*

**Files in this project**
- [questions-before-code.md](questions-before-code.md) — the 39-question thinking pass, with your answers
- [product-v1.md](product-v1.md) — product spec, current as of 4 Sep
- [architecture.md](architecture.md) — composer, feed, data model, authorization, security
- [roadmap.md](roadmap.md) — the rebuilt six weeks
- [todo.md](todo.md) — the checklist, the zero-budget configuration, and the spend ladder
- [to-do-after-MVP.md](to-do-after-MVP.md) — deferred features for later review
- [conversation-log.md](conversation-log.md) — this file

---

## 1. Where the idea started, and where it landed

**Started as:** "Instagram but only for women — a combination of Reddit, Snapchat and YouTube in an Instagram structure." A feature mashup with no wedge and an unbuildable scope.

**Landed on:** a single primitive.

> **On Instagram, privacy is a property of your account. On Eve, it's a property of every post.**

**The insight underneath it**, from your own answer at 0.1: *most girls on Instagram keep two accounts, one for people they know and one for close friends.* Millions of women run a finsta because Instagram offers exactly one privacy switch applied to everything at once. That's not a hypothesis — it's mass observable behavior, and every finsta is a person telling you the product is wrong.

**Why Meta won't take it seriously:** they already tried. Close Friends is this idea in its most minimal form — one binary list. It stays crude because fragmenting distribution is against Instagram's business model. Their revenue depends on maximizing how many people see each post; yours depends on constraining it. That's a strategy conflict, not a feature gap.

---

## 2. Decision log

### D61 - MVP notifications; pre-build decision pass complete *(5 Sep, user's approval)*

In-app Activity covers comments/replies, follow requests and approvals, vouch requests, admission updates, report outcomes and close-friends capture alerts. Push is optional and generic, with no names, member text or photos outside Eve. Settings can disable social push without disabling in-app Activity. Anonymous post/comment notifications retain the source thread's aliases; deliberately named comments and D46 capture alerts keep their approved in-app identities.

Current access governs notifications and their destinations; no bypass of admission, privacy changes, blocks or deletion. No like notifications in MVP, while likes themselves remain. Pending applicants can receive their own admission status without member-content access.

This completes the final three-decision pass (D59-D61). Move next to reconciling the architecture/schema and authorization requirements for implementation, not another general product-question round. Existing explicit implementation details and deferred items remain tracked; completion of this discussion does not mean the old SQL is ready to execute or the app is built.

### D60 - Permanent account deletion *(5 Sep, user's approval)*

Delete account lives in Settings with reauthentication and an irreversible confirmation. Immediately hide the profile/content and end access; permanently clean up all of her named and anonymous posts and their replies, her comments/likes elsewhere, follow relationships and circle memberships/owned circles. No undo or account restoration. Immediate disappearance is distinct from background deletion completing; do not promise instant erasure of all stored copies.

Previously vouched-for women retain their accounts, with no automatic strikes or suspensions from ordinary deletion. Existing reports remain reviewable; necessary evidence is private and subject to a defined retention policy, not visible/restorable content. D57 governs deleted posts, including future DM shares. Product and implementation requirements updated; implementation and specific retention lifecycles remain pending. This settles the second of the final three pre-build decisions.

### D59 - Personal vouching with team-review fallback at launch *(5 Sep, user's approval)*

Keep personal vouching as the main launch admission route. Applicants who do not know an existing member can select Request team review; authorized team approval uses the existing team-invitation route. Until admitted, applicants cannot access member content. Reporting and human review continue after admission; no route guarantees that every account is eligible or will behave safely.

Do not use AI to decide whether someone looks like a woman, or treat appearance, voice or a document sex marker as definitive membership proof. Eve's women-only, trans-inclusive scope and existing member-vouch rules remain unchanged. ID/selfie checks and other upgrades are deferred for after-MVP review, not approved automatic admission rules. Product, architecture requirements and backlog updated; implementation remains pending. This settles launch admission, not every detail of the previously proposed signup sequence.

### D58 — Private reporting flow and review status *(5 Sep, user's approval)*

Members can report posts, comments or accounts by selecting harassment, exposed private information, impersonation/fake account, spam, or another concern, with an optional explanation. Reports go to the human moderation queue. Reported members never see reporter identities.

Show the reporter Received, Reviewed, and Action taken / No action taken. Do not expose internal review notes, other reporters or anonymous account identities through status updates. A report alone triggers no content removal, ban or voucher strike; findings and sanctions follow D38/D39. Existing reports survive content deletion under D44/D57, and external alerts stay generic under D45. Implementation remains pending.

### D57 — Irreversible post deletion includes comments and DM shares *(5 Sep, user's decision)*

Deleting a post automatically deletes its comments/replies and removes the shared post from any DMs where it appeared. DM visibility must continue to respect the source post's allowed audience. Content deletion cannot be undone; there is no trash/restore/undo flow for posts or comments. Confirm irreversible post deletion before execution.

DM shares reference the source rather than preserving independent content copies. Deletion removes the shared-post item/preview, not unrelated messages. DMs remain after MVP under the existing scope; record this requirement in the after-MVP backlog without adding messaging to the current build. Internal report/backup retention is a separate lifecycle requirement, not a user recovery feature. Implementation remains pending.

### D56 — Own-comment edits with a fixed identity and Edited label *(5 Sep, user's approval)*

Members can edit their own comment text, with an Edited label once changed. Published comment identity cannot switch between named and anonymous; anonymous thread identity remains consistent. D55's identity prompt is for new comments, not editing existing comments. A post author may remove someone else's comment under D44 but cannot edit it. Own-comment deletion remains available.

This resolves the published-comment identity question left open in D41. Product and implementation requirements are updated; implementation remains pending.

### D55 — Anonymous-post likes hide names; comments explicitly choose identity *(5 Sep, user's approval and clarification)*

Show anonymous-post likes as a number without the names of people who liked the post, including for its author. Do not expose liker lists, avatars or named like notifications. Preserve existing count-visibility rules and the ability to toggle one's own like; no separate like-anonymity switch is needed.

When commenting on an anonymous post, ask whether to submit anonymously or with the member's name. Require an explicit choice for each new comment/reply, rather than silently retaining a previous named setting. Anonymous comments reuse the thread-specific identity under D37; named posts still accept only named comments under D35. This updates the comment flow and anonymous-like requirements; implementation remains pending.

**User's wording revision:** The choices are Post as anonymous and I don't care. The first uses the anonymous thread identity; the second posts with the member's normal profile name and avatar. This changes the displayed labels, not the per-comment choice or underlying identity rules.

### D54 — Going public accepts pending follow requests *(5 Sep, user's approval)*

Switching a private account to public automatically accepts its eligible pending follow requests. These members become followers without any automatic close-friends/circle membership. If the account returns to private, they remain followers unless the owner removes them. Explain automatic acceptance in the privacy-switch confirmation.

Preserve admission and blocking rules; only current pending requests qualify. This complements D33/D41 account transitions and D53 follower removal without restoring removed requests or circle memberships. Specification updated; implementation pending.

### D53 — Follower removal clears the owner's close-friends circles *(5 Sep, user's amendment and approval)*

The user approved quiet follower removal with one amendment: removing a follower also removes her from close friends / circles on both private and public accounts. Remove all of that member's memberships in circles owned by the removing account; other owners' circles are unaffected. Existing and future access based on those memberships is revoked under D34/D35.

Keep the other proposed rules: no removal notification; private accounts require a new follow request and approval, while public accounts can be followed again without approval. Refollowing does not restore circle membership automatically. Removal is distinct from blocking, so eligible app-wide viewing remains possible. This approval covers owner-initiated follower removal; voluntary-unfollow behaviour is not decided here. Specification updated; implementation pending.

### D52 — Basic people search in MVP *(5 Sep, user's approval)*

Add people search by username or display name. Results show profile picture, display name and username; opening one follows D51's profile rules. Search requires admission, respects blocks in either direction, and does not approve private-account follows. Anonymous thread labels never resolve to the underlying real profile.

This approves basic people search for MVP. It does not add post search, contact importing or anonymous-identity lookup. Product requirements and implementation tasks are recorded; implementation remains pending.

### D51 — Private profile preview before follow approval *(5 Sep, user's approval)*

An admitted member who has not been approved as a follower can see a private account's profile picture, display name, username, bio and app-wide named posts, with a Request to follow button. Reflect a pending request as Requested. Each restricted post still requires its own audience eligibility; follower approval does not grant circle access. Anonymous posts stay off profiles. Admission, blocking and existing count-privacy rules remain in force.

This clarifies the profile surface for D31/D32 without changing the account/post privacy model. Implementation remains pending.

### D50 — Choose public/private account privacy during signup *(5 Sep, user's decision)*

Ask each new member to choose Private or Public during signup, rather than automatically starting all accounts private. The member can change account privacy later in settings. Named-post defaults follow the selected account privacy (D32); subsequent changes follow D33 with D41's anonymous-post exception. Membership admission remains independent of the privacy selection.

This replaces the assistant's private-by-default proposal. The choice is part of MVP onboarding, not an after-MVP item. Implementation remains pending.

### D49 — Saved posts deferred until after MVP *(5 Sep, user's decision)*

The user requested a separate to-do-after-MVP list and placed the save-post option there. Create that backlog and exclude bookmark UI/storage/implementation from MVP scope. Preserve the proposed private in-app bookmarks, current-access checks and anonymous labels as ideas to review later, not finalized implementation requirements.

### D48 — Following, Community and Anonymous feeds *(5 Sep, user's approval)*

Organize Eve into three chronological feeds: Following contains named posts from followed accounts, including permitted close-friends posts; Community contains app-wide named posts; Anonymous contains app-wide anonymous conversations. All are newest first in v1. Pending follows grant no Following membership or audience access. Anonymous posts do not appear in Following or Community, and restricted named posts do not appear in Community.

These are views over the same posts with the existing authorization rules, not independent content systems. Use Anonymous as the feed label in place of Rant view. This settles feed organization; no recommendation algorithm or new content format is added. Implementation remains pending.

### D47 — Confirmed launch through connected friend groups *(5 Sep, user's confirmation)*

The user confirmed that recruiting the first community through sisters, friends and their friends is already the plan. Clarify D10's across-cluster tactic: recruit connected groups so members know some people on arrival while app-wide conversations connect different groups. The example of 30 women across three groups is illustrative, not a fixed requirement.

Keep the existing real-content Founders' Board. Observe posting, replies and unprompted return visits over the cohort's first two weeks before expanding. This documents the existing recruitment intention; no invitations or messages were sent.

### D46 — Notify owners of detected close-friends screenshots/recording *(5 Sep, user's request)*

Add owner notifications when a member screenshots or records close-friends / Circle content, identifying the signed-in viewer and affected content. Keep this limited to close-friends content for now. The user is otherwise satisfied with the current external-sharing policy.

Platform detection is best-effort: iOS screenshot events occur after capture; capture-state signals can include recording or mirroring. Android supports standard screenshot callbacks from Android 14 and recording visibility callbacks from Android 15, with platform/method limits. Use accurate event wording and only attribute content visible during the event/session. In-app owner alerts can name the viewing account; external push stays generic under D45. No screenshot/video upload and no automatic strikes from an event alone.

Record the feature as planned, requiring native-device verification before any coverage claim. Implementation sources and platform requirements are in architecture.md under D46. No additional capture-blocking or external-sharing feature is approved here.

### D45 — No external sharing of member content *(5 Sep, user's decision)*

The user rejected the proposed external-link sharing flow: Eve posts should never be shared outside Eve. Remove that proposal from launch scope. Provide no external post sharing, copy-post-link action, public post page, embed, cross-post or member-content download action. Named and anonymous content stay within Eve's authorized viewing surfaces. Notifications outside the app contain no member content or author identity.

Keep non-content invitation, authentication, waitlist and vouch links required by existing onboarding. In-app forwarding, if introduced later, cannot expand an audience or bypass blocks; it is not newly approved here. Treat external redistribution as a community-rule violation subject to moderation. Screenshots, manual copying and external cameras remain a limit, so the policy is not a guarantee of preventing every leak. Update implementation requirements without claiming app enforcement is built.

### D44 — Comment owners and post authors can remove comments *(5 Sep, user's approval)*

A member can delete her own comments; a post author can remove any comment on her posts. Neither can edit another person's words. Apply the same rules to named and anonymous activity without disclosing anonymous identities. Comment closure does not remove these management rights.

Removal is separate from reporting and causes no automatic moderation penalty or voucher strike. Existing reports remain independent. Record these permissions in the product and architecture; implementation remains pending.

### D43 — Authors can disable, close and reopen comments *(5 Sep, user's approval)*

Authors can turn comments off before publishing either a named or anonymous post, close comments after publication, and reopen them later. Closed comments prevent new comments/replies while existing comments remain visible to their eligible audience. This does not change identity, audience, reporting or blocking rules. Record the product decision and implementation requirements; app implementation remains pending.

### D42 — Anonymous posts off profiles; private owner management *(5 Sep, user's approval)*

Anonymous posts appear in the app-wide anonymous section under Author-number labels, never on the author's profile, even for approved followers or close friends. Exclude them from visible profile post counts. Give the author a private My anonymous posts view for finding and managing her own posts; do not expose that collection or its real-account association to other members.

This confirms and extends the existing anonymous-count restriction. D41's app-wide-only audience and fixed publication identity remain, as do comment visibility and blocking rules. The user also confirmed that account privacy switches leave anonymous posts app-wide. Product specification updated; implementation pending.

### D41 — Published post identity is fixed; anonymous posts are app-wide only *(5 Sep, user's approval and addition)*

The user approved locking a post's named/anonymous identity after publication and added that anonymous posting has exactly one audience: Everyone on Eve. No anonymous Followers, Mutuals or Circle posts. Selecting Anonymous fixes the composer audience to app-wide, regardless of whether the account is private or public. Named posts retain their audience choices and account-derived defaults.

Because app-wide is the only anonymous audience, this supersedes D33's application to anonymous posts: changing an account to private or public affects named posts only; existing anonymous posts stay app-wide. Publication identity cannot be changed by an edit or account transition. Content edits remain available. D35 comment rules and D40 blocking remain in force, as do admission and moderation restrictions. No change to published comment identity-editing rules is decided here.

This replaces the original fully independent two-dial model and resolves the open question about changing published post identity. Product and technical requirements are updated; implementation remains pending.

### D40 — Account-wide blocking across named and anonymous activity *(5 Sep, user's approval)*

Blocking an anonymous participant blocks the underlying account across Eve, not merely that thread's label. Neither member can see the other's posts/comments or interact with her, whether named or anonymous, across existing and future activity. A block in either direction overrides other audience eligibility.

Resolve identity on the server. Anonymous block confirmation and management must not expose the real username, avatar or profile or connect the member's other anonymous aliases. Keep the label from the originating action for the blocker. Blocking is not a moderation verdict and generates no voucher strikes by itself. Implementation must handle both post authors and commenters on third-party posts without leaking identities through APIs or notifications.

The user deferred D39 suspension duration and asked to move on; it remains open. D40 is a product decision, with implementation pending.

### D39 — Honest mistakes still earn strikes; three strikes suspend the account *(5 Sep, user's amendment)*

The user added outcome-based accountability: vouchers who vouch for wrong people receive a strike even if it was an honest mistake; three strikes suspend the voucher's account. This supersedes D38's exemption from penalties for honest vouchers, while preserving evidence-based findings and human appeals.

Operational rule: one strike per distinct affirmed account confirmed fake/ineligible or removed for harmful conduct, regardless of the voucher's intent. Raw reports and duplicate findings do not create strikes. Three active strikes trigger account suspension, not only loss of vouching rights. Explain counts and reasons privately. Appeals correct factual errors, attribution errors and duplicates; honest intent alone is not grounds to remove a valid strike.

Keep the deliberate-misuse review path and existing budgets/waiting period. Do not blacklist phones automatically or sanction other invitees, and do not recursively issue strikes merely because a voucher was suspended by this rule. Suspension duration, reinstatement requirements, strike expiry and future external phone-voucher handling remain open. This is a documentation decision, not implemented account enforcement.

### D38 — Evidence-based vouch accountability replaces automatic penalties *(5 Sep, user's approval)*

*Amended by D39: the honest-mistake exemption below is historical; confirmed offending accounts now produce strikes regardless of intent.*

A member's ban no longer automatically removes her vouchers' privileges, blacklists their phones, or triggers cascading removal of connected accounts. A vouch means personal knowledge and confirmation of membership eligibility, not responsibility for future behaviour. Keep the existing seven-day wait, clean-record requirement and vouch budgets.

Handle the offending account on its own evidence. Investigate questionable vouches using confirmed patterns and specific evidence of false attestation or knowing ban evasion. Shared devices, network addresses, timing, and report counts do not by themselves establish intent. Ask the voucher privately for context without exposing reporters. Credible evidence of coordinated misuse can justify a temporary pause on further vouching; resolved concerns restore privileges. Deliberate or repeated confirmed misuse can lead to loss of vouching privileges, with reasons and a human appeal path. Other connected accounts require individual review rather than automatic sanctions.

This supersedes automatic burned-phone and cascading-revocation proposals in D4/D18-D19/D27 and their corresponding product/architecture notes. A first deliberate false vouch may still evade detection; vouching remains one admission signal backed by ongoing moderation. Product policy and implementation requirements are updated; no app implementation is claimed.

### D37 — Author label, random anonymous identities, reserved username *(5 Sep, user's call)*

The original poster in an anonymous thread is labeled Author followed by a random number. The user clarified that the author also needs a number to distinguish different anonymous posts. Assign a distinct author number per anonymous post and retain it in the author's anonymous replies; another post by the same member gets a different number. Other anonymous commenters use Anonymous followed by a random number and a random cartoon-style profile picture. This refines the proposed sequential labels into random numbers while retaining a consistent identity within each thread. Assign identities independently in different threads, without exposing a real profile or using its picture. Named comments remain available on anonymous posts under D35.

The username anonymous is reserved and cannot be selected at signup; enforce case-insensitively and on username changes too. The Author marker is determined by ownership, not a user-entered name. Record this as a product requirement; artwork selection and implementation remain pending.

### D36 — Circles immediately after admission; waiting period for vouching *(5 Sep, user's approval)*

Active admitted women (Tier 2) can create and manage close-friends circles immediately. Circle creation no longer requires Tier 3 or a seven-day wait. Vouching for new members remains an established-member capability with the existing seven-day waiting period, clean-record requirement, and vouch budget.

This revises the circle-creation capability in D7's historical tier table. It does not alter circle audience/history rules (D34) or grant community access before admission. The specification is updated; implementation remains pending.

### D35 — Comments inherit visibility; anonymity depends on the post *(5 Sep, user's call)*

Comments use the parent post's current audience, including when existing posts widen or narrow through audience edits, account privacy changes, or circle membership. There is no independent comment audience.

Anonymous commenting is available only on an anonymous post. A commenter on an anonymous post can choose named or anonymous; comments on a named post must be named. Audience changes preserve comment identity. This revises D2's unrestricted reply identity dial and resolves the comment-visibility questions left open in D33/D34. It does not settle whether a published post can later change between named and anonymous.

### D34 — Close-friends additions grant access to past posts *(5 Sep, user's call)*

The user confirmed that adding someone to close friends makes all close-friends posts visible to her. Each circle therefore uses current membership for both historical and future posts, rather than a membership snapshot taken when the post was published. Access is specific to the circle joined and still requires community admission.

This confirms the read-time membership model in the architecture. The existing rule that removal revokes circle-based access remains. Reply visibility when a parent audience widens is the next discussion point and is not settled here.

### D33 — Account privacy changes apply to existing posts *(5 Sep, user's call)*

The user specified: private to public makes all content public except close-friends posts; public to private makes everything private. Public means Everyone on Eve, within the admitted women-only community.

On private to public, all non-circle posts become app-wide, including explicit Followers and Mutuals posts. Circle posts keep their circle audience. On public to private, all existing app-wide posts become Followers-only, while already narrower audiences remain restricted. Circle posts never broaden to all followers as a side effect of switching account privacy. Identity settings are separate: anonymous posts stay anonymous.

This replaces the earlier proposed interpretation that every explicit per-post audience survives an account switch. It is a transition rule, not a permanent ban on app-wide posts from private accounts; the user can still choose app-wide for a new post afterward (D30/D32). Replies on widened posts, drafts, and circle membership changes remain separate discussion points. Implementation is pending.

### D32 — New-post defaults follow account privacy *(5 Sep, user's call)*

A private account defaults to Followers; a public account defaults to Everyone on Eve. The owner can override each post's audience, but subsequent new posts still default according to account privacy. There is no independent preferred-default setting and no remembering the last post's audience. Changing account privacy changes the default.

This supersedes the last-used audience rule in the original architecture and the proposed preference setting from the review. Effects on existing posts, replies and circle history remain for the next discussion; no retroactive change rule is adopted here.

### D31 — Private accounts approve or decline follow requests *(5 Sep, user's call)*

A private account holder must approve or decline incoming follow requests. A request alone grants no followers-only access; only approval creates the follow relationship. Mutuals require established follows in both directions, and circle access still requires circle membership. App-wide posts remain visible to admitted members without follow approval, independently of account privacy (D30).

This settles the follow-request product rule. Implementation remains on the checklist. Default audience selection is the next discussion point and is not decided by this entry.

### D30 — Women-only launch; per-post audiences within the community *(5 Sep, user's call)*

**Current decision, listed first to supersede older entries below.** Eve starts as a women-only space. Adding men or other audiences is deferred for later consideration. The prior inclusion of trans women remains; no new verification method was selected in this discussion. Business features remain post-launch proposals.

The user clarified that an account can be private while an individual post is app-wide. Audience choices describe reach within Eve: **Everyone on Eve / Followers / Mutuals / A circle**. A circle is a selected group of close friends. There is no separate Women only filter in a community whose members are already women, and no additional gender restriction layered over circles. Additional audience options can be considered later.

App-wide means within the admitted community, not publicly accessible on the internet. A post's audience does not change the account's privacy or expose its other posts. Membership eligibility must apply before every audience rule, so the old unverified public-post lobby and the mixed-gender examples are superseded. The product tier table reflects this; detailed technical reconciliation and onboarding design remain to be done before implementation.

This revises D1's audience labels, D7's public lobby, D14-D16's mixed-membership assumptions, and D22's eligibility rule. Other proposals from the second review remain separate discussion points, including historical audience changes, reply controls, vouch penalties, recruitment, and monetization. Earlier entries below are retained as decision history.

### D1 — The product is per-post audience control
One composer, two dials. **Who sees this** (everyone / women only / followers / mutuals / a named circle) and **posted as** (me / anonymous). Everything else is a feed showing what you're allowed to see.

*Rejected:* "Instagram for women" as a framing. It's a demographic, not a use case, and the graveyard is full of it.

### D2 — The rant section is in v1
**Your call.** Consistent with four of your own answers (1.3, 1.4, 4.2, 4.5) which all say it's the reason anyone comes back.

*Why it's cheap:* it isn't a second product. It's the two dials combined — anonymous plus a wide audience — and the rant feed is a view over the same posts table. Replies carry the same identity dial. Anonymity is **per-post, not per-account**: you're yourself on your photos and anonymous on your rant in the same session. Nothing else does this.

### D3 — Verification is by vouch, not by ID or biometrics
This one moved the most. The path it took:

1. *ID + liveness via a vendor* — rejected. $0.50–2.50/user, and it **structurally cannot implement your stated policy** from 0.4 (women, trans women, gay men). No government ID identifies someone as a gay man; many trans women can't update documents.
2. *Social login (Instagram/TikTok)* — rejected on facts. Instagram's Basic Display API was **shut down 4 Dec 2024**, and the replacement doesn't support personal accounts. Your users have personal accounts. TikTok Login Kit works but gives only avatar and display name by default.
3. *Video vouching with face recognition* — rejected. See D4.
4. **Vouching, no cameras** — adopted.

### D4 — No biometric data, anywhere
The single most expensive legal exposure available in this product is a biometric class action. Illinois BIPA carries a private right of action with statutory damages per violation; it's why Meta paid $1.4B to Texas. GDPR Article 9 treats biometrics used for identification as special-category data.

Your video-vouch design would have collected face data from **non-users arriving through a link** — no account, no accepted terms, unknown age, unknown jurisdiction. Consent is the lawful path and you were right about that, but it requires a standalone notice, a published retention schedule, a real deletion pipeline, a DPIA, and age gating — weeks of work and legal fees, to preserve a mechanism that adds close to zero security.

*What was good in that design and survives:* vouchers need no Eve account (this solves cold-start, and it's the best idea either of us had); the applicant never learns who declined (removes the social cost of honesty — this is the hard part of vouching and you solved it); and the explicit "I don't vouch for this person" option.

*Why the camera added nothing:* the security in a vouch comes from the voucher having **something to lose**, not from ceremony. An anonymous face saying a name has no accountability. A phone number that gets burned does.

### D5 — Two paths to the "at least one woman" requirement
The constraint you set — *verify at least one woman approved* — collides with *no lawsuits*, because verifying gender requires face analysis (biometric, biased) or an ID sex marker (excludes trans women, and makes Eve the party adjudicating gender, which is the *Tickle v Giggle* exposure).

**The resolution: don't verify her gender — require her to already be a member.** She's a woman because she's an established member of a women's platform with 30+ days of behavioral history. Verified by record, not by scan. Costs nothing.

**Voucher A** — an established member **or** Eve's review team (your original "verified by the team" instinct, correctly placed as the fallback so nobody is permanently locked out).
**Voucher B** — anyone with a verified phone. No gender claim required of them.

### D6 — Seasoning 7 days, vouch budget of 3
Thirty days was too slow — it gives you one and a half generations in six weeks. Seven days gives you about six. Vouch budget of 3, +2 per month of clean standing: caps the damage from any single bad actor, creates real scarcity, and makes people spend vouches on those they actually trust.

### D7 — Trust tiers, not a binary gate
Directly implements your own 6.1 answer (*filter, not gate*) and dissolves the friction-versus-security tradeoff.

| Tier | How | Unlocks |
|---|---|---|
| 0 — New | Signed up | Browse public |
| 1 — Phone verified | SMS, VoIP blocked | Post and comment publicly |
| 2 — Vouched | Two vouches, A + B | **Women-only content, anonymous posting** |
| 3 — Established | 7+ days, clean record | Create circles, vouch for others |

The key property: **women-only content is gated at Tier 2, not at the front door.** Someone who lies at signup lands at Tier 1 and never reaches anything protected. He's in the lobby, not the room.

### D8 — Anti-self-vouching
Four stacked checks: Voucher A must be an established member (structurally self-vouch-proof); different phone number, enforced by one-account-per-number; device fingerprint must differ from the signup device; same IP within minutes flags for human review rather than auto-blocking, since households and carrier NAT share IPs legitimately.

*Honest limit:* nothing short of biometric matching proves two different humans. These make it expensive and awkward, and behavioral signals catch the rest within days.

### D9 — What's verifiable, and what is only attested
| | Verifiable | Method |
|---|---|---|
| Phone | Yes | SMS, VoIP blocked (~$0.05) |
| Email | Yes | Magic link |
| Age | **No** | Self-declared DOB, hard 18+ block. Standard practice; it's a legal shield, not a fact |
| Gender | **No** | Self-declared, plus membership history for Voucher A |

Dropping the camera also dissolved the minors problem — that was only serious because a 16-year-old can't give valid *biometric* consent. Without a camera it's a person filling in a form.

### D10 — Geography
**South Asia first, USA included.** *Your call.* Under invite-only you don't really pick a country — you pick a seed cohort and the graph follows real relationships. For the pitch, still name one wedge: "a market I understand natively, then expanding" beats "two continents, 200 users."

*Launch tactic:* seed the founding cohort **across clusters, not within one.** Fifty women who all know each other is one dense pocket. Fifty from different cities, universities and friend groups is fifty expansion fronts.

### D11 — Video cut from v1
Text and images only. Video means transcoding, CDN, storage cost and about a week. "Post the thing you wouldn't otherwise post" is mostly words and pictures.

### D12 — Mobile web PWA before native *(superseded by D28)*
No app store review delay, opens from a link, ships fixes in minutes. Native is a v2 decision. — *Reversed 4 Sep: native iOS first, through a friend's Apple account. The link-to-install friction argument survives as a metric to watch, not a reason not to ship.*

### D13 — Path 2 is a waitlist, not an adjudication *(corrects D5)*
As first described, Path 2 had a hole: asking a reviewer to judge "is this a woman" from a profile reintroduces the biased, company-made determination that D4 removed — an ML classifier with a human in the chair, arguably worse legally because there is someone to depose.

**Fixed:** the code check establishes only *"a real person with real history controls this account."* Eve's team then **invites** from the resulting waitlist. Choosing whom to invite is a normal invite-only-network activity; ruling on a gender claim is not.

Also: **never accept media from the applicant.** Screen recordings can be generated. The reviewer opens `instagram.com/[handle]` directly — a human viewing a public page, which is not scraping. The only thing that can't be faked is time, so account age and presence in *other people's* accounts are the signals that matter.

### D14 — Rules are identical for everyone
Same flow, same two vouches, regardless of declared gender. A men-only rule requires determining who is a man — the adjudication we removed — and it's trivially bypassed by declaring female. Differential treatment by declared gender is also the *Tickle v Giggle* exposure.

**The gender check moved into the vouch form:** vouchers are shown the applicant's declaration and asked to confirm it. Eve never decides; it records what people who know the applicant said.

**The asymmetry lives in the content filter, not the entry gate.** A man can be a full member and still never see a *Women only* post.

### D15 — No carve-out for gay men *(your call)*
Any exception would have to be self-declared, so any man wanting into women-only spaces would simply declare himself gay — a filter with a checkbox bypass. It also avoids recording anything about sexuality, which is special-category data under GDPR.

Where a woman wants specific men included, **circles and "+ add specific people" already do it**, per post, by her choice. Better than a platform-level category, and it costs nothing since circles are already in v1.

### D16 — "Women only" means women only *(rejected: the mutual-follow exception)*
Proposed: *Women only* would still include men she follows back, with a note under the control.

**Rejected.** The failure mode is the central use case of the app breaking: she posts something vulnerable, selects the label that means safe, and a cousin, a colleague and an ex all see it. Warning microcopy doesn't save it — bold "Women only" beats grey caveat text every time, especially on the 1am post. And mutual-follow is a *social obligation*, not a trust signal; using it as the boundary imports exactly the population the app exists to escape.

**Instead:** she picks *Women only*, then optionally taps **"+ add specific people"** and names them. Same need served, guarantee intact, and she knows who's there because she just put them there.

**The principle:** the safe option is the simple option, and every exception costs an action. Never a reassuring label with a quiet carve-out inside it. It also means the answer to *"does women only mean women only?"* is one word.

### D17 — Architecture decisions *(see [architecture.md](architecture.md))*
- **Authorization in Postgres RLS, not application code.** Per-post visibility enforced in app code fails the first time someone writes a query that forgets the filter
- **Read-time evaluation**, so removing someone from a circle immediately revokes access to every past post to it
- **Clients never read `posts`** — only a `security_invoker` view that nulls `author_id` on anonymous rows
- **UUIDv4 keys**, never sequential and not v7 (v7 embeds a timestamp, which correlates anonymous posts)
- **A gender change drops you out of Tier 2 and deletes your vouches.** Vouchers confirmed a specific declaration; if it changes, it needs re-confirming
- **Audience control sits above the text field.** Choosing the room before you speak is the correct order and it's the product's whole thesis
- **First-ever default is Women only.** The default's failure mode must be disappointment, not exposure
- **Screenshots cannot be prevented.** Say so in the copy rather than implying a guarantee that can't be kept

### D18 — Dual-path verification *(revises D3/D4: "no ID anywhere" → "no ID stored by Eve")*
Tea's numbers broke the friction objection: 1.7M women uploaded IDs to a safety app that hit #1 in the US. What survived Tea is the *storage* rule, hardened by its breach (72k IDs/selfies in a public bucket, five consolidated federal class actions): **vendor-hosted capture, attributes by webhook, no image ever touches Eve.**

So: **Path A** — vendor ID/liveness (~$1–2, instant, solves the bootstrap problem that vouch-only had). **Path B** — vouching (free, always available; the route for trans women, ID-refusers, and anyone Path A misreads — and the legal defence: Eve never excludes on a document, never adjudicates gender). Face gender estimation, if used at all, is a fast-track *signal, never a decision* — silent fallback to Path B, no algorithmic rejection ever.

### D19 — Vouch strictness ramps with graph size *(fixes the bootstrap collapse)*
Requiring two member-vouches at 50 members means newcomers need to sit in the *intersection* of two members' networks — the graph grows dense, not wide. Fix: phase the requirement (launch: 1 member vouch or team invite, big budgets; growth: 1 member + 1 phone-verified anyone; maturity: 2 member vouches). Config, not code paths. Plus **cascading revocation**: a banned account burns its vouchers' rights; corrupt subtrees get cut whole; fraud-ring detection (tight reciprocal clusters, narrow signup windows, shared fingerprints) is a weekly SQL report from day one.

### D20 — Business accounts: storefronts, not members *(your idea, 4 Sep)*
Two-sided network: women are the community (free), businesses pay for access. The rule that closes the "any man registers a business" loophole structurally: **businesses can be seen but cannot see** — broadcast-only, no browsing personal content, no women-only access ever, no initiating contact, own-posts-and-analytics only. KYB verification (registration, domain email, Stripe card — payment is itself a fraud filter), no gender question exists for them. Schema stub (`account_type`) ships in week 1; features ship after 12 Oct.

### D21 — Monetization *(closes the "no revenue" gap)*
Women free (marketplace logic + Pakistan PPP). Business subscriptions in tiers — the Growth tier sells the audience-composition dashboard, which is the original "97% women" idea returning as the B2B product. Creator/PR marketplace at 10–15% take — bot-free influencer metrics by construction. "No ads ever" revised to a keepable promise: *personal feeds are never for sale; businesses live in labeled spaces you choose to follow.* Benchmark from Tea: $2.4M ARR at 1.7M users (~1% conversion, $14.99/mo) — subscriptions alone are a floor, not a venture story; the venture story is commerce + the trust graph. Pre-October play: **signed business LOIs, not built features.**

### D22 — Path A grants Tier 2 on its own; both doors invalidate together *(4 Sep, reconciliation pass)*
D18 added the ID door to product-v1 but architecture still only knew about vouches. Resolved: a `verifications` table holds exactly the four webhook fields (passed, sex marker matches declaration, DOB matches, vendor dedup key). A pass grants Tier 2 directly, under the same rule for every declared gender — D14 holds, because a man with an M document and a "man" declaration also passes and the women-only branch still excludes him. A mismatch is never explained to the user; she just sees the vouch door, so the trans-woman path and the misread path look identical from outside. A change of declared gender supersedes the ID check the same way it deletes vouches (D17), since both confirmed the old declaration. One `recompute_tier` function reads both doors and the current policy, and nothing else writes `tier`.

### D23 — Vocabulary: member vouch, phone vouch, team invite, the waitlist
"Voucher A/B" collided with "Path A/B", and "Path 2" made it worse. Renamed: **member vouch** (a Tier 3 member, or a team invite that counts the same), **phone vouch** (anyone with a verified number), and **the waitlist** for people who know nobody. Tier 2 is "Verified", not "Vouched", since either door reaches it.

### D24 — Ramp thresholds are config with starting numbers
D19 named the phases but not the numbers. Starting values: launch (under ~200 members) 1 member vouch; growth (~200–2,000) 1 member + 1 phone; maturity (2,000+) 2 member vouches. A `vouch_policy` table, latest row wins. These are guesses to be tuned from the completion rate, and tightening never demotes anyone already verified.

### D25 — Follower and like counts are private by default *(from your 7.4)*
Was answered in the questionnaire and written nowhere else. Now in the spec: counts are visible only to the owner; she can make them public after 30 days, enforced by the update policy on `users.stats_public_at`. Consistent with 7.5 — no clout scoreboards.

### D26 — Roadmap and budget re-cut for two doors
The 1 Sep roadmap said ID verification was gone; D18 brought it back three days later and the plan wasn't touched. Week 3 now includes vendor selection and the webhook; the budget carries ~$1–2 per member who picks the instant door; the unit-economics line becomes "under two dollars a member, falling toward zero as the graph takes over." The daily metric is completion rate *split by door*, because the split itself is a signal about whether the graph is spreading.

### D27 — Zero-budget launch, with a spend ladder *(your call, 4 Sep)*
Budget is zero until further notice. Everything paid was swapped for a free path without changing the design: email magic link instead of SMS (Tier 1 becomes "contact verified"; phone comes back unchanged when funded); Path B only, since the launch policy needs one member vouch and no phone vouch anyway; free tiers of Vercel, Supabase and PostHog; a vercel.app subdomain; template terms for the hand-invited cohort. What this costs, said plainly: email is a weaker identity than phone, which is acceptable only because a member vouch is required to get in at all; and there are no reviewed terms, which is acceptable only while every member was personally invited. When money arrives it goes in a fixed order — domain, visa fee, SMS, legal review, hosting, the ID vendor, incorporation — each with a trigger. Legal review is a hard gate before opening past the cohort. Full list in [todo.md](todo.md).

### D28 — Native iOS first, through a friend's Apple account; Android next *(your call, 4 Sep — reverses D12)*
A native app for both platforms, iOS first, zero cost. Expo keeps iOS, Android and the web pages non-members touch (waitlist, voucher page) in one codebase. Free path: Xcode and the Simulator, free personal signing on your own iPhone, local builds instead of EAS's capped free tier, and the friend's account for TestFlight (public link, up to 10,000 testers, lighter beta review) and the App Store submission.

*What it costs, plainly:* the install step is back in the vouch-link funnel — universal links soften it, the metric watches it. App Review cycles replace ship-in-minutes. Report, block and a moderation queue must exist before the first submission (Guideline 1.2), which they do in week 4. The app is legally the friend's until transferred, and a transfer needs a released App Store version — so the week-5 submission is what makes the app movable. Pakistan is overwhelmingly Android, so until the $25 Play fee is paid the seed cohort has to be iPhone users; Android is ladder #3.

*What it forbids* (architecture §1.1): Sign in with Apple, iCloud / Game Center / Wallet / IAP entitlements, a throwaway bundle ID. Entitlements are push and associated domains only.

### D29 — Apply to YC, SPEEDRUN and Founders Inc, in that order of priority *(4 Sep)*
Not exclusive at application stage, same demo for all three. **YC** is the primary bet: dozens of Pakistani portfolio companies (partners know the market and the visa path), $500K committed on acceptance, indifferent to student status or degrees, the strongest brand for a solo founder raising a seed, and a 2 Nov deadline that lands three weeks after SPEEDRUN with more data. **SPEEDRUN** stays co-primary as the best thesis fit (consumer, Andrew Chen) with more upfront cash at a higher valuation; the risk is a cohort skewed to AI and revenue. **Founders Inc** Canopy is the safety net: five weeks, online option, ~15% admission, small money at demo day — the only one that works if the Bangkok B-1 fails. Neither in-person program pays a stipend; both fund the move through the investment, with a ~$4–5k bridge before the wire lands (todo §7). Social media is a founder-run track from week 1 (todo §6), with the rule that marketing never spends the product's privacy promise.

---

## 3. Research findings

*Facts gathered during these sessions, with sources. Easy to lose, expensive to re-derive.*

### a16z SPEEDRUN
- **SR008 starts early 2027.** Priority application window **12 Oct – 1 Nov 2026**; applications accepted year-round on a rolling basis. Reviews take 4–6 weeks, then a video pitch or 15-minute interview.
- **Terms:** $500K for 10% on a SAFE, plus $500K in your next round within 18 months. $10M+ in partner credits. Pro rata, no board seat.
- **12 weeks, in person in San Francisco.** Hard requirement. Solo founders explicitly encouraged. International founders supported through the Global Founders Program.
- **Scale:** $300M+ across 250–300 companies, 0.4% acceptance.
- **Founded 2023 by Andrew Chen**, who wrote *The Cold Start Problem* — the definitive book on exactly your hardest problem. That's your strongest "why SPEEDRUN" answer.
- **Thesis:** originally gaming-meets-tech, rebranded March 2025 to "tech-meets-entertainment."
- **Caution:** the recent portfolio is AI-heavy and revenue-focused. **32% of accepted SR006 companies put an ARR number in their one-liner.** You won't have one — your substitute is a retention curve, and you must make that argument explicitly.
- Named portfolio: Sekai (consumer), Nilo (social 3D sandbox), Hedra, FLORA, Runware, Fundamental Research Labs, k-ID.

### Visa — Pakistani national based in Bangkok
- **Pakistan is *not* on the 39-country travel ban** (Proclamation 10998, effective 1 Jan 2026).
- **Pakistan *is* on the 75-country immigrant visa processing pause** (21 Jan 2026) — but that covers **immigrant visas only**. B-1/B-2, F-1, H-1B and L-1 process normally.
- **The 12-week program runs on a B-1 business visitor visa.** The pause doesn't block you.
- **The real risk is appointment wait times, not eligibility.** SPEEDRUN's own writeup cites a Turkish founder facing a two-year wait.
- **Bangkok cuts both ways:** the US Embassy accepts third-country nationals and wait times are far shorter than Islamabad or Karachi, but as a TCN you face more scrutiny under §214(b). Thai residency documents help.
- **Action:** apply for a B-1/B-2 now, on general business grounds. No acceptance letter needed, typically multi-year validity. Holding one before you apply removes the biggest execution risk from your application.
- O-1A / EB-1A are the later routes; a16z has helped founders petition for both.

### Company and banking
- Delaware C-corp is straightforward — Pakistan isn't sanctioned. Stripe Atlas operates in 175+ countries, ~$500.
- **Mercury has rejected founders from Pakistan, Bangladesh, Nigeria and India at higher rates**, and Atlas bundles Mercury by default. Have Brex, Relay, Rho or Wise Business ready as backups.
- **D-U-N-S number:** free, allow **up to 5 business days**. Required before Apple will verify an organization.

### Apple
- **App Transfer** moves an app between accounts. Requires at least one released version, and no pending review states. Ratings, reviews, IAP, subscribers and download history all transfer. Recipient has 60 days to accept.
- **Sign in with Apple identifiers are team-scoped.** Migrate them within the 60-day window (TN3159) or every user silently gets a new account. **Avoid this entirely by not offering Sign in with Apple** — Apple only requires it if you offer other third-party social logins. Phone auth only means the problem never exists.
- You can enroll as an **individual** today: $99/year, no company, no D-U-N-S. Individual → organization later is the same App Transfer process, minus the ownership ambiguity of using a friend's account. *(D28 chose the friend's account anyway, for zero cost; the ambiguity is handled by a written one-line agreement and by shipping a released version early so a transfer is possible.)*
- **TestFlight:** external testers via a public link, up to 10,000, after Beta App Review (lighter than App Review). Internal testers must be App Store Connect users on the account's team — not usable for a cohort on a friend's account. Builds expire after 90 days.
- **Guideline 1.2 (user-generated content):** filtering, reporting, blocking, and a published contact address are required at first submission. Anonymous UGC is read closely.
- **Free personal signing:** run on your own device with any Apple ID — 7-day provisioning, up to 3 apps, no paid account. Enough for development, not for distribution.
- **Google Play:** $25 one-time. Personal developer accounts created after Nov 2023 must pass a closed test (12+ testers, 14 days at last check — verify) before production access.
- From **28 Apr 2026**, uploads must be built with Xcode 26 / iOS 26 SDK.

### Social platform APIs
- **Instagram Basic Display API shut down 4 Dec 2024.** The replacement doesn't support personal accounts — they must be converted to Business or Creator. **There is no way to log a normal personal Instagram account into a third-party app.**
- **TikTok Login Kit:** `user.info.basic` (avatar, display name) by default; follower and video counts need a separate pre-approved scope. Neither platform exposes the follower graph.

### Legal
- **BIPA (Illinois)** — private right of action, statutory damages per violation. The reason biometrics are the expensive mistake.
- **GDPR Article 9** — biometrics used for identification are special-category data.
- ***Tickle v Giggle*** (Australia, 2024) — excluding a trans woman from a women-only app was found to be unlawful discrimination. Mitigated here by Eve never adjudicating gender, a documented appeal path, and your inclusive 0.4 policy.

### Tea (teaforwomen.com) — the category's proof and cautionary tale
- Founded Nov 2022 by Sean Cook (ex-Salesforce), self-funded, after his mother was catfished. Women-only; required selfie + government ID
- **Proof of demand:** #1 free app in the US (July 2025), 1M signups in one week, 1.7M+ users, 4.8★
- **Revenue:** ~$200k/mo (~$2.4M ARR) at $14.99/mo — ~13k subscribers, under 1% conversion. Monetized a *decision* (meeting a stranger tonight), not a habit — Eve cannot copy that price point
- **The breach (July 2025):** verification images in an unsecured public Firebase bucket for over a year — 13k selfies+IDs, 59k user images, then a second find: 1.1M private messages. FBI involved; five federal class actions consolidated (N.D. Cal.)
- **Lessons wired into Eve:** never store verification media (D18); DMs stayed cut (their 1.1M messages were the second breach); retention policy from day one (Tea's exposed users were pre-Feb-2024 legacy data); the pitch line *"we can't leak your ID — we never hold it"*

---

## 4. Still open

*Cleared 4 Sep: product-v1 updated (D18–D21), revenue line (D21), roadmap rebuilt and re-cut (D26).*

1. **The verb (3.2).** "Share" is too weak; every app is share. Yours is closer to *choose*, or *decide who sees this*.
2. **2.4 — do your users describe the problem the way you do?** Unanswered. It's an interview question, not a thinking question. Ask the seven women in your 2.1 list.
3. **3.4 — what people get wrong when they repeat your one-liner.** Only learnable by saying it out loud to strangers.
4. **Pick the ID vendor** (week 3). Criteria: Pakistani CNIC coverage, hosted flow, a webhook that returns attributes without images, a sandbox. Persona, Veriff and Stripe Identity are the candidates; nobody has checked CNIC coverage yet.
5. **Ramp thresholds (D24) are guesses.** Revisit at ~200 members with the completion data in hand.
6. **Design work has barely started.** The composer, the feed, and the day-one experience have had a fraction of the attention verification received.

---

## 5. Known weaknesses — have answers ready

1. **No revenue**, against a cohort that leads with ARR.
2. **Cold start.** Invite-only helps enormously but caps growth by design. You need to show the graph compounding, not just existing.
3. **Vouching is a social deterrent, not a technical guarantee.** Someone with two willing friends gets in. Say that plainly rather than overclaiming — "we make bad actors socially expensive and remove them fast" is credible; "our AI verifies gender" invites the question you don't want.
4. **Anonymous posting plus a safety-seeking community** goes wrong fast without a real human in the moderation queue. Budget it in hours, not just dollars.
5. **Team review is a manual bottleneck.** Fine at 200 signups/week (~2 hours). At 5,000 you're hiring. If most people arrive through team review rather than member vouches, that's a signal the graph isn't spreading.
