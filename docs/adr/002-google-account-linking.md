# ADR 002: Linking Google login to an existing password account

## Context

Users may register with email/password, then later click “Continue with Google” using the same email. Google asserts that email via a verified ID token. Creating a second `User` row would split notes across two accounts.

## Decision

If Google returns `email_verified` and a `User` already exists with that email, set `googleId` on that row and continue (auto-link). New Google users get `password = null` and a welcome note like register.

## Alternatives

- Refuse Google login when email exists without `googleId` — safer against a pre-registered spoofed email, worse UX for a portfolio demo.
- Require password confirmation before link — correct for high-security products; too heavy for this freeze.

## Consequences

- Email/password register still does not verify email, so auto-link is a conscious demo trade-off (documented here).
- Password login still works after link; Google-only users cannot use password login (`password` is null).
