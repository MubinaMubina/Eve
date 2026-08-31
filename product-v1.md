# Eve — Product Definition v1

*Written 31 Aug 2026, from the answers in [questions-before-code.md](questions-before-code.md). This is the version I'd take into an application — react to it, don't accept it.*

---

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

One composer. Two dials.

```
┌─────────────────────────────────────────────┐
│  [ what you're sharing ]                    │
│                                             │
│  Who sees this   ▸  Everyone                │
│                     Women only              │
│                     Followers               │
│                     Mutuals                 │
│                     A circle  ▸ close / uni │
│                                             │
│  Posted as       ▸  Me                      │
│                     Anonymous               │
└─────────────────────────────────────────────┘
```

**Dial one — who sees this.** The audience boundary, chosen per post.

**Dial two — do they know it's me.** Identity, chosen per post.

That's the whole product. Everything else is a feed showing you what you're allowed to see.

### Why this makes the rant section nearly free

The rant section isn't a second product. It's a **combination of the two dials**: anonymous + a wide audience. The "rant feed" is a view over the same table, filtered to anonymous posts.

Build the composer properly and you get the rant section as a toggle rather than a separate build. That resolves the biggest contradiction in your answers — you cut the rant section in Round 05, but four other answers (1.3, 1.4, 4.2, 4.5) say it's the reason anyone comes back. It's in v1, and it's cheap, because it's the same primitive.

Two details that make it work:
- **Replies carry the same identity dial** — you can answer a rant anonymously too, or not. One level of threading, not Reddit's full tree.
- **Anonymous is per-post, not per-account.** The same person is "me" on their photos and anonymous on their rant, in the same session. That's the thing no existing app does.

---

## Verification: the vouch model

*Settled 1 Sep 2026. Full mechanics in [architecture.md](architecture.md).*

### No biometrics, no ID documents, anywhere

Not a cost decision — a structural one. ID checks **cannot implement the policy in your 0.4 answer** (women, trans women, gay men). No government ID identifies someone as a gay man; many trans women cannot update their documents. Vouching can. It also keeps you out of BIPA and GDPR Article 9 entirely, and it means Eve never adjudicates anyone's gender.

Instagram login was also considered and is not available: Meta shut down the Basic Display API on 4 Dec 2024 and the replacement doesn't support personal accounts.

### Trust tiers, not a binary gate

| Tier | How you get there | What it unlocks |
|---|---|---|
| 0 — New | Signed up | Browse public posts |
| 1 — Phone verified | SMS, VoIP blocked | Post and comment publicly |
| 2 — Vouched | Two vouches (A + B) | **Women-only content, anonymous posting** |
| 3 — Established | 7+ days, clean record | Create circles, vouch for others |

**Women-only content is gated at Tier 2, not at the front door.** Someone who lies at signup lands at Tier 1 and never reaches anything protected.

### The two vouches — identical for everyone

Same flow, same requirements, regardless of declared gender. A rule that treats men differently would require determining who is a man, which is the adjudication this design removes — and differential treatment by gender is the discrimination exposure.

- **Voucher A** — an established member (7+ days, clean record) **or** an invitation from Eve's team
- **Voucher B** — anyone with a verified phone. No account needed

**Both vouchers:** verify phone by SMS, give name, email and date of birth, and sign an affirmation — *"My vouch is attached to my number. If this account is removed for harming someone, I can never vouch again."* Invisible to the applicant. Explicit "I don't vouch for this person" option. The phone number is burned if the vouched account is later banned.

**The gender check happens here, performed by people who know the applicant.** The vouch form shows the declaration — *"Ali has signed up as a woman. Is that accurate, to your knowledge?"* Eve never decides; it only records what the people who know you said.

**Vouch budget:** 3 per member, +2 per month of clean standing. Caps damage from any single bad actor, creates real scarcity, and makes people spend vouches on those they actually trust.

### Path 2 — for people who know nobody

A waitlist, not an adjudication. They submit their Instagram handle; Eve generates a code that expires in 30 minutes; they put it in their bio; **a reviewer opens instagram.com/[handle] directly and checks.** No media is ever accepted from the applicant — anything they upload can be generated, so nothing they upload is evidence.

The reviewer checks account age and history, follower quality, and presence in *other people's* accounts — the last being the hardest thing to fake, because a manufactured persona is an island.

Your team then **invites** from that list in batches, seeding clusters the graph hasn't reached. Choosing who to invite is a normal thing an invite-only network does; ruling on whether someone's gender claim is true is a different activity with a different legal shape.

### Anti-self-vouching

Voucher A being an established member is structurally self-vouch-proof. Beyond that: different phone number (enforced by one-account-per-number), device fingerprint must differ from the signup device, and same-IP-within-ten-minutes flags for human review rather than auto-blocking.

*Honest limit:* nothing short of biometric matching proves two different humans. These make it expensive and awkward; behavioural signals catch the rest within days.

### What's verifiable, and what is only attested

| | Verifiable | Method |
|---|---|---|
| Phone | Yes | SMS, VoIP blocked (~$0.05) |
| Email | Yes | Magic link |
| Age | **No** | Self-declared DOB, hard 18+ block. A legal shield, not a fact |
| Gender | **No** | Self-declared, confirmed by vouchers who know them |

### Men on Eve

Men can join, browse, post publicly, and be vouched into full membership. They never see a post marked *Women only*, because that filter reads declared gender. **The asymmetry is in the content filter, not the entry gate.**

Gay men are not carved out. Any exception would be self-declared and instantly gamed — a filter with a checkbox bypass. Where a woman wants specific men included, **circles and "+ add specific people" already handle it, per post, by her choice.** That's more true to the product than a platform-level category would be.

*Note for the pitch:* "men are welcome" and "men are a growth segment" are different claims. Only the first is true.

## v1 scope

### Build

- **Invite / vouch onboarding** — links, pending state, public vouches, revocation
- **The composer** — both dials, on posts and replies
- **Feed** — chronological, respecting every audience rule
- **Rant view** — the anonymous filter over the same posts
- **Profiles and follows** — minimal
- **Circles** — named custom audience lists
- **Likes and replies** — one level of threading
- **Report, block, and a human moderation queue you actually read**

### Cut

- **Video.** Text and images only for v1. Video means transcoding, CDN, storage cost, and a week you don't have. Your product is "post the thing you wouldn't post" — that's mostly words and pictures. Video is v2.
- **AI comment moderation.** Report and block are non-negotiable; the automated filter is not. Human queue at 200 users.
- **DMs.** Your own 5.3 flagged these as reflex-copied from Instagram. They're also your largest safety liability.
- **Pinterest boards, AI video generation, monetization, custom algorithm.** All correctly cut in Round 05. Keep them cut.

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

**On geography:** you said South Asia plus the USA. With an invite-only launch you don't actually pick a country — you pick a seed cohort and the graph goes where their relationships go. So this resolves itself operationally.

But for the **pitch**, name one wedge. "We're winning a market I understand natively, then expanding" is a stronger sentence than "we're launching on two continents with 200 users." Lead with South Asia. Let the US arrive through the graph.

**Day one is not an empty room** — your 4.5 answer already solved this. The founding board, seeded with real posts and real rants by the founding cohort, before anyone else gets in.

---

## Where this is still weak

Honest list. Don't paper over these in an application; have answers.

1. **No revenue.** SPEEDRUN's recent cohorts put ARR in their one-liners. You won't. Your substitute is a retention curve, and you have to make that argument explicitly rather than hoping nobody notices.
2. **Cold start.** Invite-only helps enormously, but it caps growth by design. You'll need to show the graph compounding, not just existing.
3. **Vouching is softer than ID.** A determined bad actor with two friends willing to vouch gets in. Your answer: the vouch is public, revocable, and costs the voucher their own standing. It's a social deterrent, not a technical guarantee — say so plainly rather than overclaiming.
4. **The rant section is a moderation liability.** Anonymous posting plus a community that came for safety is a combination that goes wrong fast without a real human in the queue. Budget for that in hours, not just dollars.

---

## Still open

- **3.2** — the verb. "Share" is too weak; every app is share. Yours is closer to *choose*, or *decide who sees this*. Worth getting right, it shows up everywhere.
- **2.4** — do your users describe the problem the way you do? Still unanswered, and it's an interview question, not a thinking question. Ask the seven women in 2.1 this week.
- **3.4** — what people get wrong when they repeat your one-liner. You'll only learn this by saying it out loud to strangers.
