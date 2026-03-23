# WaltWDK — OpenClaw Skills Pack for Tether WDK

<!-- Built by Francisco + Walt — Human-AI collaboration in action 🤝🤖 -->

OpenClaw skills that integrate the official [Tether Wallet Development Kit (WDK)](https://docs.wallet.tether.io) for the **Galactica WDK Edition** hackathon ($30k prize pool).

**Project site:** [walt-wdk.com](https://walt-wdk.com) · **License:** Apache-2.0

## Skills

| Skill | Description |
|-------|-------------|
| **wdk-wallet** | Create and manage WDK wallets: create, balance, list, export (with confirmation) |
| **wdk-pay** | Send and receive USDT/USDC: send, payment request + QR, history, prices |
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

## RPC providers (rate limits)

WaltWDK talks to each chain through HTTP RPC endpoints. **Public endpoints are shared** and may return HTTP 429 if too many requests hit the same IP.

- **Tron (TronGrid):** Sending TRC20 (e.g. USDT) triggers several API calls per transfer. Using TronGrid **without** an API key is much more likely to hit 429. Create a free [TronGrid](https://www.trongrid.io/) API key and pass it as below.
- **Ethereum / Base / Polygon:** Defaults are public RPC URLs. For heavier use, point `rpc` (or env) at your own provider (Alchemy, Infura, etc.); URLs often include the API key in the path.

**Precedence:** environment variables override `~/.walt-wdk/config.json`, which overrides built-in defaults.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `WALT_WDK_RPC_ETHEREUM` | Ethereum JSON-RPC URL |
| `WALT_WDK_RPC_BASE` | Base JSON-RPC URL |
| `WALT_WDK_RPC_POLYGON` | Polygon JSON-RPC URL |
| `WALT_WDK_TRON_FULL_HOST` | Tron full node host (default: `https://api.trongrid.io`) |
| `WALT_WDK_TRON_PRO_API_KEY` | TronGrid API key (sent as `TRON-PRO-API-KEY`) |

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

If you (or an agent) install or update this repo from git, run `npm install` and `npm run build` so `@walt-wdk/core` matches the workspace.

**Tron sends (TRC20):** set `WALT_WDK_TRON_PRO_API_KEY` in the **host environment** (recommended for CI/agents) or add `rpc.tron.apiKey` to `~/.walt-wdk/config.json`. Restart the agent or Node process after changing env vars so the new value is picked up.

**Secrets:** do not commit API keys, paste them into public issues/PRs, or rely on long-lived chat logs if you can use a secret store or local env instead. See the [RPC providers](#rpc-providers-rate-limits) table above for all override variables.

## Security and disclaimer

This software is a hackathon prototype and **has not undergone an independent third-party security audit**. Use at your own risk. For production use, a professional security audit is recommended. To report vulnerabilities, see [SECURITY.md](SECURITY.md).

## Hackathon

Built for **Galactica WDK Edition (Tether)**. See [walt-wdk.com](https://walt-wdk.com) for submission and demo.
