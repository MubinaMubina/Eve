# Eve - Design Direction

## What This Is For

The current preview's colours, fonts and visual style are not approved. This brief starts fresh from the founder's imagined design. Keep the working product rules, not the placeholder appearance.

Answer in your own words. Short answers, rough descriptions and reference pictures are enough; no design vocabulary or hex codes are required. Write `unsure` where you want options. These are visual questions, not another round of product decisions.

First approve one Home screen. Then generate the other screens from that reference so they look like the same app. Generated screenshots are design references, not functioning UI or proof of privacy enforcement. We will implement and test the chosen direction in the actual app afterward.

Product rules: [product-v1.md](product-v1.md). Current implementation: [development.md](development.md).

## 1. The Picture in Your Head

### 1. Describe the Eve screen you imagine opening on your phone.

What do you see first? Describe the background, header, posts and overall feeling without worrying about how to build it.

**Answer:**

### 2. Which three to five words should describe Eve's personality?

For example: understated, expressive, intimate, sharp, playful, editorial, futuristic, nostalgic or minimal. Also name a feeling it must not have. A women-only app does not automatically mean pink, floral or cute.

**Answer:**

### 3. What references come closest to your vision?

List or attach two to five app screens, websites, magazine layouts, objects or colour references. For each, say exactly what you like and what you do not want to borrow. A reference's colours can be right even when its layout is wrong.

**Answer:**

### 4. What should disappear from the current preview, and is anything worth keeping?

Consider the green palette, font, lowercase wordmark, spacing, post layout, header and navigation. `Keep nothing visually` is a valid answer. Functionality can stay while its presentation changes.

**Answer:**

## 2. Colour and Surfaces

### 5. Should the first design be light, dark, or both?

If both, which should we approve first? Describe the background you imagine rather than choosing a theme just because another app uses it.

**Answer:**

### 6. Which colours do you want, and where should they appear?

Name a main background colour, primary action/accent colour and any secondary accent. Names, hex codes or pictures all work. Is the colour mostly in small details, or in larger areas of the screen?

**Answer:**

### 7. Which colours or combinations should we avoid completely?

Include anything you associate with an unwanted look, such as corporate, childish, clinical or overly decorative. Do not assume the existing colours need to survive.

**Answer:**

### 8. How should the surfaces and contrast feel?

Flat and crisp, softly separated, or more tactile? Do you like dividers, subtle borders or restrained shadows? Should accents feel muted or vivid? Text still needs to be easy to read.

**Answer:**

## 3. Typography and Identity

### 9. How should the name appear: Eve, eve, EVE, or a custom wordmark?

Describe the lettering or attach a reference. Should it be the main element in the header or share space with other controls?

**Answer:**

### 10. What kind of font do you imagine for posts and navigation?

For example: clean and neutral, geometric, softly rounded, human and handwritten-looking, or book-like. Name a font if you know one; otherwise point to lettering in a reference. We will verify the actual font and licence before implementation.

**Answer:**

### 11. Should headings and the wordmark use the same font as the rest of the app?

If different, describe the contrast. For example, a distinctive wordmark with very readable everyday text underneath it.

**Answer:**

### 12. How should text feel in size and weight?

Compact and quiet, comfortably readable, or bold and expressive? Is there a reference whose post text feels exactly right? Decorative type should not make long posts or comments difficult to read.

**Answer:**

## 4. Layout and Navigation

### 13. How much content should fit on the Home screen?

Would you prefer several compact posts, around two comfortable posts, or one large media post with the next post beginning below it? Judge at normal phone size, not a zoomed-in mockup.

**Answer:**

### 14. How should one post be separated from the next?

Edge-to-edge feed rows, thin dividers, subtle borders, or individually framed posts? Describe the spacing and corners. Avoid putting the entire feed inside a decorative card.

**Answer:**

### 15. What belongs in the top header?

Where should Eve's name sit? Where do search, notifications or the create-post action belong? Choose positions as well as which items are visible; avoid duplicating the same action everywhere.

**Answer:**

### 16. What should the bottom navigation look like, and in what order?

Relevant MVP destinations are Home, people search, Activity and your profile. Creating a post can be a prominent plus action or live elsewhere. Do you prefer icons alone or icons with short labels? Do not add DMs, bookmarks or other deferred features just because a reference has them.

**Answer:**

### 17. How should Following, Community and Anonymous be presented?

Describe their order, placement and selected state: underline, subtle colour change, segmented control or another clear treatment. Which feed should the first reference image show? These remain three views, not three different visual brands.

**Answer:**

## 5. Posts, Media and Conversations

### 18. Arrange a typical post from top to bottom.

Where should the avatar, name, audience, time, text, image/video and interaction row sit? Should captions sit above or below media? What matters most when quickly scanning the feed?

**Answer:**

### 19. How should images and videos look in the feed?

Full width or inset? Square, portrait, or the original proportions? Should a tap open a larger in-app view? Describe the visible play, progress and sound controls for a paused video. These are visual preferences; playback behaviour and production media limits are separate decisions.

**Answer:**

### 20. What should anonymous posts and cartoon avatars look like?

Should the difference from named posts be subtle or immediately noticeable? Describe the cartoon style: simple faces, illustrated characters, abstract personalities or your own reference. Keep `Author 73192` and `Anonymous 4827` readable; no real profile picture or profile link belongs to an anonymous identity.

**Answer:**

### 21. How should the audience be shown without making posts feel cluttered?

Describe the treatment for Everyone on Eve, Followers, Mutuals and Close friends/Circles. Icons, short labels or a combination? The meaning must not depend on colour alone, and the composer must make the choice clear before posting.

**Answer:**

### 22. What should the composer look like?

Full screen or a sheet? Arrange the writing area, image/video attachment tools, preview, anonymous mode, audience choice, comments setting and Post action. Which element should be most prominent?

**Answer:**

### 23. How should a post's comments and replies be displayed?

An in-app detail screen or a sheet? How compact should avatars and replies be? On an anonymous post, where should the choices `Post as anonymous` and `I don't care` appear before each submission? The latter uses the member's normal identity, which the design must make apparent.

**Answer:**

### 24. What does your own profile look like?

Describe the avatar, name, handle, bio, settings access and named-post layout. Would you use a media grid, a list, or a switch between views? `My anonymous posts` needs a separate owner-only destination, not an anonymous tab visible on everyone's profile.

**Answer:**

## 6. Details and Approval

### 25. What should icons, buttons and selection states feel like?

Thin or stronger line icons? Filled or outlined primary actions? How rounded should small controls be? Name any details you dislike. Use one consistent icon family; unusual icon-only actions will need accessible labels and tooltips where appropriate.

**Answer:**

### 26. How much motion and decorative imagery belongs in Eve?

None, subtle transitions, or a more expressive feel? Describe where illustrations belong, if anywhere. Avoid animation that interferes with reading. Screenshots can suggest motion, but we will verify the actual transitions separately.

**Answer:**

### 27. Are there readability or language requirements the design should account for?

Examples: larger text, strong contrast, long names, multilingual posts or right-to-left text. Do not put your medical or personal details here; just describe what the interface needs to accommodate.

**Answer:**

### 28. What would make you say "yes, this is what I imagined"?

List your three non-negotiable details. Then say whether you want one precise first direction or two alternative Home-screen treatments using the same layout and content. Alternatives should explore your uncertainties, not reinvent the app.

**Answer:**

## Product Rules to Keep in Every Reference

These are settled behaviour, not visual preferences. A generated screen must not quietly change them.

- Eve is a women-only, trans-inclusive, 18+ member space. Use fictional adult members and non-sensitive sample content in references. Do not imply membership is determined by appearance.
- Everyone on Eve means admitted members inside the app, not the public internet. There is no separate Women only audience toggle.
- Posts support text, images and videos. A media post can have an optional caption. The preview's single-attachment limit is provisional, not a permanent product rule.
- Named posts can use Everyone on Eve, Followers, Mutuals or a Circle. New named posts default to Followers on private accounts and Everyone on Eve on public accounts; private accounts can deliberately choose app-wide posts.
- Anonymous posts use Everyone on Eve only. Show a fixed audience label in that composer mode, not restricted audience options.
- Anonymous authors use `Author` plus a random number. Anonymous commenters use `Anonymous` plus a random number and a cartoon avatar, without real-profile links. Their labels are thread-specific.
- Comments on named posts are named. Each new comment on an anonymous post requires `Post as anonymous` or `I don't care`; the latter shows the normal name/avatar. Comments have no separate audience selector.
- Anonymous likes never reveal liker identities. Do not show a liker-avatar stack. Public counts are not automatic: for reference screens, use sample authors whose count-display eligibility and opt-in are explicitly stated, or omit counts.
- Anonymous posts do not appear on real profiles or in their public post counts. Only the owner has a separate My anonymous posts destination.
- Private-account follow requests require approval. Circles grant current members access to the circle's posts, including historical ones; they are not Stories.
- Do not add external Share, Copy link, Download, Save/bookmark, DMs, Stories, shopping, creator payouts or an AI assistant. Media can have playback controls without export controls.
- Privacy confirmations, reporting, blocking and irreversible deletion need clear states. Do not promise perfect anonymity, screenshot prevention or guaranteed capture detection.

The MVP design target includes features not built in the local preview yet, such as comments, Activity and profile search. A reference image is not a completion claim.

## Gemini Prompt 1: First Home Screen

Use this after answering the questionnaire. Attach this completed document and any reference pictures. Start with one screen, not a collage of the entire app.

```text
Create a high-fidelity mobile app UI reference image for Eve.

The attached completed design.md contains the founder's visual preferences.
Follow those answers, especially the three non-negotiable details. Treat the
current prototype's colours, fonts and layout as unapproved. Do not default to
pink, lavender, florals or a generic "women's app" aesthetic. Reference images
are guidance for the specified details, not permission to copy another brand
or import its features.

FIRST CHECK
- Read the completed questionnaire and its Product Rules section.
- If a central visual choice is unanswered or contradictory, ask at most three
  focused questions before generating. Do not invent an approved direction.
- If the founder requested two alternatives, generate them as separate images
  with identical screen content and layout. Vary only the specified visual
  choices so the two directions can be compared fairly.

SCREEN TO GENERATE
The actual Home feed of Eve, already signed in as an admitted member. Use the
feed selected in answer 17; if no feed was chosen, use Community as a stated
working assumption. This is an app screen, not a landing page or pitch graphic.

Include:
- Eve's wordmark and the header arrangement from the answers.
- Following, Community and Anonymous as three clearly distinguished views,
  ordered and placed as requested, with exactly one selected.
- The requested bottom navigation and an obvious way to create a post.
- A credible mix of text and image/video content. Use the density requested
  by the founder; do not shrink everything just to fit more posts.
- A complete first post and a hint of the next one, where the chosen density
  allows. Remaining content may continue naturally below the viewport.
- Short, readable sample text and a consistent icon family.

SAMPLE CONTENT
For Community, show fictional adult member Alia, @alia.notes, with an
Everyone on Eve post: "I finally made time to paint again."
Include an original, clearly visible photo-style image of her colourful
painting on a worktable. Do not use a blurred placeholder or external logo.
A following post by fictional adult member Sana can begin with:
"What is one small win from your week?"

For Anonymous, adapt the same hierarchy to an app-wide anonymous thread:
Author 73192, "I said no today without apologising. Small win."
Use a cartoon avatar, no real username or profile link, and no liker identities.

For Following, show named posts from followed members. A close-friends post
may be included with a clear audience marker; no anonymous posts belong here.

If counts are shown, assume these sample authors are eligible and have opted
to display counts. Otherwise omit count numbers. Do not invent popularity
badges or public leaderboards.

VISUAL AND OUTPUT REQUIREMENTS
- Use the founder's chosen colours, typography, spacing, media treatment and
  icon style. Do not silently replace them with your usual design aesthetic.
- Produce one straight-on screen image, targeting a 390 x 844 logical layout
  at a high-resolution equivalent. Keep all later screens at the same ratio.
- No physical phone frame, perspective angle, desk mockup, montage or collage.
- Respect top and bottom device-safe areas. Keep navigation separate from
  scrolling content; do not overlap labels, controls or posts.
- Use readable text, comfortable touch areas and a consistent spacing grid.
  Keep letter spacing neutral, not compressed. Use a coherent type scale.
- Use restrained corners, generally no more than 8 logical pixels on post
  cards. Do not put cards inside cards or place the main feed in a floating
  decorative panel. Avatar circles and switches can use their normal shapes.
- Do not add marketing headlines, feature explanations, arrows, annotations,
  colour palettes or typography notes inside the app screen.
- Do not add DMs, Stories, bookmarks, external sharing/downloads, shopping or AI.
- Keep anonymous identity and audience rules intact. No Women only filter.

Deliver the screen image. In separate text, briefly state the palette with
hex codes, intended font family and weights, body-text size, spacing choices
and any assumptions. If you approximated a font, say so rather than claiming
the image proves an exact font match. The separate notes must not appear
inside the screenshot.
```

## Gemini Prompt 2: Revise Without Redesigning Everything

Use this with the most recent screen when some parts are right and others are not.

```text
Revise the attached Eve app screen. Use the completed design questionnaire and
the screen's existing product rules as constraints.

KEEP EXACTLY:
[Name the elements already approved: palette, header, post layout, font mood,
navigation, avatars, or specific details.]

CHANGE ONLY:
[List the requested changes in plain language. Be specific about which element
changes, the desired result, and what should stay untouched.]

Do not add features, move unrelated controls, change the sample content or
invent a new visual direction. Preserve the image dimensions and device-safe
areas. Return one revised straight-on app screen, with no phone mockup or
annotations. Describe any unavoidable deviation separately, not in the image.
```

## Gemini Prompt 3: Extend the Approved Design

Attach the approved Home screenshot, its separate style notes, and this completed document. Replace the screen-brief field with one brief from the list below. Generate each screen separately.

```text
The attached Eve Home screen is the approved visual reference. Extend that
exact design language to one additional app screen.

SCREEN BRIEF:
[Insert one screen brief from design.md.]

Keep the same palette, wordmark, typography, icon family, spacing rhythm,
surface treatment, control sizes and device-safe areas. Use the accompanying
style notes for exact values where supplied. Do not rebrand or redesign the
app between screens. Preserve the established placement of global navigation
unless this screen is an intentionally full-screen composer or modal.

Use the attached Product Rules section as behavioural constraints. Named-post
audiences and anonymous identity must remain correct. Use fictional adult
members, short readable copy and original non-sensitive media. Do not add
external share/download actions or deferred features.

Return one straight-on high-fidelity screen image at the same aspect ratio
and resolution as the approved reference. No device frame, perspective,
collage, marketing text or annotations. Put any necessary assumptions in
separate text. Do not present newly invented tokens as previously approved.
```

### Screen Briefs

Generate the first four after Home is approved. The remaining briefs can follow as implementation reaches them.

1. **Named composer with media:** The member has a Private account, named mode is active, and Followers is selected by default. Show a selected photo, an optional caption, replace/remove media controls, the audience choice and a Post action. A comments-enabled setting belongs in the composer. Use the full-screen or sheet treatment chosen in answer 22. Do not show every option expanded simultaneously.
2. **Anonymous composer:** Anonymous mode is active with a short text draft. Show the fixed Everyone on Eve audience, media attachment tools, a comments-enabled setting and Post. Do not show Followers, Mutuals or Circles in this mode. Do not show a real profile identity or an editable author number.
3. **Anonymous thread and comment choice:** Show Author 73192 and a brief post, then comments from Anonymous 4827 and Anonymous 9163 using distinct cartoon avatars. Anonymous replies from the author reuse Author 73192. Present a new comment draft and the explicit choices Post as anonymous / I don't care. Make the normal name/avatar visible as the identity used by the latter choice, without linking anonymous commenters to profiles.
4. **Video post detail:** Show an actual readable still from an original, non-sensitive video, caption and audience. Include play/pause, seek/progress and sound controls, comfortably arranged for touch. Use a paused state, not a fake loading screen. No download, external share, casting or picture-in-picture action in this initial reference.
5. **Your own profile:** Show your avatar, name, handle, bio, settings and named-post collection in the chosen layout. Add an owner-only route to My anonymous posts, separate from the profile's public content. Own private statistics may appear here, clearly distinguished from what other members see.
6. **Another member's private profile:** Show basic profile information and Request to follow, plus only her app-wide named posts. Do not reveal follower-only or circle content. A separate Requested state can be generated next; it is not an approval state.
7. **Activity:** Show fictional examples of a follow request, comment/reply, admission update or report outcome. Use clear unread/read styling. Do not add like notifications or reveal anonymous identities. This is in-app Activity, not a lock-screen notification.
8. **Close-friends selection:** Show an owner choosing members for a circle, with search, member rows and clear selection controls. Explain historical access only if a concise confirmation is needed, not as decorative feature copy. Do not depict Stories or an automatic vouching action.
9. **Account privacy confirmation:** Show the state before making an account public. The confirmation must convey that named posts except circle posts become app-wide, eligible pending follow requests are accepted, and anonymous/circle rules remain unchanged. Use clear confirm/cancel actions, not a decorative warning card buried in settings.
10. **Required signup privacy choice:** Show Public and Private as explicit choices, neither preselected. Public still means within Eve's admitted community. Do not imply that selecting an account type admits the applicant; admission is a separate step.

## Approval Notes

Use this section after reviewing the generated images. Only approved choices should become implementation instructions.

- **Approved Home reference filename:**
- **Approved palette / hex codes:**
- **Approved font direction / family to verify:**
- **Approved density and spacing:**
- **Approved header and navigation:**
- **Approved post and media treatment:**
- **Approved anonymous avatar direction:**
- **What must stay identical across screens:**
- **What still needs changing:**
- **Which screen should be implemented first:**

When an image is shared back in this project, include what you like, what you dislike and whether it is approved or just an experiment. We will translate the approved reference into reusable colours, typography and components, then check it on small and large phones. Generated lettering, fine spacing and interactions still need validation in the real app.
