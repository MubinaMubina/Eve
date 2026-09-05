# Eve — Product Definition v1

*Started 31 Aug 2026, last updated 5 Sep 2026. **Living document** — decisions here are settled-for-now, not final. When a new idea lands, we argue it out in conversation, then this file gets the verdict. [conversation-log.md](conversation-log.md) keeps the why.*

## Current launch decision: women only

**Eve launches as a women-only space.** Membership for men or other audiences is deferred for a future decision, not part of v1. The existing inclusion of trans women remains. Business features remain post-launch proposals, not an exception into the member community.

**A private account can publish an app-wide post.** Named posts can choose Everyone on Eve, Followers, Mutuals, or A circle of selected close friends. Anonymous posts always use Everyone on Eve (D41). Everyone on Eve means the admitted women in the app, not the open internet. There is no separate Women only switch or additional gender filter in v1. Publishing app-wide does not change the account's privacy or the audience of its other posts.

This decision supersedes the earlier mixed-membership model. Verification now controls admission to the member community; the old public-post lobby is removed. D31-D37 below define follow approval, new-post defaults, account privacy changes, circle access, and comment visibility and identity. Detailed onboarding remains open.

### Private-account follow requests (D31)

Following a private account requires a request. The account holder can approve or decline it. Pending and declined requests do not count as follows and grant no followers-only access. Approval establishes the follow relationship; mutuals require an established follow in both directions. Being approved as a follower does not add someone to a circle.

An admitted member can still see that account's app-wide posts without an approved follow. Publishing an app-wide post does not approve requests, change account privacy, or expose restricted posts.

**Private profile before follow approval (D51):** Show the profile picture, display name, username and bio, a Request to follow button (or Requested for a pending request), and eligible app-wide named posts. Followers-only posts require approval; Mutuals posts require mutual following; Circle posts require membership in that circle. Anonymous posts never appear on the profile. Community admission and blocking restrictions apply to the profile as well as its posts. Existing private-count rules remain unchanged.

### Removing a follower also removes circle membership (D53)

An account owner can remove a follower without blocking her or sending her a removal notification. On both public and private accounts, this also removes that member from every close-friends circle owned by the account holder. She loses access based on the removed follow and circle memberships, including historical posts and their comments. Circles owned by other people are unaffected.

To follow again, she must request approval if the account is private; she can follow again without approval if it is public. Following again never restores old circle memberships automatically: the owner must add her back explicitly. App-wide posts remain accessible under existing admission and blocking rules. Follower removal is not a block or a moderation penalty. This defines owner-initiated removal, not a new rule for voluntary unfollowing.

### People search (D52)

MVP includes people search by username or display name for admitted members. Each result shows the member's profile picture, display name and username. Opening a result uses the existing profile and audience rules (D51); finding a private account does not grant follow approval or restricted-post access.

Apply blocking in both directions to search results. Search real member profiles only: anonymous Author-number and Anonymous-number labels do not provide a lookup or link to the underlying account. This decision adds basic people search, not post search or a contact-import feature.

### Account privacy determines the post default (D32)

During signup, the member explicitly selects **Private** or **Public** account privacy (D50). Eve does not automatically make every new account private. She can change this selection later in account settings. Choosing Public still means visibility within the admitted Eve community, not on the open internet, and does not bypass verification.

New named posts default to **Followers** for a private account and **Everyone on Eve** for a public account. There is no separate preferred-audience setting. To change the default, the owner changes her account between private and public. Anonymous mode always uses Everyone on Eve regardless of account privacy (D41).

She can override the audience for an individual post. That choice does not become the default for the next new post, which again follows account privacy. Public means within the admitted women-only community (D30). Account privacy changes affect existing posts as specified in D33.

### Changing account privacy updates existing posts (D33)

- **Private to public:** all existing named posts become visible to Everyone on Eve except close-friends / Circle posts, which keep their circle audience. This includes named posts previously set explicitly to Followers or Mutuals.
- **Public to private:** all existing app-wide named posts become private (Followers). Already narrower named-post audiences, including close-friends / Circle posts, remain restricted; switching to private must not broaden them.
- **Anonymous posts remain app-wide in either direction (D41).** This is the exception to D33's earlier all-content rule, because anonymous posts now have only one audience.

These transitions change named-post audiences, not a post's identity. Identity is fixed after publication (D41). A private account can still deliberately publish a new app-wide named post afterward, or an anonymous post which is always app-wide. D32 sets the default for new named posts. D34 settles circle post history; D35 makes comments follow the post's current audience.

**Pending follow requests on private to public (D54):** Automatically accept eligible pending requests when the owner switches to public. Those members become followers but are not added to close friends or circles. Switching back to private keeps existing followers, including these newly accepted members, until the owner removes them. The switch-to-public confirmation must mention that pending follow requests will be accepted, alongside the existing post-visibility explanation. Admission and blocking rules still apply; cancelled, declined or previously removed requests are not resurrected.

### Close-friends membership includes post history (D34)

Adding an admitted member to a close-friends circle makes all existing posts addressed to that circle visible to her, as well as future posts while she remains a member. Access follows current circle membership, not membership at the time of posting. Joining one circle does not grant access to other circles.

**Circle creation is available immediately upon admission (D36).** An active Tier 2 member can create and manage her circles without a seven-day wait. The waiting period applies to vouching for new members, not to using circles.

The existing removal rule continues: removing someone revokes her circle-based access to that circle's past and future posts. Membership eligibility and other applicable access restrictions still apply.

### Comment visibility and anonymity (D35)

Comments inherit the parent post's current audience and have no separate audience selector. When a post's audience widens or narrows, its existing comments follow that change, including changes caused by account privacy or circle membership.

- **Named post:** comments must be named; anonymous commenting is unavailable.
- **Anonymous post:** before submitting each new comment or reply, ask the commenter to choose **Post as anonymous** or **I don't care** (D55, revised wording). Post as anonymous uses her existing anonymous thread label/avatar; I don't care uses her normal profile name and avatar. Do not silently reuse a named choice from an earlier comment. Apply the chosen identity to that submission.

Anonymity changes the identity displayed, not who can read the comment. Audience changes preserve each comment's named or anonymous identity. Anonymous comments remain anonymous to other members under Eve's existing anonymity model.

### Likes on anonymous posts (D55)

Represent likes on anonymous posts as a number, without showing the identities of people who liked them. Neither the post author nor other readers get a liker-name list, avatar stack or identity-revealing like notification. There is no separate anonymity choice for likes. A member can still see whether she herself liked the post and undo her own like.

The existing rules for who may see like counts remain unchanged; this decision hides liker identities rather than changing count-publication settings. Admission and blocking rules still apply to liking and viewing the post. Named-post liker presentation is not changed by this decision.

### Authors can close and reopen comments (D43)

On both named and anonymous posts, the author can turn comments off before publication, close them afterward, and reopen them later. Closing comments stops new comments and replies but leaves existing comments visible under the post's audience and blocking rules. It does not change the post's visibility or identity. Reopening allows new comments under the existing eligibility and anonymity rules. Closing comments does not prevent reporting or blocking.

### Removing individual comments (D44)

**Comment editing (D56):** Members can edit their own comment text. Show an Edited label after the text changes. A published comment's named/anonymous identity stays fixed, including its anonymous thread label/avatar. The identity choice in D55 applies to new comments only, not edits. Post authors can remove another member's comment but cannot edit it. Members retain the ability to delete their own comments.

Members can delete their own comments. Post authors can remove any comment on their posts, including anonymous comments; authorization uses the underlying account without revealing anonymous identity. Neither permission allows editing another member's words. These rules apply to both named and anonymous posts and remain available when comments are closed.

Removal takes the comment out of member-visible content. It is separate from reporting and does not itself issue a strike, suspend an account or penalize the commenter or her vouchers. Any moderation finding follows the existing review process. Removal does not cancel an existing report.

### Post deletion is irreversible (D57)

Deleting a named or anonymous post automatically deletes its comments and replies, and removes it from feeds, profiles, the owner's anonymous-post view and any in-app shared-post surfaces. Post and comment deletion cannot be undone: no restore, trash or undo flow. Before committing a post deletion, confirm: **Delete this post and its comments? This cannot be undone.** Existing comment deletion permissions remain unchanged.

When DMs are introduced after MVP, recipients may view a shared post only while they remain eligible under its original audience, admission and blocking rules. Deleting the source post must remove the shared-post item and its preview from every DM where it was shared, without deleting unrelated messages. A DM share must not preserve an independent copy of the post or its comments. See [to-do-after-MVP.md](to-do-after-MVP.md).

The member-facing deletion operation is final. Existing moderation reports remain separate under D44; internal evidence and backup retention still require a defined lifecycle and do not provide a member restore option.

### Account deletion (D60)

Offer Delete account in Settings, requiring reauthentication and a clear permanent-deletion confirmation. Once confirmed, immediately hide the profile and associated content and end account access. Permanently delete all of her named and anonymous posts with their comments/replies, plus her own comments and likes elsewhere. Remove her follow relationships, pending follow requests, circle memberships and circles she owns. Do not delete unrelated members' posts or accounts.

There is no undo, account restoration or recoverable trash. Immediate removal from member-visible surfaces is separate from background storage cleanup; do not promise every stored copy disappears instantly. Apply D57's media, preview and future DM-share removal rules to deleted posts.

Women she vouched for retain their accounts; ordinary account deletion does not itself revoke their admission, issue voucher strikes or cause suspensions. Existing reports may still be reviewed. Retain only necessary evidence privately under a defined retention policy, with a separate backup-deletion lifecycle; retained data must not become visible or restorable member content. Retention periods still need definition before implementation.

### Anonymous labels and avatars (D37)

**D41: identity is fixed after publication; anonymous posts are app-wide only.** Choose named or anonymous before publishing. A published post cannot switch in either direction. Content can still be edited, and named posts can change audience under the existing rules. Anonymous posts have no Followers, Mutuals or Circle option and cannot later be narrowed to one of them. Selecting Anonymous in the composer sets Everyone on Eve and replaces the audience selector with a fixed audience label. Account privacy changes leave anonymous posts app-wide. Admission, blocking, deletion and moderation restrictions still apply; app-wide is not an access bypass.

In an anonymous thread, the original poster is labeled **Author + a random number** (for example, Author 73192), including when replying anonymously to her own post. Assign a distinct author number to each anonymous post so different threads are distinguishable, even when written by the same member. Other anonymous commenters receive **Anonymous + a random number** (for example, Anonymous 4827) and a randomly assigned cartoon-style profile picture.

Each participant keeps the same number and avatar throughout that thread, across replies and visits. Numbers distinguish participants within the thread and are randomly assigned, not sequential. Assign independently for each new thread; these identities do not form a persistent anonymous account or link to the member's real profile. Avatars must not use or derive from the member's real profile picture. Named comments retain the commenter's normal identity under D35.

Reserve **anonymous** as a username, case-insensitively, at signup and whenever usernames can be changed. System-generated anonymous labels are presentation identities, not selectable usernames. The Author marker is assigned by Eve based on post ownership.

### Anonymous posts stay separate from profiles (D42)

Anonymous posts appear in the app-wide anonymous section under their Author-number labels. They never appear on the author's profile, including to approved followers or close friends. Profile post counts exclude anonymous posts, including when profile statistics are made public.

The author accesses her own anonymous posts through a private **My anonymous posts** view, where she can find and manage them under the existing editing/deletion rules. Other members cannot access that view or use a profile or username search to retrieve her anonymous posts. This separation does not change the posts' app-wide audience, their thread identities, or block and admission rules.

### Blocking applies to the account in both directions (D40)

Blocking a named or anonymous participant blocks the underlying account across Eve. Neither member can see the other's posts or comments or interact with her, including through other anonymous thread identities. The rule covers existing and future activity and takes precedence over app-wide, follower, mutual and circle audiences. Comments still require parent-post access as well as the absence of a block with their commenter.

When a block starts from an anonymous post or comment, Eve resolves the account privately. Confirmation and block management retain the anonymous label used for that action and do not reveal the member's real username, avatar or profile. Do not notify the other person of who blocked her. This avoids direct identity disclosure; changes in what someone can see may still allow inferences.

Blocking is a personal boundary, not a moderation finding: it does not itself ban an account or issue voucher strikes. Reporting remains a separate action. If either member has an active block, the restriction applies in both directions.

---

## Reporting posts, comments and accounts (D58)

Members can report a post, comment or account. The MVP flow asks for a reason: harassment, exposed private information, impersonation/fake account, spam, or another concern. An explanation is optional. Submit the report privately to Eve's human moderation queue.

Only the reporter and authorized reviewers can access the report; the reported member never receives the reporter's identity. The reporter can track **Received**, **Reviewed**, and the final outcome **Action taken** or **No action taken**. Status updates do not reveal private reviewer notes, other reporters, or an anonymous member's real identity.

A report alone does not automatically delete content, ban an account or issue voucher strikes. Confirmed findings and any resulting actions follow the existing moderation and vouch rules. Deleting reported content does not cancel an existing report (D44/D57). External notifications remain generic under D45.

## MVP notifications (D61)

Provide an in-app Activity view for comments/replies, follow requests and approvals, vouch requests, admission updates, report outcomes and close-friends capture alerts. No like notifications in MVP, either in-app or push; likes themselves and their existing count-visibility rules remain unchanged.

Push notifications are optional and generic, for example **You have new activity on Eve.** Never include names, post/comment text or photos outside Eve. Members can turn social push notifications off in Settings without losing in-app Activity.

Anonymous post/comment activity uses the same Author-number or Anonymous-number as the source thread, never the underlying profile. Comments deliberately submitted with a name retain their named identity; close-friends capture alerts retain D46's approved viewer identification inside Eve.

Notification previews and destinations respect current access, including account admission, audience changes, blocks and deletion. A notification cannot preserve access to removed or newly restricted content. Pending applicants may see their own admission updates, not member activity or content. Existing privacy rules for vouch decisions and report outcomes still apply.

## Posts stay inside Eve (D45)

Eve does not provide external sharing of member posts, comments or media. No external share button, copy-post-link action, social cross-posting, embeddable post, or save/download action for member content. There are no externally viewable post pages or external content previews. This applies to named and anonymous posts, including Everyone on Eve posts.

App-wide always means inside the admitted community. Invitation, waitlist, authentication and vouch links can still exist outside the app, but carry no member-post content. Push/email notifications should direct members back into Eve without including post/comment text, media or author identity. Any future in-app forwarding must respect the original audience and blocks; this decision does not add DMs or forwarding to v1.

The community rule is that member content must not be redistributed outside Eve. Reports of external redistribution follow the moderation process. The product promise is that Eve provides no external sharing surface, not that content can never leave a device: screenshots, manual copying or photographing a screen cannot be completely prevented. Do not market "everything stays here" as a technical guarantee.

### Close-friends capture alerts (D46)

When Eve detects a screenshot while another member is viewing close-friends / Circle content, notify the post owner inside Eve with the viewing account's identity and relevant post: for example, **"ABC took a screenshot while viewing your close-friends post."** For a detected recording session covering that content, notify the owner as well. Where the platform signal also includes mirroring, use **"Screen recording or sharing was detected while ABC viewed your close-friends post."** Do not imply that Eve inspected a saved screenshot or video.

This applies only to close-friends / Circle content for now, including its post detail and comment view. Capture alerts are not added for ordinary Followers or app-wide posts. Check for capture already active when circle content becomes visible, not only when recording starts. Notify owners only about their content actually visible at the time, not every post in the circle.

Identify ABC as the signed-in viewing account, not a claim about who physically held the device. Show the detailed notice inside Eve; external push notifications remain generic under D45. Tell viewers that detected captures of close-friends content may notify its owner. A capture event alone is not proof of external redistribution and does not automatically issue strikes or suspend anyone.

Detection is best-effort and depends on platform support and client event delivery. Unsupported methods, modified clients and another camera may not be detected. No alert does not mean no capture occurred. Do not collect or upload the screenshot/recording itself. This adds owner alerts, not a new capture-blocking requirement, and does not reopen other sharing decisions.

## The one-liner

> **On Instagram, privacy is a property of your account. On Eve, it's a property of every post.**

Or, said the way you'd say it to a person:

> **You shouldn't need two accounts. Eve gives you one, and you choose who sees each thing you share.**

---

## The insight it rests on

Millions of women run two Instagram accounts — a main one and a finsta — because Instagram offers exactly one privacy switch, applied to everything at once. That's not a hypothesis. It's mass, observable, already-happening behavior, and every finsta is a person telling you the product is wrong.

The workaround *is* the market research. You don't have to convince anyone the problem exists; they've already built their own broken solution to it, twice over, on someone else's platform.

**Why Meta won't take this seriously:** they already tried. Close Friends is exactly this idea, shipped in its most minimal possible form — one binary list. It stays crude because fragmenting distribution is against Instagram's business model: their revenue depends on maximizing how many people see each post. Yours depends on constraining it. That's a strategy conflict, not a feature gap, and it's the most durable kind of moat a consumer app can have.

---

## What it actually is

### Three chronological feeds (D48)

| Feed | Content |
|---|---|
| Following | Named posts from accounts the member follows, including close-friends posts she is allowed to see |
| Community | App-wide named posts from across Eve |
| Anonymous | App-wide anonymous posts under Author-number labels |

All three feeds are chronological, newest first, for v1. Following uses established follows, not pending requests, and does not unlock a followed account's restricted posts. Community never includes Followers, Mutuals or Circle posts. Anonymous posts appear in Anonymous, not Following or Community, even if the viewer follows their author. Admission, current audience, deletion/moderation and blocking rules apply in every feed. This uses three views of the existing post system, not three separate publishing systems.

One composer. Two dials.

```
┌─────────────────────────────────────────────┐
│  [ what you're sharing ]                    │
│                                             │
│  Who sees this   ▸  Everyone on Eve          │
│                     Followers               │
│                     Mutuals                 │
│                     A circle  ▸ close / uni │
│                                             │
│  Posted as       ▸  Me                      │
│                     Anonymous               │
└─────────────────────────────────────────────┘
```

**Dial one — who sees this.** Choose the audience for a named post. In Anonymous mode this is fixed to Everyone on Eve (D41).

**Dial two — do they know it's me.** Identity, chosen before publishing and fixed afterward (D41).

That's the whole product. Everything else is a feed showing you what you're allowed to see.

### Why this makes the rant section nearly free

The rant section isn't a second product. It's a **combination of the two dials**: anonymous + a wide audience. The "rant feed" is a view over the same table, filtered to anonymous posts.

Build the composer properly and you get the rant section as a toggle rather than a separate build. That resolves the biggest contradiction in your answers — you cut the rant section in Round 05, but four other answers (1.3, 1.4, 4.2, 4.5) say it's the reason anyone comes back. It's in v1, and it's cheap, because it's the same primitive.

Two details that make it work:
- **Replies inherit the post's audience (D35).** The identity dial is available only on anonymous posts, where a reply can be named or anonymous. Named posts accept named replies only. One level of threading, not Reddit's full tree.
- **Anonymous is per-post, not per-account.** The same person is "me" on their photos and anonymous on their rant, in the same session. That's the thing no existing app does.

---

## Verification: two doors, one tier

*Revised 4 Sep 2026 (supersedes the vouch-only model of 1 Sep). Full mechanics in [architecture.md](architecture.md).*

### Launch admission (D59, 5 Sep)

Personal vouching is the main launch route. Applicants who do not know an existing member can choose **Request team review**. The team reviews membership eligibility and may approve admission through the existing team-invitation route; requesting review does not itself grant access. Pending or declined applicants cannot view member content. Keep the applicant's status private to her and authorized reviewers, with no promised turnaround time.

Eve remains women-only, including trans women. Do not use AI gender classification or judge eligibility from appearance or voice. Vouching and human review reduce impersonation risk but cannot guarantee membership eligibility or future conduct; reporting and human moderation remain necessary. Existing member-voucher eligibility, budgets and D39 strikes are unchanged.

ID/selfie verification and other verification upgrades are after-MVP review items, not launch requirements or automatically approved future admission rules. See [to-do-after-MVP.md](to-do-after-MVP.md). This launch decision supersedes the older automatic Path A admission proposal.

### The prime directive: Eve never stores an image

Tea's breach (72,000 verification selfies and government IDs in a public bucket, five consolidated federal class actions) fixed the one non-negotiable rule: **whatever the method, no document, selfie, or face template ever touches Eve's infrastructure.** Vendor-hosted capture, attributes back by webhook, four fields in our database. We cannot leak what we never possessed.

### Path A - vendor verification (deferred; requires redesign)

Vendor-hosted ID + liveness check (Persona / Veriff / Stripe Identity, ~$1–2). Works at user number one, which solves the bootstrap problem vouching alone cannot. Tea proved the friction is survivable: 1.7M women uploaded IDs to a safety app.

The previous proposal to fast-track admission using gender estimation or a document sex-marker match is superseded by D59. Identity, age and liveness checks are distinct from membership eligibility. Any future vendor route needs a fresh review of privacy, retention, cost, accessibility and admission rules before implementation; do not enable automatic Tier 2 admission from a vendor result.

### Path B — vouching (free, human, always available)

Vouches from people who personally know you are the main launch route. The number and kind are policy settings that may tighten as the graph grows (table below). No ID upload is required at launch. Applicants without an existing-member connection can request team review under D59; this is a human admission decision, not proof of gender or a legal guarantee.

Voucher strictness ramps with graph size (1 member vouch at launch → 2 at maturity); founding cohort is hand-verified by the founder with large vouch budgets. D38 review establishes the facts; D39 adds a voucher strike for each confirmed offending account even if the vouch was an honest mistake. Three active strikes suspend the voucher's account. Other people she admitted are not automatically sanctioned.

Instagram login was also considered and is not available: Meta shut down the Basic Display API on 4 Dec 2024 and the replacement doesn't support personal accounts.

### Trust tiers and community admission

| Tier | How you get there | What it unlocks |
|---|---|---|
| 0 — New | Signed up | Onboarding; no member content |
| 1 — Contact verified | Email magic link at launch; phone (SMS, VoIP blocked) once funded | Verification / invitation pending; no member content |
| 2 — Admitted | Qualifying personal vouch or approved team admission (D59) | Member feeds and participation, anonymous posting, and immediate circle creation/management; per-post audiences still apply |
| 3 — Established | 7+ days, clean record | Tier 2 capabilities plus vouching for others |

**All member content requires admission at Tier 2 or above.** App-wide posts, follows, circles, and explicit invitations to a post cannot bypass membership eligibility. The public waitlist and onboarding pages do not expose member content.

### Vouches for community admission

The vouch path supports applicants to the women-only community. External vouchers do not become members or gain access to content by completing a vouch. Broader membership is deferred.

Two kinds of voucher:

- **Member vouch** — from an established member (7+ days, clean record) **or** an invitation from Eve's team, which counts the same
- **Phone vouch** — from anyone with a verified phone. No account needed. Not required by the launch policy, so it waits for SMS to be funded

How many of each Tier 2 needs is configuration, not code, and tightens as the graph grows. Starting thresholds — tune them from the verification completion rate, not from theory:

| Phase | Roughly | Tier 2 needs |
|---|---|---|
| Launch | under ~200 members | 1 member vouch |
| Growth | ~200–2,000 | 1 member vouch + 1 phone vouch |
| Maturity | 2,000+ | 2 member vouches |

Tightening never demotes anyone already verified. Demotion is only ever explicit: a ban, or a change of declared gender.

**Vouch affirmation:** *"I personally know this person and, to my knowledge, she meets Eve's membership requirements. If this account is confirmed fake or ineligible, or removed for harmful conduct, I receive a strike even if my vouch was an honest mistake. Three strikes suspend my account. Knowingly providing a false vouch or helping someone evade a ban can also lead to losing my vouching privileges."* Keep the explicit "I don't vouch for this person" option and do not reveal a decline to the applicant. At launch, member vouches use the established account identity; phone verification for phone vouchers remains deferred until SMS is funded. The old automatic phone-blacklisting policy is not reinstated.

**Membership eligibility is attested, not proven by a gender test.** The vouch form shows the declaration — *"Ali has signed up as a woman. Is that accurate, to your knowledge?"* Personal vouches record the voucher's knowledge; the fallback team-review route makes an explicit human admission decision under D59.

**Vouch budget:** 3 per member, +2 per month of clean standing. Caps damage from any single bad actor, creates real scarcity, and makes people spend vouches on those they actually trust.

### Vouch accountability, review and strikes (D38-D39)

A vouch confirms personal knowledge and membership eligibility; it cannot guarantee future behaviour. A real member later harassing someone is different from evidence that the original account was fabricated or impersonating someone. We cannot reliably determine intent from one bad outcome. Under D39, however, an honest mistake still earns a strike when the vouched account's wrongdoing or ineligibility is confirmed.

1. Address the offending account based on its own conduct or evidence of fraud. Do not wait for a voucher review to protect members.
2. Review the vouch when evidence calls it into question. Several independently confirmed fake accounts linked to one voucher, or evidence of knowingly helping a banned person return, support investigation. Report volume alone does not establish misuse.
3. Ask the voucher privately how she knows the applicant. Do not identify reporters or disclose their private reports. Shared devices, network addresses and timing are supporting signals, not proof of intent; households can share them legitimately.
4. Temporarily pause further vouching when credible evidence suggests coordinated misuse. A pause is separate from community membership and is not a finding of guilt. Record the reason and revisit the case.
5. Restore investigation-only restrictions when concerns are resolved. Remove vouching privileges when the evidence supports deliberate false vouching, knowing ban evasion, or repeated confirmed misuse. Separately apply D39's strike rule regardless of intent. Explain decisions without exposing reporters and provide an appeal reviewed by a human.

**Three-strike rule (D39):** issue one strike to each responsible voucher for a distinct account she affirmed that is confirmed fake or ineligible, or removed for harmful conduct. An honest mistake is not an exemption. Reports, suspicions, ordinary account deletion and duplicate findings on the same account do not create additional strikes. Show the voucher her count and a reason that does not expose reporters. At three active strikes, suspend her account, not just her ability to vouch.

Appeals can challenge an incorrect finding, mistaken vouch attribution or duplicate strike. If overturned, reverse the associated strike and review any suspension that depended on it; do not clear unrelated restrictions. Claiming honest intent alone does not erase a valid strike. Suspension duration, reinstatement requirements, strike expiry, and the future treatment of external phone vouchers still need decisions before implementation.

Do not automatically revoke all previous vouches or remove everyone connected to a suspicious voucher. A suspension caused solely by voucher strikes does not itself create strikes for that voucher's own vouchers; otherwise this would recreate the rejected cascade. Review other implicated accounts individually. A first deliberate false vouch may escape detection; the existing waiting period, vouch budget and ongoing moderation limit abuse without proving honesty.

### The waitlist — for people who know nobody

A waitlist, not an adjudication. They submit their Instagram handle; Eve generates a code that expires in 30 minutes; they put it in their bio; **a reviewer opens instagram.com/[handle] directly and checks.** No media is ever accepted from the applicant — anything they upload can be generated, so nothing they upload is evidence.

The reviewer checks account age and history, follower quality, and presence in *other people's* accounts — the last being the hardest thing to fake, because a manufactured persona is an island.

Your team then **invites** from that list in batches, seeding clusters the graph hasn't reached. Choosing who to invite is a normal thing an invite-only network does; ruling on whether someone's gender claim is true is a different activity with a different legal shape.

### Anti-self-vouching

Reject a vouch from the applicant's own account. An established account and limited budget add friction but do not prove that two accounts belong to different people. Enforce distinct verified phone identities when phone verification is available. Shared device fingerprints and same-IP-within-ten-minutes are review signals, not automatic findings of false vouching or grounds for punishing a voucher (D38).

*Honest limit:* these checks add friction and evidence, but do not prove that accounts belong to distinct people or guarantee that abuse will be detected within a fixed time. Vouching remains one admission signal backed by ongoing moderation (D38).

### What's verifiable, and what is only attested

| | Verifiable | Method |
|---|---|---|
| Email | Yes | Magic link — the launch identity |
| Phone | Yes | SMS, VoIP blocked (~$0.05) — once funded |
| Age | **No** | Self-declared DOB with an 18+ gate; not verified age or a legal guarantee |
| Gender | **No** | Self-declared membership eligibility, supported by personal vouching or human team review (D59); not proven by a document marker |

### Broader membership is deferred

Men and other audiences outside the current women-only membership are not admitted in v1. Any future expansion needs a new product decision. Circles select among admitted members; they are not exceptions to membership eligibility.

## Business accounts: storefronts, not members

*Added 4 Sep 2026.*

Eve's individual space is women-only. Businesses get in on one condition:

> **Businesses can be seen, but cannot see.**

A storefront on the street of a women's club — women walk in and browse; the shopkeeper doesn't wander the club.

| Capability | Personal (woman) | Business |
|---|---|---|
| Post to followers | ✓ | ✓ (badged as business) |
| Rant / anonymous posting | ✓ | ✗ |
| View women-only content | ✓ (Tier 2) | ✗ — ever |
| Browse personal feeds/profiles | ✓ | ✗ — only their own posts, comments on them, aggregate analytics |
| Contact individuals first | (DMs are v2) | ✗ — never |

The obvious attack — a man registers "a business" — buys him a broadcast channel into the void and his own comment section. He cannot look at anyone. The loophole closes structurally, not by policy.

**Verification is KYB, not KYC:** registration number, domain-verified email, website + existing socials, Stripe billing card. No gender question exists for businesses. Payment is itself a fraud filter — no free business tier.

---

## Monetization

**Women: free.** Marketplace logic — subsidize the side that creates the value, charge the side that extracts it. Launch market is Pakistan; consumer ARPU is low there, and the trust ask at signup is already high. Founding pass and premium controls (extra circles, scheduling, expiring posts) stay as optional revenue, never a gate.

**Businesses pay:**
- **Subscriptions**, tiered: Starter (~$25–50/mo, profile + posting) → Growth (+ audience-composition analytics — *"your audience is 100% verified women"* is the sales pitch) → Scale (~$150–300/mo, + placement in a labeled Discover tab)
- **Creator/PR marketplace:** women creators opt into a brand-deals directory; Eve brokers matches and takes 10–15%. Differentiator: every follower is a verified woman, so influencer metrics are bot-free by construction — a known, expensive fraud problem elsewhere
- **Later:** commerce take-rate on checkout

**The feed promise (revised from "no ads ever"):** *Your feed is never for sale — no injected ads, no data selling. Businesses live in their own labeled spaces, and you choose to follow them.* Personal feeds stay clean permanently; sponsored placement exists only in the labeled Discover tab.

Rough math: 500 businesses at a blended $100/mo = **$600k ARR** — a quarter of Tea's revenue ($2.4M ARR at 1.7M users, ~1% conversion at $14.99/mo) with a fraction of the audience, and it scales *with* the women's side rather than against it.

---

## v1 scope

### Build

- **People search (D52)** — username/display-name search for admitted members, respecting blocks and existing profile visibility

- **A native app** — iOS first (Expo, shipped through a friend's Apple account), Android from the same codebase once the Play fee is paid. Web only for the waitlist and the voucher page
- **Invite / vouch onboarding** — links, pending state, public vouches, revocation
- **The composer** — audience and identity dials on posts; replies inherit the audience and offer the identity dial only on anonymous posts (D35)
- **Following and Community feeds** — chronological named-post views, respecting every audience rule (D48)
- **Anonymous feed** — chronological app-wide anonymous posts, filtered from the same posts (D41/D48); replaces the Rant view label
- **Profiles and follows** — minimal. Likes and follower counts are private to the owner by default; she can make them public after 30 days (7.4). No scoreboards on day one
- **Circles** — named custom audience lists
- **Likes and replies** — one level of threading
- **Report, block, and a human moderation queue you actually read**

### Cut

- **Saved posts / bookmarks (D49).** Deferred until after MVP. The proposed behaviour is recorded for later review in [to-do-after-MVP.md](to-do-after-MVP.md).

- **Video.** Text and images only for v1. Video means transcoding, CDN, storage cost, and a week you don't have. Your product is "post the thing you wouldn't post" — that's mostly words and pictures. Video is v2.
- **AI comment moderation.** Report and block are non-negotiable; the automated filter is not. Human queue at 200 users.
- **DMs.** Your own 5.3 flagged these as reflex-copied from Instagram. They're also your largest safety liability.
- **Pinterest boards, AI video generation, creator payouts, custom algorithm.** All correctly cut in Round 05. Keep them cut. Business revenue is a different thing: it's pre-sold before 12 Oct and built after (see Monetization). Nothing of it ships in v1 beyond the schema stub.

### The engineering shape

Every post row carries `audience_type`, `audience_ref`, and `is_anonymous`. Every read path filters on the viewer's relationship to that row. Get that right on day one — retrofitting per-post visibility into a schema that assumed public posts is a rewrite, not a migration.

---

## The loops

**Engagement**
1. She posts something she wouldn't post on Instagram — audience and identity chosen deliberately
2. Exactly the intended people see it, and no one else
3. They respond honestly, because the audience is bounded
4. She feels the difference — this is the part Instagram cannot give her
5. She posts again → back to 1

**Growth**
1. A member invites someone she knows
2. That person joins *because* she vouched — the invite is the trust
3. They get their own invites
4. → back to 1

**These are the same system.** Trust, verification, and growth all run on one mechanic. That's the elegant part, and it's what makes this explainable in one breath.

---

## Launch

**Seed cohort:** the names in your 2.1 — your sisters (Nabeeha, Karima, Tayyaba, Nurina), your friends (Urooj, Nighat, Hira), and their friends. Real people, real relationships, invited by hand.

**D47 confirms the existing launch approach:** recruit a few connected friend groups through those relationships, so each newcomer already knows some members and can also meet women from other groups through app-wide conversations. Around 30 women in three groups is an illustration, not a required group size. During the first two weeks of cohort use, observe posting, replies and return visits without repeated founder reminders. Seed real everyday posts, questions, photos and anonymous conversations on the Founders' Board.

**On geography:** you said South Asia plus the USA. With an invite-only launch you don't actually pick a country — you pick a seed cohort and the graph goes where their relationships go. So this resolves itself operationally.

But for the **pitch**, name one wedge. "We're winning a market I understand natively, then expanding" is a stronger sentence than "we're launching on two continents with 200 users." Lead with South Asia. Let the US arrive through the graph.

**Day one is not an empty room** — your 4.5 answer already solved this. The founding board, seeded with real posts and real rants by the founding cohort, before anyone else gets in.

---

## Where this is still weak

Honest list. Don't paper over these in an application; have answers.

1. **No revenue yet.** SPEEDRUN's recent cohorts put ARR in their one-liners. The plan: retention curve as the traction number, plus **signed business LOIs before 12 Oct** ("N businesses at $X/mo, launching November") as the ARR sentence. Pre-sell, don't pre-build.
2. **Cold start.** Invite-only helps enormously, but it caps growth by design. You'll need to show the graph compounding, not just existing.
3. **Vouching cannot guarantee honesty.** A determined bad actor with willing collaborators may get in. Waiting periods, limited budgets, evidence-based review and ongoing moderation limit abuse. Deliberate or repeated confirmed misuse can cost a voucher her vouching privileges (D38); an account ban alone does not establish that her vouch was dishonest.
4. **The rant section is a moderation liability.** Anonymous posting plus a community that came for safety is a combination that goes wrong fast without a real human in the queue. Budget for that in hours, not just dollars.

---

## Still open

- **3.2** — the verb. "Share" is too weak; every app is share. Yours is closer to *choose*, or *decide who sees this*. Worth getting right, it shows up everywhere.
- **2.4** — do your users describe the problem the way you do? Still unanswered, and it's an interview question, not a thinking question. Ask the seven women in 2.1 this week.
- **3.4** — what people get wrong when they repeat your one-liner. You'll only learn this by saying it out loud to strangers.
