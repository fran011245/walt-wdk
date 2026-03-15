/**
 * Motor de guardas: blacklist, whitelist, límites por tx y diarios.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import lockfile from 'proper-lockfile';
import { Decimal } from 'decimal.js';
import { loadConfig, getConfigDir } from '@walt-wdk/core';

export type GuardOperation = 'send' | 'cron' | 'swap';

export interface GuardCheck {
  operation: GuardOperation;
  amount: string;
  currency: string;
  to?: string;
  fromWallet: string;
}

export interface GuardDecision {
  allowed: boolean;
  reason?: string;
  requiresApproval?: boolean;
  approvalMethod?: string;
  currentDailySpent?: string;
  remainingDaily?: string;
}

const LEDGER_FILE = 'guard-ledger.json';

interface DayLedger {
  date: string; // YYYY-MM-DD
  spent: Record<string, string>; // currency -> amount
}

function getLedgerPath(): string {
  return path.join(getConfigDir(), LEDGER_FILE);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseAmount(s: string): Decimal {
  try {
    return new Decimal(s);
  } catch {
    return new Decimal(0);
  }
}

async function loadLedger(): Promise<DayLedger> {
  const p = getLedgerPath();
  if (!existsSync(p)) return { date: today(), spent: {} };
  const raw = await readFile(p, 'utf-8');
  const data = JSON.parse(raw) as Partial<DayLedger>;
  if (!data || typeof data !== 'object' || typeof data.date !== 'string' || typeof data.spent !== 'object') {
    throw new Error('Corrupted guard ledger: expected { date: string, spent: Record<string, string> }.');
  }
  if (data.date !== today()) return { date: today(), spent: {} };
  return data as DayLedger;
}

async function saveLedger(ledger: DayLedger): Promise<void> {
  const dir = getConfigDir();
  if (!existsSync(dir)) await mkdir(dir, { recursive: true, mode: 0o700 });
  await writeFile(getLedgerPath(), JSON.stringify(ledger, null, 2), {
    encoding: 'utf-8',
    mode: 0o600,
  });
}

/** Obtiene el total gastado hoy en la moneda dada. */
export async function getDailySpent(currency: string): Promise<string> {
  const ledger = await loadLedger();
  return ledger.spent[currency] ?? '0';
}

/** Registra un gasto en el ledger del día (llamar después de un envío aprobado). Uses file lock to avoid race conditions. */
export async function recordSpend(amount: string, currency: string): Promise<void> {
  const lockPath = getLedgerPath();
  if (!existsSync(lockPath)) {
    await saveLedger({ date: today(), spent: {} });
  }

  let release: (() => Promise<void>) | undefined;
  try {
    release = await lockfile.lock(lockPath, {
      retries: { retries: 5, factor: 2, minTimeout: 100, maxTimeout: 1000 },
      stale: 10000,
    });
  } catch (e) {
    throw new Error(`Failed to acquire lock for guard ledger: ${(e as Error).message}`);
  }

  try {
    const ledger = await loadLedger();
    const current = parseAmount(ledger.spent[currency] ?? '0');
    const add = parseAmount(amount);
    ledger.spent[currency] = current.plus(add).toString();
    await saveLedger(ledger);
  } finally {
    if (release) await release();
  }
}

/**
 * Evalúa si la operación está permitida según config.
 * 1) Blacklist 2) Whitelist 3) Límite por tx 4) Límite diario 5) Require approval over X
 */
export async function check(config: GuardCheck): Promise<GuardDecision> {
  const cfg = await loadConfig();
  const guard = cfg.guard;

  if (guard?.blacklist?.length && config.to) {
    const toLower = config.to.trim().toLowerCase();
    if (guard.blacklist.some((a) => a.trim().toLowerCase() === toLower)) {
      return { allowed: false, reason: 'Destination address is blacklisted.' };
    }
  }

  if (guard?.whitelist?.length && config.to) {
    const toLower = config.to.trim().toLowerCase();
    const entry = guard.whitelist.find((w) => w.address.trim().toLowerCase() === toLower);
    if (entry?.skipApproval) {
      return { allowed: true };
    }
  }

  const amountNum = parseAmount(config.amount);
  if (guard?.perTransactionLimit?.amount) {
    const limit = parseAmount(guard.perTransactionLimit.amount);
    if (guard.perTransactionLimit.currency === config.currency && amountNum.greaterThan(limit)) {
      return {
        allowed: false,
        reason: `Amount ${config.amount} ${config.currency} exceeds per-transaction limit ${guard.perTransactionLimit.amount}.`,
      };
    }
  }

  if (guard?.dailyLimit?.amount && guard.dailyLimit.currency === config.currency) {
    const spent = await getDailySpent(config.currency);
    const spentNum = parseAmount(spent);
    const limitNum = parseAmount(guard.dailyLimit.amount);
    const remaining = Decimal.max(0, limitNum.minus(spentNum));
    if (amountNum.greaterThan(remaining)) {
      return {
        allowed: false,
        reason: `Would exceed daily limit. Spent today: ${spent} ${config.currency}; limit: ${guard.dailyLimit.amount}; remaining: ${remaining.toString()}.`,
        currentDailySpent: spent,
        remainingDaily: remaining.toString(),
      };
    }
    if (amountNum.greaterThan(0)) {
      const afterSpend = spentNum.plus(amountNum);
      if (afterSpend.greaterThan(limitNum)) {
        return {
          allowed: false,
          reason: `Would exceed daily limit.`,
          currentDailySpent: spent,
          remainingDaily: remaining.toString(),
        };
      }
    }
    // Within daily limits: return allowance info.
    return { allowed: true, currentDailySpent: spent, remainingDaily: remaining.toString() };
  }

  if (guard?.requireApproval?.overAmount) {
    const over = parseAmount(guard.requireApproval.overAmount);
    if (amountNum.greaterThanOrEqualTo(over)) {
      return {
        allowed: true,
        requiresApproval: true,
        approvalMethod: guard.requireApproval.notifyVia ?? 'telegram',
        reason: `Amount ${config.amount} >= ${guard.requireApproval.overAmount} requires approval.`,
      };
    }
  }

  return { allowed: true };
}
