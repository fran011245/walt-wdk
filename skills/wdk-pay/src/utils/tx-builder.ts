/**
 * Token addresses y conversión de montos para USDT/USDC.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import type { WdkNetwork } from '@walt-wdk/core';

/** Contract addresses mainnet (USDT, USDC) por red */
export const TOKEN_ADDRESSES: Record<WdkNetwork, { USDT: string; USDC: string }> = {
  ethereum: {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  base: {
    USDT: '0x0000000000000000000000000000000000000000', // Base: use USDC; USDT not standard
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  polygon: {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  },
  tron: {
    USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    USDC: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8', // TRON USDC
  },
};

const TOKEN_DECIMALS = 6; // USDT/USDC typically 6

/** Human amount "50.25" -> base units bigint */
export function parseTokenAmount(amount: string): bigint {
  const trimmed = amount.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) throw new Error(`Invalid amount: ${amount}`);
  const [intPart = '0', decPart = ''] = trimmed.split('.');
  const decimals = decPart.slice(0, TOKEN_DECIMALS).padEnd(TOKEN_DECIMALS, '0');
  return BigInt(intPart + decimals);
}

/** Base units -> human string (2 decimals) */
export function formatTokenAmount(baseUnits: bigint): string {
  const s = baseUnits.toString().padStart(TOKEN_DECIMALS + 1, '0');
  const int = s.slice(0, -TOKEN_DECIMALS) || '0';
  const frac = s.slice(-TOKEN_DECIMALS).replace(/0+$/, '') || '0';
  const combined = frac === '0' ? int : `${int}.${frac}`;
  const [i, f] = combined.split('.');
  const f2 = (f ?? '0').slice(0, 2);
  return f2 ? `${i}.${f2}` : i;
}

export function getTokenAddress(network: WdkNetwork, token: 'USDT' | 'USDC'): string {
  const addr = TOKEN_ADDRESSES[network][token];
  if (addr === '0x0000000000000000000000000000000000000000' && network === 'base' && token === 'USDT') {
    throw new Error('USDT on Base not configured. Use USDC.');
  }
  return addr;
}

export const EXPLORER_TX_URL: Record<WdkNetwork, string> = {
  ethereum: 'https://etherscan.io/tx/',
  base: 'https://basescan.org/tx/',
  polygon: 'https://polygonscan.com/tx/',
  tron: 'https://tronscan.org/#/transaction/',
};
