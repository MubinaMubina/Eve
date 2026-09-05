# Eve — Six Weeks to SR008

*Rebuilt 1 Sep 2026, revised 4 Sep. Supersedes the earlier plan, which assumed vertical video and mandatory ID verification. Video is gone. ID verification came back on 4 Sep as one of two optional doors (D18) — vendor-hosted, never stored by Eve — which adds a few days to week 3 and a line to the budget.*

**Priority window opens 12 Oct 2026. Closes 1 Nov.** Submit on the 12th, not the 1st.

**Companion docs:** [architecture.md](architecture.md) · [product-v1.md](product-v1.md) · [conversation-log.md](conversation-log.md)

**5 Sep scope override (D30):** Launch membership is women-only. Reconcile the architecture draft before building it. The demo should show a private account publishing an app-wide post, then a followers/circle post hidden from an admitted member outside that audience. Also verify that pending applicants cannot access member content. Earlier instructions to demonstrate a women's post against a male member account are superseded. Use Everyone on Eve / Followers / Mutuals / A circle as the audience choices; business access remains post-launch.

---

## The three tracks

Three things run in parallel and only one of them is code. The build is the one most likely to eat the other two, so protect them.

| Track | Owner | Why it can't wait |
|---|---|---|
| **Visa & paperwork** | You | Longest lead time, zero flexibility |
| **Users** | You | Your seed cohort *is* your launch |
| **Build** | Me | Five weeks of actual work |

---

## Week 1 · Sep 1–7

**Visa — start Monday.** Check the Bangkok B-1/B-2 appointment wait time. Apply on general business grounds; you don't need an acceptance letter, and a multi-year visa in hand removes the biggest execution risk from your application. This is the single most urgent item in the document because it's the only one whose clock you don't control.

**Company — start the paperwork, don't incorporate yet.** The only piece with real lead time is the **EIN**, which without an SSN or ITIN means filing Form SS-4 by fax or mail and waiting **4–8 weeks** on the IRS. Start that now; it costs nothing. Incorporate on a trigger — an acceptance, a term sheet, or revenue — not on a date. See *Deferred* below for why.

**Talk to the seven.** Nabeeha, Karima, Tayyaba, Nurina, Urooj, Nighat, Hira. One question above all: *how many Instagram accounts do you have, and why?* Their exact words become your landing page. This conversation is also founding-cohort recruitment — you're not researching, you're inviting.

**Waitlist page ships this week.** One afternoon. Headline, one-liner, email field. Every conversation ends with a signup.

**Your friend's Apple account — set it up this week.** They add your Apple ID to their App Store Connect team as App Manager, create the app record and the bundle ID (you choose the name), and enable TestFlight. Get a one-line written agreement that the app transfers to you on request. Nothing else about the account is needed until week 4.

**Build:** the Expo project running in the iOS Simulator, with the web export deployed to Vercel Hobby for the waitlist page; auth (email magic link; phone OTP once SMS is funded, DOB gate), the schema — including the `account_type` business stub and the `verifications`, `vouches` and `vouch_policy` tables, so nothing needs a migration later — RLS policies, and the RLS test suite.

---

## Week 2 · Sep 8–14

**Build:** the composer with both dials, posts table, and the feed with cursor pagination. By Friday you can post something to a chosen audience and see it in a feed. That's the spine.

**Users:** expand outward from the seven through connected friend groups (D47). Each newcomer should already know some members, with several groups represented so app-wide conversations can connect them. Around 30 women across three groups is an example, not a fixed target.

**Decide:** the verb (3.2). "Share" is too weak. It shows up in the composer button, the landing page, and the pitch, so it's worth an hour.

---

## Week 3 · Sep 15–21

**Build (D59 launch scope):** follows, circles, the "+ add specific people" flow, personal vouching and Request team review. Build vouch tokens, the voucher page, anti-self-vouch checks, applicant review status and a private team-review queue. Approved team reviews use the existing team-admission route; both launch routes use server-controlled admission and grant no member-content access while pending. Vendor ID/selfie integration remains after MVP; reconcile the old `recompute_tier` sketch before implementation.

**Users:** line up the founding cohort through those groups. The existing 30–50 target is flexible; secure a few willing posters and responders in each group. Observe contributions and return visits over the first two weeks of use, including whether members return without repeated founder reminders (D47).

---

## Week 4 · Sep 22–28

**Build:** complete the chronological Following, Community and Anonymous feeds (D48), report/block, the moderation queue, push notifications, and PostHog retention events. Instrument D1/D7/D30 with weekly cohorts — retention only measures forward and you cannot backfill it in October.

**First TestFlight build uploaded by Wednesday** through your friend's account, so Beta App Review (a day or two) clears by Friday and the cohort installs from a public link in week 5. App Privacy labels and a privacy-policy URL are required for beta review too — the template terms from week 3 cover it. Report and block are in this build on purpose: Guideline 1.2 requires them for anything with user-generated content.

**Seed the Founders' Board.** The cohort posts *before* anyone else is admitted. Nobody arrives to a blank feed. Do not open beyond the cohort until 20 members have posted.

---

## Week 5 · Sep 29 – Oct 5

**Private launch, through the TestFlight public link.** Cohort invites outward using their vouch budgets. Watch three numbers daily:

- **Verification completion rate, split by door.** What fraction of started signups reach Tier 2, and through which door? Under 50% overall is your most urgent product problem. If nearly everyone takes the ID door, the graph isn't spreading; if nearly everyone takes the vouch door, the ID flow is broken or distrusted
- **Posts per active member per week.** Below ~1 and the loop isn't closing
- **W1 retention**, by cohort

**Fix what the numbers say, not what you assumed.** This week exists to be surprised.

**Submit to the App Store early in the week.** Expect one rejection round — anonymous user-generated content gets read closely — and answer it with the moderation queue and the contact address. A released version is also the precondition for transferring the app to your own account later, so this submission matters beyond the listing.

**Business track starts now (sell, don't build):** a one-page business waitlist (*"Reach verified women"*), then pitch 5–10 Pakistani boutique/beauty/fashion brands directly. Target: **signed LOIs at a named monthly price** before 12 Oct — a founding-partner deposit is even better. Business *features* ship after the application; the schema stub already exists.

---

## Week 6 · Oct 6–12

**Build:** nothing new. Fix, polish, and stabilise only.

**Write the application.** The one-liner, the founder story, the metrics.

**Record the demo** — 60–90 seconds, the TestFlight or App Store build on a real iPhone, one take. Sign up, get verified, open the composer, pick *Women only*, post, then show the same post invisible from a man's account. **That last shot is the entire product in three seconds.** No slides, no music.

**The ARR sentence:** *"N businesses signed at $X/month, launching to them in November — women's side is free by design."* This is what the LOI track buys you.

**Rehearse three answers:** verification economics (vouching costs nothing; the instant door costs about $1.50 and Eve never holds the document — say both halves); your inclusion policy in one calm sentence; and why Meta won't copy this (Close Friends exists and stays crude because fragmenting reach fights their business model).

**Submit SPEEDRUN on 12 October, then start the YC Winter 2027 application the same day** — same answers, same demo, deadline 2 Nov 8pm PT, three more weeks of retention data. Founders Inc Canopy is the safety net that runs online; apply the day the next cohort opens. Decision D29 in the log.

---

## Targets by 12 October

| Metric | Floor | Strong |
|---|---|---|
| Verified members | 150 | 600+ |
| Posting weekly | 40 | 200+ |
| W1 retention | 25% | 40%+ |
| Verification completion | 50% | 75%+ |
| Waitlist | 300 | 1,500+ |

---

## Budget

**Zero-budget mode from 4 Sep (D27).** Everything below is what the plan *would* cost. Nothing is bought until there's money, and then it's bought in the order of the spend ladder in [todo.md](todo.md). The free configuration — email instead of SMS, Path B only, free hosting tiers, template terms for the cohort — is in that file too.

| Item | Cost |
|---|---|
| SMS (Twilio Verify + Lookup) | ~$0.05/user — every user |
| ID check (Path A) | ~$1–2 per user who chooses it — ~$450 if half of 600 members do |
| Hosting (Vercel, Supabase, PostHog) | ~$50/mo |
| Legal review (terms, privacy, moderation policy) | $1–3k |
| **Total to 12 Oct** | **~$2–4k** |

Dropping video removed the infrastructure cost. Verification is now two doors: SMS for everyone (about **thirty dollars** at 600 users) plus a vendor fee only for those who choose the instant check — worst case, every member takes it, about **$1,000**. The honest unit-economics answer is *"under two dollars a member, falling toward zero as the graph takes over from the vendor."*

Legal review is now the dominant line, and it's the one not to cut: you're launching a platform where women post sensitive content anonymously. Terms, privacy policy, and a written moderation policy before real users arrive.

**No Apple Developer enrollment** ($99) — the app ships through a friend's account, see *Platform* — and **no incorporation** ($500) before October.

---

## Platform — native iOS first, through a friend's account *(revised 4 Sep, D28)*

**Your call: a native app for iOS and Android, iOS first, shipped through a friend's Apple Developer account, at zero cost.** This reverses the 1 Sep plan (PWA only). The earlier argument still holds and is worth keeping in view: every user arrives through a vouch link, and *tap link → App Store → download → find your way back* is friction in the funnel 8.1 names as your top risk. Universal links soften it — the link opens the app when it's installed and a web page when it isn't — but the install step is real. Measure it.

**What's free:** Xcode, the Simulator, and free personal signing to run on your own iPhone (7-day certificates, re-sign weekly). Expo, `expo-router`, `expo-notifications`, APNs. Your friend's account gives you TestFlight — a public link for up to 10,000 testers, after a lighter Beta App Review — and the App Store submission. Build locally with Xcode rather than on EAS, whose free tier caps builds per month.

**What it forbids:** see [architecture.md §1.1](architecture.md) — no Sign in with Apple, no iCloud or purchase entitlements, a bundle ID you'd keep, and a released version before a transfer is possible.

**What's not free:** Android. Same Expo codebase, but Google Play Console is a one-time $25, and new personal accounts must run a closed test (currently 12+ testers for 14 days — verify the numbers when you pay) before production. Pakistan is overwhelmingly Android, so this is ladder #3 in [todo.md](todo.md): the seed cohort must be iPhone users until it's paid.

**Apple org enrollment later.** When you incorporate, enrol as an organization (needs a D-U-N-S, allow 5 business days) and use App Transfer. Ratings, reviews and download history move with it; the recipient has 60 days to accept.

---

## Deferred until there's a trigger

### Incorporation

Delaware C-corp via Stripe Atlas (~$500) is right *when you do it*, because US venture money only flows into that structure — SAFEs assume it, and a16z's does. But it isn't needed to apply, only to receive money, and there's typically 6–8 weeks between an acceptance and a wire. SPEEDRUN actively helps with this; a large share of their founders are international.

What it actually costs once you start: **$1,000–2,000 every year**, revenue or not — ~$450 Delaware franchise tax, ~$100 registered agent, Form 1120, and an accountant.

**Three things to have ready for when you do incorporate:**

- **Form 5472 — $25,000 penalty.** A US corporation that's 25%+ foreign-owned must file it annually alongside Form 1120, **even with zero revenue and zero activity**. This catches non-US founders constantly because nothing in the incorporation process warns you. Whoever does your taxes must know about it.
- **83(b) election — 30 days, no extensions.** File within 30 days of your founder stock being issued or you can owe tax on the appreciation as it vests. One of the most expensive founder mistakes there is. Filing it without an SSN is fiddly — get advice.
- **Delaware franchise tax method.** The default "authorized shares" calculation on a standard 10M-share startup produces a bill in the tens of thousands. Elect the **assumed par value** method to bring it to a few hundred.

**Banking:** Mercury bundles with Atlas but rejects Pakistani, Bangladeshi, Nigerian and Indian founders at higher rates. Your Thai residency may help, since banks often weigh residence over nationality. Have **Wise Business** ready as the fallback — generally the most forgiving for non-US founders. Relay and Rho are alternatives.

---

## What kills this

**Reopening settled decisions.** Verification took most of the design budget and it's done. Every reopened question costs a build day you don't have.

**An empty feed on launch day.** Twenty members posting before anyone else arrives. Non-negotiable.

**Building instead of recruiting.** The cohort is the product. Code with nobody in it demos nothing.

**Verification friction eating the funnel.** Measure both doors from day one and treat them as a product surface you iterate on, not a fixed cost.

---

## If it slips

If the product isn't real by mid-October, applying in the January window with something working beats applying now with a deck. Your own 8.3 said you'd build this either way — so the date is a target, not a cliff. Protect the product, not the deadline.
