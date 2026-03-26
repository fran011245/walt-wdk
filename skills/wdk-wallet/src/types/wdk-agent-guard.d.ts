/**
 * Type stub for optional peer dependency @walt-wdk/wdk-agent-guard.
 * Allows TypeScript compilation when the guard package is not installed.
 */
declare module '@walt-wdk/wdk-agent-guard' {
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

  export interface DecisionEntry {
    timestamp: string;
    operation: string;
    amount: string;
    currency: string;
    to?: string;
    fromWallet: string;
    approved: boolean;
    reason?: string;
  }

  export interface ApprovalRequest {
    operation: string;
    amount: string;
    currency: string;
    to?: string;
    fromWallet: string;
    reason?: string;
  }

  export interface ApprovalResult {
    approved: boolean;
    requestId?: string;
    reason?: string;
  }

  export function check(config: GuardCheck): Promise<GuardDecision>;
  export function getDailySpent(currency: string): Promise<string>;
  export function recordSpend(amount: string, currency: string): Promise<void>;
  export function waitForApproval(
    request: ApprovalRequest,
    timeoutMs: number,
    notifyVia?: string,
  ): Promise<ApprovalResult>;
  export function parseTimeout(timeoutStr: string): number;
  export function setApprovalLogger(logger: ((level: 'info' | 'warn', message: string) => void) | null): void;
  export function checkLimit(input: { currency?: string }): Promise<any>;
  export function requestApproval(input: any): Promise<any>;
  export function logDecision(entry: DecisionEntry): Promise<void>;
  export function getAuditLog(limit?: number): Promise<DecisionEntry[]>;

  export const name: string;
}
