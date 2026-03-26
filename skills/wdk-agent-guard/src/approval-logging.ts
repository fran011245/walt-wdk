/**
 * Injectable logging for approval notifications (tests can silence or capture).
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

export type ApprovalLogLevel = 'info' | 'warn';

export type ApprovalLogger = (level: ApprovalLogLevel, message: string) => void;

let customLogger: ApprovalLogger | null = null;

export function setApprovalLogger(logger: ApprovalLogger | null): void {
  customLogger = logger;
}

export function logApproval(level: ApprovalLogLevel, message: string): void {
  if (customLogger) {
    customLogger(level, message);
    return;
  }
  if (process.env.NODE_ENV === 'test') return;
  if (level === 'warn') console.warn(message);
  else console.info(message);
}
