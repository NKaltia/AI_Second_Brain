# ADR 001: Gemini chat model and freeze embeddings

## Context

`gemini-3.1-flash-lite-preview` was a preview ID. Google’s deprecations page lists its shutdown as 25 May 2026; after that, `/ask` can fail in production. Embedding model `gemini-embedding-001` remains available until at least May 2028. Switching to `gemini-embedding-2` produces vectors in a different space — existing `vector(768)` rows would not be comparable without a full re-embed.

## Decision

- Use stable chat model `gemini-3.5-flash-lite` (cost/latency fit for intent + answers; Google recommends 3.5 Flash-Lite / 3.8 Flash for new work as of late 2026).
- Keep `gemini-embedding-001` at 768 dimensions.
- Centralize IDs in `src/gemini-models.ts` (no hard-coded strings in the service).

## Alternatives

- `gemini-3.8-flash` — newer/heavier; unnecessary cost for this demo.
- `gemini-3.1-flash-lite` — stable but already has a announced successor path; prefer current lite GA.
- Move to `gemini-embedding-2` now — high migration cost, low urgency before freeze.

## Consequences

- Chat quality/behavior may shift slightly after the swap; smoke-test `/ask`.
- Re-embedding deferred to “After the freeze” if we ever change embedding models.
