/**
 * Comando: enviar USDT/USDC a una dirección.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { WdkClient } from '@walt-wdk/core';
import { getWalletSeed, getWalletMeta, getDefaultWalletName } from '../utils/wallet-resolver.js';
import { parseTokenAmount, getTokenAddress, formatTokenAmount, EXPLORER_TX_URL } from '../utils/tx-builder.js';
import { validateAmount, validateAddress, validateToken } from '../utils/validation.js';
import { appendToLedger } from '../utils/history-ledger.js';
import type { WdkNetwork } from '@walt-wdk/core';
import { isValidNetwork } from '../utils/validation.js';

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

  // Optional guard integration: if @walt-wdk/wdk-agent-guard is installed, check limits first.
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
  } catch (e: any) {
    // If the guard package is not installed, skip guard checks gracefully.
    if (e?.code !== 'ERR_MODULE_NOT_FOUND' && e?.code !== 'MODULE_NOT_FOUND') {
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
    const result = await client.transfer(network, { to: input.to.trim(), token: tokenAddress, amount: amountBase }, 0);
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
