/**
 * Tests básicos para wdk-agent-guard.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  checkLimit,
  getDailySpent,
  recordSpend,
  requestApproval,
  logDecision,
  getAuditLog,
  parseTimeout,
} from '../src/index.js';
import { getConfigDir } from '@walt-wdk/core';
import path from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const auditPath = () => path.join(getConfigDir(), 'guard-audit.jsonl');

const TEST_CONFIG_DIR = path.join(process.cwd(), '.test-walt-wdk-guard');

describe('wdk-agent-guard', () => {
  beforeEach(async () => {
    process.env.WALT_WDK_CONFIG_DIR = TEST_CONFIG_DIR;
    if (existsSync(TEST_CONFIG_DIR)) await rm(TEST_CONFIG_DIR, { recursive: true });
    await mkdir(TEST_CONFIG_DIR, { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(TEST_CONFIG_DIR)) await rm(TEST_CONFIG_DIR, { recursive: true });
    delete process.env.WALT_WDK_CONFIG_DIR;
  });

  describe('checkLimit', () => {
    it('allows when no guard config', async () => {
      const res = await checkLimit({
        operation: 'send',
        amount: '100',
        currency: 'USDC',
        fromWallet: 'w',
      });
      expect(res.allowed).toBe(true);
    });

    it('rejects when destination is blacklisted', async () => {
      await writeFile(
        path.join(TEST_CONFIG_DIR, 'config.json'),
        JSON.stringify({
          guard: { blacklist: ['0x0000000000000000000000000000000000000001'] },
        }),
        'utf-8'
      );
      const res = await checkLimit({
        operation: 'send',
        amount: '10',
        currency: 'USDC',
        to: '0x0000000000000000000000000000000000000001',
        fromWallet: 'w',
      });
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('blacklisted');
    });

    it('allows when address is whitelisted with skipApproval', async () => {
      await writeFile(
        path.join(TEST_CONFIG_DIR, 'config.json'),
        JSON.stringify({
          guard: {
            whitelist: [
              { address: '0x0000000000000000000000000000000000000002', skipApproval: true },
            ],
          },
        }),
        'utf-8'
      );
      const res = await checkLimit({
        operation: 'send',
        amount: '50',
        currency: 'USDC',
        to: '0x0000000000000000000000000000000000000002',
        fromWallet: 'w',
      });
      expect(res.allowed).toBe(true);
    });

    it('returns requiresApproval when amount >= requireApproval.overAmount', async () => {
      await writeFile(
        path.join(TEST_CONFIG_DIR, 'config.json'),
        JSON.stringify({
          guard: {
            requireApproval: { overAmount: '100', notifyVia: 'telegram' },
          },
        }),
        'utf-8'
      );
      const res = await checkLimit({
        operation: 'send',
        amount: '150',
        currency: 'USDC',
        fromWallet: 'w',
      });
      expect(res.allowed).toBe(true);
      expect(res.requiresApproval).toBe(true);
      expect(res.approvalMethod).toBe('telegram');
    });
  });

  describe('daily spent and recordSpend', () => {
    it('getDailySpent returns 0 when no ledger', async () => {
      expect(await getDailySpent('USDC')).toBe('0');
    });
    it('recordSpend and getDailySpent', async () => {
      await recordSpend('50', 'USDC');
      expect(await getDailySpent('USDC')).toBe('50');
      await recordSpend('25', 'USDC');
      expect(await getDailySpent('USDC')).toBe('75');
    });
  });

  describe('requestApproval', () => {
    it('returns approved: false after timeout (MVP)', async () => {
      const res = await requestApproval({
        operation: 'send',
        amount: '200',
        currency: 'USDC',
        fromWallet: 'w',
      });
      expect(res.approved).toBe(false);
      expect(res.reason).toBeDefined();
    });
  });

  describe('logDecision and getAuditLog', () => {
    it('getAuditLog returns empty when no log', async () => {
      const { unlink } = await import('fs/promises');
      if (existsSync(auditPath())) await unlink(auditPath());
      const log = await getAuditLog(10);
      expect(log).toEqual([]);
    });
    it('logDecision appends and getAuditLog returns entries', async () => {
      await logDecision({
        timestamp: new Date().toISOString(),
        operation: 'send',
        amount: '10',
        currency: 'USDC',
        fromWallet: 'w',
        approved: true,
      });
      const log = await getAuditLog(10);
      expect(log.length).toBeGreaterThanOrEqual(1);
      expect(log[0].operation).toBe('send');
      expect(log[0].approved).toBe(true);
    });
  });

  describe('parseTimeout', () => {
    it('parses 5m to ms', () => {
      expect(parseTimeout('5m')).toBe(5 * 60 * 1000);
    });
    it('parses 30s to ms', () => {
      expect(parseTimeout('30s')).toBe(30000);
    });
  });
});
