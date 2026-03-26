---
name: wdk-agent-guard
description: Limits and approval flow for autonomous WDK operations
version: 1.0.0
author: walt-wdk
license: Apache-2.0
openclaw:
  requires: []
---

# wdk-agent-guard

Sistema de permisos y límites para operaciones autónomas (envíos, cron, swap). Diferenciador para agentes que usan WDK: límites diarios, por transacción, whitelist/blacklist y flujo de aprobación vía Telegram/Discord/Email.

## Installation

```bash
clawhub install wdk-agent-guard
```

## Configuration

En `~/.walt-wdk/config.json` (o vía OpenClaw config):

```json
{
  "guard": {
    "dailyLimit": { "amount": "1000", "currency": "USDC" },
    "perTransactionLimit": { "amount": "500", "currency": "USDC" },
    "requireApproval": {
      "overAmount": "200",
      "notifyVia": "telegram",
      "timeout": "5m",
      "approvalChannel": "file"
    },
    "whitelist": [{ "address": "0x1234...", "name": "partner", "skipApproval": true }],
    "blacklist": ["0xbad..."]
  }
}
```

## Usage

### Check if an operation is allowed

```
User: Can I send 50 USDC to 0x1234... from wallet business?
Agent: checkLimit({ operation: 'send', amount: '50', currency: 'USDC', to: '0x1234...', fromWallet: 'business' })
       → allowed: true, remainingDaily: 950
```

### Request human approval

When `requiresApproval` is true, the agent can call `requestApproval` to notify the user and wait (timeout). Decisions are logged to the audit log.

### Query audit log

```
User: Show last 10 guard decisions
Agent: getAuditLog(10) → list of DecisionEntry
```

## Commands Reference

| Command           | Params                                                            | Description                                                             |
| ----------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `checkLimit`      | `operation`, `amount`, `currency`, `to?`, `fromWallet`            | Returns GuardDecision (allowed, requiresApproval, remainingDaily, etc.) |
| `requestApproval` | `operation`, `amount`, `currency`, `to?`, `fromWallet`, `reason?` | Notifies, waits for timeout, logs decision                              |
| `logDecision`     | `DecisionEntry`                                                   | Appends a decision to the audit log                                     |
| `getAuditLog`     | `limit?`                                                          | Returns recent decisions                                                |
| `getDailySpent`   | `currency`                                                        | Returns total spent today for currency                                  |
| `recordSpend`     | `amount`, `currency`                                              | Records a spend (call after a send)                                     |

## Integration with wdk-pay

Before sending, wdk-pay (or the agent) can call `checkLimit`. If `allowed` is false, abort. If `requiresApproval` is true, call `requestApproval` and only proceed if `approved`. After a successful send, call `recordSpend(amount, currency)` to update the daily ledger.

## Security

- **`approvalChannel`:** use `"file"` for real human approval (edit pending JSON under `pending-approvals/`). Omit or use `"console"` only for dev/CI (fast reject after log).
- Blacklist is checked first; whitelist can skip approval for trusted addresses.
- Daily and per-transaction limits use the same config and a local ledger (`~/.walt-wdk/guard-ledger.json`).
- All decisions are logged to `~/.walt-wdk/guard-audit.jsonl`.

## Requirements

- Node.js >= 18
- @walt-wdk/core (for config and paths)

## License

Apache-2.0
