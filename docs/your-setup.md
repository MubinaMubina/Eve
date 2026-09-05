# Your Setup

We have enough product decisions to build. No additional decision round or purchase is needed to try the first local preview.

## Do Now

1. **Try the preview:** open `http://localhost:8082`, choose Private or Public, and try posting and changing account privacy. Use only made-up content; the preview resets on reload.
2. **Install full Xcode and an iOS Simulator:** install Xcode from Apple's distribution, open it, accept the license and install its requested iOS components. This Mac currently has Command Line Tools only. Expo SDK 57 lists Xcode 26.4+; confirm your macOS can run the required version. [Expo requirements](https://docs.expo.dev/versions/v57.0.0/), [Apple Xcode](https://developer.apple.com/xcode/)
3. Tell me when Xcode opens successfully, or share the exact install error. We can keep building in the browser meanwhile.

## Before Backend Integration

- Install a supported Docker-compatible runtime so we can run the full Supabase stack locally. We will initialize the project configuration and migrations together; embedded database tests already work without Docker. [Supabase local development](https://supabase.com/docs/guides/local-development/overview)
- No hosted Supabase project is needed for today's preview. When we connect one, use a separate development project and local environment configuration. Do not paste passwords, service-role keys or SMTP credentials into chat.

## Can Wait

- Paid Apple Developer enrollment, TestFlight access, a domain, SMS, production email and hosting.
- The permanent iOS bundle identifier and signing ownership must be confirmed before distribution. `eve-local` is only a development name/scheme.
- Real-member invitations. The preview is not ready for them; [release-readiness.md](release-readiness.md) still applies.
