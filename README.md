# Conversational AI – Next.js + React

Conversational AI with web search, image search, weather, and THESYS LLM integration for routing and assistant replies.

## Local Development

```bash
cp .env.example .env
# Paste your THESYS key
# THESYS_API_KEY=sk-th-...

pnpm install
pnpm run dev
# http://localhost:3000
```

## Deploy to Vercel

1) Push this repository to GitHub/GitLab/Bitbucket.

2) In Vercel:
   - Import the repository.
   - Framework Preset: Next.js (auto).
   - Build Command: `pnpm build` (auto).
   - Install Command: `pnpm install` (auto).
   - Root Directory: `/` (repo root).

3) Environment Variables (Project Settings → Environment Variables):
   - `THESYS_API_KEY` = your key
   - Optional:
     - `THESYS_API_BASE` = https://api.thesys.ai/v1
     - `THESYS_MODEL` = thesys-small
     - `NEXT_PUBLIC_APP_NAME` = Conversational AI

4) Click Deploy.

Notes:
- API routes run on the Edge runtime by default for `app/api/chat/route.ts`.
- No special routing config is required; Vercel auto-detects Next.js.
- If you use the Image component with remote sources, allowed domains are configured in `next.config.ts`.

## Tools Available

- Web search via DuckDuckGo Instant Answer API (no key)
- Image search via Unsplash Source endpoint (no key)
- Weather via Open-Meteo (no key)
- THESYS LLM for routing and assistant replies (requires `THESYS_API_KEY`)

## Example Queries

- `search latest Next.js features`
- `image aurora borealis`
- `weather in Tokyo` or `wx Paris`
- `Explain React Server Components in simple terms`