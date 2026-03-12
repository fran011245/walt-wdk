---
name: wdk-wallet
description: Create and manage Tether WDK wallets with enterprise security
version: 1.0.0
author: walt-wdk
license: Apache-2.0
openclaw:
  requires: ["@tetherto/wdk"]
---

# wdk-wallet

Create and manage WDK wallets with enterprise-grade security (Tether Wallet Development Kit).

## Installation

```bash
clawhub install wdk-wallet
```

## Configuration

Add to your OpenClaw agent config:

```json
{
  "skills": {
    "wdk-wallet": {
      "defaultNetwork": "base",
      "encryption": "aes-256-gcm"
    }
  }
}
```

## Usage

### Create a wallet

```
User: Create a wallet called "business" on Base
Agent: ✅ Wallet "business" created!
       Address: 0x742d35Cc6634C0532925a3b8D4C9db965...
       Network: Base

       ⚠️ IMPORTANT: Your private key is encrypted and stored securely.
       Run "export business seed" to backup your recovery phrase.
```

### Check balance

```
User: What's my business wallet balance?
Agent: 💰 Wallet "business" (0x742d...)
       USDT: 150.50
       USDC: 25.00
       Native: 0.05
       Last updated: just now
```

### List wallets

```
User: List my wallets
Agent: 📋 You have 2 wallets:

       1. "business" (Base)
          0x742d35...35Cc
          Has balance: yes

       2. "personal" (Ethereum)
          0x8a9b...2Cd1
          Has balance: no
```

### Export wallet (Caution!)

```
User: Export my business wallet seed phrase
Agent: ⚠️ SECURITY WARNING
       You are about to reveal your private key.
       Anyone with this key can steal your funds.

       Type "I understand" to continue: I understand

       🔐 Seed Phrase: word1 word2 word3 ... word12

       Write this down and store it securely.
       This will NOT be shown again.
```

## Commands Reference

| Command | Params | Description |
|---------|--------|-------------|
| `create` | `name`, `network?`, `backup?` | Create new wallet |
| `balance` | `name` | Check balance (native + USDT/USDC) |
| `list` | — | List all wallets |
| `export` | `name`, `format` (seed \| privateKey), `confirmed?` | Export seed or key (requires confirmation) |

## Security Considerations

- Private keys encrypted with AES-256-GCM; stored under `~/.walt-wdk/secrets/`.
- Export requires explicit user confirmation (`confirmed: true` or "I understand").
- Use env `WALT_WDK_SECRET_KEY` or `OPENCLAW_SECRET_KEY` for encryption password in production.
- Audit logging recommended for export operations.

## Requirements

- Node.js >= 18
- OpenClaw >= 2.0
- @tetherto/wdk

## License

Apache-2.0
