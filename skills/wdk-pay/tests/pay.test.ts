/**
 * Tests básicos para wdk-pay.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  send,
  request,
  history,
  validateAmount,
  validateToken,
  parseTokenAmount,
  formatTokenAmount,
  getTokenAddress,
} from '../src/index.js';
import { createWallet } from '@walt-wdk/wdk-wallet';
import path from 'path';
import { mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

const TEST_CONFIG_DIR = path.join(process.cwd(), '.test-walt-wdk-pay');

describe('wdk-pay', () => {
  beforeEach(async () => {
    process.env.WALT_WDK_CONFIG_DIR = TEST_CONFIG_DIR;
    if (existsSync(TEST_CONFIG_DIR)) await rm(TEST_CONFIG_DIR, { recursive: true });
    await mkdir(TEST_CONFIG_DIR, { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(TEST_CONFIG_DIR)) await rm(TEST_CONFIG_DIR, { recursive: true });
    delete process.env.WALT_WDK_CONFIG_DIR;
  });

  describe('validation and tx-builder', () => {
    it('validates amount', () => {
      expect(() => validateAmount('50')).not.toThrow();
      expect(() => validateAmount('0')).toThrow();
      expect(() => validateAmount('-1')).toThrow();
      expect(() => validateAmount('abc')).toThrow();
    });
    it('validates token', () => {
      expect(validateToken('USDT')).toBe(true);
      expect(validateToken('USDC')).toBe(true);
      expect(validateToken('ETH')).toBe(false);
    });
    it('parseTokenAmount and formatTokenAmount', () => {
      expect(parseTokenAmount('1').toString()).toBe('1000000');
      expect(formatTokenAmount(1500000n)).toBe('1.5');
    });
    it('getTokenAddress returns address for network', () => {
      expect(getTokenAddress('ethereum', 'USDT')).toMatch(/^0x/);
      expect(getTokenAddress('base', 'USDC')).toMatch(/^0x/);
    });
  });

  describe('request', () => {
    it('throws when wallet does not exist', async () => {
      await expect(request({ from: 'nonexistent', amount: '10', token: 'USDC' })).rejects.toThrow(/not found/);
    });
    it('returns payment request when wallet exists', async () => {
      await createWallet({ name: 'pay-req-wallet', network: 'base' });
      const out = await request({ from: 'pay-req-wallet', amount: '25', token: 'USDC' });
      expect(out.amount).toBe('25');
      expect(out.token).toBe('USDC');
      expect(out.address).toMatch(/^0x/);
      expect(out.paymentRequestUrl).toContain('amount=25');
    });
  });

  describe('history', () => {
    it('returns empty array when no ledger', async () => {
      const out = await history(undefined, 10);
      expect(out.transactions).toEqual([]);
    });
  });

  describe('send', () => {
    it('throws when wallet does not exist', async () => {
      await expect(
        send({
          to: '0x0000000000000000000000000000000000000001',
          amount: '1',
          token: 'USDC',
          fromWallet: 'nonexistent',
        })
      ).rejects.toThrow(/not found/);
    });
    it('throws when no wallet specified and no default', async () => {
      await expect(
        send({
          to: '0x0000000000000000000000000000000000000001',
          amount: '1',
          token: 'USDC',
        })
      ).rejects.toThrow(/No wallet specified/);
    });
  });
});
