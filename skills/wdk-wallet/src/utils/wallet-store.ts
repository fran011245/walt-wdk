/**
 * Persistencia segura de wallets: metadata en JSON y seed encriptado en archivo.
 * Estructura de clave compatible con OpenClaw secrets: wdk-wallet.{name}.key
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getConfigDir, encrypt, decrypt, getEncryptionPassword } from '@walt-wdk/core';

const WALLETS_MANIFEST = 'wallets.json';
const SECRETS_SUBDIR = 'secrets';

/** Wallet name: alphanumeric, dash, underscore; 1–64 chars. Prevents path traversal. */
function assertValidWalletName(name: string): void {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(name)) {
    throw new Error(
      `Invalid wallet name: "${name}". Use only letters, numbers, dash and underscore (1–64 chars).`,
    );
  }
}

export interface WalletMeta {
  name: string;
  network: string;
  address: string;
  createdAt: string;
}

interface Manifest {
  wallets: Record<string, WalletMeta>;
}

function getSecretsDir(): string {
  return path.join(getConfigDir(), SECRETS_SUBDIR);
}

function getManifestPath(): string {
  return path.join(getConfigDir(), WALLETS_MANIFEST);
}

function getSecretPath(name: string): string {
  assertValidWalletName(name);
  return path.join(getSecretsDir(), `wdk-wallet.${name}.key`);
}

async function ensureSecretsDir(): Promise<void> {
  const dir = getSecretsDir();
  if (!existsSync(dir)) await mkdir(dir, { recursive: true, mode: 0o700 });
}

async function loadManifest(): Promise<Manifest> {
  const p = getManifestPath();
  if (!existsSync(p)) return { wallets: {} };
  const raw = await readFile(p, 'utf-8');
  const parsed = JSON.parse(raw) as Partial<Manifest>;
  if (!parsed || typeof parsed !== 'object' || !parsed.wallets || typeof parsed.wallets !== 'object') {
    throw new Error('Corrupted wallets manifest: expected { wallets: Record<string, WalletMeta> }.');
  }
  return parsed as Manifest;
}

async function saveManifest(manifest: Manifest): Promise<void> {
  const dir = getConfigDir();
  if (!existsSync(dir)) await mkdir(dir, { recursive: true, mode: 0o700 });
  await writeFile(getManifestPath(), JSON.stringify(manifest, null, 2), {
    encoding: 'utf-8',
    mode: 0o600,
  });
}

/**
 * Guarda wallet: metadata en manifest y seed encriptado en wdk-wallet.{name}.key
 */
export async function saveWallet(name: string, network: string, address: string, seedPhrase: string): Promise<void> {
  await ensureSecretsDir();
  const password = await getEncryptionPassword();
  const encrypted = encrypt(seedPhrase, password);
  const meta: WalletMeta = { name, network, address, createdAt: new Date().toISOString() };
  const manifest = await loadManifest();
  manifest.wallets[name] = meta;
  await saveManifest(manifest);
  await writeFile(getSecretPath(name), encrypted, { encoding: 'utf-8', mode: 0o600 });
}

/**
 * Obtiene seed phrase desencriptada. Lanza si el wallet no existe.
 */
export async function getWalletSeed(name: string): Promise<string> {
  const p = getSecretPath(name);
  if (!existsSync(p)) throw new Error(`Wallet "${name}" not found.`);
  const encrypted = await readFile(p, 'utf-8');
  const password = await getEncryptionPassword();
  return decrypt(encrypted, password);
}

/**
 * Obtiene metadata del wallet. Lanza si no existe.
 */
export async function getWalletMeta(name: string): Promise<WalletMeta> {
  const manifest = await loadManifest();
  const meta = manifest.wallets[name];
  if (!meta) throw new Error(`Wallet "${name}" not found.`);
  return meta;
}

/**
 * Lista todos los wallets (solo metadata).
 */
export async function listWallets(): Promise<WalletMeta[]> {
  const manifest = await loadManifest();
  return Object.values(manifest.wallets);
}

/**
 * Comprueba si existe un wallet con ese nombre.
 */
export async function hasWallet(name: string): Promise<boolean> {
  const manifest = await loadManifest();
  return name in manifest.wallets;
}

/**
 * Elimina wallet (metadata y archivo de seed). No falla si no existe.
 */
export async function deleteWallet(name: string): Promise<void> {
  const manifest = await loadManifest();
  delete manifest.wallets[name];
  await saveManifest(manifest);
  const p = getSecretPath(name);
  if (existsSync(p)) {
    const { unlink } = await import('fs/promises');
    await unlink(p);
  }
}
