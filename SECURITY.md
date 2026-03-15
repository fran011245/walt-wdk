# Security

## Reporting a vulnerability

If you discover a security issue in Walt WDK, please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities.
2. Email the maintainers (see repository contacts) or open a private security advisory on GitHub: **Security** → **Advisories** → **Report a vulnerability**.
3. Include a clear description, steps to reproduce, and impact. We will acknowledge receipt and work with you on a fix and disclosure.

We take security seriously. An internal security review of the application code has been performed and identified findings have been addressed (guard enforcement, input validation, custody and concurrency hardening). We recommend keeping dependencies up to date and using the guard with `guard.enabled` in production.

## Guard and production

- The **wdk-agent-guard** integration is **enabled by default** (`config.guard.enabled !== false`). When enabled, the guard package must be installed or sends will fail (fail-closed).
- To run without guard (e.g. local dev), set `guard.enabled: false` in your config. Do not disable the guard in production without a clear reason.
- Seed export requires the exact confirmation phrase; never share seeds or private keys.

## Dependencies

- Run `npm audit` and address reported issues where possible.
- Wallet and payment flows depend on `@walt-wdk/core` and optional `@walt-wdk/wdk-agent-guard`; keep these and their transitive dependencies updated.
