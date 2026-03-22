/**
 * Tests for RPC resolution precedence (env > config > defaults).
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { describe, it, expect } from 'vitest';
import { resolveRpcProviders } from './rpc-resolve.js';
import type { WaltWdkConfig } from './config-manager.js';

const emptyCfg: WaltWdkConfig = {};

describe('resolveRpcProviders', () => {
  it('uses built-in defaults when config and env are empty', () => {
    const r = resolveRpcProviders(emptyCfg, {});
    expect(r.ethereum).toBe('https://eth.drpc.org');
    expect(r.base).toBe('https://mainnet.base.org');
    expect(r.polygon).toBe('https://polygon-rpc.com');
    expect(r.tron).toEqual({ kind: 'url', fullHost: 'https://api.trongrid.io' });
  });

  it('prefers config over defaults for EVM', () => {
    const cfg: WaltWdkConfig = {
      rpc: {
        ethereum: 'https://eth.example.com',
        base: 'https://base.example.com',
        polygon: 'https://polygon.example.com',
      },
    };
    const r = resolveRpcProviders(cfg, {});
    expect(r.ethereum).toBe('https://eth.example.com');
    expect(r.base).toBe('https://base.example.com');
    expect(r.polygon).toBe('https://polygon.example.com');
  });

  it('prefers env over config for EVM', () => {
    const cfg: WaltWdkConfig = {
      rpc: {
        ethereum: 'https://from.config',
        base: 'https://base.config',
        polygon: 'https://polygon.config',
      },
    };
    const r = resolveRpcProviders(cfg, {
      WALT_WDK_RPC_ETHEREUM: 'https://from.env',
      WALT_WDK_RPC_BASE: '',
      WALT_WDK_RPC_POLYGON: '   ',
    });
    expect(r.ethereum).toBe('https://from.env');
    expect(r.base).toBe('https://base.config');
    expect(r.polygon).toBe('https://polygon.config');
  });

  it('returns authed Tron when apiKey is in config', () => {
    const cfg: WaltWdkConfig = {
      rpc: { tron: { fullHost: 'https://api.trongrid.io', apiKey: 'cfg-key' } },
    };
    const r = resolveRpcProviders(cfg, {});
    expect(r.tron).toEqual({
      kind: 'authed',
      fullHost: 'https://api.trongrid.io',
      apiKey: 'cfg-key',
    });
  });

  it('prefers TRON env api key and fullHost over config', () => {
    const cfg: WaltWdkConfig = {
      rpc: { tron: { fullHost: 'https://from.config', apiKey: 'cfg-key' } },
    };
    const r = resolveRpcProviders(cfg, {
      WALT_WDK_TRON_PRO_API_KEY: 'env-key',
      WALT_WDK_TRON_FULL_HOST: 'https://from.env',
    });
    expect(r.tron).toEqual({
      kind: 'authed',
      fullHost: 'https://from.env',
      apiKey: 'env-key',
    });
  });

  it('uses config tron fullHost when only env api key is set', () => {
    const cfg: WaltWdkConfig = {
      rpc: { tron: { fullHost: 'https://custom.tron.host' } },
    };
    const r = resolveRpcProviders(cfg, { WALT_WDK_TRON_PRO_API_KEY: 'k' });
    expect(r.tron).toEqual({
      kind: 'authed',
      fullHost: 'https://custom.tron.host',
      apiKey: 'k',
    });
  });
});
