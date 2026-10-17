# AI Second Brain — Roadmap

Each milestone ends with a review session (mock interview) on the material it covered.

**Current milestone:** M1 — Production hardening

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

## M1 — Production hardening

- [x] Single config module: validate environment variables with Zod at startup (fail fast)
- [x] Remove the hardcoded JWT secret fallback
- [x] Set a new `JWT_SECRET` on Render
- [ ] Centralized error handler: generic message to the client, details only in server logs (no `error.stack` in responses)
- [ ] Same login error for unknown email and wrong password (prevents user enumeration)
- [ ] Validate request bodies with Zod
- [ ] 🎤 Review: configuration and secrets, JWT, error handling, input validation

## M2 — Project walkthrough

- [ ] Trace a request end to end: browser → route → controller → service → Gemini / Postgres → response
- [ ] Explain the layered architecture and why each layer exists
- [ ] Write down the tech debt list
- [ ] 🎤 Review: architecture, data flow, RAG, embeddings, pgvector

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
