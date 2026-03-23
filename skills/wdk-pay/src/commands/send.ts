/**
 * Comando: enviar USDT/USDC a una dirección.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { WdkClient, loadConfig } from '@walt-wdk/core';
import { getWalletSeed, getWalletMeta, getDefaultWalletName } from '../utils/wallet-resolver.js';
import { parseTokenAmount, getTokenAddress, formatTokenAmount, EXPLORER_TX_URL } from '../utils/tx-builder.js';
import { validateAmount, validateAddress, validateToken } from '../utils/validation.js';
import { appendToLedger } from '../utils/history-ledger.js';
import type { WdkNetwork } from '@walt-wdk/core';
import { isValidNetwork } from '../utils/validation.js';

function formatTrxFromSun(sun: bigint): string {
  return (Number(sun) / 1_000_000).toFixed(2);
}

export interface SendInput {
  to: string;
  amount: string;
  token: 'USDT' | 'USDC';
  fromWallet?: string;
  memo?: string;
}

export interface SendOutput {
  success: boolean;
  txHash: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  fee?: string;
  explorerUrl: string;
  timestamp: string;
}

export async function send(input: SendInput): Promise<SendOutput> {
  validateAmount(input.amount);
  const token = input.token;
  if (!validateToken(token)) throw new Error('Token must be USDT or USDC.');

  const walletName = input.fromWallet ?? (await getDefaultWalletName());
  if (!walletName) throw new Error('No wallet specified. Set fromWallet or defaultWallet in config.');

  const meta = await getWalletMeta(walletName);
  if (!isValidNetwork(meta.network)) {
    throw new Error(`Unsupported network stored for wallet "${walletName}": ${meta.network}`);
  }
  const network = meta.network as WdkNetwork;
  validateAddress(input.to.trim(), network);

  // Guard integration: when enabled (default), check limits and require approval when configured.
  const cfg = await loadConfig();
  const guardEnabled = cfg.guard?.enabled !== false;

  if (guardEnabled) {
    try {
      const guard = await import('@walt-wdk/wdk-agent-guard');
      const decision = await guard.check({
        operation: 'send',
        amount: input.amount,
        currency: token,
        to: input.to.trim(),
        fromWallet: walletName,
      });

      if (!decision.allowed) {
        throw new Error(`Guard blocked send: ${decision.reason ?? 'not allowed'}`);
      }

      if (decision.requiresApproval) {
        const approval = await guard.requestApproval({
          operation: 'send',
          amount: input.amount,
          currency: token,
          to: input.to.trim(),
          fromWallet: walletName,
          reason: decision.reason ?? 'Amount exceeds approval threshold',
        });
        if (!approval.approved) {
          throw new Error(`Send cancelled: ${approval.reason ?? 'approval denied or timeout'}`);
        }
      }
    } catch (e: any) {
      if (e?.code === 'ERR_MODULE_NOT_FOUND' || e?.code === 'MODULE_NOT_FOUND') {
        throw new Error(
          'Guard is enabled but @walt-wdk/wdk-agent-guard is not installed. Install it or set guard.enabled=false in config.',
        );
      }
      throw e;
    }
  }

  const seed = await getWalletSeed(walletName);
  const client = WdkClient.fromSeed(seed);
  try {
    await client.init();
    const tokenAddress = getTokenAddress(network, token);
    const amountBase = parseTokenAmount(input.amount);
    const balance = await client.getTokenBalance(network, tokenAddress, 0);
    if (balance < amountBase) {
      throw new Error(`Insufficient ${token} balance. Have ${formatTokenAmount(balance)}, need ${input.amount}.`);
    }

    if (network === 'tron') {
      const [nativeBal, quote] = await Promise.all([
        client.getBalance(network, 0),
        client.quoteTransfer(network, { to: input.to.trim(), token: tokenAddress, amount: amountBase }, 0),
      ]);
      if (quote && nativeBal < quote.fee) {
        const need = formatTrxFromSun(quote.fee);
        const have = formatTrxFromSun(nativeBal);
        throw new Error(
          `Insufficient TRX for Tron network fee. Estimated fee: ~${need} TRX, available: ${have} TRX.\n` +
            `  - Add at least ${need} TRX to this wallet, or\n` +
            `  - Stake 500+ TRX for Energy to make transfers nearly free.\n` +
            `  https://developers.tron.network/docs/resource-model`,
        );
      }
    }

    let result: { hash: string };
    try {
      result = await client.transfer(network, { to: input.to.trim(), token: tokenAddress, amount: amountBase }, 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (network === 'tron' && (msg.includes('OUT_OF_ENERGY') || /out of energy/i.test(msg))) {
        throw new Error(
          `Tron transfer failed: out of Energy. Add more TRX or stake for Energy.\n` +
            `  https://developers.tron.network/docs/resource-model`,
        );
      }
      throw err;
    }
    const explorerUrl = EXPLORER_TX_URL[network] + result.hash;
    const timestamp = new Date().toISOString();

    await appendToLedger({
      txHash: result.hash,
      type: 'send',
      amount: input.amount,
      token,
      counterparty: input.to.trim(),
      timestamp,
      status: 'pending',
      network,
      walletName,
    });

    // Record spend in guard ledger if guard is installed.
    try {
      const guard = await import('@walt-wdk/wdk-agent-guard');
      if (typeof guard.recordSpend === 'function') {
        await guard.recordSpend(input.amount, token);
      }
    } catch (e: any) {
      if (e?.code !== 'ERR_MODULE_NOT_FOUND' && e?.code !== 'MODULE_NOT_FOUND') {
        throw e;
      }
    }

    return {
      success: true,
      txHash: result.hash,
      from: meta.address,
      to: input.to.trim(),
      amount: input.amount,
      token,
      explorerUrl,
      timestamp,
    };
  } finally {
    client.dispose();
  }
}
