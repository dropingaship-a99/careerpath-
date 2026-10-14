# CareerPath AI + ML additions

This patch adds an **AI Career Lab** to the existing Next.js project without replacing the existing pages or career data.

## What's included

- **Local career matcher:** ranks the existing career catalogue against selected interest areas, skills, subjects, and optional goals. It does not require an API key and sends no profile data to a server.
- **AI Career Advisor:** a server-side Next.js route that calls the OpenAI Chat Completions API when configured. The API key is never placed in client-side code.
- **Error handling:** input validation, provider error handling, a clear UI message when the AI key is missing, and a local matcher that remains available without the AI API.

## Run locally

Use Node.js 20.9 or newer. From the project root:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Enable conversational AI

Copy `.env.example` to `.env.local`, replace the placeholder with an API key you own, then restart the dev server:

```bash
cp .env.example .env.local
```

Set `OPENAI_API_KEY` in `.env.local`. Do not commit `.env.local` or expose the key in `NEXT_PUBLIC_*` variables. The AI provider may incur usage charges.

For Vercel, add `OPENAI_API_KEY` and optionally `OPENAI_MODEL` under **Project → Settings → Environment Variables**, then redeploy.

## Build checks

```bash
npm run build
```

The local matcher is a content-based heuristic, not a scientifically validated career assessment or a model trained on a user's personal data. Treat match scores as exploratory guidance only.
