# PR description — Security release (copy into GitHub PR)

## Summary

This PR applies security fixes from an internal code audit (P0 and P1). It does not change public APIs; config gains an optional `guard.enabled` and seed export now requires a string confirmation phrase.

## Changes

### P0 – Critical

- **Approval enforcement:** When the guard returns `requiresApproval`, the send flow now calls the approval flow and blocks until approved or timeout. Previously sends could proceed without approval.
- **Guard fail-closed:** If the guard is enabled (default) and `@walt-wdk/wdk-agent-guard` is not installed, send fails with a clear error instead of skipping checks.
- **Wallet name validation:** Wallet names in the pay resolver are validated (alphanumeric, dash, underscore, 1–64 chars) to prevent path traversal.

### P1 – High

- **Export hardening:** Seed export requires the exact phrase `confirmed: "I understand the risks"` instead of a boolean.
- **Record spend locking:** Guard daily ledger updates use file locking to avoid race conditions.
- **Decimal amounts:** Guard and pay use Decimal.js for limits and amount validation to avoid precision/rounding issues.

### Docs and config

- `SECURITY.md` added (reporting process, guard usage).
- `CHANGELOG.md` added with 1.1.0 and security section.
- Config `guard.enabled` documented; default remains effective true.

## Testing

- `npm test` passes (wdk-wallet, wdk-pay, wdk-agent-guard).
- `npm run build` passes for all workspaces.

## Release

- Version bump to **1.1.0** recommended after merge.
- Changelog already includes 1.1.0 entry.
