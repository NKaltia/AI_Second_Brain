# AI Second Brain — Roadmap

Each milestone ends with a review session (mock interview) on the material it covered.

**Current milestone:** MVP 2.0 — polish and freeze (~2 weeks, then stop feature work)

Context (28.10.2026): semester + diploma project. Goal — a demo/CV-ready app, each step shippable on its own. Teaching stays per `AGENTS.md`, but only topics marked 🔴 get the deep loop.

---

## Done so far

- Express + TypeScript server with a layered architecture (routes → controllers → services)
- PostgreSQL via Prisma, local Postgres in Docker Compose, Neon in production
- RAG pipeline: Gemini embeddings, pgvector cosine-similarity search scoped per user
- Intent routing and query expansion before vector search (README still says “HyDE” — that is query expansion, not real HyDE)
- LLM function calling (`saveNote`) to create notes from chat
- JWT authentication with bcrypt password hashing
- Vanilla JS frontend; deployed on Render
- M1 production hardening (config fail-fast, AppError, Zod bodies, anti-enumeration on login)
- M1.5 observability (pino + request IDs, `/health`, honest 400/413/404)
- M2 walkthrough + 🎤 (~5.0/10) — see Notion «Где мы сейчас»

---

## M0 — Housekeeping ✅

- [x] Commit leftover typing changes
- [x] Stop tracking `.DS_Store`
- [x] Track this roadmap in git

## M1 — Production hardening ✅

- [x] Single config module: validate environment variables with Zod at startup (fail fast)
- [x] Remove the hardcoded JWT secret fallback
- [x] Set a new `JWT_SECRET` on Render
- [x] Centralized error handler: generic message to the client, details only in server logs
- [x] Same login error for unknown email and wrong password (prevents user enumeration)
- [x] Validate request bodies with Zod
- [x] 🎤 Review: configuration and secrets, JWT, error handling, input validation

## M1.5 — Observability and error-handling follow-ups ✅

- [ ] Separate Gemini API key for development (moved into MVP 2.0 §1 — do with Google Cloud / OAuth setup)
- [x] Structured logging with `pino` + `pino-http`
- [x] Request ID on every request (logs + error responses)
- [x] Prisma query logging only in development
- [x] `GET /health` with DB ping
- [x] Malformed JSON → 400; too-large body → 413
- [x] Missing / someone else's note on update/delete → 404
- [x] Check note exists before calling Gemini on update

## M2 — Project walkthrough ✅

- [x] Trace a request end to end
- [x] Explain layered architecture
- [x] Tech debt list
- [x] 🎤 Review (24.10.2026, ~5.0/10): architecture, data flow, RAG, embeddings, pgvector

---

## MVP 2.0 — Polish and freeze

Every checkbox should be deployable alone. Order = risk × CV value.

### Part 1 — Demo works and is safe

- [ ] **1. Models (do first).** Replace preview chat model with stable GA; centralize IDs; ADR for keeping embeddings. Verify `/ask` after deploy. Create a separate **dev** Gemini key in its own Google Cloud project (still open).
  - [x] Code: `gemini-3.5-flash-lite` + `src/gemini-models.ts` + ADR 001 (embeddings unchanged)
  - [ ] Smoke `/ask` locally and on Render after push
  - [ ] Separate dev Gemini API key (Google Cloud project)
- [ ] **2. 🔴 XSS.** Prove locally (`marked.parse` / note cards → `innerHTML`), then DOMPurify / `textContent`, re-test. Prompt injection → XSS story for interviews.
- [ ] **3. UI without `alert()`.** Inline form errors + toasts; loading states; register → logged in; on 5xx show `requestId`.
- [ ] **4. 🔴 Architecture debt from 🎤 M2.** `AskService` orchestration; Zod for tool-call args (no `as any`); intent errors → pino `warn` + requestId (not silent swallow); remaining `console.*` → pino; AppError 4xx → `warn`, 5xx → `error`.
- [ ] **5. 🔴 Rate limiting.** `/auth/*` and `/ask` → 429. Explain why in-memory limits fail with multiple instances.

### Part 2 — Real auth (highest value)

Theory already covered in desktop Claude («JWT изнутри») — ask, don’t re-lecture from zero.

- [ ] **6. 🔴 Cookies + access/refresh.** Access ~15m; refresh hashed in DB; httpOnly cookies; `/auth/refresh` with rotation + reuse detection; `/auth/logout`; frontend silent refresh on 401; drop `localStorage` token. Also: `algorithms: ['HS256']`; Zod JWT payload; constant-time login; register-409 → ADR. “Attack yourself”: old refresh after rotation revokes chain.
- [ ] **7. 🔴 Google OAuth 2.0 (required, after §6).** Our access/refresh after Google login; Auth Code + `state` (+ PKCE 🟡); verify ID token; Cloud Console redirect URIs; secrets via `config` / `.env.example`. ADR: linking Google email to existing password account. Schema: nullable `password`, `googleId` via expand → migrate → contract (check `DATABASE_URL` first).
- [ ] **8. Guest “Try demo”** — only if time left. Per-visitor temp account with seed notes (not one shared account).

### Part 3 — Packaging and freeze

- [ ] **9. Tests + CI.** Vitest + supertest (auth refresh/reuse, notes 404, 400/413; Gemini mocked). GitHub Actions: `tsc` + tests.
- [ ] **10. README + ADRs.** Honest README (query expansion ≠ HyDE; architecture; Security; cold start). ADRs: refresh vs sessions; OAuth account linking; model choice / keep embeddings.
- [ ] **11. Freeze checklist.** Full `.env.example`; Render Health Check Path `/health`; no soon-deprecated models; free-tier limits checked; manual demo path register → ask.
- [ ] **12. 🎤 Final review** (desktop Claude) + CV bullets + pitch. Agent writes interviewer summary in Notion «Где мы сейчас» first.

---

## After the freeze (explicitly not now)

- Real HyDE + evaluation set / hit-rate measurement
- HNSW (or other ANN) index on `embedding` (+ `userId` index check)
- More agent tools (update/delete) + prompt-injection defenses + human-in-the-loop for delete
- Server-side chat history
- Switch embedding model (full re-embed)
- Broader OWASP Top 10 security review

---

## Terminal cheat sheet

| Command | What it does |
|---|---|
| `npm run dev` | Run the dev server (restarts on file changes) |
| `npx tsc --noEmit` | Type-check the whole project without building |
| `npx prisma generate` | Regenerate the Prisma client after editing `schema.prisma` or switching machines |
| `npx prisma migrate dev --name <name>` | Apply schema changes to the database as a new migration |
| `docker-compose up -d` | Start the local database container in the background |
| `docker ps` | List running containers |
| `git pull --rebase` | Get remote commits and replay local unpushed commits on top |

Two-machine rule: **start of session → `git pull`, end of session → `git push`.**
