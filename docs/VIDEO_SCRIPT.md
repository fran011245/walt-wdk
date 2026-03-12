# Demo Video Script (2–3 min) — WaltWDK

Use this script to record the hackathon demo for judges.

---

## Intro (0:00–0:20)

- **Say:** “This is WaltWDK: three OpenClaw skills that plug the official Tether WDK into your AI agent.”
- **Show:** Repo README and project structure (root, `src/core`, `skills/`).
- **Say:** “Everything is Apache-2.0 and uses the real Tether WDK — no mocks.”

---

## 1. wdk-wallet (0:20–0:50)

- **Show:** Terminal or OpenClaw: “Create a wallet called business on Base.”
- **Say:** “wdk-wallet generates a seed with the WDK, stores it encrypted under dot walt-wdk, and returns the address and optional QR.”
- **Show:** “List my wallets” and “What’s my business wallet balance?” — show list and balance (native + USDT/USDC if available).
- **Say:** “Export requires explicit confirmation so the agent never leaks the seed by accident.”

---

## 2. wdk-pay (0:50–1:25)

- **Show:** “Send 10 USDC to [address] from business” (or a test address).
- **Say:** “wdk-pay uses the same wallet store, checks balance, and sends via the WDK; we get the tx hash and explorer link.”
- **Show:** “Create a payment request for 50 USDT to my business wallet” — show the link and QR.
- **Say:** “History comes from a local ledger today; you can later plug in an indexer or explorer API.”

---

## 3. wdk-agent-guard (1:25–2:00)

- **Show:** Config with `dailyLimit`, `perTransactionLimit`, `requireApproval`, and maybe `whitelist`/`blacklist`.
- **Say:** “wdk-agent-guard is the differentiator: before the agent sends, it can check limits and approval rules.”
- **Show:** “Check if I can send 200 USDC to [address] from business” — show result (e.g. allowed, or requiresApproval, or over daily limit).
- **Say:** “Decisions are logged for audit; you can notify over Telegram or Discord and wait for human approval with a timeout.”

---

## Wrap (2:00–2:30)

- **Say:** “So: real Tether WDK, three skills — wallet, pay, guard — and guard gives you limits and approval flow for autonomous agents.”
- **Show:** `npm test` or a short clip of tests passing.
- **Say:** “Repo is public, INSTALL and ARCHITECTURE are in the docs, and we’re submitting to Galactica WDK Edition. Thanks.”

---

## Tips

- Keep the flow: wallet → pay → guard.
- If something fails live, cut to a short clip of it working or to the test run.
- Mention “Apache-2.0”, “real WDK”, and “wdk-agent-guard” as the differentiator at least once.
