# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1.0] - 2026-03-14

### Security

- **P0 – Send flow:** Enforce approval when the guard returns `requiresApproval`; send no longer proceeds without calling the approval flow.
- **P0 – Guard fail-closed:** When the guard is enabled (default), require `@walt-wdk/wdk-agent-guard` to be installed; otherwise send fails with a clear error instead of skipping checks.
- **P0 – Path traversal:** Validate wallet names in the pay resolver (alphanumeric, dash, underscore, 1–64 chars) before building file paths.
- **P1 – Export:** Seed export now requires the exact confirmation phrase (`confirmed: "I understand the risks"`) instead of a boolean.
- **P1 – Concurrency:** Guard daily ledger updates use file locking to avoid race conditions when recording spends.
- **P1 – Amounts:** Guard and pay validation use decimal arithmetic (Decimal.js) for limits and amounts to avoid precision issues.

### Added

- Config option `guard.enabled` (default: effective true). Set to `false` to disable guard checks (e.g. local dev).
- `SECURITY.md` with vulnerability reporting and guard usage notes.
