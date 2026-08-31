# Eve — Architecture & Interaction Spec

*Written 1 Sep 2026. Covers the composer, the feed, and the authorization model. Decisions here are load-bearing: per-post visibility is the product, so the read path is the security boundary.*

**Companion docs:** [product-v1.md](product-v1.md) · [conversation-log.md](conversation-log.md) · [roadmap.md](roadmap.md)

---

## 0. The governing principle

Every post carries an audience. Every read must prove the reader belongs to it.

This has one architectural consequence that dictates everything below: **authorization lives in the database, not the application.** A per-post visibility model enforced in application code fails the first time someone writes a query that forgets the filter — an admin tool, an analytics job, a new endpoint, a `SELECT *` in a migration script. There is no version of "we'll remember" that survives six months.

So: Postgres Row Level Security is the enforcement layer, the API is a convenience layer, and the client is assumed hostile.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| App | Next.js 15 + TypeScript, deployed on Vercel | Mobile-web PWA, installable, ships in minutes |
| Data & auth | Supabase (Postgres 15+) | **RLS is the reason.** Auth, storage and Postgres in one, and RLS gives us database-level authorization |
| Images | Supabase Storage, signed URLs | No video in v1, so no transcoding pipeline needed |
| SMS | Twilio Verify + Lookup | Lookup blocks VoIP and virtual numbers |
| Email | Resend | Magic links, vouch notifications |
| Analytics | PostHog | Cohort retention — instrument from commit one |
| Fingerprint | FingerprintJS (open-source build) | Anti-self-vouch signal only, never an identity |

---

## 2. Data model

Notes before the schema: **all primary keys are UUIDs, never sequential integers.** Sequential IDs let anyone enumerate posts and users, and worse, they leak ordering — which for anonymous posts is a correlation vector.

```sql
-- ─────────────── identity ───────────────
create table users (
  id                uuid primary key default gen_random_uuid(),
  phone_e164        text unique not null,
  email             citext unique,
  handle            citext unique not null,
  display_name      text,

  declared_gender   text not null check (declared_gender in ('woman','man','nonbinary')),
  gender_set_at     timestamptz not null default now(),

  dob               date not null,           -- 18+ enforced at write and by constraint
  tier              smallint not null default 1 check (tier between 0 and 3),

  seasoned_at       timestamptz,             -- when they became eligible to vouch (tier 3)
  vouch_budget      smallint not null default 3,

  status            text not null default 'active'
                    check (status in ('active','suspended','banned')),
  created_at        timestamptz not null default now(),

  constraint adult check (dob <= (current_date - interval '18 years'))
);

-- ─────────────── graph ───────────────
create table follows (
  follower_id uuid not null references users(id) on delete cascade,
  followee_id uuid not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create table circles (
  id       uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  name     text not null
);

create table circle_members (
  circle_id uuid not null references circles(id) on delete cascade,
  member_id uuid not null references users(id) on delete cascade,
  primary key (circle_id, member_id)
);

-- ─────────────── posts ───────────────
create type audience_kind as enum ('everyone','women','followers','mutuals','circle');

create table posts (
  id                uuid primary key default gen_random_uuid(),
  author_id         uuid not null references users(id) on delete cascade,
  body              text,
  media             jsonb not null default '[]',

  audience_type     audience_kind not null,
  audience_circle_id uuid references circles(id) on delete cascade,

  is_anonymous      boolean not null default false,

  created_at        timestamptz not null default now(),
  deleted_at        timestamptz,

  constraint circle_ref check (
    (audience_type = 'circle') = (audience_circle_id is not null)
  )
);

-- explicit per-post additions: "Women only + Ali"
create table post_extra_viewers (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  primary key (post_id, user_id)
);
```

### The gender-change hole

A man declares male, gets vouched, then edits his profile to female and walks into women-only content. **Close it at the database:**

```sql
create or replace function invalidate_tier_on_gender_change()
returns trigger language plpgsql as $$
begin
  if new.declared_gender is distinct from old.declared_gender then
    new.tier          := least(old.tier, 1);   -- drop out of Tier 2+
    new.gender_set_at := now();
    delete from vouches where applicant_id = new.id;  -- must be re-vouched
  end if;
  return new;
end $$;

create trigger trg_gender_change
  before update of declared_gender on users
  for each row execute function invalidate_tier_on_gender_change();
```

Changing your declared gender is legitimate and must stay possible. It just costs you re-vouching, which is the honest price — the vouchers confirmed a specific declaration, and the declaration changed.

---

## 3. Authorization

### The predicate

```sql
create or replace function can_view(viewer uuid, p posts)
returns boolean language sql stable as $$
  select
    p.deleted_at is null
    and (
      -- your own posts, always
      p.author_id = viewer
      -- explicitly added to this post
      or exists (select 1 from post_extra_viewers x
                 where x.post_id = p.id and x.user_id = viewer)
      or case p.audience_type
           when 'everyone'  then true
           -- Tier 2 gate lives here, and only here
           when 'women'     then exists (select 1 from users u
                                         where u.id = viewer
                                           and u.declared_gender = 'woman'
                                           and u.tier >= 2
                                           and u.status = 'active')
           when 'followers' then exists (select 1 from follows f
                                         where f.follower_id = viewer
                                           and f.followee_id = p.author_id)
           when 'mutuals'   then exists (select 1 from follows a
                                         where a.follower_id = viewer
                                           and a.followee_id = p.author_id)
                              and exists (select 1 from follows b
                                         where b.follower_id = p.author_id
                                           and b.followee_id = viewer)
           when 'circle'    then exists (select 1 from circle_members m
                                         where m.circle_id = p.audience_circle_id
                                           and m.member_id = viewer)
         end
    );
$$;

alter table posts enable row level security;

create policy posts_read on posts for select
  using (can_view(auth.uid(), posts));

create policy posts_write on posts for insert
  with check (author_id = auth.uid());
```

**Read the `women` branch carefully — it is the whole product.** Declared gender alone is not enough; `tier >= 2` means the declaration has been confirmed by two people who know them. Someone who lies at signup sits at Tier 1 and this branch returns false for them, forever, until vouched.

### Why evaluation happens at read time

Circle membership, follows, and tier all change. Evaluating at read time means **removing someone from a circle immediately removes their access to every past post to that circle.** Precomputing visibility at write time would leave stale grants behind — a bug class that in this product means a man still seeing posts he was cut off from.

Read-time evaluation costs performance. That trade is correct here, and §5 covers how to keep it fast.

---

## 4. Anonymity

The subtle one. RLS decides *whether* you see a row; it does nothing about *what's in it*. If clients read `posts` directly they get `author_id` on every row they're allowed to see — including anonymous ones.

**Clients never touch `posts`.** They read a view:

```sql
create view feed_posts with (security_invoker = true) as
select
  p.id,
  p.body,
  p.media,
  p.audience_type,
  p.is_anonymous,
  p.created_at,
  case when p.is_anonymous and p.author_id <> auth.uid()
       then null else p.author_id end          as author_id,
  case when p.is_anonymous and p.author_id <> auth.uid()
       then null else u.handle end             as author_handle,
  case when p.is_anonymous and p.author_id <> auth.uid()
       then null else u.display_name end       as author_name
from posts p
join users u on u.id = p.author_id;
```

`security_invoker = true` keeps RLS applied as the querying user rather than the view owner — without it the view becomes a bypass. This is the single most important line in the file.

`author_id` is still stored, always. Moderation needs it, bans need it, and "anonymous" means *anonymous to other users*, never *untraceable by us*. Say that plainly in the privacy policy — a user who believes it's untraceable and later learns otherwise has been misled.

**Three leaks to close:**

1. **Post counts.** A profile showing "24 posts" when 19 are visible tells you five are hidden. Count only non-anonymous posts in public profile stats.
2. **Ordering and IDs.** UUIDv4, not v7 or sequential — v7 embeds a timestamp, which correlates an anonymous post with anything else posted at that moment.
3. **Style and timing.** Unsolvable technically. A small community will sometimes recognise a voice. Say so in the UI copy — "anonymous to other members" is honest; "completely anonymous" is not.

---

## 5. The feed

### Query strategy

RLS is the backstop, not the fast path. Calling `can_view` per row forces a sequential scan. Instead, resolve the viewer's predicates once per request and push them into an index-friendly query:

```sql
-- $1 viewer, $2 followed ids, $3 mutual ids, $4 my circle ids,
-- $5 viewer is a Tier-2 woman, $6 cursor
select id, body, media, audience_type, is_anonymous, created_at,
       author_id, author_handle, author_name
from feed_posts
where created_at < $6
  and (
        audience_type = 'everyone'
     or (audience_type = 'women'     and $5)
     or (audience_type = 'followers' and author_id = any($2))
     or (audience_type = 'mutuals'   and author_id = any($3))
     or (audience_type = 'circle'    and audience_circle_id = any($4))
     or author_id = $1
  )
order by created_at desc
limit 50;
```

**Cursor pagination on `created_at`, never `OFFSET`.** Offset pagination on a feed that changes underneath you skips and duplicates posts, and it degrades linearly.

```sql
create index posts_recent           on posts (created_at desc) where deleted_at is null;
create index posts_author_recent    on posts (author_id, created_at desc) where deleted_at is null;
create index posts_audience_recent  on posts (audience_type, created_at desc) where deleted_at is null;
create index posts_anon_recent      on posts (created_at desc)
  where is_anonymous and deleted_at is null;   -- the rant feed
```

**Fan-out-on-read is correct at your scale** and stays correct into the low tens of thousands of users. Revisit when feed p95 crosses ~200ms, not before. Building write-time fan-out now would be optimising for a scale that premature optimisation will stop you reaching.

### The rant feed is not a second product

It's the last index above — the same posts table, filtered to `is_anonymous`. One table, one composer, one authorization path. This is what makes the rant section nearly free, and it's why it belongs in v1.

---

## 6. The composer

### Layout

```
┌───────────────────────────────────────────┐
│  ◆ Women only                        ▾    │   ← audience, always visible, at the top
│  ────────────────────────────────────     │
│                                           │
│   What's on your mind?                    │
│                                           │
│                                           │
│  ────────────────────────────────────     │
│  🖼  Photo        Posting as: You     ▾   │
│                                    [Post] │
└───────────────────────────────────────────┘
```

### Rules, and why each exists

**The audience control sits above the text field, always visible.** Facebook spent years learning this: when the audience selector lives *after* the composition, people write for an imagined audience, then discover the setting. Choosing the room before you speak is the correct order, and it's the whole thesis of the product — putting it at the bottom would contradict the thing being built.

**Default is your last-used audience. First-ever default is Women only.** Safe default principle: the default must be the one whose failure mode is disappointment, not exposure. Someone who meant "everyone" and posted to women only is mildly annoyed. The reverse is the harm the app exists to prevent.

**Widening asks for confirmation; narrowing never does.** Moving from Women only → Everyone shows a one-line confirm. Going the other way is silent. Friction belongs only on the dangerous direction.

**"+ Add specific people" is an explicit act.** Per the design decision: *Women only* means women only. If she wants Ali included she taps and adds him, and he appears as a named chip she can see. Never a silent carve-out behind a label that says otherwise — a reassuring label with a quiet exception inside it is how this product breaks its central promise.

**The identity dial shows a live preview.** Switching to Anonymous re-renders the avatar and name in the composer as they'll appear to others. People need to *see* their name disappear, not read that it will.

**Published posts keep a persistent audience badge**, visible to the author on her own posts forever. She should never have to remember who could see something — she should be able to look.

---

## 7. Empty states

Day one is a design problem, not a content problem. Your 4.5 answer already had it right; this is the implementation.

**Never render a blank feed.** A first-run feed shows the Founders' Board — real posts and real anonymous rants from the founding cohort, seeded before anyone else is admitted. Do not open signups until 20 members have posted.

**Tier 1 users see a marker, not a void.** Where women-only content would be, an explicit line: *"Some posts here are visible to verified members. Get two vouches to see them."* Absence should be legible. An empty feed reads as a dead app; a feed that tells you what you're missing reads as a door.

**Every empty state names the next action.** No illustrations of empty boxes, no "Nothing here yet."

---

## 8. Security checklist

**Authentication**
- OTP: 6 digits, 10-minute expiry, max 5 per phone per hour, 10 per IP per hour, lockout after 5 failed attempts
- **Never leak registration status.** "We've sent a code" is the response whether or not the number exists — anything else is a user-enumeration oracle
- Twilio Lookup rejects VoIP and non-mobile numbers at signup

**Vouch tokens**
- 32 bytes from a CSPRNG, **stored hashed** (SHA-256) — a database read must not yield working links
- Single-use, 24-hour expiry, bound to one applicant and one slot
- Rate-limited per applicant; a burst of vouch requests is itself a signal

**Anti-self-vouch**
- Phone must differ from the applicant's (enforced by uniqueness)
- Device fingerprint must differ from the signup device
- Same IP within 10 minutes → flag for human review, never auto-block (households and carrier NAT share IPs legitimately)

**Data**
- RLS on every table. `security_invoker` on every view. Verify with a test that queries as each tier
- Signed URLs for media, short expiry. A public bucket makes every audience rule decorative — the image URL leaks the content regardless of who can see the post
- Store `verification_status`, `vouch` records and phone numbers. Never ID documents, never selfies, never face data

**Honest limits — write these in the product copy, don't hide them**
- **Screenshots cannot be prevented.** Not on web, not meaningfully on native. A woman posting to women only is protected from the wrong audience seeing it *in the app*, not from a member betraying her. Handle it in terms of service, reporting and consequences — and say so plainly rather than implying a guarantee you can't keep
- **Widening a post's audience is retroactive; narrowing it is not.** People who already saw it, saw it
- Anonymous means anonymous to other members, not to Eve

---

## 9. What to build in what order

1. Auth: phone OTP, email, DOB gate, one-account-per-number
2. Schema, RLS policies, and **the RLS test suite** — write the tests with the policies, not after
3. Composer with both dials, and the posts table behind it
4. Feed with cursor pagination
5. Follows, circles, the "+ add people" flow
6. Vouch flow: tokens, the voucher page, tier transitions
7. Rant view (an index and a filter, at this point)
8. Report, block, moderation queue
9. PostHog retention events
10. Founders' Board seeding

Items 1–4 are the spine. If week three arrives and only those exist, that's still a demonstrable product.
