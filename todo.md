# Eve — To-do

*Started 4 Sep 2026. Zero-budget mode: nothing is bought until there's money, and when money arrives it's spent in the order in §3. Platform: native iOS first through a friend's Apple account, Android from the same codebase when the Play fee is paid (D28).*

**Companion docs:** [roadmap.md](roadmap.md) (the narrative) · [architecture.md](architecture.md) · [product-v1.md](product-v1.md) · [conversation-log.md](conversation-log.md)

---

## 0. Dates that don't move

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
| Path A vendor ID check (~$1.50/user) | Path B only: 1 member vouch or a team invite. Schema and tier logic stay; the UI is hidden behind config | Ladder #7 |
| Phone vouches | Not needed — the launch `vouch_policy` row requires 0 of them | Ladder #4 |
| Vercel + Supabase + PostHog (~$50/mo) | Free tiers of all three | Ladder #6 |
| Custom domain + Resend | `eve.vercel.app`, Gmail SMTP | Ladder #1 |
| Legal review ($1–3k) | Template terms and privacy policy, honest about anonymity limits, cohort-only | Ladder #5, a hard gate |
| Own Apple Developer account ($99/yr) | A friend's account: TestFlight public link for the cohort, App Store after. Built locally with Xcode, run on your iPhone with free personal signing | Ladder #9, then App Transfer |
| Android | Same Expo codebase, not shipped. Seed cohort must be on iPhone until then | Ladder #3 ($25) |

Tier 1 is "contact verified" — email at launch, phone once SMS is funded. Everything else in the tier table is unchanged.

---

## 2. The list

### This week · Sep 4–7

**Build**
- [ ] Expo project with `expo-router`, TypeScript, Supabase client — running in the iOS Simulator
- [ ] Web export of the same project deployed to Vercel Hobby, for the waitlist page now and the voucher page later
- [ ] Supabase project (free tier)
- [ ] Bundle ID chosen as if permanent; entitlements limited to push and associated domains; no Sign in with Apple, no iCloud
- [ ] Auth: email magic link, DOB gate, one account per email. Custom SMTP through a Gmail app password
- [ ] The full schema from [architecture.md](architecture.md) — every table including `verifications`, `vouches`, `vouch_policy` and the business stub — with `phone_e164` nullable
- [ ] Insert the launch `vouch_policy` row: 1 member vouch, 0 phone vouches
- [ ] RLS policies and the RLS test suite, run as a user at each tier and as a business account
- [ ] A cron ping so the Supabase free project never pauses (it pauses after 7 idle days)

**You**
- [ ] Talk to the seven — Nabeeha, Karima, Tayyaba, Nurina, Urooj, Nighat, Hira. *How many Instagram accounts do you have, and why?* Write their words down verbatim
- [ ] Waitlist page — a route in the same app, not a paid tool
- [ ] File Form SS-4 for the EIN by fax or mail. Free, 4–8 weeks
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
- [ ] Composer: audience dial above the text field, identity dial with live preview, widening confirm, "+ add specific people"
- [ ] Posts table behind it, `feed_posts` view with `security_invoker`
- [ ] Feed with cursor pagination and the four indexes
- [ ] Running on your own iPhone with free personal signing (7-day certificate, re-sign weekly)
- [ ] By Friday: post to a chosen audience from the phone and see it in a feed

**You**
- [ ] Two names from each of the seven, in *different* circles
- [ ] Decide the verb (3.2). One hour, then stop

**Social**
- [ ] Three short videos this week. Hook 1: *"how many Instagram accounts do you have?"* Hook 2: the finsta problem in your words. Hook 3: build-in-public, the composer on the Simulator
- [ ] Post one of the seven's quotes as a text card

### Week 3 · Sep 15–21

**Build**
- [ ] Follows, circles, circle management
- [ ] Vouch flow, Path B only: hashed tokens, the voucher page, the declaration question, the explicit decline, `recompute_tier`
- [ ] Team invite as a `kind = 'team'` vouch, so the founder can hand-verify the cohort
- [ ] Anti-self-vouch: open-source FingerprintJS, same-IP flag for review
- [ ] Path A: **nothing built.** Leave a config flag and a stub route
- [ ] Persistent audience badge on published posts
- [ ] Voucher page on the web export — a voucher with no account never has to install anything
- [ ] Universal links: associated-domains entitlement plus `apple-app-site-association` on the web export, so a vouch link opens the app when installed and the web page when not

**You**
- [ ] 30–50 women committed to *post* in week 4, not just sign up
- [ ] Write template terms and privacy policy. Say plainly: anonymous to members not to Eve, screenshots can't be prevented, widening is retroactive

**Social**
- [ ] Three videos. One is the audience dial being chosen *before* typing — that's the thesis in four seconds
- [ ] Reply to every comment on the earlier posts. The replies are where the waitlist comes from

### Week 4 · Sep 22–28

**Build**
- [ ] Rant view — the anonymous index and filter
- [ ] Replies with the identity dial, one level
- [ ] Report, block, and the moderation queue
- [ ] PostHog free tier: signup, verified, first post, D1/D7/D30 cohorts
- [ ] Empty states: Tier 1 marker line, never a blank feed
- [ ] Profile counts private by default, `stats_public_at` after 30 days
- [ ] Push notifications via `expo-notifications`: vouch requests, replies
- [ ] App Privacy labels and privacy-policy URL filled in App Store Connect (required for beta review too)
- [ ] **First TestFlight build uploaded by Wednesday** through the friend's account. Beta App Review clears by Friday. Report, block and the moderation queue are in this build — Guideline 1.2

**You**
- [ ] Seed the Founders' Board. 20 members posting before anyone else is admitted

**Social**
- [ ] Three videos. One teases the rant section without showing any real post — a blank composer with *Anonymous* selected is enough
- [ ] A "we're opening to the first 50 next week" post with the waitlist link. Scarcity is true here, so say it

### Week 5 · Sep 29 – Oct 5

- [ ] Private launch through the TestFlight public link. Cohort invites outward with their vouch budgets
- [ ] Submit to the App Store early in the week. Expect one rejection round on anonymous user content; answer with the moderation queue and the contact address. A released version is what makes App Transfer possible later
- [ ] Watch the install step in the vouch funnel: link tapped → app installed → account created. If the drop is large, that's the PWA argument coming back as data

**Social**
- [ ] Record the three-second shot — a post visible from her phone, invisible from a man's — and post it everywhere. This is the whole product and the best hook you'll ever have
- [ ] Waitlist number as a weekly post: *"312 women waiting."* Real numbers only
- [ ] Watch daily: verification completion, posts per active member per week, W1 retention
- [ ] Fix what the numbers say
- [ ] Business track, free version: a one-page "Reach verified women" waitlist, then pitch 5–10 Pakistani boutique / beauty / fashion brands. Target signed LOIs at a named price. Conversations cost nothing
- [ ] Do **not** open beyond people you or a member personally invited — see ladder #5

### Week 6 · Oct 6–12

- [ ] Nothing new. Fix and polish
- [ ] Write the application
- [ ] Record the demo from the TestFlight or App Store build on a real iPhone: sign up, get vouched, pick *Women only*, post, show it invisible from a man's account
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
| 4 | Twilio Verify + Lookup | ~$10 to start, ~$0.05/user | Phone verification, one-account-per-number, burned phones, phone vouches, the growth `vouch_policy` phase | Before anyone joins who wasn't personally invited by a member |
| 5 | Legal review | $1–3k | Opening beyond the hand-invited cohort. Anonymous posting among strangers without reviewed terms is the one risk not to take | **Hard gate** before public opening |
| 6 | Vercel Pro | $20/mo | Commercial-use terms, more bandwidth for the web export | When Vercel asks, or traffic needs it. Cloudflare Pages is a free alternative that allows commercial use |
| 7 | Path A vendor (Persona / Veriff / Stripe Identity) | ~$1.50/user | Instant verification for people the vouch graph can't reach | When more than ~30% of the waitlist has waited over 7 days for a vouch |
| 8 | Incorporation via Stripe Atlas | ~$500, then $1–2k/yr | Receiving investment | On acceptance, a term sheet, or revenue — never on a date |
| 9 | Your own Apple Developer account | $99/yr, org enrolment needs a D-U-N-S (free, ~5 days) | App Transfer from the friend's account: the app, its ratings and history become yours | Right after incorporation, or the moment the friend needs the account back. Needs one released App Store version first |

---

## 4. Free-tier limits to know

| Service | Free tier | Watch for |
|---|---|---|
| Supabase | 500 MB database, 1 GB storage, 50k monthly users | **Pauses after 7 idle days** — the cron ping above. Built-in email is rate-limited to a handful an hour, hence Gmail SMTP |
| Vercel Hobby | 100 GB bandwidth | Terms say non-commercial. Fine pre-revenue; move when it isn't |
| PostHog | 1M events/month | Nothing at this scale |
| Gmail SMTP | ~500 emails/day per account | Fine for 50–200 people who know you. Not for strangers — that's ladder #1 |
| FingerprintJS OSS | Unlimited | Weaker than the paid version, and it was only ever a signal |
| Xcode + free personal signing | Unlimited local builds; run on your own iPhone | 7-day provisioning, up to 3 apps. Re-sign weekly. Not for distributing to anyone else |
| EAS Build (Expo cloud) | A capped number of builds per month | Build locally with Xcode instead — unlimited |
| TestFlight via the friend's account | Public link, up to 10,000 testers | Beta App Review on each new build (usually a day). Builds expire after 90 days |

---

## 5. What zero-budget costs you — be honest about it

- **Email is a weaker identity than phone.** One-account-per-email is trivially gameable. It's acceptable *only* because the launch policy requires a member vouch, so nobody gets in without a member spending budget on them. A banned user returning with a new email still needs a new vouch, and cascading revocation burns whoever gave it.
- **No reviewed terms** while the app is cohort-only. Acceptable among people you personally invited. Not acceptable one person beyond that.
- **No instant door.** Someone who knows nobody waits on the waitlist. That's the bootstrap risk D18 was meant to solve; the ladder brings it back at #6 the moment the waitlist shows the problem.
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
- The three-second shot: visible on her phone, invisible on his
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
