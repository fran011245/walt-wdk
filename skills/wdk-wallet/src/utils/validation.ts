/**
 * Validation helpers for wdk-wallet.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import type { WdkNetwork } from '@walt-wdk/core';

export const SUPPORTED_NETWORKS: WdkNetwork[] = ['ethereum', 'base', 'polygon', 'tron'];

/** Wallet name: alphanumeric, dash, underscore; 1–64 chars */
export function isValidWalletName(name: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(name);
}

/** Validate network string. */
export function isValidNetwork(network: string): network is WdkNetwork {
  return SUPPORTED_NETWORKS.includes(network as WdkNetwork);
}

/** Normalize network to default if invalid or empty. */
export function normalizeNetwork(network?: string): WdkNetwork {
  if (network && isValidNetwork(network)) return network as WdkNetwork;
  return 'base';
}
