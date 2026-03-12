/**
 * Comando: consultar balance de un wallet (nativo + USDT/USDC si aplica).
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { WdkClient } from '@walt-wdk/core';
import { getWalletMeta, getWalletSeed } from '../utils/wallet-store.js';
import type { WdkNetwork } from '@walt-wdk/core';

// Contract addresses (mainnet) para balance de tokens — ejemplos por red
const USDT_EVM = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // Ethereum USDT
const USDC_EVM = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // Ethereum USDC
const USDT_BASE = '0x0000000000000000000000000000000000000000'; // placeholder
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC
const USDT_TRON = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

function formatUnits(value: bigint, decimals: number): string {
  const s = value.toString().padStart(decimals + 1, '0');
  const int = s.slice(0, -decimals) || '0';
  const frac = s.slice(-decimals).replace(/0+$/, '') || '0';
  return frac === '0' ? int : `${int}.${frac}`;
}

export interface BalanceInput {
  name: string;
}

export interface BalanceOutput {
  address: string;
  network: string;
  balances: {
    USDT?: string;
    USDC?: string;
    native?: string;
  };
  lastUpdated: string;
}

export async function getBalance(input: BalanceInput): Promise<BalanceOutput> {
  const meta = await getWalletMeta(input.name);
  const seed = await getWalletSeed(input.name);
  const client = WdkClient.fromSeed(seed);
  try {
    await client.init();
    const network = meta.network as WdkNetwork;
    const nativeBalance = await client.getBalance(network, 0);

    const balances: BalanceOutput['balances'] = {};
    const decimals = network === 'tron' ? 6 : 18;
    balances.native = formatUnits(nativeBalance, decimals);

    if (network === 'tron') {
      try {
        const usdt = await client.getTokenBalance(network, USDT_TRON, 0);
        balances.USDT = formatUnits(usdt, 6);
      } catch {
        // ignore
      }
    } else {
      try {
        const usdtAddr = network === 'base' ? USDT_BASE : USDT_EVM;
        const usdcAddr = network === 'base' ? USDC_BASE : USDC_EVM;
        const [usdt, usdc] = await Promise.all([
          client.getTokenBalance(network, usdtAddr, 0),
          client.getTokenBalance(network, usdcAddr, 0),
        ]);
        balances.USDT = formatUnits(usdt, 6);
        balances.USDC = formatUnits(usdc, 6);
      } catch {
        // ignore token balance errors
      }
    }

    return {
      address: meta.address,
      network: meta.network,
      balances,
      lastUpdated: new Date().toISOString(),
    };
  } finally {
    client.dispose();
  }
}
