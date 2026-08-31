# Eve — Six Weeks to SR008

*Rebuilt 1 Sep 2026. Supersedes the earlier plan, which assumed vertical video and vendor ID verification — both are gone, so this is meaningfully lighter.*

**Priority window opens 12 Oct 2026. Closes 1 Nov.** Submit on the 12th, not the 1st.

**Companion docs:** [architecture.md](architecture.md) · [product-v1.md](product-v1.md) · [conversation-log.md](conversation-log.md)

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

**Build:** auth (phone OTP, email, DOB gate), the schema, RLS policies, and the RLS test suite.

---

## Week 2 · Sep 8–14

**Build:** the composer with both dials, posts table, and the feed with cursor pagination. By Friday you can post something to a chosen audience and see it in a feed. That's the spine.

**Users:** expand outward from the seven. Ask each for two names in *different* circles — other cities, other universities, other friend groups. Fifty women who all know each other is one dense pocket; fifty across clusters is fifty expansion fronts.

**Decide:** the verb (3.2). "Share" is too weak. It shows up in the composer button, the landing page, and the pitch, so it's worth an hour.

---

## Week 3 · Sep 15–21

**Build:** follows, circles, the "+ add specific people" flow, and the vouch system end to end — tokens, the voucher page, tier transitions, anti-self-vouch checks.

**Users:** line up the founding cohort. Target 30–50 committed women who've agreed to post in week 4, not just to sign up. A member who joins and never posts is worse than no member — she's a person who saw an empty room.

---

## Week 4 · Sep 22–28

**Build:** rant view, report/block, the moderation queue, and PostHog retention events. Instrument D1/D7/D30 with weekly cohorts — retention only measures forward and you cannot backfill it in October.

**Seed the Founders' Board.** The cohort posts *before* anyone else is admitted. Nobody arrives to a blank feed. Do not open beyond the cohort until 20 members have posted.

---

## Week 5 · Sep 29 – Oct 5

**Private launch.** Cohort invites outward using their vouch budgets. Watch three numbers daily:

- **Vouch completion rate.** What fraction of started signups get two vouches? Under 50% and that's your most urgent product problem
- **Posts per active member per week.** Below ~1 and the loop isn't closing
- **W1 retention**, by cohort

**Fix what the numbers say, not what you assumed.** This week exists to be surprised.

---

## Week 6 · Oct 6–12

**Build:** nothing new. Fix, polish, and stabilise only.

**Write the application.** The one-liner, the founder story, the metrics.

**Record the demo** — 60–90 seconds, real app, real phone, one take. Sign up, get vouched, open the composer, pick *Women only*, post, then show the same post invisible from a man's account. **That last shot is the entire product in three seconds.** No slides, no music.

**Rehearse three answers:** verification economics (yours is near-zero marginal cost — that's a genuinely good answer, use it); your inclusion policy in one calm sentence; and why Meta won't copy this (Close Friends exists and stays crude because fragmenting reach fights their business model).

**Submit 12 October.**

---

## Targets by 12 October

| Metric | Floor | Strong |
|---|---|---|
| Verified members | 150 | 600+ |
| Posting weekly | 40 | 200+ |
| W1 retention | 25% | 40%+ |
| Vouch completion | 50% | 75%+ |
| Waitlist | 300 | 1,500+ |

---

## Budget

| Item | Cost |
|---|---|
| SMS (Twilio Verify + Lookup) | ~$0.05/user — **your only per-user cost** |
| Hosting (Vercel, Supabase, PostHog) | ~$50/mo |
| Legal review (terms, privacy, moderation policy) | $1–3k |
| **Total to 12 Oct** | **~$1.5–3.5k** |

Dropping ID verification and video removed almost all the variable cost — at 600 users your verification spend is about **thirty dollars** in SMS. That's a strong answer when they ask about unit economics.

Legal review is now the dominant line, and it's the one not to cut: you're launching a platform where women post sensitive content anonymously. Terms, privacy policy, and a written moderation policy before real users arrive.

**No Apple Developer enrollment** ($99) and **no incorporation** ($500) before October — see below.

---

## Deferred until there's a trigger

Two things the earlier plan had in week 1 that shouldn't be there.

### The App Store

**Ship the PWA only.** Every user arrives through a vouch link — tap from WhatsApp, land in Eve, join. Inserting *tap link → App Store → download → find your way back* adds friction to the exact funnel 8.1 names as your top risk. A PWA installs to the home screen, opens from a link, ships fixes in minutes instead of review cycles, and supports web push on iOS 16.4+. With no video in v1, nothing needs native.

Consequence: **no Apple org enrollment, so no D-U-N-S deadline** — which is what made incorporation urgent in the first place.

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

**Vouch friction eating the funnel.** Measure it from day one and treat it as a product surface you iterate on, not a fixed cost.

---

## If it slips

If the product isn't real by mid-October, applying in the January window with something working beats applying now with a deck. Your own 8.3 said you'd build this either way — so the date is a target, not a cliff. Protect the product, not the deadline.
