# Eve — Conversation Log

*Working sessions, 30 Aug – 4 Sep 2026. This is a record of what was decided and why, not a transcript. The reasoning is the valuable part — the conclusions alone won't survive contact with a co-founder or an investor question.*

**Files in this project**
- [questions-before-code.md](questions-before-code.md) — the 39-question thinking pass, with your answers
- [product-v1.md](product-v1.md) — product spec, current as of 4 Sep
- [architecture.md](architecture.md) — composer, feed, data model, authorization, security
- [roadmap.md](roadmap.md) — the rebuilt six weeks
- [todo.md](todo.md) — the checklist, the zero-budget configuration, and the spend ladder
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
