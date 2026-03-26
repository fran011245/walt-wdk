/**
 * Tests básicos para wdk-wallet.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// Mock optional guard integration so export tests don't depend on wdk-agent-guard (and its lockfile).
vi.mock('@walt-wdk/wdk-agent-guard', () => ({
  logDecision: vi.fn(async () => {}),
}));
import {
  createWallet,
  getBalance,
  listWalletsCommand,
  exportWallet,
  isValidWalletName,
  isValidNetwork,
  normalizeNetwork,
  SUPPORTED_NETWORKS,
} from '../src/index.js';
import path from 'path';
import { mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

const TEST_CONFIG_DIR = path.join(process.cwd(), '.test-walt-wdk');

describe('wdk-wallet', () => {
  beforeEach(async () => {
    process.env.WALT_WDK_CONFIG_DIR = TEST_CONFIG_DIR;
    if (existsSync(TEST_CONFIG_DIR)) await rm(TEST_CONFIG_DIR, { recursive: true });
    await mkdir(TEST_CONFIG_DIR, { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(TEST_CONFIG_DIR)) await rm(TEST_CONFIG_DIR, { recursive: true });
    delete process.env.WALT_WDK_CONFIG_DIR;
  });

  describe('validation', () => {
    it('validates wallet name', () => {
      expect(isValidWalletName('ok')).toBe(true);
      expect(isValidWalletName('my-wallet_1')).toBe(true);
      expect(isValidWalletName('')).toBe(false);
      expect(isValidWalletName('a'.repeat(65))).toBe(false);
      expect(isValidWalletName('bad name')).toBe(false);
    });
    it('validates network', () => {
      expect(isValidNetwork('base')).toBe(true);
      expect(isValidNetwork('ethereum')).toBe(true);
      expect(isValidNetwork('invalid')).toBe(false);
    });
    it('normalizes network', () => {
      expect(normalizeNetwork('base')).toBe('base');
      expect(normalizeNetwork(undefined)).toBe('base');
      expect(normalizeNetwork('')).toBe('base');
    });
    it('has supported networks', () => {
      expect(SUPPORTED_NETWORKS).toContain('ethereum');
      expect(SUPPORTED_NETWORKS).toContain('tron');
    });
  });

  describe('create', () => {
    it('creates a wallet and returns address', async () => {
      const out = await createWallet({ name: 'test-create', network: 'base' });
      expect(out.success).toBe(true);
      expect(out.name).toBe('test-create');
      expect(out.network).toBe('base');
      expect(out.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(out.warning).toBeDefined();
    });
    it('rejects duplicate name', async () => {
      await createWallet({ name: 'dup', network: 'base' });
      await expect(createWallet({ name: 'dup', network: 'ethereum' })).rejects.toThrow(/already exists/);
    });
    it('rejects invalid name', async () => {
      await expect(createWallet({ name: 'bad name', network: 'base' })).rejects.toThrow(/Invalid wallet name/);
    });
  });

  describe('list', () => {
    it('lists created wallets', async () => {
      await createWallet({ name: 'list-a', network: 'base' });
      await createWallet({ name: 'list-b', network: 'ethereum' });
      const { wallets } = await listWalletsCommand();
      expect(wallets.length).toBeGreaterThanOrEqual(2);
      const names = wallets.map((w) => w.name);
      expect(names).toContain('list-a');
      expect(names).toContain('list-b');
    });
  });

  describe('balance', () => {
    it('returns balance for existing wallet', async () => {
      await createWallet({ name: 'bal-wallet', network: 'base' });
      try {
        const out = await getBalance({ name: 'bal-wallet' });
        expect(out.address).toMatch(/^0x/);
        expect(out.network).toBe('base');
        expect(out.balances).toHaveProperty('native');
        expect(out.lastUpdated).toBeDefined();
      } catch (err: unknown) {
        // If the underlying RPC endpoint is unreachable in CI/local, skip this assertion.
        const code = err && typeof err === 'object' && 'code' in err ? (err as { code?: string }).code : undefined;
        if (code === 'ETIMEDOUT' || code === 'EHOSTUNREACH' || code === 'NETWORK_ERROR') {
          console.warn('[wdk-wallet tests] Skipping balance RPC assertion due to network error:', code);
          return;
        }
        throw err;
      }
    });
    it('throws for unknown wallet', async () => {
      await expect(getBalance({ name: 'nonexistent-wallet-xyz' })).rejects.toThrow(/not found/);
    });
  });

  describe('export', () => {
    it('requires confirmation', async () => {
      await createWallet({ name: 'export-me', network: 'base' });
      const out = await exportWallet({ name: 'export-me', format: 'seed', confirmed: false });
      expect(out.success).toBe(false);
      expect(out.seedPhrase).toBeUndefined();
      expect(out.warning).toContain('confirm');
    });
    it('returns seed when confirmed with exact phrase', async () => {
      await createWallet({ name: 'export-seed', network: 'base' });
      const out = await exportWallet({
        name: 'export-seed',
        format: 'seed',
        confirmed: 'I understand the risks',
      });
      expect(out.success).toBe(true);
      expect(out.seedPhrase).toBeDefined();
      expect(typeof out.seedPhrase).toBe('string');
      expect((out.seedPhrase ?? '').split(' ').length).toBeGreaterThanOrEqual(12);
    });
    it('throws for unknown wallet', async () => {
      await expect(
        exportWallet({ name: 'no-wallet', format: 'seed', confirmed: 'I understand the risks' }),
      ).rejects.toThrow(/not found/);
    });
  });
});
