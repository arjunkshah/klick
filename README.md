# Klick

Open-source **team productivity UI** demo: docs, threads, issues, tasks, runs, and **Dex** (a Groq-backed chat assistant). The frontend is a Vite + React + TypeScript app with Tailwind; **Firebase Authentication** handles sign-in; the **Dex API** runs as a small Node server so your **Groq API key never ships to the browser**.

## Features

- **Workspace shell** — Collapsible sidebar, command palette, light/dark theme with a polished toggle.
- **Docs & threads** — Folder trees, channels, and message-style layouts (demo data via Zustand).
- **Issues, tasks, people, runs** — Kanban-style issues, task lists, and run history (demo).
- **Dex** — Streaming chat against Groq; API key stays on the server in development.
- **Auth** — Email/password and Google sign-in via Firebase (configure in Firebase Console).

## Stack

| Layer | Technology |
|--------|------------|
| UI | React 19, React Router 7, Tailwind CSS |
| State | Zustand |
| Build | Vite 8, TypeScript |
| Auth | Firebase Auth (Web SDK) |
| Dex API | Node (`server/index.js`), Groq-compatible chat API |

## Prerequisites

- **Node.js** 20+ (recommended)
- **npm** (ships with Node)
- **Firebase** project with Authentication enabled (Google + Email/Password if you want both flows)
- **Groq API key** (optional, for Dex) — [Groq Console](https://console.groq.com/)

## Quick start

```bash
git clone https://github.com/arjunkshah/klick.git
cd klick
npm install
cp .env.example .env.local
# Edit .env.local: Firebase vars + GROQ_API_KEY for Dex
npm run dev
```

- **App:** http://localhost:5173  
- **Dex API:** http://localhost:8787 (started alongside Vite by `npm run dev`)

Sign-in routes: `/login`, `/signup`. Protected app routes require a signed-in user.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + Dex API (concurrent) |
| `npm run dev:vite` | Frontend only |
| `npm run dev:api` | Dex API only |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm start` | Run Dex API only (e.g. production process) |

## Environment variables

Copy **`.env.example`** to **`.env.local`** (never commit `.env.local`).

| Variable | Where | Purpose |
|----------|--------|---------|
| `VITE_FIREBASE_*` | Client (Vite) | Firebase Web SDK config |
| `GROQ_API_KEY` | Server only | Groq API for Dex (`server/index.js`) |

Firebase: enable **Authentication** → **Sign-in method** for the providers you use, and paste the Web app config from the Firebase console into the `VITE_FIREBASE_*` variables.

Dex in dev: Vite proxies `/api` to the local API (see `vite.config.ts`).

## Deploying

- **Frontend:** Any static host (e.g. Vercel, Netlify). Set all `VITE_FIREBASE_*` in the host’s environment.  
- **Dex in production:** Vercel serves `api/dex/chat.js` (Gemini). Set `geminikey` (and optional `GEMINI_MODEL`) in the project env.  
- **Slack & GitHub OAuth:** Requires Vercel (or `vercel dev`) so `/api/integrations/*` runs. Set `FIREBASE_SERVICE_ACCOUNT_JSON` (full service account JSON string), `INTEGRATION_OAUTH_SECRET` (long random string), `SLACK_CLIENT_ID` / `SLACK_CLIENT_SECRET`, `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`, and optional `APP_ORIGIN` (e.g. `https://your-domain.com`). Register redirect URLs:  
  - `https://<host>/api/integrations/slack/callback`  
  - `https://<host>/api/integrations/github/callback`  
  Deploy updated `firestore.rules` so `users/{uid}/klick/*` documents remain owner-scoped.  
- **Google Calendar:** No extra server env — users connect via **Integrations** (Firebase `linkWithPopup` + Calendar readonly scope); tokens live in `users/{uid}/klick/privateIntegrations`.

## Repository layout

```
src/           React app, routes, components, Zustand store
server/        Dex API (Node)
public/        Static assets
docs/          Internal product notes (optional reading)
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Issues and pull requests are welcome.

## License

[MIT](./LICENSE)
