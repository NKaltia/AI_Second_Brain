# ADR 003: Short JWT access + hashed refresh vs server sessions

## Context

After M2 we stored a long-lived JWT in `localStorage`. That is easy to steal via XSS, hard to revoke, and couples “logged in” to a token the frontend can read.

## Decision

- **Access:** JWT ~15 minutes in an httpOnly cookie; verified with `JWT_SECRET` (stateless on `/notes` and `/ask`).
- **Refresh:** random opaque string in a second httpOnly cookie; **SHA-256 hash** in `RefreshToken` rows; rotation on every refresh; reuse of a revoked token revokes the user’s active refresh rows.
- Logout revokes the refresh row and clears cookies.

## Alternatives

- **Only server sessions** (session id in cookie, all state in Redis/DB): simpler revoke-everywhere, but every authenticated request hits the store.
- **JWT-only without refresh:** either short UX pain (re-login often) or long-lived JWT with weak revoke story.
- **Refresh as JWT:** possible, but we already need DB state for revoke/reuse — opaque + hash is enough.

## Consequences

- XSS cannot read tokens from JS; CSRF risk mitigated with `SameSite=Lax` on our first-party app.
- Stolen refresh after rotation is detectable (reuse → revoke family).
- Access remains valid until expiry even after refresh revoke (accepted JWT trade-off; keep TTL short).
