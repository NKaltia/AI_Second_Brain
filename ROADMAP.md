# AI Second Brain — Roadmap

Each milestone ends with a review session (mock interview) on the material it covered.

**Current milestone:** M2 — ready for 🎤 (walkthrough done; review pending)

---

## Done so far

- Express + TypeScript server with a layered architecture (routes → controllers → services)
- PostgreSQL via Prisma, local Postgres in Docker Compose, Neon in production
- RAG pipeline: Gemini embeddings, pgvector cosine-similarity search scoped per user
- Intent routing and query expansion before vector search
- LLM function calling (`saveNote`) to create notes from chat
- JWT authentication with bcrypt password hashing
- Vanilla JS frontend; deployed on Render
- Removed `any` types from Express handlers

---

## M0 — Housekeeping ✅

- [x] Commit leftover typing changes
- [x] Stop tracking `.DS_Store`
- [x] Track this roadmap in git

## M1 — Production hardening ✅

- [x] Single config module: validate environment variables with Zod at startup (fail fast)
- [x] Remove the hardcoded JWT secret fallback
- [x] Set a new `JWT_SECRET` on Render
- [x] Centralized error handler: generic message to the client, details only in server logs (no `error.stack` in responses)
- [x] Same login error for unknown email and wrong password (prevents user enumeration)
- [x] Validate request bodies with Zod
- [x] 🎤 Review: configuration and secrets, JWT, error handling, input validation

## M1.5 — Observability and error-handling follow-ups

Gaps found during the M1 review. Small milestone; its review is folded into the M2 review.

**Observability — being able to find out what went wrong**
- [ ] Separate Gemini API key for development, in its own Google Cloud project (quotas are per project) — defer until we need live Gemini testing (e.g. before M3)
- [x] Structured logging with `pino` + `pino-http` instead of `console.*`
- [x] Request ID for every request: in every log line and in error responses
- [x] Prisma query logging only in development
- [x] `GET /health` that also checks the database; set it as the Health Check Path on Render

**Error handling — honest status codes**
- [x] Malformed JSON → 400 and too-large body → 413 (today both become 500)
- [x] Missing or someone else's note on update/delete → 404 (today: 500 on delete, empty 200 on update)
- [x] Check that the note exists before calling Gemini on update

## M2 — Project walkthrough

- [x] Trace a request end to end: browser → route → controller → service → Gemini / Postgres → response
- [x] Explain the layered architecture and why each layer exists
- [x] Write down the tech debt list (start from the M1 review findings in Notion)
- [ ] 🎤 Review: architecture, data flow, RAG, embeddings, pgvector

### Tech debt (tracked; not blocking M2 🎤)

- [ ] Log `AppError` 4xx as `warn` (not `error`); keep 5xx as `error`
- [ ] UI: replace `alert()` + fix post-register redirect / auto-login (see M4)
- [ ] Separate Gemini API key for local vs production (M1.5, deferred until live AI tests)
- [ ] Remaining `console.*` in AI/controllers vs pino (noise / consistency)
- [ ] Render: confirm Health Check Path is `/health` on the service

## M3 — Real HyDE and retrieval quality

- [ ] Build a small evaluation set (questions → expected notes) and measure the current hit rate
- [ ] Implement HyDE (embed a hypothetical answer instead of the query)
- [ ] Measure again and compare
- [ ] Decide whether to merge intent classification and HyDE generation into one LLM call (latency/cost vs. clarity), based on the numbers
- [ ] Record the decision as an ADR
- [ ] 🎤 Review: RAG, HyDE, retrieval evaluation, latency/cost/quality trade-offs

## M4 — Proper authentication

- [ ] Inline error messages in the UI instead of `alert()`
- [ ] Tokens in httpOnly cookies instead of localStorage
- [ ] Short-lived access token + refresh token
- [ ] Sign in with Google (OAuth 2.0)
- [ ] Rate limiting on login
- [ ] Validate the JWT payload with Zod instead of a type assertion (`as`)
- [ ] Constant-time login: compare against a dummy hash for unknown emails (timing attack)
- [ ] Decide how registration handles an existing email (today `409` reveals it) and record it as an ADR
- [ ] 🎤 Review: auth flow end to end, cookies vs. localStorage, OAuth

## M5 — Engineering practices and packaging

- [ ] Tests for the main endpoints
- [ ] CI with GitHub Actions (lint, type check, tests)
- [ ] Accurate README
- [ ] CV bullet points and a 2-minute project pitch
- [ ] 🎤 Final review of the whole project

## Next — Agent

- [ ] More tools beyond `saveNote`
- [ ] Agent loop: the model decides the next step on its own

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
