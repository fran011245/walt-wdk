/**
 * Resolve per-chain RPC URLs and TronGrid auth from env and WaltWDK config.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import type { WaltWdkConfig } from './config-manager.js';

const DEFAULT_RPC: Record<'ethereum' | 'base' | 'polygon' | 'tron', string> = {
  ethereum: 'https://eth.drpc.org',
  base: 'https://mainnet.base.org',
  polygon: 'https://polygon-rpc.com',
  tron: 'https://api.trongrid.io',
};

export type ResolvedTronProvider =
  | { kind: 'url'; fullHost: string }
  | { kind: 'authed'; fullHost: string; apiKey: string };

export interface ResolvedRpcProviders {
  ethereum: string;
  base: string;
  polygon: string;
  tron: ResolvedTronProvider;
}

function firstNonEmpty(...vals: (string | undefined)[]): string | undefined {
  for (const v of vals) {
    if (v != null && v.trim() !== '') return v;
  }
  return undefined;
}

/**
 * Merge precedence: process.env overrides config.json overrides built-in defaults.
 * Env: WALT_WDK_RPC_ETHEREUM, WALT_WDK_RPC_BASE, WALT_WDK_RPC_POLYGON,
 * WALT_WDK_TRON_FULL_HOST, WALT_WDK_TRON_PRO_API_KEY.
 */
export function resolveRpcProviders(cfg: WaltWdkConfig, env: NodeJS.ProcessEnv = process.env): ResolvedRpcProviders {
  const rpc = cfg.rpc;

  const ethereum = firstNonEmpty(env.WALT_WDK_RPC_ETHEREUM, rpc?.ethereum) ?? DEFAULT_RPC.ethereum;
  const base = firstNonEmpty(env.WALT_WDK_RPC_BASE, rpc?.base) ?? DEFAULT_RPC.base;
  const polygon = firstNonEmpty(env.WALT_WDK_RPC_POLYGON, rpc?.polygon) ?? DEFAULT_RPC.polygon;

  const tronFullHost = firstNonEmpty(env.WALT_WDK_TRON_FULL_HOST, rpc?.tron?.fullHost) ?? DEFAULT_RPC.tron;
  const tronApiKey = firstNonEmpty(env.WALT_WDK_TRON_PRO_API_KEY, rpc?.tron?.apiKey);

  const tron: ResolvedTronProvider =
    tronApiKey != null
      ? { kind: 'authed', fullHost: tronFullHost, apiKey: tronApiKey }
      : { kind: 'url', fullHost: tronFullHost };

  return { ethereum, base, polygon, tron };
}
