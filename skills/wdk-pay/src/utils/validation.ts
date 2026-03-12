/**
 * Validación de montos y direcciones para wdk-pay.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { isValidAddress } from '@walt-wdk/core';
import type { WdkNetwork } from '@walt-wdk/core';

export function validateAmount(amount: string): void {
  const n = parseFloat(amount);
  if (Number.isNaN(n) || n <= 0) throw new Error('Amount must be a positive number.');
  if (n > 1e12) throw new Error('Amount too large.');
}

export function validateAddress(address: string, network: WdkNetwork): void {
  if (!address || typeof address !== 'string') throw new Error('Address is required.');
  if (!isValidAddress(address.trim(), network)) {
    throw new Error(`Invalid address for network ${network}.`);
  }
}

export function validateToken(token: string): token is 'USDT' | 'USDC' {
  return token === 'USDT' || token === 'USDC';
}
