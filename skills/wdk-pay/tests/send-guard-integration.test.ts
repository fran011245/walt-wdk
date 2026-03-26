/**
 * Send + guard integration (mocked chain and guard module).
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { WdkClient } from '@walt-wdk/core';
import * as Guard from '@walt-wdk/wdk-agent-guard';
import { send } from '../src/commands/send.js';
import { createWallet } from '@walt-wdk/wdk-wallet';

const TEST_DIR = path.join(process.cwd(), '.test-walt-wdk-pay-guard');

vi.mock('@walt-wdk/wdk-agent-guard', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@walt-wdk/wdk-agent-guard')>();
  return {
    ...mod,
    check: vi.fn(),
    requestApproval: vi.fn(),
    recordSpend: vi.fn(),
  };
});

describe('send with guard', () => {
  beforeEach(async () => {
    process.env.WALT_WDK_CONFIG_DIR = TEST_DIR;
    if (existsSync(TEST_DIR)) await rm(TEST_DIR, { recursive: true });
    await mkdir(TEST_DIR, { recursive: true });
    await writeFile(path.join(TEST_DIR, 'config.json'), JSON.stringify({ guard: { enabled: true } }), 'utf-8');
    vi.mocked(Guard.check).mockReset();
    vi.mocked(Guard.requestApproval).mockReset();
    vi.mocked(Guard.recordSpend).mockReset();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    if (existsSync(TEST_DIR)) await rm(TEST_DIR, { recursive: true });
    delete process.env.WALT_WDK_CONFIG_DIR;
  });

  it('throws when approval is denied', async () => {
    await createWallet({ name: 'g1', network: 'base' });
    vi.mocked(Guard.check).mockResolvedValue({
      allowed: true,
      requiresApproval: true,
      reason: 'threshold',
    });
    vi.mocked(Guard.requestApproval).mockResolvedValue({
      approved: false,
      reason: 'no',
    });

    const addr = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    await expect(send({ to: addr, amount: '1', token: 'USDC', fromWallet: 'g1' })).rejects.toThrow(/Send cancelled/);
  });

  it('completes send when approval granted (mocked WDK)', async () => {
    await createWallet({ name: 'g2', network: 'base' });
    vi.mocked(Guard.check).mockResolvedValue({ allowed: true });
    vi.mocked(Guard.recordSpend).mockResolvedValue(undefined);

    const instance = {
      init: vi.fn().mockResolvedValue(undefined),
      getTokenBalance: vi.fn().mockResolvedValue(10_000_000n),
      quoteTransfer: vi.fn().mockResolvedValue(null),
      transfer: vi.fn().mockResolvedValue({ hash: '0xdeadbeef' }),
      dispose: vi.fn(),
    };
    vi.spyOn(WdkClient, 'fromSeed').mockReturnValue(instance as unknown as ReturnType<typeof WdkClient.fromSeed>);

    const addr = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const out = await send({ to: addr, amount: '1', token: 'USDC', fromWallet: 'g2' });
    expect(out.success).toBe(true);
    expect(out.txHash).toBe('0xdeadbeef');
    expect(Guard.recordSpend).toHaveBeenCalled();
  });
});
