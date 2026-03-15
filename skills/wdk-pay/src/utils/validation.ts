/**
 * Validación de montos y direcciones para wdk-pay.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { Decimal } from 'decimal.js';
import { isValidAddress } from '@walt-wdk/core';
import type { WdkNetwork } from '@walt-wdk/core';

export function validateAmount(amount: string): void {
  let n: Decimal;
  try {
    n = new Decimal(amount);
  } catch {
    throw new Error('Amount must be a valid number.');
  }
  if (n.lessThanOrEqualTo(0)) throw new Error('Amount must be a positive number.');
  if (n.greaterThan('1e12')) throw new Error('Amount too large.');
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

const SUPPORTED_NETWORKS: WdkNetwork[] = ['ethereum', 'base', 'polygon', 'tron'];

export function isValidNetwork(network: string): network is WdkNetwork {
  return SUPPORTED_NETWORKS.includes(network as WdkNetwork);
}
