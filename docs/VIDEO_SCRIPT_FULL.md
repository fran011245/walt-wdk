# WaltWDK Demo Video — Full Script & Guide (English)

Read this while recording. It includes what to say, what to show, and short clarifications in brackets so you stay on track.

---

## Before You Start

- Run `npm install && npm run build && npm test` in the repo root. All tests should pass.
- Create one demo wallet (e.g. name `demo`, network `base`) so you have something to list and show balance for. [You can do this via OpenClaw or by calling the skill; no need to show wallet creation twice.]
- Optional: have `~/.walt-wdk/config.json` open or a snippet ready with guard config (dailyLimit, requireApproval) for the guard section.
- Choose your recording area: terminal only, or IDE + terminal, or OpenClaw UI + terminal. [Avoid windows with real keys or personal data.]
- Start your screen recorder (e.g. QuickTime, OBS, Loom). Record the region where you’ll show the repo/terminal/OpenClaw.

---

## Part 1 — Intro (about 0:00–0:20)

**Show:** The repo README on GitHub or in your IDE.

**Say:**

> "This is WaltWDK: three OpenClaw skills that plug the official Tether Wallet Development Kit into your AI agent. Everything is Apache-2.0 and uses the real Tether WDK — no mocks."

**Show:** Project structure: `src/core` (core shared code) and the `skills` folder with `wdk-wallet`, `wdk-pay`, and `wdk-agent-guard`.

**Clarification:** [You’re setting the tone: real SDK, open source, three clear skills. No need to read the whole README aloud.]

---

## Part 2 — wdk-wallet (about 0:20–0:50)

**Show:** Terminal (or OpenClaw) in the repo.

**Do:** Run or trigger wallet creation. For example, in OpenClaw ask the agent: *"Create a wallet called demo on Base."* Or, if you have a CLI, run the equivalent command.

**Show:** The response: address, network, and the backup warning message.

**Say:**

> "wdk-wallet generates a seed phrase using the WDK, stores it encrypted under dot walt-wdk, and returns the address and optionally a QR code."

**Do:** Ask to list wallets and to show the balance for the demo wallet (e.g. *"List my wallets"* and *"What’s the balance of my demo wallet?"*).

**Show:** The list of wallets and the balance output (native plus USDT/USDC if available).

**Say:**

> "Exporting the seed or private key requires explicit user confirmation, so the agent never leaks it by accident."

**Clarification:** [You don’t have to perform an actual export in the video; just state the safety feature.]

---

## Part 3 — wdk-pay (about 0:50–1:25)

**Do:** Request a send. For example: *"Send 10 USDC to [test address] from demo."*  
[Use a test address you control or a known testnet address. If you prefer not to send real funds, say it’s a demo and cut before confirming, or use testnet.]

**Show:** The response: transaction hash and explorer link (if the tx was sent).

**Say:**

> "wdk-pay uses the same wallet store, checks balance, and sends through the WDK; we get back the transaction hash and an explorer link."

**Do:** Ask for a payment request, e.g. *"Create a payment request for 50 USDT to my demo wallet."*

**Show:** The payment link and QR code returned by the skill.

**Say:**

> "Transaction history is powered by a local ledger for now; you can later plug in an indexer or explorer API."

**Clarification:** [Focus on: same wallets as wdk-wallet, send flow, payment request + QR, and that history is local for the demo.]

---

## Part 4 — wdk-agent-guard (about 1:25–2:00)

**Show:** The guard configuration. Open `~/.walt-wdk/config.json` or a snippet in the docs that shows `dailyLimit`, `perTransactionLimit`, `requireApproval`, and optionally `whitelist` or `blacklist`.

**Say:**

> "wdk-agent-guard is the differentiator: before the agent sends, it can check limits and approval rules."

**Do:** Trigger a limit check. For example: *"Check if I can send 200 USDC to [some address] from demo."*

**Show:** The result: e.g. allowed, or requires approval, or over daily limit, plus any remaining daily amount if shown.

**Say:**

> "Decisions are logged for audit; you can notify over Telegram or Discord and wait for human approval with a timeout."

**Clarification:** [Judges care about safety and control; stress limits, approval flow, and audit log.]

---

## Part 5 — Wrap-up (about 2:00–2:30)

**Show:** The README again or the list of the three skills.

**Say:**

> "So: real Tether WDK, three skills — wallet, pay, and guard — and the guard gives you limits and an approval flow for autonomous agents."

**Do (optional):** Run `npm test` in the repo root and let the tests run for a few seconds on screen.

**Say:**

> "Repo is public; INSTALL and ARCHITECTURE are in the docs; and we’re submitting to the Galactica WDK Edition. Thanks."

**Clarification:** [Keep the ending short. If tests take too long, you can cut the recording or mention that tests are in the repo.]

---

## Quick checklist before recording

- [ ] `npm install && npm run build && npm test` — all pass.
- [ ] Demo wallet exists (e.g. `demo` on Base).
- [ ] Optional: guard config file or snippet ready.
- [ ] Screen recorder set (region, mic if you use voice).
- [ ] This script visible (second screen or printed) so you can read and follow.

---

## If you need to redo a section

- **Intro:** Just say the one-liner and show the folder structure again.
- **Wallet:** Create another wallet with a different name, or reuse `demo` and show list + balance.
- **Pay:** You can skip a real send and only show the payment request + QR.
- **Guard:** Showing the config and one check result is enough; no need to show the full approval flow live.

---

## One-page cheat sheet (what to say)

1. **Intro:** "WaltWDK: three OpenClaw skills, official Tether WDK, Apache-2.0, no mocks."
2. **Wallet:** "Seed from WDK, stored encrypted; list and balance; export needs confirmation."
3. **Pay:** "Same wallet store; send and explorer link; payment request and QR; history from local ledger."
4. **Guard:** "Limits and approval before send; decisions logged; notify via Telegram/Discord, timeout."
5. **End:** "Real WDK, three skills, guard for limits and approval; repo public, docs in INSTALL and ARCHITECTURE; submitting to Galactica WDK Edition. Thanks."

Use this doc as your full guide and script while you record; the clarifications in brackets are there so you know what to emphasize without ad-libbing too much.
