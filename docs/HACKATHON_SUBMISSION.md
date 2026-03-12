# Galactica WDK Edition — Hackathon Submission

**Project:** WaltWDK — OpenClaw Skills Pack for Tether WDK  
**License:** Apache-2.0  
**Prize pool:** $30k

## Summary

WaltWDK provides three OpenClaw skills that integrate the official Tether WDK:

1. **wdk-wallet** — Create and manage multi-chain wallets (Ethereum, Base, Polygon, TRON); keys stored encrypted.
2. **wdk-pay** — Send/receive USDT/USDC; payment requests with QR; transaction history (local ledger).
3. **wdk-agent-guard** — Guardrails for autonomous agents: daily and per-transaction limits, whitelist/blacklist, and approval flow (notify via Telegram/Discord/Email, timeout, audit log).

Differentiator: **wdk-agent-guard** gives judges and users a clear way to cap and approve high-value or risky operations before execution.

## Checklist

- [x] Apache-2.0 license (root + each skill + core)
- [x] Uses real Tether WDK (`@tetherto/wdk`, `@tetherto/wdk-wallet-evm`, `@tetherto/wdk-wallet-tron`)
- [ ] Skills published on ClawHub
- [ ] Demo video 2–3 min (script: [VIDEO_SCRIPT.md](VIDEO_SCRIPT.md))
- [x] Repo public with clear [INSTALL.md](INSTALL.md)
- [ ] Submitted on DoraHacks before deadline (22–23 March 2026)

## Demo

- **Video:** (add link after upload)
- **Landing / repo:** (add GitHub URL)

## How to run the demo

1. Clone the repo and run `npm install && npm run build && npm test`.
2. Install skills in OpenClaw from local paths:  
   `clawhub install ./skills/wdk-wallet` (and same for wdk-pay, wdk-agent-guard).
3. In the agent: create a wallet → check balance → (optional) set guard config → check limit → send or request payment.

See [VIDEO_SCRIPT.md](VIDEO_SCRIPT.md) for a 2–3 minute walkthrough script.

## Team

(Add team name and members.)

## Links

- [Tether WDK docs](https://docs.wallet.tether.io)
- [OpenClaw / ClawHub](https://openclawlab.com/docs/tools/clawhub/)
