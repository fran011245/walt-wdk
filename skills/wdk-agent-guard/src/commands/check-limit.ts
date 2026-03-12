/**
 * Comando: comprobar si una operación está permitida según guard.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { check, type GuardCheck, type GuardDecision } from '../guard-engine.js';

export interface CheckLimitInput {
  operation: 'send' | 'cron' | 'swap';
  amount: string;
  currency: string;
  to?: string;
  fromWallet: string;
}

export async function checkLimit(input: CheckLimitInput): Promise<GuardDecision> {
  const guardCheck: GuardCheck = {
    operation: input.operation,
    amount: input.amount,
    currency: input.currency,
    to: input.to,
    fromWallet: input.fromWallet,
  };
  return check(guardCheck);
}
