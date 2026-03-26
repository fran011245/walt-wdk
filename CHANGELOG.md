# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.3.0] - 2026-03-26

### Added

- GitHub Actions CI (Node 18/20): build, typecheck, lint, test, coverage.
- ESLint + Prettier + EditorConfig; Dependabot weekly npm updates.
- **EIP-55** checksum validation for mixed-case EVM addresses in `@walt-wdk/core`.
- **Guard config validation** (JSON Schema + Ajv) for `config.guard`.
- **Approval channels:** `guard.requireApproval.approvalChannel`: `file` (pending JSON under `~/.walt-wdk/pending-approvals/`) or `console` (log + fast reject; default when omitted).
- Injectable approval logging via `setApprovalLogger` on `wdk-agent-guard`.
- Tests: `security-utils` (EIP-55), guard schema validation, send+guard integration (mocked).
- [CONTRIBUTING.md](CONTRIBUTING.md) for contributors.

### Changed

- Pinned `@tetherto/wdk-wallet-evm` / `@tetherto/wdk-wallet-tron` in `@walt-wdk/core` (no more `latest`).
- Removed unused `notify` export from `wdk-agent-guard` (use `waitForApproval` / file channel).
- `wdk-pay` devDependency on `wdk-agent-guard` for tests.

## [1.2.0] - 2026-03-15

### Added

- **prices** command in wdk-pay — returns current USDT/USDC prices (CoinGecko, 1 min cache) for informed agent decisions.

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
