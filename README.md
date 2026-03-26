# WaltWDK — OpenClaw skills + Tether WDK

[![CI](https://github.com/fran011245/walt-wdk/actions/workflows/ci.yml/badge.svg)](https://github.com/fran011245/walt-wdk/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node](https://img.shields.io/badge/Node-%3E%3D%2018-brightgreen)](https://nodejs.org/)

<!-- Built by Francisco + Walt — Human-AI collaboration in action 🤝🤖 -->

**Wallet-oriented building blocks for AI agents — non-custodial, multi-chain, and shaped with production habits (tests, strict TypeScript, CI) — delivered as [OpenClaw](https://github.com/openclaw/openclaw) skills on top of the official [Tether Wallet Development Kit (WDK)](https://docs.wallet.tether.io).**

Born from the **Galactica WDK Edition** hackathon ($30k prize pool). **Site:** [walt-wdk.com](https://walt-wdk.com) · **License:** Apache-2.0

## The Story

What happens when you give an AI agent its own wallet?

WaltWDK started as a hackathon project built through intense human–AI collaboration. The goal was to show that agents can work with real value (USDT/USDC) with guardrails, optional approvals, and an audit trail — not blind key exposure.

It remains **open-source infrastructure** for experiments and integrations; it is **not** a substitute for a full security audit if you treat it as production custody for third parties.

## Built with

- **TypeScript** — `strict` mode, workspace-wide `typecheck`
- **Tether WDK** — official `@tetherto/wdk` stack (EVM + Tron wallets)
- **OpenClaw** — skills packaging for agents (OpenClaw ≥ 2.0)
- **Vitest** — 50+ tests across `@walt-wdk/core` and skills workspaces
- **GitHub Actions** — CI on every PR (`build`, `typecheck`, `lint`, tests, coverage)
- **ESLint + Prettier** — `npm run lint` (ESLint) and `npm run format:check` (Prettier)

## Skills

| Skill               | Description                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **wdk-wallet**      | Create and manage WDK wallets: create, balance, list, export (with confirmation)                                                             |
| **wdk-pay**         | Send and receive USDT/USDC: send, payment request + QR, history, prices                                                                      |
| **wdk-agent-guard** | Guardrails for autonomous agents: daily/per-tx limits, whitelist/blacklist, approval flow (file-based or console; see wdk-agent-guard SKILL) |

## Architecture

Three peer **OpenClaw skills** share **`@walt-wdk/core`** (WDK client, config, security). Use **wdk-agent-guard** before or around sensitive operations (e.g. sends); it is not a mandatory linear stage after pay.

```
┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
│ wdk-wallet   │   │  wdk-pay     │   │ wdk-agent-guard   │
│ wallets      │   │ send/receive │   │ limits, approve   │
│ list, export │   │ QR, history  │   │ audit trail       │
└──────┬───────┘   └──────┬───────┘   └─────────┬────────┘
       │                  │                      │
       └──────────────────┼──────────────────────┘
                          ▼
               ┌─────────────────────┐
               │   @walt-wdk/core    │
               │ WDK, config, crypto │
               └─────────────────────┘
```

## Quick start

```bash
git clone https://github.com/fran011245/walt-wdk.git && cd walt-wdk
npm ci
npm run build
npm test              # 50+ tests (all workspaces)
npm run lint          # ESLint
npm run typecheck     # strict TypeScript
npm run format:check  # Prettier
```

Install via OpenClaw / ClawHub and the fuller walkthrough: [walt-wdk.com](https://walt-wdk.com).

## Usage examples

**Create a wallet (wdk-wallet)**  
Create a wallet named `business` on Base; seed is encrypted and stored under `~/.walt-wdk/`.

**Check balance (wdk-wallet)**  
Query native + USDT/USDC balance for a wallet by name.

**Send USDC (wdk-pay)**  
Send USDC to an address from a stored wallet; optionally run **wdk-agent-guard** first.

**Payment request (wdk-pay)**  
Generate a payment link and QR so someone can pay you USDT/USDC.

**Guard check (wdk-agent-guard)**  
Before sending, check limits and approval rules; log decisions for audit.

See each skill’s `SKILL.md` for full command reference and config.

## Project structure

```
walt-wdk/
├── README.md
├── LICENSE                 # Apache-2.0
├── package.json            # workspaces
├── src/core/               # Shared: WDK client, config, security
│   ├── wdk-client.ts
│   ├── config-manager.ts
│   └── security-utils.ts
└── skills/
    ├── wdk-wallet/
    ├── wdk-pay/
    └── wdk-agent-guard/
```

## Docs

Installation, architecture, and hackathon narrative: [walt-wdk.com](https://walt-wdk.com).

## Requirements

- Node.js >= 18
- OpenClaw >= 2.0 (for using skills in an agent)

Contributing workflow and layout: [CONTRIBUTING.md](CONTRIBUTING.md).

## RPC providers (rate limits)

WaltWDK talks to each chain through HTTP RPC endpoints. **Public endpoints are shared** and may return HTTP 429 if too many requests hit the same IP.

- **Tron (TronGrid):** Sending TRC20 (e.g. USDT) triggers several API calls per transfer. Using TronGrid **without** an API key is much more likely to hit 429. Create a free [TronGrid](https://www.trongrid.io/) API key and pass it as below.
- **Ethereum / Base / Polygon:** Defaults are public RPC URLs. For heavier use, point `rpc` (or env) at your own provider (Alchemy, Infura, etc.); URLs often include the API key in the path.

**Precedence:** environment variables override `~/.walt-wdk/config.json`, which overrides built-in defaults.

### Environment variables

| Variable                    | Purpose                                                  |
| --------------------------- | -------------------------------------------------------- |
| `WALT_WDK_RPC_ETHEREUM`     | Ethereum JSON-RPC URL                                    |
| `WALT_WDK_RPC_BASE`         | Base JSON-RPC URL                                        |
| `WALT_WDK_RPC_POLYGON`      | Polygon JSON-RPC URL                                     |
| `WALT_WDK_TRON_FULL_HOST`   | Tron full node host (default: `https://api.trongrid.io`) |
| `WALT_WDK_TRON_PRO_API_KEY` | TronGrid API key (sent as `TRON-PRO-API-KEY`)            |

### `config.json` example

Stored under `~/.walt-wdk/config.json` (or `WALT_WDK_CONFIG_DIR`). Do **not** commit real API keys to git.

```json
{
  "defaultNetwork": "base",
  "rpc": {
    "ethereum": "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY",
    "base": "https://base-mainnet.g.alchemy.com/v2/YOUR_KEY",
    "polygon": "https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY",
    "tron": {
      "fullHost": "https://api.trongrid.io",
      "apiKey": "YOUR_TRONGRID_KEY"
    }
  }
}
```

### Agents and automation

If you (or an agent) install or update this repo from git, run `npm ci` (or `npm install`) and `npm run build` so `@walt-wdk/core` matches the workspace.

**Tron sends (TRC20):** set `WALT_WDK_TRON_PRO_API_KEY` in the **host environment** (recommended for CI/agents) or add `rpc.tron.apiKey` to `~/.walt-wdk/config.json`. Restart the agent or Node process after changing env vars so the new value is picked up.

**Secrets:** do not commit API keys, paste them into public issues/PRs, or rely on long-lived chat logs if you can use a secret store or local env instead. See the [RPC providers](#rpc-providers-rate-limits) table above for all override variables.

## Security highlights

- **EIP-55** checks for mixed-case EVM addresses (checksum)
- **AES-256-GCM** for encrypted seed material (see `src/core/security-utils.ts`)
- **Configurable guardrails** — daily and per-tx limits, allow/deny lists
- **Approval flows** — file-based (recommended) or console-oriented paths for sensitive operations (`wdk-agent-guard`)
- **Sensitive buffers zeroed** where the core client manages seed material (`wdk-client`)
- **Audit logging** — guard decisions can be recorded for review

**Disclaimer:** This is a **hackathon-origin** codebase and **has not** undergone an independent third-party security audit. Use at your own risk. For production use affecting others’ funds, engage a professional audit. Report issues responsibly: [SECURITY.md](SECURITY.md).

## Hackathon

Built for **Galactica WDK Edition (Tether)**. Submission and demo: [walt-wdk.com](https://walt-wdk.com).

---

Built with human–AI collaboration (Francisco + Walt).
