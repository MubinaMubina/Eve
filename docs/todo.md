# Eve — To-do

*Started 4 Sep 2026. Zero-budget mode: nothing is bought until there's money, and when money arrives it's spent in the order in §3. Platform: native iOS first through a friend's Apple account, Android from the same codebase when the Play fee is paid (D28).*

**Release gates and lifecycle policy:** [release-readiness.md](release-readiness.md). No real-member launch until its checklist passes.

**Companion docs:** [roadmap.md](roadmap.md) (the narrative) · [architecture.md](architecture.md) · [product-v1.md](product-v1.md) · [conversation-log.md](conversation-log.md)

**After MVP:** [to-do-after-MVP.md](to-do-after-MVP.md) tracks deferred features, starting with saved posts / bookmarks (D49). These are outside the current build checklist.

**Pre-build decision pass complete (D61), reconciled 6 Sep:** The architecture now defines the current database/API contracts instead of unsafe historical SQL. D62 lifecycle defaults are approved. Next: write migrations, implement and test. Checked product decisions do not mean those features are built.

**5 Sep scope override (D30):** Women-only membership for launch. Everyone on Eve means the admitted community, including when the author has a private account. The former Women only vs Everyone distinction and male-member demo are superseded.

## MVP Implementation Checklist

**Build started:** a synthetic Expo preview and the first applicant/review migration now exist. See [development.md](development.md) for implemented scope, tests and remaining integration work, and [your-setup.md](your-setup.md) for owner tasks. Partial preview behaviour does not complete the production checkboxes below.

*All approved MVP commitments below are required before the first real-member cohort. A local synthetic-data demo can be partial; the target date cannot silently defer privacy, deletion, vouch safeguards or capture alerts. Release sequencing is governed by [release-readiness.md](release-readiness.md).*

### Foundation and Audience Rules
- [x] Reconcile the architecture contract: mandatory admission/status/block checks before every audience; private authorship storage, narrow database API and stable two-field cursors
- [ ] Implement versioned migrations, private-schema grants/default privileges, internal authorization helpers and reviewed API functions; test direct-table, RPC, GraphQL, Realtime and media access as each relevant role
- [x] Define private-account follow approval (D31): owner approves or declines; pending and declined requests grant no follower access
- [ ] Implement private-account follow requests and owner-only approval/decline; check pending/declined requests against followers-only and mutuals audiences
- [x] Define new-post defaults (D32): private account = Followers; public account = Everyone on Eve; no separate preferred default or last-used audience
- [x] Define initial account privacy (D50): member chooses Private/Public during signup and can change it later in settings
- [ ] Implement required signup privacy selection and persisted/resumable choice; verify named-post defaults, owner-only settings changes and no admission bypass
- [ ] Implement account privacy and derived composer defaults; individual post overrides must not change the next new post's default
- [x] Define account privacy transitions (D33/D41): named non-circle posts become app-wide on private to public; named app-wide posts become Followers on public to private; anonymous posts always remain app-wide
- [x] Define pending requests on privacy switches (D54): going public accepts eligible pending requests without circle membership; returning to private retains followers; explain acceptance in confirmation
- [ ] Implement atomic pending-request acceptance with the private-to-public switch; verify admission/blocks, cancellations, retries, unchanged circle membership and retained follows when returning to private
- [ ] Implement atomic account privacy / existing-post audience changes, preserve anonymity and circle restrictions, and recheck current audiences and cached/media access
- [ ] Decide how account privacy changes affect drafts
- [x] Define circle history (D34): new close-friends members can see all existing posts in that circle
- [x] Define circle creation eligibility (D36): immediately at Tier 2; retain the seven-day wait and clean-record requirement for member vouching
- [ ] Implement circle creation/management for active Tier 2 owners; verify pending applicants are denied, newly admitted members can create circles, and vouching remains gated separately
- [ ] Implement and verify circle addition/removal against historical and new posts, including admission checks and isolation between circles
- [x] Define comment visibility and identity (D35): inherit current post audience; anonymous comments allowed only on anonymous posts
- [x] Define blocking (D40): underlying account, both directions, named and anonymous activity across Eve, without directly revealing anonymous identity
- [x] Define feed organization (D48): Following = eligible named posts from followed accounts; Community = app-wide named; Anonymous = app-wide anonymous; all chronological
- [ ] Implement three feed queries/navigation with independent pagination and shared authorization; verify no anonymous posts in Following/Community and no restricted named posts in Community
- [ ] Implement private account block records, anonymous-target resolution and identity-preserving block management; enforce before all audience grants and on comments independently of parent authors
- [ ] Verify block behaviour across feeds, direct reads/media, third-party threads, interactions, queued notifications and independent unblock actions; ensure blocks alone never issue voucher strikes
- [ ] Demo app-wide posting from a private account, then restricted posting checked against a member outside the audience; verify pending applicants cannot read either

### Profiles, Comments and Anonymity
- [x] Define private-profile preview (D51): basic profile details, request button and app-wide named posts; restricted posts still require audience eligibility and anonymous posts stay excluded
- [ ] Implement private-profile preview/request states and authorized named-post lists; verify profile visibility never bypasses admission, blocks, follower/mutual/circle rules or count privacy
- [x] Define anonymous likes/comment choice (D55): likes show counts without identities; ask Post as anonymous / I don't care for each new comment on an anonymous post; I don't care means normal profile identity
- [ ] Implement private anonymous-post liker records with count/own-like projections and explicit per-comment identity choice; verify no author/reader liker enumeration or named like notifications, and no silently reused named choice
- [x] Define comment controls (D43): author can disable before publishing, close later and reopen; existing comments remain visible for both post types
- [x] Define comment removal (D44): own comments or comments on own posts; no editing others' words; no automatic penalty and no cancellation of existing reports
- [ ] Implement comment-owner/post-owner removal with anonymous identity protection; verify authorization, closed comments, direct reads/previews and separation from reports/strikes
- [ ] Implement owner-only comment controls and server-enforced closure for all new replies; verify concurrent submissions, disabled-at-publish, reopening and unchanged existing-comment visibility
- [x] Define anonymous presentation (D37): a distinct random Author-number label per anonymous post; random Anonymous-number commenter labels and cartoon avatars, consistent within each thread; reserve anonymous as a username
- [ ] Implement private thread-identity mappings, collision-safe random numbers, cartoon avatar assets, and ownership-based Author-number labels without real-profile links; verify distinct posts get distinct author numbers and author replies reuse the post's label
- [ ] Reject anonymous case-insensitively at signup and username changes; verify server enforcement and anonymous identity consistency/isolation between threads
- [ ] Implement inherited comment access and server-enforced identity rules; verify named/anonymous parents, audience changes, and circle additions/removals
- [x] Define anonymous posting and published post identity (D41): anonymous = Everyone on Eve only; no identity changes after publication
- [x] Define anonymous/profile separation (D42): no anonymous posts or counts on profiles; private My anonymous posts view for the owner
- [ ] Implement owner-only anonymous-post management and profile/count/search exclusions; verify followers, close friends and direct API queries cannot link an anonymous post to a real profile
- [ ] Implement anonymous audience invariant, immutable published post identity, fixed-audience composer mode and named-only account privacy transitions; verify direct API bypass attempts and both account privacy settings

### Deletion and Media Privacy
- [x] Define image and video posts as MVP scope (D64); same post audiences and named/anonymous rules, with optional captions
- [ ] Implement protected photo/video uploads and playback, server-side file validation/limits, processing states, private thumbnails/transcodes and metadata stripping
- [ ] Verify media access for every audience and anonymous posts, including video range/segment requests, privacy changes, blocks, removal and deletion; no external download/share controls
- [ ] Confirm production attachment-count, format, file-size and video-duration limits; local preview limits are provisional
- [x] Define comment editing (D56): own text editable with Edited label; published identity fixed; post owners cannot edit others' words; own deletion remains available
- [x] Define irreversible deletion (D57): deleting a post deletes all comments/replies; no undo/restore; future DM shares must also be removed
- [x] Define account deletion (D60): Settings, reauthentication and permanent confirmation; immediate hiding/access termination, irreversible content/relationship cleanup, unaffected vouched-for members and private retained report evidence only under a defined policy
- [ ] Implement account deletion with immediate authorization denial/session revocation and idempotent cleanup; verify named/anonymous content, comments/likes elsewhere, follows/circles, concurrent writes, no restoration and no penalties or admission loss for invitees
- [x] Define D62 lifecycle defaults: 30-day ordinary deletion/backups, 180-day closed-case evidence, documented holds, 12-month strike expiry and human reinstatement
- [ ] Implement D62 cleanup/hold/backup lifecycles; prove exact deadlines and recovery behaviour with the chosen providers before real-member release
- [ ] Implement confirmed owner-authorized post/conversation deletion, media/view cleanup and irreversible post/comment deletion; verify concurrent writes, direct reads and no restore/reconnect resurrection
- [ ] Implement author-only comment text edits and server-controlled Edited state; verify immutable identity/parent, both identity modes, permission boundaries and removed-comment denial
- [x] Define external-sharing policy (D45): no external member-content sharing, public post pages, copy-post-link actions, embeds or content downloads; onboarding links remain content-free
- [ ] Implement content-free external notifications and public routes/previews; omit sharing/export controls and reconcile signed media delivery with authenticated access
- [ ] Verify post/comment/media authorization and no content leakage through previews or notification payloads; document redistribution reporting and the limits of preventing capture

### Relationships, Vouch Safeguards and Capture Alerts
- [x] Define follower removal (D53): quiet removal also clears all of that owner's close-friends/circle memberships on public and private accounts; refollow never restores circles
- [ ] Implement atomic owner-authorized follower/circle removal; verify private reapproval, public refollow, historical access revocation, unchanged other owners' circles and no removal notification/block/strike
- [x] Define MVP people search (D52): username/display-name search with basic profile results, admission/block checks and no anonymous identity lookup
- [ ] Implement people search and profile navigation; verify matches, duplicate display names, private accounts, both block directions, admission and absence of private account data or anonymous mappings
- [x] Define vouch accountability (D38-D39): evidence-based findings and appeals; honest mistakes still earn strikes; three active strikes suspend the voucher's account; no recursive cascade
- [ ] Implement private vouch-review records and independent vouching restrictions; enforce restrictions on issuance/affirmation, including pending requests, and preserve the waiting period and budgets
- [ ] Implement voucher strike ledger and atomic three-strike account suspension; one strike per confirmed offending account, including honest mistakes
- [ ] Verify reports alone do not count; cover first/second/third strikes, duplicates and concurrency, confirmed misuse, suspended/paused-voucher bypass attempts, factual appeals and unaffected invitees
- [x] Define D39/D62 suspension and expiry: third-strike suspension persists until fewer than three active strikes remain and human reinstatement is approved
- [ ] Implement and test expiry/reversal counting, duplicate-finding prevention and reinstatement races; external phone-voucher consequences stay deferred with that feature
- [x] Define close-friends capture alerts (D46): notify the owner of detected screenshots/recording with the viewing account; circle content only, accurate platform-dependent wording
- [ ] Implement supported screenshot and capture-state listeners, visible-circle-content attribution, authenticated event delivery and owner-only in-app notices; keep pushes generic and collect no captured files
- [ ] Verify on physical devices: capture already active on entry, screenshots, recording/mirroring, multiple visible posts, deduplication, offline events and unsupported coverage; no automatic strikes or alerts for non-circle content

---

## 0. Target Dates (Reverify Before Acting)

| Date | What | Notes |
|---|---|---|
| **12 Oct** | a16z SPEEDRUN SR008 priority window opens | Submit on the 12th. Window closes 1 Nov. Program late Jan–Apr 2027, SF, in person |
| **2 Nov, 8pm PT** | YC Winter 2027 deadline | About 11am Bangkok on 3 Nov — verify. Same demo, three more weeks of data. Decision by 11 Dec; batch Jan–Mar 2027, SF, in person |
| Now | Founders Inc Canopy — sign up for the next-cohort notification at f.inc/canopy | Last cohort applied early April, ran from mid-April, five weeks, on campus **or online**. The one that works without a visa |
| This week | B-1/B-2 appointment wait check at the Bangkok embassy | Both in-person programs start in January. The visa is the gate, not the acceptance |

---

## 1. The zero-dollar configuration

What launches, and what it replaces:

| Was | Now (free) | Comes back when |
|---|---|---|
| Phone OTP via Twilio (~$0.05/user) | Email magic link via Supabase Auth, sent through a Gmail app password over SMTP | Ladder #4 |
| Vendor ID check | Personal member vouch or approved team review; no vendor integration or automatic admission branch | Separate after-MVP approval, then funding |
| Phone vouches | Not needed — the launch `vouch_policy` row requires 0 of them | Ladder #4 |
| Paid hosting | Cloudflare Pages static export plus Supabase/PostHog free plans, subject to limits and production-readiness checks | Upgrade on measured needs and terms |
| Custom domain + Resend | Assigned `pages.dev` subdomain; Gmail SMTP subject to deliverability checks | Ladder #1 |
| Legal review | Draft accurate terms/privacy notices; invitation-only use is not a legal exemption | Assess before real users; planned professional review is a hard gate for expansion |
| Own Apple Developer account ($99/yr) | A friend's account: TestFlight public link for the cohort, App Store after. Built locally with Xcode, run on your iPhone with free personal signing | Ladder #9, then App Transfer |
| Android | Same Expo codebase, not shipped. Seed cohort must be on iPhone until then | Ladder #3 ($25) |

Tier 1 is contact verified by email, not admitted. D59 controls admission and D62 controls lifecycle/suspension; historical mixed-membership or vendor tier logic must not be reused.

The old assumption that Vercel Hobby is permitted until revenue begins is withdrawn. Its restrictions concern commercial purpose, not only collected revenue. See [Vercel fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines). The chosen web deployment is a static export; verify routing/auth callbacks, terms and plan limits before publishing. See [Cloudflare static deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/).

---

## 2. The list

### This week · Sep 4–7

**Build**
- [ ] Expo project with `expo-router`, TypeScript, Supabase client — running in the iOS Simulator
- [ ] Deploy the Expo static web export to Cloudflare Pages after terms/limits and routing checks; test waitlist, authenticated voucher page, auth callbacks and associated-domain files
- [ ] Supabase project (free tier)
- [ ] Bundle ID chosen as if permanent; entitlements limited to push and associated domains; no Sign in with Apple, no iCloud
- [ ] Auth: email magic link, DOB gate, one account per email. Custom SMTP through a Gmail app password
- [ ] Write versioned migrations from [architecture.md](architecture.md)'s current data dictionary; no speculative vendor/business tables or historical SQL copied into migrations
- [ ] Insert the launch `vouch_policy` row: 1 member vouch, 0 phone vouches
- [ ] Database privilege/RLS/API tests for pending, admitted, suspended, banned and deleting accounts, both block directions and unauthenticated access
- [ ] A cron ping so the Supabase free project never pauses (it pauses after 7 idle days)

**You**
- [ ] Talk to the seven — Nabeeha, Karima, Tayyaba, Nurina, Urooj, Nighat, Hira. *How many Instagram accounts do you have, and why?* Write their words down verbatim
- [ ] Waitlist page — a route in the same app, not a paid tool
- [ ] Prepare entity/EIN information now; apply for the planned corporation's EIN only after state formation. Recheck the current international application process and timing. [IRS instructions](https://www.irs.gov/businesses/employer-identification-number)
- [ ] Check the Bangkok B-1/B-2 appointment wait. The fee is the first money you'll spend, so know the date you'd need it by
- [ ] **Friend's Apple account:** they add your Apple ID to App Store Connect as App Manager, create the app record with your bundle ID, enable TestFlight. Get a one-line written agreement that the app transfers to you on request
- [ ] Confirm the seed cohort is on iPhone. Anyone on Android goes on the waitlist for ladder #3, not silently lost
- [ ] Sign up for the Founders Inc Canopy notification

**Social (see §6)**
- [ ] Create the accounts: TikTok, Instagram, X — one set for Eve, one for you as the founder. Same handle everywhere if you can get it. Waitlist link in every bio
- [ ] First post on the founder account: *"I'm building the app where women only means women only. $0, day 1."* No polish
- [ ] Ask the seven if their answer to "how many Instagram accounts do you have?" can be quoted, first name or anonymous

### Week 2 · Sep 8–14

**Build**
- [ ] Composer: named audience control (Everyone on Eve/Followers/Mutuals/Circle), anonymous fixed audience, identity preview and widening confirmation; defaults follow account privacy
- [ ] Private posts/authorship tables and allowlisted database API projections; no direct client reads or redacting-view-only privacy boundary
- [ ] Independent Following/Community/Anonymous feeds with `(created_at, id)` cursors; test equal timestamps and index query plans
- [ ] Running on your own iPhone with free personal signing (7-day certificate, re-sign weekly)
- [ ] By Friday: post to a chosen audience from the phone and see it in a feed

**You**
- [ ] Recruit connected friend groups through the seven, with familiar people within each group and several groups represented (D47); group sizes are flexible
- [ ] Decide the verb (3.2). One hour, then stop

**Social**
- [ ] Three short videos this week. Hook 1: *"how many Instagram accounts do you have?"* Hook 2: the finsta problem in your words. Hook 3: build-in-public, the composer on the Simulator
- [ ] Post one of the seven's quotes as a text card

### Week 3 · Sep 15–21

**Build**
- [ ] Follows, circles, circle management
- [ ] Personal-vouch flow: authenticated established voucher, hashed tokens, affirmation/decline, atomically enforced budget/restrictions and server-controlled admission
- [ ] Team invite as a `kind = 'team'` vouch, so the founder can hand-verify the cohort
- [x] Define launch admission (D59): personal vouching as the main route, Request team review for applicants without an existing member connection; no member content before approval
- [ ] Implement team-review request/status and reviewer-only approval/decline, with private notes and idempotent team admission; verify applicants cannot approve themselves or bypass moderation restrictions
- [ ] Implement D59 admission with no automatic vendor/sex-marker branch; upgrades remain in [to-do-after-MVP.md](to-do-after-MVP.md)
- [ ] Anti-self-vouch: open-source FingerprintJS, same-IP flag for review
- [ ] Keep vendor/phone-voucher integrations out of MVP; do not leave an executable hidden admission branch
- [ ] Persistent audience badge on published posts
- [ ] Voucher page on the web export: launch vouchers authenticate as established members; a token alone grants no vouching authority
- [ ] Universal links: associated-domains entitlement plus `apple-app-site-association` on the web export, so a vouch link opens the app when installed and the web page when not

**You**
- [ ] Founding cohort recruited through connected groups, with willing posters/responders in each; 30–50 is a flexible target (D47)
- [ ] Observe the cohort's first two weeks: posts, replies and return visits, distinguishing founder-prompted activity from unprompted participation
- [ ] Write template terms and privacy policy. Say plainly: anonymous to members not to Eve, screenshots can't be prevented, widening is retroactive

**Social**
- [ ] Three videos. One is the audience dial being chosen *before* typing — that's the thesis in four seconds
- [ ] Reply to every comment on the earlier posts. The replies are where the waitlist comes from

### Week 4 · Sep 22–28

**Build**
- [ ] Anonymous feed (D48) — anonymous index/filter, separate from chronological Following and Community feeds
- [ ] Replies, one level: inherited post audience; explicit Post as anonymous / I don't care choice for each comment on anonymous posts (D35/D55); owner can disable, close and reopen comments (D43)
- [x] Define reporting flow (D58): post/comment/account, reason and optional explanation, private reporter identity, Received/Reviewed/Action taken or No action taken
- [ ] Implement reporting and reviewer queue with reporter-only status access; verify identity protection, reviewer-only outcomes and no automatic penalty from report submission
- [ ] Report, block, and the moderation queue, including D58 reporting/status flow
- [ ] PostHog free tier: signup, verified, first post, D1/D7/D30 cohorts
- [ ] Empty states: pending applicants see owner-only admission status, not a member-feed teaser; admitted members see authorized content/next actions
- [ ] Profile counts private by default, `stats_public_at` after 30 days
- [x] Define MVP notifications (D61): recipient-private Activity, optional generic push, thread-safe anonymous identities, current-access checks and no like notifications
- [ ] Implement Activity for comments/replies, follow requests/approvals, vouch requests, admission updates, report outcomes and capture alerts; include read state and recipient-only access
- [ ] Implement optional generic push via `expo-notifications` and the social-push setting; disabling push must preserve in-app Activity
- [ ] Verify D61 event deduplication, recipient/status isolation, anonymous identities, push payload privacy, queued preference changes, stale destinations and absence of like notifications
- [ ] App Privacy labels and privacy-policy URL filled in App Store Connect (required for beta review too)
- [ ] Target the first external TestFlight build only after the real-member gate passes. Verify current store requirements and allow variable review time; do not promise Friday approval

**You**
- [ ] After the readiness gate, admit and seed the founding cohort; target 20 contributing members before expansion, without blocking the initial founders from joining

**Social**
- [ ] Three videos. One teases the rant section without showing any real post — a blank composer with *Anonymous* selected is enough
- [ ] A "we're opening to the first 50 next week" post with the waitlist link. Scarcity is true here, so say it

### Week 5 · Sep 29 – Oct 5

- [ ] Private TestFlight launch after readiness checks, with server-enforced cohort-only admission; outward expansion remains separately gated
- [ ] Submit to the App Store when readiness and current store checks pass; timing/review rounds are not guaranteed. Keep review evidence and contact details ready
- [ ] Watch the install step in the vouch funnel: link tapped → app installed → account created. If the drop is large, that's the PWA argument coming back as data
- [ ] Enforce the cohort-only/expansion flag and team-approved founding invitations across both admission paths; allow only audited privileged changes after the expansion gate. A capacity cap may supplement this, but cannot identify cohort membership or replace the gate

**Social**
- [ ] Record a synthetic-data demo: a private account's app-wide post is visible to an admitted non-follower, while its Followers/Circle post is not; pending applicants see neither
- [ ] Waitlist number as a weekly post: *"312 women waiting."* Real numbers only
- [ ] Watch daily: verification completion, posts per active member per week, W1 retention
- [ ] Fix what the numbers say
- [ ] Business track, free version: a one-page "Reach verified women" waitlist, then pitch 5–10 Pakistani boutique / beauty / fashion brands. Target signed LOIs at a named price. Conversations cost nothing
- [ ] Do **not** expand beyond the approved founding cohort until the expansion gate passes, even when an existing member offers a vouch

### Week 6 · Oct 6–12

- [ ] Nothing new. Fix and polish
- [ ] Write the application
- [ ] Record the current women-only admission and per-post audience demo on a real iPhone with synthetic accounts/content; no removed gender toggle or male-member account
- [ ] Rehearse: verification economics, inclusion policy in one sentence, why Meta won't copy it
- [ ] Submit SPEEDRUN on 12 October
- [ ] Start the YC application the same day. Same answers, same demo. Submit by 2 Nov, 8pm PT, with three more weeks of retention data in it

**Social**
- [ ] Keep the cadence. Investors reading an application look at the founder account, and a dead account reads like a dead product

### Weeks 7–8 · Oct 13 – Nov 2

- [ ] Nothing new in the build. Retention data accrues; fix what week 5 exposed
- [ ] YC application submitted before **2 Nov, 8pm PT**
- [ ] Founders Inc: apply the day the next Canopy cohort opens, online track if the visa isn't in hand

---

## 3. The spend ladder

When money arrives, buy in this order. Each row says what it unlocks and the trigger that says it's time.

| # | Item | Cost | Unlocks | Buy when |
|---|---|---|---|---|
| 1 | Domain | ~$12/yr | Real links in WhatsApp, sender reputation, Resend free tier for magic links | First $12 you have |
| 2 | B-1/B-2 visa fee | $185, possibly plus a separate visa integrity fee — check the current amount | The 12-week program is impossible without it, and the clock isn't yours | As soon as you can, regardless of product |
| 3 | Google Play Console | $25 one-time | Android — the same Expo codebase, and the majority platform in Pakistan. New personal accounts must pass a closed test (12+ testers, 14 days — verify) before production, so start it the day you pay | As soon as the visa fee is covered. Every Android name on the waitlist is a reason |
| 4 | Future SMS/phone verification | Requote when approved | Optional later phone identity and phone-vouch workflows | After separate approval and funding; not a hidden prerequisite for D59 team admission |
| 5 | Legal review | $1–3k | Opening beyond the hand-invited cohort. Anonymous posting among strangers without reviewed terms is the one risk not to take | **Hard gate** before public opening |
| 6 | Hosting upgrades | Recheck current pricing | Capacity, reliability and supported production features | Before plan limits or terms require it; not after a provider warning |
| 7 | Future verification provider | Requote after design review | Optional identity/age/liveness evidence, not automatic gender eligibility | Only after an explicit post-MVP decision; first measure the D59 team-review queue |
| 8 | Incorporation via Stripe Atlas | ~$500, then $1–2k/yr | Receiving investment | On acceptance, a term sheet, or revenue — never on a date |
| 9 | Your own Apple Developer account | $99/yr, org enrolment needs a D-U-N-S (free, ~5 days) | App Transfer from the friend's account: the app, its ratings and history become yours | Right after incorporation, or the moment the friend needs the account back. Needs one released App Store version first |

---

## 4. Free-tier limits to know

| Service | Free tier | Watch for |
|---|---|---|
| Supabase | 500 MB database, 1 GB storage, 50k monthly users | **Pauses after 7 idle days** — the cron ping above. Built-in email is rate-limited to a handful an hour, hence Gmail SMTP |
| Cloudflare Pages static export | Recheck current free-plan limits | Validate terms, deployment output, callbacks and routing before publishing; Vercel Hobby is not the commercial-launch fallback |
| PostHog | 1M events/month | Nothing at this scale |
| Gmail SMTP | ~500 emails/day per account | Fine for 50–200 people who know you. Not for strangers — that's ladder #1 |
| FingerprintJS OSS | Unlimited | Weaker than the paid version, and it was only ever a signal |
| Xcode + free personal signing | Unlimited local builds; run on your own iPhone | 7-day provisioning, up to 3 apps. Re-sign weekly. Not for distributing to anyone else |
| EAS Build (Expo cloud) | A capped number of builds per month | Build locally with Xcode instead — unlimited |
| TestFlight via the friend's account | Public link, up to 10,000 testers | Beta App Review on each new build (usually a day). Builds expire after 90 days |

---

## 5. What zero-budget costs you — be honest about it

- **Email is a weaker identity than phone.** One-account-per-email is trivially gameable. Launch admission therefore also requires a member vouch or team invitation. A banned user returning with a new email still needs a new vouch; knowing assistance with ban evasion is investigated under D38. Waiting periods, budgets and moderation limit abuse, but a first false vouch may escape detection. Confirmed offending accounts produce voucher strikes even for honest mistakes, with account suspension at three (D39); unrelated invitees are not automatically sanctioned.
- **Legal/privacy readiness is not waived by invitations.** Accurate notices, defined retention, consent where needed and working moderation are cohort gates; planned professional review remains an expansion gate.
- **Human admission takes time.** Applicants without an existing-member connection can request team review. Track queue age/capacity; there is no mandatory Instagram check or promised instant vendor route.
- **Gmail deliverability** is fine for known recipients and bad for strangers. Ladder #1 fixes it for twelve dollars.
- **iOS first in an Android country.** Until the $25 Play fee is paid, every Android woman in the cohort is on a waitlist. Count them; they're the argument for ladder #3.
- **The app is your friend's until it's transferred.** A transfer needs a released App Store version and a friend who still says yes. The written one-liner and the early submission are the whole mitigation.
- **The install step is back in the vouch funnel.** The 1 Sep plan avoided it with a PWA. Universal links soften it; measure link-tapped → installed → signed-up from the first day.

---

## 6. Social media — yours, every week, free

**Accounts.** Eve on TikTok, Instagram and X. You on the same three as the founder. The founder account does the work: people follow a person building something, not a logo with no users.

**Cadence.** Three short videos a week, no exceptions, no polish. One of each:

1. **A problem hook.** *"How many Instagram accounts do you have?"* · *"Your finsta is proof the product is wrong."* · *"Women only should mean women only."* · *"Why do men see posts that were never for them?"*
2. **Build in public.** *"Day 12, $0 spent, here's the composer."* The Simulator on screen, your voice over it. Setbacks included — a rejection from App Review is a better post than a feature.
3. **Their words.** A quote from the seven, then from members, as a text card. Ask first, every time.

**Hooks that come from the product itself:**
- The audience dial chosen *before* typing
- The three-second shot: app-wide named content visible to an admitted non-follower, restricted content hidden from her
- *"Anonymous to other members, not to us"* said out loud — honesty is a hook
- The waitlist count, weekly, real
- *"No ads in your feed, ever. Businesses live in their own room."*

**Rules that come from the product too:**
- Never a screenshot of a real member's post, name or handle. Not even blurred. The app's promise is privacy; the marketing can't spend it
- Never show who vouched for whom
- No fake numbers, no fake testimonials. The seven are real; use them
- Reply to every comment for the first month. The replies are where the waitlist comes from

**Measure one thing:** waitlist signups per post. PostHog can attribute the link in each bio with a `?src=` tag. Do more of whatever the number says.

---

## 7. If you get in: money for the move

None of the three pays a stipend or housing. Two of them fund the move through the investment itself; the third doesn't need a move.

| | Funds the move? | How | The gap |
|---|---|---|---|
| **YC** | Yes | $500K is committed on acceptance. The first $125K is wired once the Delaware company exists and the SAFE is signed. Rent and living for three months come out of it | Decision 11 Dec, batch in January. Company formation and the wire can take weeks, so the flight, the first month and the deposit may need to be found before the money lands. YC has done this for hundreds of international founders — ask on the acceptance call how fast they can wire |
| **SPEEDRUN** | Yes | $500K SAFE at the start of the program, same mechanics. a16z actively helps international founders incorporate and with visas | Same gap. Ask the same question |
| **Founders Inc** | No, and no move needed | Canopy runs online. Money, if any, comes at demo day at the end | If you do go to Fort Mason in person, that's on you. Online is the point |

**The bridge, roughly:**

| Item | Rough cost |
|---|---|
| B-1/B-2 visa fee | $185, possibly plus a separate integrity fee |
| Flight Bangkok → SF | ~$600–900 one way |
| First month in SF (a room, not a flat) | ~$1,500–2,500 |
| Deposit, food, phone, transit for the first weeks | ~$1,500 |
| **Before the wire lands** | **~$4–5k** |

That number, not the $500K, is the one to solve. The 42 network, family, the seven, or a small founder-friendly loan cover it. Both YC and a16z have seen founders in exactly this position and will tell you what has worked. Ask before you fly, not after.

**One question for their immigration lawyer, not for me:** a B-1 visitor cannot take a US salary. How a founder on a B-1 covers living costs from the company's money is something YC and a16z answer routinely. Ask it on the acceptance call.
