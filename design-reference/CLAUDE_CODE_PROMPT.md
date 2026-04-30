# Prompt for Claude Code

Copy-paste this into Claude Code as your first message after dropping this folder into a fresh repo.

---

I'm building **YoSOM**, a two-sided AI system for Yale SOM dining. This folder contains the design handoff for the **student-facing chatbot**.

Read `README.md` end-to-end before writing any code. It contains:
- Full screen specs and design tokens
- The 5-stage conversation state machine
- MongoDB schemas + indexes
- API route definitions
- Three places where Claude Haiku plugs in (off-topic classifier, conversational glue, tag extractor)

Then read the HTML/JSX prototype files (`YoSOM Chatbot.html`, `yosom/*.jsx`) — these are **design references, not production code**. Recreate the UI in our chosen stack (Next.js 14 App Router + Tailwind + shadcn/ui + Framer Motion + Mongoose + `@anthropic-ai/sdk`).

## Build order

1. Scaffold the Next.js app, install deps, set up MongoDB connection (use `MONGODB_URI` env var), set up Anthropic client (`ANTHROPIC_API_KEY` env var)
2. Create Mongoose models for `Session`, `MenuItem`, `Vote`, `Reaction`, `DeepTalk` per the README schemas
3. Seed `menuItems` for the current week with the data in README's "Vote Items (seed data)" section
4. Build `/api/session`, `/api/menu`, `/api/vote`, `/api/reaction`, `/api/feed/live`, `/api/deeptalk`, `/api/session/finish`
5. Build the chat UI on `/` — match the prototype's visuals exactly
6. Wire the Claude Haiku call in `/api/deeptalk` (classify → reply, both tightly bounded with `max_tokens`)
7. Build the live-feed view at `/feed/[venue]` — poll `/api/feed/live` every 2s
8. Add a Tailwind config that maps the design tokens from README's "Design Tokens" section to CSS custom properties + `theme.extend`
9. Add `eslint`, `prettier`, basic `vitest` unit tests for the conversation state machine

## Constraints

- **Mobile-first.** Reference viewport: 390×844 (iPhone). Make sure it works at 360px wide.
- **Anonymous.** No accounts, no auth — just an HttpOnly session cookie.
- **Rate-limit** with `@upstash/ratelimit` (or in-memory if Upstash isn't available): 60 req/min per IP, plus a unique index on `Vote { sessionId, itemId }` for vote dedupe.
- **Don't reproduce Apple UI chrome.** The prototype uses an iOS device frame for presentation only — the real app is just a mobile web view.
- **Keep Claude calls cheap.** Use Haiku, cap `max_tokens` per the README.

## When you're done

- Tests pass
- `pnpm dev` runs without errors
- A walkthrough of the Quick Tap flow completes in under 30 seconds
- An off-topic message ("book me a haircut") gets the redirect, not the next script line
- The live feed updates every 2s with new vote counts

Ask me before making any decision the README doesn't cover.
