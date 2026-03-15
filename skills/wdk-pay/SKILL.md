---
name: wdk-pay
description: Send and receive USDT/USDC via Tether WDK
version: 1.0.0
author: walt-wdk
license: Apache-2.0
openclaw:
  requires: ["@tetherto/wdk"]
---

# wdk-pay

Send and receive USDT/USDC using wallets created with wdk-wallet.

## Installation

```bash
clawhub install wdk-pay
```

## Configuration

Set a default wallet in `~/.walt-wdk/config.json` (or use `fromWallet` per command):

```json
{
  "defaultWallet": "business",
  "defaultNetwork": "base"
}
```

## Usage

### Send USDT/USDC

```
User: Send 50 USDC to 0x1234... from my business wallet
Agent: ✅ Sent 50 USDC to 0x1234...
       Tx: 0xabc... | Explorer: https://basescan.org/tx/0xabc...
```

### Payment request (link + QR)

```
User: Create a payment request for 100 USDT to my business wallet
Agent: Payment request:
       Amount: 100 USDT | Address: 0x742d...
       Link: https://walt-wdk.app/pay?...
       [QR code]
```

### History

```
User: Show my last 10 payments
Agent: Last 10 transactions:
       1. send 50 USDC to 0x1234... — 0xabc... (pending)
       2. send 25 USDT to 0x5678... — 0xdef... (confirmed)
```

### Prices

```
User: What are the current USDT and USDC prices?
Agent: USDT: $1.0000 | USDC: $0.9998
       Timestamp: 2026-03-15T12:00:00.000Z
```

## Commands Reference

| Command | Params | Description |
|---------|--------|-------------|
| `send` | `to`, `amount`, `token` (USDT \| USDC), `fromWallet?`, `memo?` | Send tokens to address |
| `request` | `from` (wallet name), `amount`, `token` | Generate payment link + QR |
| `history` | `wallet?`, `limit?` | List recent transactions (from local ledger) |
| `prices` | — | Get current USDT/USDC prices in USD (for informed agent decisions) |

## Integration with wdk-wallet

- Uses the same wallet store (`~/.walt-wdk/`). Create wallets with **wdk-wallet** first.
- `fromWallet` defaults to `config.defaultWallet`.

## Requirements

- Node.js >= 18
- OpenClaw >= 2.0
- @tetherto/wdk
- wdk-wallet (wallets must exist)

## License

Apache-2.0
