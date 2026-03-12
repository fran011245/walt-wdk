/**
 * Resuelve seed de wallet por nombre leyendo el mismo store que wdk-wallet.
 * No depende del paquete wdk-wallet; usa @walt-wdk/core y el layout de archivos.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getConfigDir, decrypt, getEncryptionPassword } from '@walt-wdk/core';

const WALLETS_MANIFEST = 'wallets.json';
const SECRETS_SUBDIR = 'secrets';

export interface WalletMeta {
  name: string;
  network: string;
  address: string;
  createdAt: string;
}

function getManifestPath(): string {
  return path.join(getConfigDir(), WALLETS_MANIFEST);
}

function getSecretPath(name: string): string {
  return path.join(getConfigDir(), SECRETS_SUBDIR, `wdk-wallet.${name}.key`);
}

export async function getWalletSeed(name: string): Promise<string> {
  const p = getSecretPath(name);
  if (!existsSync(p)) throw new Error(`Wallet "${name}" not found.`);
  const encrypted = await readFile(p, 'utf-8');
  const password = await getEncryptionPassword();
  return decrypt(encrypted, password);
}

export async function getWalletMeta(name: string): Promise<WalletMeta> {
  const manifestPath = getManifestPath();
  if (!existsSync(manifestPath)) throw new Error(`Wallet "${name}" not found.`);
  const raw = await readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(raw) as { wallets: Record<string, WalletMeta> };
  const meta = manifest.wallets?.[name];
  if (!meta) throw new Error(`Wallet "${name}" not found.`);
  return meta;
}

export async function getDefaultWalletName(): Promise<string | undefined> {
  try {
    const { loadConfig } = await import('@walt-wdk/core');
    const config = await loadConfig();
    return config.defaultWallet as string | undefined;
  } catch {
    return undefined;
  }
}
