/**
 * Centralized config load/save and validation for WaltWDK skills.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { homedir } from 'os';

function getConfigDirPath(): string {
  return process.env.WALT_WDK_CONFIG_DIR ?? path.join(homedir(), '.walt-wdk');
}

export interface WaltWdkConfig {
  defaultNetwork?: string;
  defaultWallet?: string;
  encryption?: string;
  /** Agent guard limits (used by wdk-agent-guard). If enabled (default), guard module must be installed. Do not set enabled: false in production without justification. */
  guard?: {
    /** When true or omitted, guard checks run and the guard package is required. Set false only for local/dev. */
    enabled?: boolean;
    dailyLimit?: { amount: string; currency: string };
    perTransactionLimit?: { amount: string; currency: string };
    requireApproval?: { overAmount: string; notifyVia?: string; timeout?: string };
    whitelist?: Array<{ address: string; name?: string; skipApproval?: boolean }>;
    blacklist?: string[];
  };
  [key: string]: unknown;
}

const defaultConfig: WaltWdkConfig = {
  defaultNetwork: 'base',
  defaultWallet: undefined,
  encryption: 'aes-256-gcm',
};

/**
 * Load config from ~/.walt-wdk/config.json. Creates dir and file with defaults if missing.
 */
export async function loadConfig(): Promise<WaltWdkConfig> {
  const dir = getConfigDirPath();
  const configFile = path.join(dir, 'config.json');
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true, mode: 0o700 });
  }
  if (!existsSync(configFile)) {
    await saveConfig(defaultConfig);
    return { ...defaultConfig };
  }
  const raw = await readFile(configFile, 'utf-8');
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  return { ...defaultConfig, ...parsed };
}

/**
 * Save config to ~/.walt-wdk/config.json.
 */
export async function saveConfig(config: WaltWdkConfig): Promise<void> {
  const dir = getConfigDirPath();
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true, mode: 0o700 });
  }
  await writeFile(path.join(dir, 'config.json'), JSON.stringify(config, null, 2), {
    encoding: 'utf-8',
    mode: 0o600,
  });
}

/**
 * Get config (alias for loadConfig for backward compatibility).
 */
export async function getConfig(): Promise<WaltWdkConfig> {
  return loadConfig();
}

/** Sync helper: get config path for other modules (e.g. secrets dir). */
export function getConfigDir(): string {
  return getConfigDirPath();
}
