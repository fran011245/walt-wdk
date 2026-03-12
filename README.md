# WaltWDK — OpenClaw Skills Pack for Tether WDK

OpenClaw skills that integrate the official [Tether Wallet Development Kit (WDK)](https://docs.wallet.tether.io) for the **Galactica WDK Edition** hackathon ($30k prize pool).

**Project site:** [walt-wdk.com](https://walt-wdk.com) · **License:** Apache-2.0

## Skills

| Skill | Description |
|-------|-------------|
| **wdk-wallet** | Create and manage WDK wallets: create, balance, list, export (with confirmation) |
| **wdk-pay** | Send and receive USDT/USDC: send, payment request + QR, history |
| **wdk-agent-guard** | Guardrails for autonomous agents: daily/per-tx limits, whitelist/blacklist, approval flow (Telegram/Discord/Email) |

## Quick start

```bash
git clone https://github.com/fran011245/walt-wdk.git && cd walt-wdk
npm install
npm run build
npm test
```

For install via OpenClaw/ClawHub and the full story, see [walt-wdk.com](https://walt-wdk.com).

## Usage examples

**Create a wallet (wdk-wallet)**  
Create a wallet named `business` on Base; seed is encrypted and stored under `~/.walt-wdk/`.

**Check balance (wdk-wallet)**  
Query native + USDT/USDC balance for a wallet by name.

**Send USDC (wdk-pay)**  
Send 50 USDC to an address from a stored wallet; optionally run **wdk-agent-guard** check first.

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

For installation, architecture, and hackathon details, see [walt-wdk.com](https://walt-wdk.com).

## Requirements

- Node.js >= 18
- OpenClaw >= 2.0 (for using skills in an agent)

## Hackathon

Built for **Galactica WDK Edition (Tether)**. See [walt-wdk.com](https://walt-wdk.com) for submission and demo.
