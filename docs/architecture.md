# Eve — Architecture & Interaction Spec

*Written 1 Sep 2026. Covers the composer, the feed, and the authorization model. Decisions here are load-bearing: per-post visibility is the product, so the read path is the security boundary.*

**Companion docs:** [product-v1.md](product-v1.md) · [conversation-log.md](conversation-log.md) · [roadmap.md](roadmap.md)

**5 Sep scope override (D30):** Eve launches women-only. The current product spec takes precedence over the older examples below. Before implementing this draft, reconcile the schema, authorization, feed query, composer and onboarding with these requirements: every member-content read and write requires an active admitted woman (Tier 2+); `everyone` means all admitted members, never anonymous web access; remove the separate `women` audience; follows, circles and extra viewers cannot bypass admission. A private account can publish an app-wide post without exposing other posts. The old gender-based widening example, public lobby and first-use default rationale are superseded. Initial audience defaults and private-account follow approval still need specification. SQL below is a prior design sketch, not a reconciled implementation of D30.

---

## 0. The governing principle

Every post carries an audience. Every read must prove the reader belongs to it.

This has one architectural consequence that dictates everything below: **authorization lives in the database, not the application.** A per-post visibility model enforced in application code fails the first time someone writes a query that forgets the filter — an admin tool, an analytics job, a new endpoint, a `SELECT *` in a migration script. There is no version of "we'll remember" that survives six months.

So: Postgres Row Level Security is the enforcement layer, the API is a convenience layer, and the client is assumed hostile.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| App | Expo (React Native) + TypeScript. One codebase: native iOS first, Android next, web export for the pages non-members touch | Native was your call (D28). Expo keeps iOS, Android and the voucher web page in one repo |
| Web pages | Expo web export on Vercel Hobby | Waitlist, the voucher page (vouchers may have no account and won't install an app to vouch), the vouch-link landing page |
| Distribution | A friend's Apple Developer account: TestFlight public link for the cohort, App Store after. App Transfer to your own account later | Zero cost now. §1.1 lists what this forbids |
| Data & auth | Supabase (Postgres 15+) | **RLS is the reason.** Auth, storage and Postgres in one, and RLS gives us database-level authorization |
| Images | Supabase Storage, signed URLs | No video in v1, so no transcoding pipeline needed |
| SMS | Twilio Verify + Lookup — **off until funded (D27)** | Lookup blocks VoIP and virtual numbers |
| Email | Supabase Auth over Gmail SMTP at launch → Resend once there's a domain | Magic links, vouch notifications |
| Analytics | PostHog | Cohort retention — instrument from commit one |
| Fingerprint | FingerprintJS (open-source build) on web; device install id + `expo-application` on native | Anti-self-vouch signal only, never an identity |
| Push | APNs via `expo-notifications` | Free. Vouch requests and replies |

### 1.1 What shipping through someone else's Apple account forbids

The app will be transferred to your own account later. To keep that possible and painless:

- **No Sign in with Apple.** Its user identifiers are team-scoped; after a transfer every user silently gets a new account unless migrated inside a 60-day window (TN3159). Email and phone auth mean the problem never exists. Apple only mandates Sign in with Apple when you offer other social logins, and we don't.
- **No iCloud, Game Center, Wallet or in-app purchase entitlements.** Some block a transfer outright, all complicate it. Entitlements are exactly two: push notifications and associated domains.
- **The bundle ID travels with the app.** Name it as if you'll keep it forever, because you will.
- **A transfer needs at least one released App Store version.** TestFlight alone doesn't count. The week-5 App Store submission is also what makes the app yours to move.
- **The vouch page is web, not native.** A voucher may have no account and won't install an app to say yes. Universal links (associated domains, with the `apple-app-site-association` file served from the web export) open the app when it's installed and fall through to the web page when it isn't.
- **App Review Guideline 1.2 (user-generated content)** requires filtering, reporting, blocking and a published contact address *before* the first submission, not after. Report and block ship in the submission build, not in v1.1. Anonymous posting draws extra scrutiny, so the moderation queue must visibly exist.
| ID check (Path A) | Persona / Veriff / Stripe Identity — pick in week 3 | Vendor-hosted capture. We receive four attributes by webhook and never an image |

---

## 2. Data model

**D50 signup privacy selection:** Require an explicit Private/Public choice before completing member signup and persist it as account privacy. Keep this separate from the older schema's `account_type` field, which means personal/business. Do not silently substitute Private when the selection is absent; leave onboarding incomplete until a valid choice is provided. Preserve the choice across resumed signup. Owner-authorized settings changes use the D33/D41 transition rules and update named-post defaults under D32. Public privacy never grants admission. This requirement still needs incorporation into the draft schema and onboarding implementation.

**D31 follow-request requirement (5 Sep):** Private accounts require owner approval or decline of each follow request. Represent pending requests separately from established follows, or use explicit statuses and filter every audience check to approved relationships. The `follows` table and predicates in this older sketch must represent established follows only: inserting a request must never grant followers-only or mutuals access. Only the target account holder can approve or decline a request. Circle membership is separate. This settles the product rule referenced as open in the D30 notice above; the request schema, transition handling and account-privacy field still need implementation. Initial composer defaults remain open.

Notes before the schema: **all primary keys are UUIDs, never sequential integers.** Sequential IDs let anyone enumerate posts and users, and worse, they leak ordering — which for anonymous posts is a correlation vector.

```sql
-- ─────────────── identity ───────────────
create table users (
  id                uuid primary key default gen_random_uuid(),
  -- D27: email is the identity at launch (zero budget); phone becomes required once SMS is funded.
  -- Unique when present either way, so one-account-per-number is enforced from the day it exists.
  phone_e164        text unique,
  email             citext unique not null,
  handle            citext unique not null,
  display_name      text,

  account_type      text not null default 'personal'
                    check (account_type in ('personal','business')),
  -- business accounts: declared_gender is irrelevant and never collected;
  -- they verify via KYB (Stripe/Persona), never KYC, and never reach tier 2
  declared_gender   text check (declared_gender in ('woman','man','nonbinary')),
  gender_set_at     timestamptz not null default now(),

  constraint personal_has_gender check (
    account_type = 'business' or declared_gender is not null
  ),

  dob               date not null,           -- 18+ enforced at write and by constraint
  tier              smallint not null default 1 check (tier between 0 and 3),

  seasoned_at       timestamptz,             -- when they became eligible to vouch (tier 3)
  vouch_budget      smallint not null default 3,

  -- 7.4: likes and follower counts are private to the owner until she opts in,
  -- and she can only opt in 30 days after signup (enforced by the update policy in §3)
  stats_public_at   timestamptz,

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

-- ─────────────── verification: two doors, one tier ───────────────
-- Nothing in these tables is ever an image, a document number, or a face.

-- Path A: the vendor ID check. Exactly the four fields the webhook gives us are written.
create table verifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  vendor        text not null,        -- 'persona' | 'veriff' | 'stripe_identity'
  vendor_ref    text not null,        -- their session id, so we can re-query; never content
  outcome       text not null check (outcome in ('passed','failed','abandoned')),
  sex_matches   boolean,              -- document sex marker == declared_gender at time of check
  dob_matches   boolean,              -- document DOB == declared dob
  liveness_ok   boolean,
  dedup_key     text,                 -- vendor-computed one-way key for the document; blocks one ID verifying two accounts
  status        text not null default 'current' check (status in ('current','superseded')),
  created_at    timestamptz not null default now()
);
create unique index verifications_one_doc_one_account
  on verifications (dedup_key) where outcome = 'passed' and status = 'current';

-- Path B: vouches. Three kinds — see product-v1 §Vouches.
create table vouches (
  id                    uuid primary key default gen_random_uuid(),
  applicant_id          uuid not null references users(id) on delete cascade,
  kind                  text not null check (kind in ('member','team','phone')),
  voucher_user_id       uuid references users(id),   -- member / team vouches
  voucher_phone_e164    text,                         -- phone vouches: no account needed
  token_hash            bytea not null,               -- sha256 of a 32-byte CSPRNG token; never the token itself
  status                text not null default 'pending'
                        check (status in ('pending','affirmed','declined','expired','revoked')),
  declaration_confirmed boolean,   -- "Ali signed up as a woman. Accurate, to your knowledge?" — the gender check lives here
  device_fp             text,
  ip                    inet,
  expires_at            timestamptz not null default now() + interval '24 hours',
  decided_at            timestamptz,
  created_at            timestamptz not null default now(),
  constraint voucher_identity check (
    (kind in ('member','team') and voucher_user_id is not null)
    or (kind = 'phone' and voucher_phone_e164 is not null)
  ),
  constraint not_self check (voucher_user_id is distinct from applicant_id)
);

-- D38: no automatic burned-phone table or cascading voucher sanctions.
-- Reviewed vouching restrictions and appeals are specified in section 3.2.

-- D19/D24: how many vouches Tier 2 needs. Config, not code paths. Latest row wins.
create table vouch_policy (
  effective_from        timestamptz primary key default now(),
  member_required       smallint not null,   -- launch 1 → maturity 2
  phone_required        smallint not null,   -- launch 0 → growth 1
  team_counts_as_member boolean not null default true
);
insert into vouch_policy (member_required, phone_required) values (1, 0);   -- launch phase
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
    update verifications set status = 'superseded'    -- the ID match was against the old declaration
      where user_id = new.id;
  end if;
  return new;
end $$;

create trigger trg_gender_change
  before update of declared_gender on users
  for each row execute function invalidate_tier_on_gender_change();
```

Changing your declared gender is legitimate and must stay possible. It just costs you re-verifying, through either door, which is the honest price — the vouchers or the document confirmed a specific declaration, and the declaration changed.

---

## 3. Authorization

### Blocking requirements (D40; apply before the older predicate below)

Store a directed block from blocker account to blocked account, but deny member-content visibility and interaction when a block exists in either direction. For a post, evaluate the viewer against its real author before applying any audience grant. For a comment, require access to the parent and independently check the viewer against the comment's real author. This covers comments on third-party posts as well as named and anonymous posts. App-wide access, follows, mutuals, circles and explicit extra viewers cannot bypass a block.

For an anonymous target, accept an authorized post/comment reference and resolve its author privately on the server. Do not require or return a real account identifier. Enforce ownership of block mutations and use an opaque block reference for management. The blocker-facing record retains only the originating anonymous label/avatar presentation, not the real profile or other aliases. Do not notify the blocked member of the blocker's identity. Removing one member's block must not remove the other member's independent block.

Apply the rule to feeds, profiles, search, direct post/comment reads, media authorization, follow requests, replies, likes, mentions and notification generation/delivery. Invalidate affected cached content and suppress queued previews after a block; content already seen or downloaded cannot be recalled. Do not link hidden named and anonymous activity in API responses or block-management UI. Access changes can still permit inference, so this is not a guarantee of unlinkability.

Keep block records independent of moderation bans, voucher strikes and admission review. The old `can_view` sketch below and comment schemas are not yet a D40 implementation. Verify both directions, cross-thread anonymous aliases, comments on third-party posts, all audience types, direct endpoints, notifications, anonymous block management, and independent unblock behaviour when implementing it.

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
                                           and u.account_type = 'personal'
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

-- Profile edits: your own row only, a whitelist of columns, and counts can't go
-- public in the first 30 days (7.4). tier, status and vouch_budget are never
-- client-writable — they move only through recompute_tier and moderation.
revoke update on users from authenticated;
grant  update (display_name, email, declared_gender, stats_public_at) on users to authenticated;

create policy users_self_update on users for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and (stats_public_at is null or created_at <= now() - interval '30 days')
  );
```

**Read the `women` branch carefully — it is the whole product.** Declared gender alone is not enough; `tier >= 2` means the declaration has been confirmed — by a document check at a vendor, or by people who know them (§3.1). Someone who lies at signup sits at Tier 1 and this branch returns false for them, forever, until verified.

### Why evaluation happens at read time

**D53 owner-initiated follower removal:** Authorize the action as the followee/account owner, then atomically delete the target's established follow and all `circle_members` rows joining that target to circles owned by the removing account. Do not delete the reverse follow, other owners' circles, unrelated content, or create a block/strike. Apply this on both public and private accounts and invalidate affected relationship/feed/profile/media access state. Recheck parent-post access for comments and notifications under D35.

Do not send a follower/circle-removal notification. Ensure stale accepted requests cannot recreate the removed follow without a fresh authorized action: private accounts require a new request/approval, public accounts allow refollowing. Never restore circle memberships on refollow or approval; require an explicit owner addition. Serialize removal against relevant relationship writes and make retries safe. Voluntary unfollowing is outside this owner-removal decision. Verify both account privacy modes, multiple owner circles, preserved unrelated circles/reverse follows, historical content access, refollow without circle restoration and unauthorized removal attempts when implementing D53.

**D36 circle-write eligibility:** Active admitted women at Tier 2 or above can create circles immediately and manage circles they own. Enforce ownership on circle and membership writes. Do not apply the seven-day / Tier 3 requirement to these operations; it continues to govern member vouching. Circle creation does not bypass admission checks for the owner or added members.

Circle membership, follows, and tier all change. **D34 confirms that adding someone to a circle grants access to all existing posts in that circle**, plus future posts while membership continues. Evaluate current membership at read time, not membership at publication. Removing someone revokes circle-based access to all of that circle's past and future posts. Admission and other applicable restrictions still apply. Precomputed grants must not preserve access after removal or omit historical posts after addition.

Read-time evaluation costs performance. That trade is correct here, and §5 covers how to keep it fast.

---

### 3.1 Reaching Tier 2 — one function, two doors

**D59 launch override (5 Sep):** The launch routes are qualifying personal vouching and approved team admission. Offer Request team review to applicants without an existing member connection. Persist applicant, pending/approved/declined state, authorized reviewer, decision time and private review notes. Applicants may read their own status, not internal notes or other applications; only authorized team reviewers may decide. Do not accept client-written admission state. Pending/declined applications grant no member-content access and review requests cannot bypass onboarding or moderation restrictions.

An approved review uses the existing team-admission/vouch mechanism and the same server-controlled admission transition as a qualifying member vouch. Make approval idempotent and preserve reviewer attribution; retries must not create duplicate admission records. Member-vouch budgets, eligibility and D39 accountability remain unchanged. Test unauthorized approval, status/notes isolation, pending and declined access denial, duplicate approvals and attempts to admit a suspended account.

No ID/selfie verification or AI gender classification ships in MVP. Appearance, voice and document sex markers are not automatic eligibility gates. The vendor branch, `sex_matches` admission rule and mixed-membership explanation in the historical SQL below are superseded and must not be implemented as launch authorization. Future verification requires separate design review; keep existing no-verification-media-storage constraints. The draft SQL remains unreconciled, not a D59 implementation.

Both doors end in the same call. Nothing else writes `tier`.

```sql
create or replace function recompute_tier(u uuid) returns void language plpgsql as $$
declare
  pol     vouch_policy;
  members int; phones int;
  id_pass boolean;
  t       smallint := 1;
begin
  -- businesses never reach Tier 2, whatever the tables say
  if exists (select 1 from users where id = u and account_type <> 'personal') then return; end if;

  select * into pol from vouch_policy order by effective_from desc limit 1;

  -- Path B: affirmed vouches that also confirmed the declaration
  select count(*) filter (where kind = 'member' or (kind = 'team' and pol.team_counts_as_member)),
         count(*) filter (where kind = 'phone')
    into members, phones
    from vouches
   where applicant_id = u and status = 'affirmed' and declaration_confirmed;

  -- Path A: a current, passed check whose document agrees with the declaration
  select exists (
    select 1 from verifications
     where user_id = u and status = 'current' and outcome = 'passed'
       and sex_matches and dob_matches
  ) into id_pass;

  if id_pass or (members >= pol.member_required and phones >= pol.phone_required) then
    t := 2;
  end if;

  -- never demote here. Demotion is explicit: a ban, or the gender-change trigger.
  update users set tier = greatest(tier, t) where id = u;
end $$;
```

Rules this encodes:

- **Path A grants Tier 2 on its own.** Same rule for every declared gender — a man with an M document and a "man" declaration passes too, and the `women` branch still excludes him. The asymmetry lives in the content filter, never in the door.
- **A mismatch is never explained.** When `sex_matches` is false the user is not told what the document said; she simply sees the vouch door. This is the trans-woman path and the misread path, and they look identical from outside.
- **Policy tightening never demotes.** `greatest(tier, t)` means moving `vouch_policy` from 1 to 2 member vouches affects only people not yet at Tier 2.
- **Tier 3 is a daily job**, not this function: `tier = 2`, `created_at` older than 7 days, no strikes → `tier = 3`, `seasoned_at = now()`. D36 keeps this waiting period for vouching; circle creation is available at Tier 2 immediately.
- Call it from the vendor webhook handler and from the vouch-affirm endpoint. Call it also from a nightly sweep so a missed webhook can't strand anyone.

### 3.2 Vouch abuse review, restrictions and strikes (D38-D39)

Keep investigation-only vouching restrictions separate from account `status`, trust `tier`, and individual vouch status. Such a pause does not itself suspend the account or invalidate everyone she admitted. D39 separately requires account suspension at three active voucher strikes, including strikes for honest mistakes. Do not automatically blacklist phones or sanction other connected members.

Before implementation, add private moderation records for the subject (member ID or a verified phone-voucher identity when that path is funded), implicated vouches/accounts, evidence references, reviewer, reason, decision timestamps, restriction state, next review date, and appeal outcome. Restrictions need explicit active/paused/revoked transitions and an audited restoration path. Restrict access to authorized reviewers and expose only the subject's own decision summary and appeal status, without reporter identities or private reports.

Check applicable restrictions, established-member eligibility and available budget on every vouch issuance and affirmation, including pending requests created before a pause. Enforce these checks atomically so concurrent actions cannot spend budget or affirm a vouch after restrictions take effect. `recompute_tier`, the Tier 3 job and clean-standing budget accrual must not clear a moderation restriction. A restriction blocks further vouching; existing affirmed vouches remain valid unless individually reviewed and revoked. If an admission relied on a confirmed fraudulent vouch, review that account's eligibility explicitly; the existing monotonic `recompute_tier` cannot perform a demotion.

An offending account's conduct and a voucher's intent are separate findings. Confirmed fake-account patterns or evidence of knowing ban evasion justify review; device/IP/timing overlap and report volume are only supporting signals. Record private voucher context, pause further vouching when credible coordinated-misuse evidence warrants it, restore investigation-only restrictions when concerns are resolved, and allow human appeal. Honest intent does not prevent D39's outcome-based strikes.

**D39 strike ledger and threshold:** record the voucher, distinct offending applicant, affirmed vouch reference, confirmed moderation finding, reviewer, timestamps, active/reversed status and reversal reason. Enforce one active strike per voucher/applicant pair; repeated reports, duplicate moderation events and job retries must not increase the count. Ordinary deletion, an unconfirmed report and a suspension caused solely by voucher strikes are not qualifying findings. Do not infer guilt from shared IP/device signals. If several members affirmed the same offending account, apply the one-strike rule to each responsible voucher.

Issue a strike and evaluate the threshold atomically, serializing concurrent updates for the voucher so the third active strike sets `users.status = 'suspended'` with a recorded D39 reason. This is an account-wide restriction: deny member content and participation through every access path, while retaining access to the decision notice and appeal. Vouch-token handling and tier/budget jobs must respect the suspension and must not reactivate the account. Suspension must not recursively penalize the suspended voucher's own vouchers or invalidate unrelated invitees.

On a successful factual or attribution appeal, reverse affected strikes, recompute the count and review any D39 suspension; do not clear unrelated sanctions. An honest-mistake explanation alone does not reverse a valid strike. Suspension duration, reinstatement, expiry and external phone-voucher handling are unresolved product settings, not assumptions for the implementation. Required checks include honest mistakes still counting, first/second strikes, suspension at the third distinct account, duplicate/concurrent events, overturned findings, unrelated restrictions, no recursive cascade, and no access or pending-token bypass after suspension.

### Business accounts (schema stub now, features post-launch)

`account_type = 'business'` exists in the schema from day one so no migration is ever needed; the features ship after 12 Oct. The rules, enforced in the same places everything else is:

- The `women` branch above requires `account_type = 'personal'` — a business account can never satisfy it, regardless of any other field
- The rant/anonymous feed view adds `where u.account_type = 'personal'` — businesses cannot post anonymously or read the rant feed
- Business browse surface is *their own* posts, comments on them, and aggregate analytics — enforced by RLS on the feed views, not by hiding UI
- Businesses are broadcast-only: no initiating contact with individuals, ever (DMs are v2 regardless, but write the policy row now)

**Businesses can be seen but cannot see.** If that sentence stops being true in any code path, it's a security bug, same severity as an RLS bypass.

## 4. Anonymity

### Published post invariants (D41)

On post creation and update, enforce `is_anonymous` implies `audience_type = 'everyone'`, with no circle reference or narrower audience. Deny changes to a published post's `is_anonymous` value in either direction, including through bulk operations and direct API access. Content edits must preserve identity; named-post audience edits remain supported. These requirements must be enforced on the server/database, not only by hiding controls. The older SQL sketch requires reconciliation before implementation.

D41 narrows D33's account-privacy transition operation to named posts: anonymous posts stay app-wide even when their account becomes private. Do not rewrite them to followers-only or reveal the author's identity. App-wide anonymous access still requires membership eligibility, no applicable block, and an available, non-deleted post. Comments inherit this parent audience under D35. D56 also fixes published comment identity; only its text can be edited by its author.

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

### Comment visibility and identity (D35)

Comments derive visibility from the parent post's current audience; do not store an independent comment audience or a snapshot of viewers. Apply the parent authorization check to comment reads and creation, alongside applicable account and moderation restrictions. Account privacy and circle membership changes therefore affect existing comments as well as posts. A removed or inaccessible parent must not leave a readable comment endpoint or notification preview.

Enforce on the server that an anonymous comment can be created only when the parent post is anonymous. Named posts offer named comments only; anonymous posts offer named or anonymous comments. The client must mirror this rule by showing the identity control only for anonymous parents. Use the same identity-redaction boundary as anonymous posts and preserve comment anonymity when audiences change. D41 prohibits published posts changing identity modes, so a parent edit cannot turn an anonymous thread into a named one.

**D55 explicit identity selection:** For each new comment/reply on an anonymous parent, present Post as anonymous / I don't care before submission and require a deliberate selection for that draft. Map Post as anonymous to anonymous identity and I don't care to the member's normal named profile identity, not an unspecified or random choice. Do not carry a named selection forward into the next new comment. Preserve the selected value on retry of the same unsent draft, but do not submit automatically. Require an explicit identity value in the write request rather than defaulting an omitted value to named; keep D35 server validation and comment-closure/admission/block checks. Anonymous choices reuse D37's per-thread label and avatar.

### Anonymous-post likes (D55)

Keep real liker membership private for uniqueness, unlike actions and access enforcement. Member-facing reads for anonymous posts return only an authorized aggregate count under the existing visibility policy and the viewer's own liked/unliked state. Neither the author nor another reader may enumerate liker IDs, names, avatars or per-person timestamps through lists, filters, realtime events, notifications or related profile queries. Do not emit a named like notification for an anonymous post. A count-publication opt-in never grants access to liker identities. Named-post rules are unchanged.

Verify author/reader denial of liker enumeration, count visibility, the viewer's own like/unlike, notification payloads, and explicit identity selection on new anonymous-parent comments alongside D35/D37/D43 checks when implementing D55.

### Comment controls (D43)

Persist a per-post comments-enabled state on creation and allow the post owner to close or reopen it afterward, for both named and anonymous posts. Enforce ownership on changes and check the current state server-side on every new comment/reply, including author replies, direct API requests and retries. Serialize new-comment creation against closure so a request cannot commit after the closure operation using a stale permission check. Preserve an unsent draft when rejected; do not automatically publish rejected replies when comments reopen.

Do not use this state in comment-read authorization: existing comments remain visible under parent audience, blocking and moderation rules. Closure does not delete comments, change identity/audience or disable reporting/blocking. Reflect the state in the composer, owner post actions and reply controls. Verify disabled-at-publication, close/reopen, unauthorized changes, concurrent submissions and preserved existing comments for both post types when implementing this requirement.

### Comment deletion permissions (D44)

**D56 comment edits:** Permit text edits only by the comment's authenticated real author, under applicable account, block and parent-access restrictions. Post ownership alone never grants text-edit rights. Keep the comment's author, parent reference and named/anonymous identity immutable on member-facing updates; do not regenerate anonymous labels or avatars. Persist a server-controlled edited timestamp/flag only when text actually changes and render Edited wherever that comment is shown. Do not offer D55's identity prompt during editing. Deny attempts to edit removed comments or revive them through an update. Verify owner edits, unrelated-member/post-owner denial, no-op updates, fixed identity in both directions and retained deletion permissions when implementing D56.

Authorize member-initiated comment removal when the authenticated account is either the comment's real author or the parent post's real author, subject to applicable account restrictions. Resolve ownership privately for anonymous activity. Do not accept client-supplied author IDs as proof, and do not reveal them in responses. Post ownership grants removal permission only, never permission to edit someone else's comment text or identity. Closed comments still allow authorized removal.

Exclude removed comment content from member-facing lists, direct reads, media access and future/queued notification previews; invalidate relevant cached views. Keep report handling separate: removal must not automatically issue moderation or voucher strikes, and must not cancel or expose an existing report. Evidence retention for reports requires a separately defined retention policy; this rule does not authorize indefinite retention. The display/treatment of replies attached to a removed comment remains to be specified rather than silently deleting other members' contributions.

Verify removal by the commenter and post owner, denial for an unrelated member, no editing rights over another writer's text, both identity modes, closed-comment management, excluded removed content and unchanged report/strike state when implementing D44.

### Irreversible post and conversation deletion (D57)

Authorize post deletion as the real post owner, including anonymous ownership without revealing identity. Atomically make the source post and all descendant comments/replies inaccessible, then complete removal of associated media and derived records with idempotent cleanup. Serialize deletion against new comments, edits and any future sharing so no operation can resurrect or create an accessible child of a deleted post. A `deleted_at` marker in the old sketch is an internal cleanup/access mechanism, not a reversible archive; do not expose an undelete operation or allow member writes to clear it. Apply irreversible deletion to individual comments under D44 as well.

Invalidate feeds, profiles, owner anonymous collections, counts, media access, in-app activity and queued previews. Recheck source existence/access on subsequent reads; disconnected clients must discard deleted content on reconciliation, and bytes already captured outside Eve cannot be recalled. Deletion confirmation must state that the post and its comments are deleted without undo. Preserve report handling under D44; define finite evidence/backup lifecycles separately and prevent backups or synchronization from republishing user-deleted content.

**After-MVP DM contract:** Store shared-post references, not independent copies of post text, media or comments. Every recipient read requires current source audience, admission and block authorization. On source deletion, remove all related shared-post message items and previews, leaving unrelated conversation messages untouched. Ensure a stale/offline share cannot recreate the item. Any cleanup delay must not make the referenced content readable. This is a future messaging requirement, not new MVP scope.

Verify owner-only deletion, named/anonymous posts, all comment descendants, irreversible update/restore denial, concurrent writes, unavailable media/previews and no restoration on reconnect when implementing MVP deletion. Verify DM reference removal, recipient authorization and unchanged unrelated messages when messaging is built later.

### Account deletion requirements (D60)

Provide an owner-only Settings action with recent reauthentication and explicit irreversible confirmation. Atomically mark the account as deleting, deny account access and hide its profile, named/anonymous posts, comments and other activity from member-facing reads before acknowledging success. Revoke sessions and pending authentication/admission tokens; authorization must reject the deleting account even while credentials or cleanup jobs remain outstanding. Prevent concurrent writes, vouches, admission recomputation or profile updates from restoring access or publishing new activity.

Use retryable, idempotent cleanup for the account's posts and all their comment descendants under D57, its own comments/likes elsewhere, media, follows in both directions, pending follow requests, circle memberships and owned circles. Invalidate search, feeds, counts, notifications and cached previews. Do not cascade deletion into unrelated members' posts or accounts. Remove private anonymous identity mappings when no longer needed by the defined evidence lifecycle, without exposing the real account behind an alias. Future DM shares of removed source posts follow D57; this does not add messaging to MVP.

Preserve admission for members previously vouched for by the deleting account. Do not let foreign-key cascades, nightly tier recomputation or removal of vouch records implicitly revoke their membership or generate strikes. Separate necessary private admission/audit records from the deleted member-facing profile. Ordinary account deletion is not a moderation finding and must not trigger D39 penalties; existing reports remain reviewable under restricted access.

Define finite evidence and backup retention/deletion lifecycles before implementation. Retain only necessary private evidence, not a restorable account archive. Cleanup and backup recovery must preserve deletion decisions rather than republish deleted data. Test reauthentication/ownership, immediate read/write denial including existing sessions, named/anonymous cleanup, comments elsewhere, relationship cleanup, retry/concurrency safety, unaffected invitees and no restore on reconnect or backup recovery. These are requirements, not an implemented deletion pipeline.

### Thread identities and username reservation (D37)

Maintain a private mapping from root post and member to a random display number and cartoon avatar asset. Assign once on the first anonymous participation, persist across reloads and replies, and allocate independently in each thread. Enforce uniqueness of the participant mapping and of display numbers within a thread, with collision retries under concurrent creation. Do not derive display numbers or avatar choices from account identifiers, handles, real avatars, or signup order.

At anonymous post creation, assign and persist a random author display number unique across anonymous posts, with collision handling. Render `Author <number>` on the post and on the owner's anonymous replies. Allocate a new number for every new post, including posts by the same member. Ownership determines the Author role; the number identifies the thread, not a public account.

Return only the display label and cartoon asset reference to authorized readers, never the mapping's member ID or a real-profile link. Reuse the thread's Author-number label for the original poster instead of allocating an Anonymous-number commenter label. Keep named comments separate from anonymous presentation; do not expose their shared mapping to clients. The cartoon asset must carry no real-account identifier.

Reject the exact normalized username `anonymous` case-insensitively at signup and on any later username write, using server/database enforcement as well as form validation. The existing `citext` uniqueness constraint does not reserve names by itself. These are specification requirements; the earlier schema and feed view do not yet implement them.

### Profile counts (7.4)

**D52 people search:** Provide an authenticated, admission-gated search over real handles and display names. Only eligible active member profiles may appear. Filter blocks in both directions before results or result counts are returned. Return the D51 basic result projection (avatar, display name, handle, and authorized profile navigation reference), never email, phone, DOB, verification data or anonymous identity mappings. Private-account status does not prevent basic discovery but does not grant access to restricted posts or create a follow.

Use bounded paginated queries and apply the same restrictions to suggestions/autocomplete if implemented. Search must not join anonymous thread labels or numbers to real profiles. Enforce visibility on the server as well as result rendering. Verify username/display-name matches, duplicate display names distinguished by handle, private-profile navigation, pending follows, blocked accounts in both directions and denial for unadmitted viewers when implementing D52.

**D51 private profile preview:** For eligible admitted viewers with no block in either direction, expose avatar, display name, handle and bio before follow approval. Show Request to follow or Requested based on the viewer's actual request state. Include authorized app-wide named posts; apply the existing follower, mutual and circle checks independently to restricted named posts. Do not gate the entire named-post list on follower approval, and do not expose restricted posts merely because the viewer can see the profile. Keep anonymous posts excluded under D42 and preserve existing private-statistics rules. The draft schema still needs avatar/bio and follow-request support. Verify non-followers, pending requests, approved followers, eligible circle members, blocked viewers and unadmitted users on both UI and direct profile/post queries.

**D42 profile separation:** Profile post lists and their visible counts exclude anonymous posts, regardless of account privacy, follow approval, circle membership or public-statistics opt-in. Do not expose anonymous posts through real-author profile queries, username search, profile activity lists or author-filtered count endpoints. An authorized reader may see an anonymous post in the anonymous section without being allowed to discover its real author through a query filter.

Provide a separate My anonymous posts collection bound to the authenticated owner, rather than a caller-supplied author ID. Only the owner can list and manage that collection through the member-facing API; apply existing ownership, account eligibility and immutable-identity rules to edits/deletion. Its responses must not be placed in shared/public caches. The public profile surface remains separate even when viewed by its owner. Verify anonymous posts and counts stay absent for strangers, followers and circle members, and that requesting another owner's collection fails.

Follower and like counts are private to the owner by default. The profile view exposes them only when `stats_public_at is not null` or the viewer is the owner; the update policy in §3 stops anyone flipping it in their first 30 days. Enforce this in the view, not the client — a public count is the one scoreboard 7.5 says we don't copy, so leaking it through an API is a product bug, not a cosmetic one.

---

## 5. The feed

**D48 feed contracts:** Implement Following, Community and Anonymous as distinct chronological queries over the same authorized posts. Following requires a named post and an established follow of its author, plus current post access; permitted Circle posts from followed accounts are included. Community requires a named post with audience `everyone`. Anonymous requires `is_anonymous` and audience `everyone` under D41. Apply membership, block, deletion and moderation checks in every path. Sort newest first with stable cursor pagination; paginate each feed independently.

Never use anonymous authorship or the viewer's follow graph to route anonymous posts into Following. Never include restricted named posts in Community. The older combined-feed query below is not a D48 implementation and needs replacement alongside the previously noted authorization reconciliation. Verify feed separation with named/anonymous posts, all named audiences, pending/approved follows, circle access and blocks.

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

### The Anonymous feed uses the same posts (D48)

Use the same posts table and anonymous index, filtered to `is_anonymous` with the app-wide invariant from D41 and all applicable authorization checks. D48 names this feed Anonymous and separates it from the two named-post feeds, Following and Community.

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

**D32: new-post defaults follow account privacy.** Private accounts default to Followers; public accounts default to Everyone on Eve. Each post can override that audience without changing the next new post's default. There is no preferred-audience setting and no last-used audience persistence. Changing account privacy changes the default. This resolves the default question marked open in the earlier D30/D31 notes. Store account privacy separately from `account_type`, which already means personal/business in the older schema. D33 below settles existing-post behaviour; drafts remain unspecified.

**D33: account privacy transitions change existing post audiences.** Private to public changes every non-circle post to `everyone`, including explicit `followers` and `mutuals` posts. Circle posts stay circle-only. Public to private changes all existing `everyone` posts to `followers`; already narrower audiences stay restricted. Preserve `is_anonymous` in both directions. Implement the privacy change and audience updates as one authorized atomic operation, and invalidate affected feed/media access state. Explicit extra-viewer grants must not leave posts accessible outside their resulting audience. This is a transition, not a blanket read-time ceiling: private accounts can still deliberately publish new app-wide posts afterward. The old schema/query sketches above do not implement this operation. Reply visibility on widening requires a further product decision; D34 settles circle post history.

**Widening asks for confirmation; narrowing never does.** Moving from Followers to Everyone on Eve shows a one-line confirm. Switching an account to public must explain that existing non-circle posts become app-wide (D33). This confirmation does not change the chosen transition rule.

**D54 pending requests on account transitions:** Within the authorized private-to-public transition, accept currently pending requests from eligible admitted accounts with no block in either direction and create their established follow relationships. Couple request-state and follow updates atomically with the privacy transition, serialize against cancellation/removal/block changes, and make retries idempotent. Do not revive cancelled/declined/previously removed requests or create/restore circle memberships. Public-to-private transitions preserve established follows. The confirmation must disclose pending-request acceptance alongside the D33/D41 named-post effects. Verify pending acceptance, blocked/ineligible request exclusion, cancellation races, no duplicate follows, no circle restoration and persistence after returning to private.

**"+ Add specific people" is an explicit act.** Per the design decision: *Women only* means women only. If she wants Ali included she taps and adds him, and he appears as a named chip she can see. Never a silent carve-out behind a label that says otherwise — a reassuring label with a quiet exception inside it is how this product breaks its central promise.

**The identity dial shows a live preview.** Switching to Anonymous re-renders the avatar and name in the composer as they'll appear to others. People need to *see* their name disappear, not read that it will.

**D41 overrides the older two-dial/default rules above for anonymous posts.** Anonymous mode fixes the audience to Everyone on Eve and removes the audience selector, displaying the fixed audience instead. Named drafts use D32 defaults and audience choices. Published-post editing never offers an identity switch, and anonymous-post editing never offers an audience switch. Apply D33 account privacy transitions only to named posts. Verify anonymous creation from both private and public accounts, attempted narrower audiences, identity edits in both directions, account privacy switches, and continued block/admission enforcement.

**Published posts keep a persistent audience badge**, visible to the author on her own posts forever. She should never have to remember who could see something — she should be able to look.

**D35 resolves comment visibility:** comments follow their parent's current audience, including widening under D33 and history access under D34. The reply composer has no audience dial. Its identity dial appears only on anonymous posts. This supersedes the earlier note in D33 above that reply visibility is undecided.

---

## 7. Empty states

Day one is a design problem, not a content problem. Your 4.5 answer already had it right; this is the implementation.

**Never render a blank feed.** A first-run feed shows the Founders' Board — real posts and real anonymous rants from the founding cohort, seeded before anyone else is admitted. Do not open signups until 20 members have posted.

**Tier 1 users see a marker, not a void.** Where women-only content would be, an explicit line: *"Some posts here are visible to verified members. Verify your account to see them."* — with both doors one tap away. Absence should be legible. An empty feed reads as a dead app; a feed that tells you what you're missing reads as a door.

**Every empty state names the next action.** No illustrations of empty boxes, no "Nothing here yet."

---

## 8. Security checklist

### Reporting and review status (D58)

Provide authenticated report creation for posts, comments and accounts using a validated reason (harassment, exposed private information, impersonation/fake account, spam, another concern) plus an optional explanation. Derive the reporter from the session and resolve anonymous targets privately; never accept a claimed reporter ID or expose the target's real identity. Validate access to the reported target at submission under the applicable membership/access rules.

Persist the target reference, reporter, reason, optional explanation, received/reviewed timestamps, reviewer and final outcome. Expose only the reporter's own receipt/status projection to member clients: Received, Reviewed, then Action taken or No action taken. Keep reviewer notes, other reporters and identity mappings restricted to authorized reviewers. Do not give the reported member access to reports or reporter identities. Use generic external status notifications under D45.

Report submission must not directly mutate content visibility, account status or voucher strikes. Authorized human review determines findings and any D38/D39 action, with an audited outcome. Deletion does not cancel reports or allow status links to restore deleted content; use the separately defined evidence-retention lifecycle under D44/D57. Verify target types, optional explanations, report ownership, reviewer-only transitions, anonymous identity protection and no submission-triggered penalties when implementing D58.

### MVP Activity and optional push (D61)

Implement a recipient-private Activity stream for comments/replies, follow requests and approvals, vouch requests, admission updates, report outcomes and D46 capture alerts. Derive recipients from authorized source events, not client-supplied recipient/actor identities. Make event handling idempotent and allow only the recipient to read or mark her own activity as read. Do not emit like notifications in-app or through push; D55 like storage and count rules are unchanged.

Check current access at event generation, Activity rendering, push dispatch and destination opening. Suppress inaccessible social activity and invalidate cached previews after blocks, audience changes or deletion. Notification references are not access grants. Resolve anonymous post/comment actors using the existing thread identity, never by exposing private member IDs, real profiles or cross-thread mappings. Preserve deliberately named comment identities and D46's in-app capture-viewer identification. Admission/status notices use owner-only access without granting pending applicants access to member content; report outcomes expose only D58's recipient-safe projection.

Persist an owner-controlled social-push preference in Settings; declining or disabling push does not remove in-app Activity. Use generic external text with no names, content snippets, images or identity-bearing metadata. Route via an opaque notification reference and fetch authorized details inside Eve. Recheck preference and account state before dispatch, and invalidate device tokens on logout/account deletion as applicable. In-app admission and review updates remain available without push permission.

Verify recipient isolation, read-state ownership, duplicate events, preference changes while queued, anonymous versus deliberately named comments, capture alerts, pending-applicant isolation, generic external payloads, stale destinations, revoked access and absence of all like notifications. Implementation remains pending.

### No external member-content sharing (D45)

Do not implement external share sheets, copyable post links, public post rendering, embeds, cross-posting or save/download actions for posts, comments or media. Public web routes and link-preview responses expose no member content, author identity, protected post metadata or media. App-internal navigation and authorized content requests remain necessary, but their references are not externally shareable access grants. Public invitation/authentication/vouch routes must not embed or preview member posts.

Use generic push/email notifications that open the relevant authorized view in Eve; do not put member text, media or author identity in notification payloads or previews outside the app. Recheck current membership, audience, block and moderation state when the destination opens. In-app forwarding remains out of scope unless separately approved.

Reconcile the older signed-media-URL proposal with this rule before implementation: a standalone bearer URL is not an audience check and must not become an external viewing path. Require authenticated, authorized media delivery; keep storage credentials and internal delivery URLs out of sharing/preview surfaces. No public buckets or public content caches. Authorized device rendering still cannot guarantee that a member will not capture or manually copy content.

Verify absence of external-sharing controls, member content on public pages/link previews, and sensitive notification payloads, plus denial of unauthenticated post/comment/media reads. Keep evidence-based reporting/moderation for redistribution separate from claims of complete technical prevention.

**Authentication**
- Launch (D27, zero budget): email magic link only. Single-use, 10-minute expiry, max 5 per address per hour, 10 per IP per hour
- When SMS is funded — OTP: 6 digits, 10-minute expiry, max 5 per phone per hour, 10 per IP per hour, lockout after 5 failed attempts
- **Never leak registration status.** "We've sent a link" (or "a code") is the response whether or not the address or number exists — anything else is a user-enumeration oracle
- Twilio Lookup rejects VoIP and non-mobile numbers at signup

**Vouch tokens**
- 32 bytes from a CSPRNG, **stored hashed** (SHA-256) — a database read must not yield working links
- Single-use, 24-hour expiry, bound to one applicant and one slot
- Rate-limited per applicant; a burst of vouch requests is itself a signal

**Anti-self-vouch**
- Phone must differ from the applicant's (enforced by uniqueness)
- Shared device fingerprints are review signals, not proof of self-vouching or intent; do not automatically sanction shared-device households (D38)
- Same IP within 10 minutes → flag for human review, never auto-block (households and carrier NAT share IPs legitimately)

**Data**
- RLS on every table. `security_invoker` on every view. Verify with a test that queries as each tier
- Signed URLs for media, short expiry. A public bucket makes every audience rule decorative — the image URL leaks the content regardless of who can see the post
- Store `verifications` (four attributes), `vouches` and phone numbers. Never ID documents, never selfies, never face data
- Vendor webhooks: verify the signature, then write only the four fields. Never call the vendor's document or image endpoints, even though they exist — scope the API key so it can't
- One document, one account is enforced by the vendor's one-way `dedup_key`, never by Eve holding a document number

### Close-friends capture detection and alerts (D46)

Track currently visible Circle posts/media/comment views while the app is foregrounded. On a supported screenshot callback, record the authenticated viewing account, relevant visible post IDs, event type and time; do not attribute off-screen/preloaded content. For recording/capture-state callbacks, handle both state transitions and an already-active session when protected content becomes visible. Deduplicate repeated callbacks per viewer/post/capture session, while treating separate screenshots as separate events. Scope owner alerts to the Circle content actually displayed, excluding the owner's own captures.

Submit through an authenticated endpoint that derives the actor from the session, verifies the target/owner and authorized viewing context, validates the payload and rate-limits/deduplicates delivery. Preserve event-time visibility context for delayed delivery and do not treat a client report as tamper-proof evidence. Store only event metadata needed for the owner notice; do not access/upload captured image or video files. Only the relevant owner can read the member-facing capture notice. Use generic external pushes and fetch event details inside Eve under D45; recheck applicable block/account restrictions before delivery.

Detecting capture does not prove which pixels were saved, whether a recording file exists, who physically held the device or whether anything was redistributed. Wording must distinguish screenshot events from recording/mirroring state. Expose supported/unsupported detection accurately, give viewers notice of close-friends capture alerts, and issue no automatic moderation or voucher strike from an event alone. No new capture-prevention requirement is introduced.

**Platform references checked for this specification:**

- [Apple screenshot notification](https://developer.apple.com/documentation/uikit/uiapplication/userdidtakescreenshotnotification): event fires after capture and contains no screenshot payload.
- [Apple scene capture state](https://developer.apple.com/documentation/swiftui/environmentvalues/isscenecaptured): state covers recording, mirroring and other scene capture. Use the appropriate supported native API for the app's iOS target; do not call it proof of a saved recording.
- [Android screenshot detection](https://developer.android.com/about/versions/14/features/screenshot-detection): Android 14+ activity callbacks, with documented method limitations and no image payload. Observe lifecycle and declare the required permission.
- [Android recording detection](https://developer.android.com/about/versions/15/features#screen-recording-detection): Android 15+ visibility callbacks; inspect initial state as well as changes and configure required permission/lifecycle handling.
- [Expo ScreenCapture](https://docs.expo.dev/versions/latest/sdk/screen-capture/): use screenshot listeners where supported; recording-state support may require a native bridge. Do not assume the screenshot listener detects recording. Avoid adding broad photo-library access solely for legacy screenshot detection; mark unsupported coverage instead.

Before shipping, verify on physical supported iOS/Android devices: screenshots, recording started before/after opening a Circle post, feed visibility changes, mirroring wording, foreground/background transitions, duplicate/offline events, owner-only notices, unsupported methods, and no alerts for non-circle content. Neither generic Expo support nor a simulator check establishes complete capture coverage.

**Honest limits — write these in the product copy, don't hide them**
- **Content capture cannot be completely prevented.** D45 removes external sharing surfaces, but screenshots, manual copying or photographing a screen remain possible. State the community rule and reporting path without promising that content can never leave a device. Platform capture controls, if later added, are only an additional deterrent.
- **Widening a post's audience is retroactive; narrowing it is not.** People who already saw it, saw it
- Anonymous means anonymous to other members, not to Eve

---

## 9. What to build in what order

1. Auth: email magic link, DOB gate, one-account-per-email (phone OTP and one-account-per-number when SMS is funded)
2. Schema, RLS policies, and **the RLS test suite** — write the tests with the policies, not after
3. Composer with both dials, and the posts table behind it
4. Feed with cursor pagination
5. Follows, circles, the "+ add people" flow
6. Verification, both doors: vendor hosted flow + signed webhook (Path A); vouch tokens, the voucher page, anti-self-vouch checks (Path B); `recompute_tier` and `vouch_policy`
7. Rant view (an index and a filter, at this point)
8. Report, block, moderation queue
9. PostHog retention events
10. Founders' Board seeding

Items 1–4 are the spine. If week three arrives and only those exist, that's still a demonstrable product.
