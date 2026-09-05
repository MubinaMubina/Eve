# Development

## First Build

The first milestone is a **local, synthetic-data Expo preview**, not a deployed MVP. The app is not connected to Supabase yet. No email, password, identity documents or analytics are collected. Selected post media is handled locally without uploads; use only non-sensitive sample files.

Implemented in the preview:
- Explicit initial Private/Public choice.
- Community, Following and Anonymous feed separation.
- Named text, image and video posts with four audiences; account-derived defaults for each fresh draft.
- Anonymous text, image and video posts with an app-wide audience and distinct random Author numbers.
- Device-library selection, replace/remove attachment, optional media captions and inline video play/pause, seeking and mute controls. No autoplay, download or external-sharing controls.
- Owner-only named/anonymous post lists, privacy-switch confirmation and local post deletion.
- Draft discard confirmation. Account settings cannot change while a composer is open; no draft is automatically republished or widened.

This is intentionally an incomplete interface. Comments, likes, profile search, follow requests, circle management, cartoon avatars, reports, vouching, moderation, capture detection, push, protected media uploads, persistence and real admission are not implemented. Preview follow/circle relationships are fixed fixtures. Pending-follow acceptance is not implemented or claimed by the privacy-switch tests.

Media preview: one image (up to 10 MB) or video (up to 50 MB) per post, with no required caption. These are provisional development limits, not final MVP limits. Files are selected locally using Expo ImagePicker and rendered without uploads. Browser object URLs are released on replacement, removal, discard, deletion or preview unmount; the original device files are never deleted. Native picker cache cleanup and production metadata stripping remain unimplemented. Do not use sensitive/identifying media, even in anonymous mode: faces, voices and file contents can identify people. Playback formats depend on the device's decoders; unreadable files show an error. [Expo ImagePicker](https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/), [Expo Video](https://docs.expo.dev/versions/v57.0.0/sdk/video/)

`src/demo` owns sample data and preview state. Its client-side permission checks are testable product examples, **not a security boundary**. Sample identities are inspectable in browser development tools. Production renders a closed screen, even when the preview environment flag is true.

## Run Locally

Node 22.14 is installed on this Mac. Dependencies are locked in `package-lock.json`. Expo SDK 57 requires Node 22.13.x or later; keep its native package versions aligned using `npx expo install`. [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/)

```sh
npm ci
npm run preview -- --port 8082
```

Open `http://localhost:8082`. Choose an account privacy and enter the sample community. Reload resets all changes. This server is local-only; do not tunnel it or invite real members.

For a native preview once Xcode is ready:

```sh
EXPO_PUBLIC_DEMO_MODE=true npm run ios
```

`npm start` without the demo flag shows the closed screen. `.env` files are ignored, except `.env.example`. Never put service-role keys, SMTP passwords, signing keys or database passwords in `EXPO_PUBLIC_*` variables or Git.

## Verification

```sh
npm run typecheck
npm test
EXPO_PUBLIC_DEMO_MODE=true npm run export:web
npm run test:ui
```

Keep the preview server running on port 8082 for UI tests. Override `EVE_PREVIEW_URL` when using another port. Playwright uses installed Google Chrome. The export command deliberately enables the preview flag to verify that a production build still refuses the demo. Export writes local files only; it does not publish them.

Unit tests cover preview audience rules, mandatory membership checks, both block directions, current circle membership, privacy transitions, feed separation and owner deletion. Database tests execute the actual migration in embedded PostgreSQL via PGlite. Browser tests exercise mobile/desktop posting and privacy flows, draft handling and the production lock. Screenshots go into ignored `test-results/`.

PGlite tests simulate Supabase Auth identities. They do **not** validate email delivery, JWT verification, PostgREST, GraphQL, Realtime, Storage, physical capture detection, native layouts or a deployed Supabase environment. Those release checks remain open.

## Database Foundation

`supabase/migrations/202609060001_admission_foundation.sql` creates private applicant records and review requests, restrictive privileges/RLS, a non-login/non-bypass API role, and three owner-scoped functions:

- `eve_complete_onboarding`: verified-email and adult self-declaration checks, explicit privacy, normalized handle; creates Tier 1 only.
- `eve_my_application`: only the caller's safe application summary, never review notes.
- `eve_request_team_review`: idempotent pending request, no self-approval.

Member access starts closed in `private.release_config`. No reviewer approval API, member-content table/API or production cleanup exists yet. There is no reason to enable that flag in a real environment now.

The migration has been tested in PGlite, not applied to local or hosted Supabase. Next: initialize the full Supabase dev stack, verify the migration against its actual roles/API exposure, wire native email authentication and resumable onboarding, then build the private post/relationship APIs. Retention and deletion defaults in [release-readiness.md](release-readiness.md) are approved requirements, not implemented jobs.

## Known Build Issues

The initial npm audit reports 13 moderate dependency findings, including propagated findings in Expo tooling. Two underlying advisories concern [URI decoding](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) and [UUID buffer bounds](https://github.com/advisories/GHSA-w5hq-g745-h8pq). Do not run `npm audit fix --force`: npm currently proposes incompatible Expo/Router downgrades. Review compatible upstream fixes or narrowly tested overrides before any external build; this is not an accepted production exception.

Full Xcode and Docker are not installed on this Mac. Native Simulator/device and full Supabase integration checks remain unrun. Placeholder Expo launcher assets are not final Eve branding.

See [your-setup.md](your-setup.md) for the owner's setup tasks, and [release-readiness.md](release-readiness.md) for real-member release gates.
