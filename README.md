# Handoff: YoSOM Student Chatbot

## Overview

YoSOM is a two-sided AI system that helps Yale SOM dining venues (**Charlie's Place** and **McNay Cafe**) optimize their menus based on student input. This handoff covers the **student-facing chatbot** — a mobile-first iOS-style conversational interface that students reach via in-venue QR codes or links from the YoSOM Instagram account.

The experience is engineered for two segments:
- **Quick Tappers (~90%)**: vote and leave in 30 seconds, all clicks no typing
- **Deep Talkers (~10%)**: type out specific cravings or ideas

The default flow serves Quick Tappers; Deep Talk mode is always one tap away but never forced.

---

## About the Design Files

The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate these designs in your target codebase's environment**, using its established patterns and libraries.

If you are starting fresh, we recommend the production stack outlined under "Recommended Production Stack" below.

---

## Fidelity

**High-fidelity (hifi).** Final colors, typography, spacing, animations, and interactions are all locked in. Recreate pixel-perfectly using your chosen UI library, but feel free to swap implementation primitives (e.g., shadcn/ui buttons instead of raw `<button>` tags) so long as the rendered result matches.

---

## Recommended Production Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Next.js API routes (or a small Express service in the same repo)
- **Database**: MongoDB Atlas (with Mongoose for schemas)
- **AI**: `@anthropic-ai/sdk` calling Claude Haiku for conversational glue + classification
- **Hosting**: Vercel (frontend + API routes), MongoDB Atlas (DB)
- **Icons**: lucide-react
- **Fonts**: SF Pro (system) for UI, Fraunces (Google Fonts) for the wordmark and live-feed title

---

## Screens / Views

The prototype is a single mobile screen (390×844 reference, the design renders in a 402-wide iOS device frame) with two views: **chat** and **live feed**.

### View 1 — Chat

**Purpose**: Five-stage conversational flow that collects menu preferences in 30 seconds.

**Layout** (top → bottom, fixed-height column):

1. **Sticky header** (`64px` top padding to clear the iOS status bar, `16px` horizontal, `12px` bottom padding)
   - Background: `rgba(250, 247, 242, 0.88)` with `backdrop-filter: blur(14px) saturate(180%)`
   - Bottom border: `0.5px solid rgba(27, 40, 69, 0.08)`
   - Contents:
     - **Venue avatar**: 36×36 rounded square (`border-radius: 12px`), gradient `linear-gradient(135deg, #1B2845 0%, #0F4D92 100%)`, holds an emoji (🥪/☕/🍽️ depending on selected venue)
     - **Wordmark "YoSOM"**: Fraunces 700, 19px, letter-spacing -0.4px, color `#1B2845`
     - **Status line**: 11.5px, weight 500, color `#8A8A93`. Format: `[pulsing green dot] {N} chatting now · {VenueName}`
     - **Reset button** (right): 34×34 circle, background `rgba(27, 40, 69, 0.06)`, contains a refresh icon

2. **Scrollable message list** (flex: 1, `padding: 16px 14px 18px`, `gap: 10px`, smooth scroll)
   - Auto-scrolls to bottom on new messages

3. **Sticky input bar** (`8px 12px 36px` — bottom padding clears iOS home indicator)
   - Background and blur match header
   - Top border: `0.5px solid rgba(27, 40, 69, 0.08)`
   - Pill input: white, `border-radius: 22px`, `0.5px solid` border, holds the text input plus a 34×34 coral circle button (mic icon when empty, send icon when there's text)

**Components inside the message list:**

- **AI bubble** — left-aligned, max-width 82%
  - Background `#FFFFFF`, color `#1B2845`, `border-radius: 22px 22px 22px 6px`
  - Padding `12px 16px`, font 16px / line-height 1.42, weight 450
  - Subtle shadow: `0 1px 2px rgba(27,40,69,0.05), 0 4px 16px rgba(27,40,69,0.04)`
  - Animation: `pop-in` (translateY + scale, 360ms cubic-bezier)

- **User bubble** — right-aligned, max-width 82%
  - Background `var(--coral)` (default `#FF6B6B`), color white
  - `border-radius: 22px 22px 6px 22px`, padding `11px 16px`
  - Font 16px, weight 500
  - Shadow: `0 2px 8px rgba(255, 107, 107, 0.25)`

- **Typing indicator** — three pulsing dots in a light-gray bubble (`#EDE7DC`), shape matches AI bubble. ~1.1s before each AI message replaces it.

- **Quick-reply chips** — vertical column, right-aligned. Each: white background, `1.5px solid rgba(255, 107, 107, 0.35)` border, coral text `#E85959`, font 15.5px / weight 600, `border-radius: 999px`, padding `11px 18px`. Stagger their entrance by 80ms.

- **Venue cards** — 2-column grid, `gap: 10px`. Each card:
  - White background, `1px solid rgba(27,40,69,0.08)`, `border-radius: 22px`, padding `18px 14px`
  - 56×56 rounded-square emoji bucket (`border-radius: 16px`, tinted background per venue)
  - Name: 16px weight 700; sub: 13px weight 500 muted
  - On select: border becomes `2px solid coral`, coral checkmark badge (26×26) appears top-right with pop animation, the *other* card dims to 0.45 opacity

- **Vote card** — full-width row, white background, 22px radius, padding 14, `gap: 14px` flex
  - 64×64 emoji bucket on left
  - Middle: name (15.5px / 700), dietary pill row (10.5px, weight 600, `padding: 3px 8px`, background `rgba(15,77,146,0.08)`, color `#0F4D92`), price + vote count line (13px muted)
  - 46×46 heart button on right. Unvoted: white with coral border. Voted: solid coral with white heart icon, plus a coral box-shadow. Tap triggers `heart-burst` animation (scale 1 → 1.35 → 1, 380ms)
  - Voted card border becomes `1.5px solid rgba(255,107,107,0.5)`

- **"Done voting" button** — appears under the vote stack only after ≥1 vote
  - Dark navy `#1B2845`, white text, `border-radius: 999px`, padding `14px 22px`, font 15.5px / 700, with a right-arrow icon

- **"Nothing's hitting?" link** — small underlined text under the vote stack, color `#2A3759`, font 13.5px / 600, opacity 0.85

- **Emoji reactions** — three 60×60 rounded squares (`border-radius: 20px`), white, 30px emoji centered. On select: `2px solid coral` border, others dim to 0.4

- **Live-feed CTA** — full-width button, gradient `linear-gradient(135deg, #FF6B6B 0%, #FF8C66 100%)`, white text, sparkle icon left + arrow icon right, font 16px / 700, padding `16px 18px`, `border-radius: 20px`, shadow `0 8px 24px rgba(255,107,107,0.32)`

### View 2 — Live Feed

**Purpose**: The emotional payoff — students see their vote land in a live, animated tally.

**Layout**:

1. **Sticky header** — same chrome as chat
2. **Sub-header section** (`64px 20px 16px` padding, bottom border `0.5px`):
   - Pulsing coral dot + "LIVE" label (11.5px, weight 700, letter-spacing 1.2, uppercase, color `#E85959`)
   - Title "What SOM Wants" — Fraunces 700, 26px, letter-spacing -0.5
   - Sub: "Refreshing every few seconds · {N} students contributing" (13px muted)
3. **Scrollable body** (`18px 20px 24px`, `gap: 14px`):
   - Section label "TOP PICKS · THIS WEEK" (11px, weight 700, letter-spacing 1.4, uppercase, muted)
   - Bar rows: 36×36 emoji bucket + name + tabular-num vote count (right-aligned, coral, 14px / 700) + 10px-tall horizontal bar (background `rgba(27,40,69,0.06)`, fill is gradient for #1 / progressively-fading navy for #2-5). Bar width transitions over 800ms.
   - Section label "RECENT INPUTS" + word-cloud card (white background, 18px radius, 14px padding). Words pop with floating animation (`yo-float`, 3s ease-in-out, staggered delays). Random subset rendered in coral with `rgba(255,107,107,0.10)` background.
   - "Share with friends" button (white, neutral border, 16px radius, lucide share icon)
   - "← Back to chat" link (muted, 13.5px / 600)

---

## Interactions & Behavior

### Conversation State Machine

Stages: `boot → welcome → venue → votes → reaction → final → deeptalk`.

**Stage 1 — Welcome**
- AI message streams in (typing indicator ~900ms): "Hey! 👋 {N} students have chatted today. McNay Cafe is leaning Asian comfort food this week. Wanna help shape next week's menu? Takes 30 seconds."
- Three quick-reply chips below: "Yes, let's go 🚀", "Show me what people want", "I have a specific craving"
- First two → Stage 2. Third → Deep Talk (Stage 4 fork).

**Stage 2 — Venue Pick**
- AI: "Pick a spot 📍"
- Two venue cards. On tap: card animates checkmark, user-bubble echo of venue name appears, then advance to Stage 3 after 700ms.

**Stage 3 — Vote Cards**
- AI: "Here are 4 ideas I'm considering for next week. Tap the ones you'd actually order 👇"
- Four vote cards (different per venue — see Vote Items table below)
- "Nothing's hitting?" deep-talk link always visible
- After ≥1 vote → "Done voting →" button appears with fade-up animation
- Tap "Done voting" → user bubble "Voted on X items" → Stage 4

**Stage 4 — Quick Reaction OR Deep Talk**

Quick branch (from Stage 3):
- AI: "How was the Korean rice bowl this week? 🍚"
- Three emoji buttons (👍 😐 👎)
- On pick: user-bubble echo, AI replies "Got it, thanks!" (or, for 👎: "Got it — noted. Thanks for the honesty 🙏"), then Stage 5

Deep Talk branch (from welcome chip OR vote-card link OR free typing in any stage):
- AI: "I'm listening. What are you actually craving? Could be a dish, an ingredient, even just a vibe. ✨"
- Input gets focus
- User types and sends
- **Off-topic check** runs first (see "Off-topic redirect" below)
- Turn 1 → "{FirstWord}, got it. Are you thinking tonkotsu broth or something lighter? 🍜"
- Turn 2 → "Mm, that's helpful. Any specific protein or veg you're craving with it?"
- Turn 3 → "Cool, I've got enough. Want to see what others are voting on too? →" + a single "Yes, show me" chip → Stage 5

**Stage 5 — Final + Live Feed Reveal**
- AI: "🎉 You're done! Your vote joins {N} others in tomorrow's brief. Wanna see live results?"
- Single coral CTA: "Show me the live feed" → swap to live-feed view with fade-up animation

### Off-topic Redirect

In the prototype, a regex of food keywords detects on-topic input. **In production, replace this with a Claude Haiku classifier.** Off-topic flow:

- User: "wait can you book me a haircut"
- AI: "Ha — I hear you, but I can only help with food at SOM 🍽️ What would actually hit the spot for lunch this week?"
- The conversation does NOT advance — it just re-prompts. The next on-topic message resumes the script where it left off.

### Free typing from any stage

If the user types and sends a message during Quick Tap stages, smoothly route them into Deep Talk (set stage to `deeptalk`, do not consume their voting progress).

### Live feed simulation

Every 2200ms: bump 1–2 random items by 1–3 votes; re-sort items descending; occasionally increment the "students contributing" counter. Word cloud cycles its accent words on the same tick.

### Reset button

Clears all state, returns to Stage 1 boot.

---

## Animations & Transitions

| Name | Use | Definition |
|---|---|---|
| `yo-pop-in` | Bubble entrance | 360ms cubic-bezier(0.2, 0.9, 0.3, 1.2): translateY 10→0, scale 0.96→1, with 60% overshoot to scale 1.01 |
| `yo-fade-up` | Card entrance | 320ms ease-out: translateY 8→0, opacity 0→1 |
| `yo-typing` | Typing dots | 1.2s infinite: dots pulse translateY 0→-3 with opacity 0.4→1, staggered 0.15s/0.30s |
| `yo-heart-burst` | Vote tap | 380ms cubic-bezier(0.3, 1.4, 0.5, 1): scale 1 → 1.35 → 1 |
| `yo-bar-grow` | Live bars | 900ms cubic-bezier(0.2, 0.8, 0.2, 1) — but in production, just transition the `width` property |
| `yo-pulse-dot` | Live indicator | 1.6s infinite: opacity 0.5→1, scale 1→1.3 |
| `yo-float` | Word cloud | 3s ease-in-out infinite: translateY 0 ↔ -3 |
| Card press feedback | Any tappable | 120ms ease: scale 1 → 0.97 on `:active` |

Stagger entrances of multi-item lists (chips, vote cards) by 70–80ms per item.

---

## State Management

```ts
type Stage = 'boot' | 'welcome' | 'venue' | 'votes' | 'reaction' | 'final' | 'deeptalk';
type View = 'chat' | 'feed';

type Msg =
  | { id: number; kind: 'ai'; text: ReactNode }
  | { id: number; kind: 'user'; text: string }
  | { id: number; kind: 'typing' }
  | { id: number; kind: 'chips'; chips: {id, label}[]; handler: 'welcome' | 'postdeep' }
  | { id: number; kind: 'venue' }
  | { id: number; kind: 'votes' }
  | { id: number; kind: 'reactions' }
  | { id: number; kind: 'cta' };

interface AppState {
  msgs: Msg[];
  stage: Stage;
  venue: 'charlie' | 'mcnay' | null;
  votedIds: Set<string>;
  reaction: 'up' | 'mid' | 'down' | null;
  deepTalkTurns: number;
  view: View;
  chatters: number;     // ticks up every ~4.5s
  voteItems: VoteItem[];
  input: string;
}
```

Server-side, every state change that's a real signal (vote, reaction, deep-talk message, completion) should write to MongoDB. See "Backend & Database" below.

---

## Design Tokens

### Colors

| Token | Default value | Used for |
|---|---|---|
| `--cream` | `#FAF7F2` | App background |
| `--cream-2` | `#F2EDE4` | Secondary background |
| `--ink` | `#1B2845` | Primary text, AI bubble text, dark CTAs |
| `--ink-soft` | `#2A3759` | Secondary text, link color |
| `--coral` | `#FF6B6B` | Primary accent — user bubbles, vote button, CTAs |
| `--coral-deep` | `#E85959` | Coral hover/active, vote count emphasis |
| `--yale` | `#0F4D92` | Sparingly: dietary tag pills |
| `--muted` | `#8A8A93` | Captions, helper text |
| `--line` | `rgba(27, 40, 69, 0.08)` | Borders, dividers |

### Accent variations (Tweak panel)

| Name | Coral primary | Coral deep |
|---|---|---|
| Coral (default) | `#FF6B6B` | `#E85959` |
| Sunset | `#E8602D` | `#C84F22` |
| SOM Gold | `#C8A04A` | `#A88334` |
| Sage | `#4A8E6E` | `#387055` |
| Yale Blue | `#0F4D92` | `#0A3970` |

### Typography

- **UI**: `-apple-system, "SF Pro Text", "SF Pro Display", "Inter", system-ui, sans-serif`
- **Display** (wordmark, live-feed title): `Fraunces, Georgia, serif`, weights 500/600/700

### Border radius scale

`6px` (bubble tail), `12px`, `16px` (icons/buckets), `18px` (cards inside chat), `20px` (CTAs), `22px` (bubbles, large cards), `999px` (pills, buttons)

### Shadows

- Card resting: `0 1px 2px rgba(27,40,69,0.05), 0 4px 12px rgba(27,40,69,0.03)`
- Card hover/active: `0 4px 16px rgba(255,107,107,0.12)` (coral-tinted when selected)
- CTA: `0 6px 18px rgba(27,40,69,0.25)` (dark) or `0 8px 24px rgba(255,107,107,0.32)` (coral gradient)
- User bubble: `0 2px 8px rgba(255,107,107,0.25)`

### Spacing

Common values: `4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24` px. Use `gap` on flex/grid containers; avoid stacking margins.

---

## Vote Items (seed data)

```ts
const VOTE_ITEMS = {
  charlie: [
    { id: 'ramen',   emoji: '🍜', name: 'Spicy Miso Ramen',   tags: ['Vegan', 'Spicy'],          price: 9.50, votes: 12, tone: '#FFE2D6' },
    { id: 'bowl',    emoji: '🥘', name: 'Korean Rice Bowl',   tags: ['Gluten-free', 'Spicy'],    price: 10.25, votes: 18, tone: '#FFE9D6' },
    { id: 'salad',   emoji: '🥗', name: 'Crunchy Thai Salad', tags: ['Vegan', 'Gluten-free'],    price: 8.75, votes: 7,  tone: '#E6F1E0' },
    { id: 'burrito', emoji: '🌯', name: 'Breakfast Burrito',  tags: ['Veggie', 'High-protein'],  price: 7.50, votes: 21, tone: '#FFF1D6' },
  ],
  mcnay: [
    { id: 'sandwich', emoji: '🥪', name: 'Pesto Caprese Sub', tags: ['Veggie'],                  price: 8.25, votes: 14, tone: '#E6F1E0' },
    { id: 'matcha',   emoji: '🍵', name: 'Iced Matcha Latte', tags: ['Vegan-opt'],               price: 5.50, votes: 22, tone: '#E0EFE3' },
    { id: 'boba',     emoji: '🧋', name: 'Brown Sugar Boba',  tags: ['Sweet'],                   price: 6.00, votes: 17, tone: '#EFE0F0' },
    { id: 'wrap',     emoji: '🌯', name: 'Buffalo Chick Wrap', tags: ['High-protein', 'Spicy'],  price: 9.00, votes: 11, tone: '#FFE2D6' },
  ],
};
```

In production these come from MongoDB, scoped by venue + weekOf.

---

## Backend & Database

### MongoDB Schemas

```ts
// sessions — anonymous student sessions (cookie-based session ID)
{
  _id: ObjectId,
  sessionId: string,              // random, set in HttpOnly cookie
  entrySource: 'qr' | 'instagram',
  venueQR?: 'charlie' | 'mcnay',  // QR-encoded venue, lets us skip Stage 2
  startedAt: Date,
  completedStage: Stage,
  finishedAt?: Date,
}

// menuItems — vote candidates the AI shows
{
  _id, venue, name, emoji, tags: string[], price, weekOf: Date,
  status: 'candidate' | 'live' | 'retired',
  createdAt, createdBy
}

// votes — every heart tap (upsert per session+item to dedupe)
{ _id, sessionId, venue, itemId, value: 1 | -1, createdAt }

// reactions — 👍😐👎 on shipped items
{ _id, sessionId, itemId, value: 'up' | 'mid' | 'down', createdAt }

// deepTalk — free-text exchanges
{
  _id, sessionId,
  transcript: { role: 'user' | 'assistant'; text: string; ts: Date }[],
  extractedTags: string[],   // populated by background Claude call on session end
  createdAt
}
```

**Indexes**:
- `votes`: `{ venue: 1, itemId: 1, createdAt: -1 }` (live-feed query)
- `votes`: unique `{ sessionId: 1, itemId: 1 }` (dedupe)
- `menuItems`: `{ venue: 1, weekOf: -1, status: 1 }`
- `sessions`: `{ sessionId: 1 }` unique

### API Routes (Next.js)

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/session` | Create or resume a session (sets cookie). Accepts `?venue=` to record QR origin. |
| `GET` | `/api/menu?venue=charlie` | Returns 4 active candidates for current `weekOf` |
| `POST` | `/api/vote` | Body: `{ itemId, value }`. Upserts on `(sessionId, itemId)`. |
| `POST` | `/api/reaction` | Body: `{ itemId, value }`. |
| `POST` | `/api/deeptalk` | Body: `{ message }`. Server: classify → reply via Claude → append to transcript → return reply. |
| `GET` | `/api/feed/live?venue=charlie` | Top 5 items by vote count for the current week. Polls every 2s on the client (or use Server-Sent Events). |
| `POST` | `/api/session/finish` | Marks session complete; triggers background tag-extraction job. |

### Anthropic Calls (3 places)

1. **Off-topic classifier** (`/api/deeptalk` first step):
   - Model: `claude-haiku-4-5`
   - System: "You classify a single user message as `food_input`, `off_topic`, or `done`. Reply with JSON: `{intent: ...}`. No prose."
   - max_tokens: 50

2. **Conversational glue** (`/api/deeptalk` if intent is `food_input`):
   - Model: `claude-haiku-4-5`
   - System: "You are YoSOM, a friendly food-feedback chatbot for Yale SOM dining. Ask ONE short follow-up question about food preferences. Be warm, casual, ≤25 words. Use 1 emoji max. Never go off-topic."
   - Input: last 3 turns from `deepTalk.transcript`
   - max_tokens: 200

3. **Tag extractor** (background job after `/api/session/finish`):
   - Model: `claude-haiku-4-5`
   - System: "Extract food preference tags from this conversation. Return JSON array of lowercase strings, max 8 items. Examples: ['spicy', 'vegan', 'late-night', 'asian']."
   - max_tokens: 200
   - Stored in `deepTalk.extractedTags`

### Privacy & Ops

- **No accounts.** Use HttpOnly session cookie (random ID, 30-day expiry).
- **Rate-limit by IP** (Upstash or in-memory): 60 req/min per IP, 1 vote per `(session, item)`.
- **GDPR/Yale data policy**: Don't store anything personally identifying. The session cookie is the only identifier.
- **QR codes** should encode `?venue=charlie&src=qr` so the QR landing skips Stage 2.

---

## Assets

The prototype uses no proprietary assets:
- Emoji are system emoji (🍜🥪☕ etc.) — keep these as Unicode in production
- Icons are inline SVG drawn lucide-style — replace with `lucide-react` imports
- Fonts: SF Pro (system, no asset needed), Fraunces (Google Fonts CDN — `@fontsource/fraunces` for production)

If your real product needs photography instead of emoji buckets, swap the 56–64px emoji blocks for `<Image>` components — keep the rounded-square frame with the same tone-tinted background as a fallback.

---

## Files in this bundle

- `YoSOM Chatbot.html` — the prototype entry point
- `yosom/app.jsx` — main React app with the conversation state machine
- `yosom/chat.jsx` — header + input bar
- `yosom/cards.jsx` — bubbles, chips, vote/venue cards, emoji reactions
- `yosom/livefeed.jsx` — live-feed view with bar chart and word cloud
- `yosom/icons.jsx` — inline SVG icons (replace with `lucide-react`)
- `ios-frame.jsx` — iPhone device frame (drop in production — your app should be a normal mobile web view)
- `tweaks-panel.jsx` — design-time tweak panel (drop in production)

---

## Suggested Build Order

1. Scaffold Next.js + Tailwind + shadcn/ui + Mongoose + Anthropic SDK
2. Set up MongoDB schemas + seed `menuItems` for current week
3. Build `/api/session`, `/api/menu`, `/api/vote`, `/api/reaction`
4. Build the chat shell + state machine (Stages 1–3 with mocked typing delays)
5. Wire the Claude Haiku conversational path for Deep Talk
6. Build the live feed with polling
7. Build the management-side ops brief (separate route, behind basic auth)
8. QR codes + Instagram-link landing page polish
9. Analytics + monitoring (PostHog, Sentry)

Good luck — this prototype is your spec; your real app will be better than the prototype because it's connected to real preferences. The prototype's job is to make sure the *experience* is right; your job is to make the experience real.
