/**
 * Guard config JSON Schema validation tests.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { checkLimit } from '../src/index.js';
import path from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const TEST_CONFIG_DIR = path.join(process.cwd(), '.test-walt-wdk-guard-schema');

describe('guard config validation', () => {
  beforeEach(async () => {
    process.env.WALT_WDK_CONFIG_DIR = TEST_CONFIG_DIR;
    if (existsSync(TEST_CONFIG_DIR)) await rm(TEST_CONFIG_DIR, { recursive: true });
    await mkdir(TEST_CONFIG_DIR, { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(TEST_CONFIG_DIR)) await rm(TEST_CONFIG_DIR, { recursive: true });
    delete process.env.WALT_WDK_CONFIG_DIR;
  });

  it('throws on invalid dailyLimit amount', async () => {
    await writeFile(
      path.join(TEST_CONFIG_DIR, 'config.json'),
      JSON.stringify({
        guard: { dailyLimit: { amount: 'not-a-number', currency: 'USDC' } },
      }),
      'utf-8',
    );
    await expect(checkLimit({ operation: 'send', amount: '1', currency: 'USDC', fromWallet: 'w' })).rejects.toThrow(
      /Invalid guard config/,
    );
  });

  it('allows valid guard config', async () => {
    await writeFile(
      path.join(TEST_CONFIG_DIR, 'config.json'),
      JSON.stringify({
        guard: { dailyLimit: { amount: '100', currency: 'USDC' } },
      }),
      'utf-8',
    );
    const res = await checkLimit({
      operation: 'send',
      amount: '1',
      currency: 'USDC',
      fromWallet: 'w',
    });
    expect(res.allowed).toBe(true);
  });
});
