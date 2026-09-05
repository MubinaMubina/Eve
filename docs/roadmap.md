# Eve — Six Weeks to SR008

*Reconciled 6 Sep 2026; media scope updated under D64. Target sequence for the approved MVP, not a guarantee of shipping dates. Image and video posts are MVP scope. Vendor verification, messaging and business features remain after MVP.*

**Application target: 12 Oct 2026.** Reverify accelerator dates/terms with primary sources before submitting or spending. Product readiness, not an application deadline, controls real-member release.

**Companion docs:** [architecture.md](architecture.md) · [product-v1.md](product-v1.md) · [conversation-log.md](conversation-log.md)

**5 Sep scope override (D30):** Launch membership is women-only. Reconcile the architecture draft before building it. The demo should show a private account publishing an app-wide post, then a followers/circle post hidden from an admitted member outside that audience. Also verify that pending applicants cannot access member content. Earlier instructions to demonstrate a women's post against a male member account are superseded. Use Everyone on Eve / Followers / Mutuals / A circle as the audience choices; business access remains post-launch.

**Release authority:** [release-readiness.md](release-readiness.md) controls the local-demo, real-member cohort, store-submission and expansion gates. All D30-D62 MVP commitments, including voucher safeguards, deletion/media protection and capture alerts, are required before the cohort opens. [todo.md](todo.md) tracks implementation; weeks below are adjustable targets.

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

**Company - prepare now, apply in the correct order.** Gather formation and responsible-party information now. When incorporation is justified, form the planned corporation with the state first, then apply for its EIN using the appropriate current IRS process. Do not file for a corporation that does not yet exist. The IRS explicitly requires entity formation before the EIN application; timing must be checked then. [IRS guidance](https://www.irs.gov/businesses/employer-identification-number)

**Talk to the seven.** Nabeeha, Karima, Tayyaba, Nurina, Urooj, Nighat, Hira. One question above all: *how many Instagram accounts do you have, and why?* Their exact words become your landing page. This conversation is also founding-cohort recruitment — you're not researching, you're inviting.

**Waitlist page ships this week.** One afternoon. Headline, one-liner, email field. Every conversation ends with a signup.

**Your friend's Apple account — set it up this week.** They add your Apple ID to their App Store Connect team as App Manager, create the app record and the bundle ID (you choose the name), and enable TestFlight. Get a one-line written agreement that the app transfers to you on request. Nothing else about the account is needed until week 4.

**Build:** Expo/TypeScript in the iOS Simulator; static web export on Cloudflare Pages after deployment/terms checks; email-link auth, DOB declaration and explicit public/private signup choice. Implement private data migrations, grants, authorization helpers and API projections with negative-access tests. No speculative business/vendor schema. Use synthetic data until cohort readiness is proven.

---

## Week 2 · Sep 8–14

**Build:** named composer with account-derived audience defaults, anonymous fixed app-wide audience and thread identities, private posts/comments, relationship rules and the three feeds with `(created_at, id)` pagination. Test ownership, admission, privacy transitions, blocks and equal-timestamp pages. A partial demo remains local and synthetic.

**Users:** expand outward from the seven through connected friend groups (D47). Each newcomer should already know some members, with several groups represented so app-wide conversations can connect them. Around 30 women across three groups is an example, not a fixed target.

**Decide:** the verb (3.2). "Share" is too weak. It shows up in the composer button, the landing page, and the pitch, so it's worth an hour.

---

## Week 3 · Sep 15–21

**Build:** complete follows/requests/removal, circles, profiles/search, personal vouching and Request team review. Validate authenticated vouchers, budgets, restrictions, single-use tokens and reviewer-only decisions. Add the moderation/appeal queue, strike ledger, 12-month expiry and human reinstatement workflow. Both admission paths respect cohort controls. No vendor integration or mandatory Instagram-bio flow.

**Users:** line up the founding cohort through those groups. The existing 30–50 target is flexible; secure a few willing posters and responders in each group. Observe contributions and return visits over the first two weeks of use, including whether members return without repeated founder reminders (D47).

---

## Week 4 · Sep 22–28

**Build:** complete remaining feed/comment/like controls; irreversible post/account deletion, authenticated media, D62 cleanup/backup recovery, Activity and generic push preferences. Verify capture alerts on supported physical devices, including recording already active on entry. Finish moderation and privacy tests. Instrument only necessary retention events without private content or anonymous-author links.

**External TestFlight build:** upload only after every real-member gate passes and current store disclosures/signing requirements are checked. Review timing is variable; do not promise approval by Friday. Draft notices must accurately describe implemented controls and retention, not assume a template is sufficient.

**Seed the Founders' Board after readiness.** Admit the founding group first, then seed posts. Target 20 contributing members before expansion; this must not prevent the initial founders from being admitted.

---

## Week 5 · Sep 29 – Oct 5

**Private launch, only if ready.** A TestFlight installation does not itself admit someone. Keep both admission paths cohort-only until the expansion gate passes. Watch three numbers daily:

- **Admission completion and queue age, split by personal vouch/team review.** Track started signups reaching admission, waiting time and drop-off; use the split to understand reach and reviewer workload. There is no ID-door metric in MVP
- **Posts per active member per week.** Below ~1 and the loop isn't closing
- **W1 retention**, by cohort

**Fix what the numbers say, not what you assumed.** This week exists to be surprised.

**Submit to the App Store when ready.** Complete the store gate and budget for variable review cycles. Keep moderation/contact details and review credentials ready; a target date never waives a security or deletion test.

**Business track starts now (sell, don't build):** a one-page business waitlist (*"Reach Eve's admitted women-only community"*), then pitch 5–10 Pakistani boutique/beauty/fashion brands directly. Target: **signed LOIs at a named monthly price** before 12 Oct — a founding-partner deposit is even better. Business features remain after MVP and require later design; no business schema or product is implemented yet.

---

## Week 6 · Oct 6–12

**Build:** nothing new. Fix, polish, and stabilise only.

**Write the application.** The one-liner, the founder story, the metrics.

**Record the demo** with synthetic content/accounts on a real iPhone: sign up, choose privacy, get admitted; a private account publishes an app-wide named post visible to an admitted non-follower, then a Followers/Circle post that she cannot see. Pending applicants see neither. Show anonymous posting separately without connecting it to a real profile. No removed gender selector or male-member demo.

**The ARR sentence:** *"N businesses signed at $X/month, launching to them in November — women's side is free by design."* This is what the LOI track buys you.

**Rehearse:** the launch admission model and its limits, human moderation/review costs, the women-only inclusion policy and the audience-control use case. Treat competitor behaviour as a hypothesis, not a guarantee that the idea cannot be copied.

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

**Zero-budget launch intent (D27):** do not purchase services without funding/approval. The plan is feasible only if the chosen providers can satisfy the security, delivery and D62 lifecycle gates. If required capabilities cost money, fund them or delay the cohort; do not omit them.

| Item | Current approach |
|---|---|
| Web pages | Cloudflare Pages static export, with routing, terms and limit checks before publishing |
| Database/storage/auth | Supabase; validate media authorization, email delivery, cleanup and backup recovery before choosing production configuration |
| Analytics | Minimal PostHog events; no private content or anonymous-to-profile mappings |
| ID/SMS verification | Not part of MVP; reevaluate costs only after a separate approval |
| Privacy/legal readiness | Accurate notices and operational controls before real users; planned professional review before expansion |

The former claim that Vercel Hobby is fine until revenue starts is withdrawn. Commercial purpose matters under [Vercel's fair-use rules](https://vercel.com/docs/limits/fair-use-guidelines); use a suitable deployment plan from the outset. The static-export target is supported by [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/). No paid service or deployment has been created.

Human review and moderation cost time even when no vendor fee is paid. Measure both queue capacity and infrastructure usage.

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

**An empty feed on launch day.** Seed the admitted founding cohort before expansion; avoid a circular requirement that nobody can be admitted until members have posted.

**Building instead of recruiting.** The cohort is the product. Code with nobody in it demos nothing.

**Admission friction eating the funnel.** Measure personal-vouch and team-review completion/queue age, and improve the workflow without relaxing admission or privacy gates.

---

## If it slips

If the product isn't real by mid-October, applying in the January window with something working beats applying now with a deck. Your own 8.3 said you'd build this either way — so the date is a target, not a cliff. Protect the product, not the deadline.
