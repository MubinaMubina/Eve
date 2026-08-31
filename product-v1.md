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

### The decision

**No ID documents. No biometrics. No selfie checks. Entry is by vouch.**

This isn't a compromise — it's the only architecture that fits the policy you actually stated in 0.4: *mostly women, trans women, then gay men.* No government ID identifies someone as a gay man. Many trans women cannot update their documents. **ID verification structurally cannot implement your inclusion policy.** Vouching can.

It's also cheaper (no $0.50–2.50 per user), far less legally exposed (no biometric data, so no BIPA or GDPR Article 9 problem), and it makes Eve a *private invite-only network* rather than a company adjudicating who counts as a woman. That distinction matters enormously, both legally and morally.

### The recommendation I want you to react to

You said vouching applies to men. **I think it should apply to everyone**, and here's the hole it closes:

If signup is open and only men need vouching, a man simply declares himself a woman at signup. Nothing catches him. The entire protection is a dropdown he can lie to.

So: **everyone enters by vouch.** Eve is invite-only, and your invite is a vouch from someone already here who knows you personally.

This is not "women need permission." It's the same mechanic every desirable network launched with — early Facebook, Gmail, Clubhouse. And it's worth being precise about a distinction your 8.1 answer collapses: **invite friction is not verification friction.** Verification friction is bureaucratic and insulting — upload your passport, wait, get rejected. Invite friction is social, and it makes a product *more* desirable, not less. An invite from your sister isn't a barrier. It's the reason you join.

### How it works

| | |
|---|---|
| **Everyone** | Enters by vouch from an existing member who knows them personally |
| **Women** | 1 vouch |
| **Men** | 2 vouches, both from women, both public on his profile |
| **Pending state** | Profile visibly reads *"Approval pending"* until cleared |
| **What pending can do** | Browse public posts only. No commenting, no DMs, nothing gender-filtered, no anonymous posting |
| **Vouches are public** | Shown on the vouched person's profile. Visible cost is what makes a vouch mean something |
| **Vouches are revocable** | Withdraw at any time; the account reverts to pending |
| **Accountability** | If someone you vouched for is banned, you lose vouching ability. Vouch chains police themselves |

### The detail that matters most

**A pending man must never be able to solicit vouches inside the app.** If he can message women to ask, you've built a harassment vector into your onboarding — on day one, in the exact place you promised safety.

Instead: he generates a **vouch link**, shares it *outside* Eve (WhatsApp, iMessage, wherever he actually knows these people), and she taps it. The ask happens in a relationship that already exists. Eve never carries it.

### Bootstrap

Your original rule — vouchers must have been members a month — means nobody can vouch at launch. Founding cohort is invited directly by you, with vouching rights from day one. The one-month seasoning rule kicks in after week four.

### Trans women and gay men

Trans women enter as women: one vouch, no adjudication by Eve, ever. Gay men enter through the standard two-vouch path. The company never rules on anyone's identity — the people who know them do. That's the whole point, and it's a good answer when you're asked.

---

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
