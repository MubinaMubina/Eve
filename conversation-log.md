# Eve — Conversation Log

*Working sessions, 30 Aug – 1 Sep 2026. This is a record of what was decided and why, not a transcript. The reasoning is the valuable part — the conclusions alone won't survive contact with a co-founder or an investor question.*

**Files in this project**
- [questions-before-code.md](questions-before-code.md) — the 39-question thinking pass, with your answers
- [product-v1.md](product-v1.md) — product spec. **Its verification section is now out of date** — superseded by the decisions below
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

### D12 — Mobile web PWA before native
No app store review delay, opens from a link, ships fixes in minutes. Native is a v2 decision.

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
- You can enroll as an **individual** today: $99/year, no company, no D-U-N-S. Individual → organization later is the same App Transfer process, minus the ownership ambiguity of using a friend's account.
- From **28 Apr 2026**, uploads must be built with Xcode 26 / iOS 26 SDK.

### Social platform APIs
- **Instagram Basic Display API shut down 4 Dec 2024.** The replacement doesn't support personal accounts — they must be converted to Business or Creator. **There is no way to log a normal personal Instagram account into a third-party app.**
- **TikTok Login Kit:** `user.info.basic` (avatar, display name) by default; follower and video counts need a separate pre-approved scope. Neither platform exposes the follower graph.

### Legal
- **BIPA (Illinois)** — private right of action, statutory damages per violation. The reason biometrics are the expensive mistake.
- **GDPR Article 9** — biometrics used for identification are special-category data.
- ***Tickle v Giggle*** (Australia, 2024) — excluding a trans woman from a women-only app was found to be unlawful discrimination. Mitigated here by Eve never adjudicating gender, a documented appeal path, and your inclusive 0.4 policy.

---

## 4. Still open

1. **Update [product-v1.md](product-v1.md)** with D3–D9. Its verification section describes the older model — don't build from it.
2. **The verb (3.2).** "Share" is too weak; every app is share. Yours is closer to *choose*, or *decide who sees this*.
3. **2.4 — do your users describe the problem the way you do?** Unanswered. It's an interview question, not a thinking question. Ask the seven women in your 2.1 list.
4. **3.4 — what people get wrong when they repeat your one-liner.** Only learnable by saying it out loud to strangers.
5. **A revenue line.** SPEEDRUN's recent cohorts put ARR in their one-liners. Worth deciding whether anything in Eve can carry a price before October.
6. **Rebuild the six-week roadmap.** The original assumed vertical video and ID verification. Both are gone; the plan is meaningfully more achievable now.
7. **Design work has barely started.** The composer, the feed, and the day-one experience have had a fraction of the attention verification received.

---

## 5. Known weaknesses — have answers ready

1. **No revenue**, against a cohort that leads with ARR.
2. **Cold start.** Invite-only helps enormously but caps growth by design. You need to show the graph compounding, not just existing.
3. **Vouching is a social deterrent, not a technical guarantee.** Someone with two willing friends gets in. Say that plainly rather than overclaiming — "we make bad actors socially expensive and remove them fast" is credible; "our AI verifies gender" invites the question you don't want.
4. **Anonymous posting plus a safety-seeking community** goes wrong fast without a real human in the moderation queue. Budget it in hours, not just dollars.
5. **Team review is a manual bottleneck.** Fine at 200 signups/week (~2 hours). At 5,000 you're hiring. If most people arrive through team review rather than member vouches, that's a signal the graph isn't spreading.
