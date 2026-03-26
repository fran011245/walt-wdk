/**
 * Encryption, validation, and secrets handling for WaltWDK.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getConfigDir } from './config-manager.js';
import { keccak_256 } from '@noble/hashes/sha3.js';

const ALG = 'aes-256-gcm';
const KEY_LEN = 32;
const IV_LEN = 16;
const SALT_LEN = 32;
const TAG_LEN = 16;
const MASTER_KEY_FILE = '.master-key';
const SECRETS_SUBDIR = 'secrets';
const LEGACY_SUFFIX = '.walt-wdk-default';

/**
 * Derive a key from password and salt using scrypt.
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, KEY_LEN);
}

/**
 * Encrypt plaintext with AES-256-GCM. Uses a random IV and salt.
 * Format: salt (32) + iv (16) + tag (16) + ciphertext.
 * Password should come from env or a secure secret store.
 */
export function encrypt(data: string, password: string): string {
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = deriveKey(password, salt);
  const cipher = createCipheriv(ALG, key, iv);
  const enc = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, tag, enc]).toString('base64');
}

/**
 * Decrypt data produced by encrypt().
 */
export function decrypt(encryptedBase64: string, password: string): string {
  const buf = Buffer.from(encryptedBase64, 'base64');
  const salt = buf.subarray(0, SALT_LEN);
  const iv = buf.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const tag = buf.subarray(SALT_LEN + IV_LEN, SALT_LEN + IV_LEN + TAG_LEN);
  const ciphertext = buf.subarray(SALT_LEN + IV_LEN + TAG_LEN);
  const key = deriveKey(password, salt);
  const decipher = createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext) + decipher.final('utf8');
}

/**
 * Keccak-256 (64 hex chars) over ASCII bytes of the 40-char lowercase hex body (no 0x). EIP-55.
 */
function eip55HashHex(lowerHex40: string): string {
  const bytes = new Uint8Array(40);
  for (let i = 0; i < 40; i++) bytes[i] = lowerHex40.charCodeAt(i);
  return Array.from(keccak_256(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate Ethereum/EVM address (0x + 40 hex).
 * All-lowercase or all-uppercase: accepted. Mixed-case: only if EIP-55 checksum is valid.
 */
export function isValidEvmAddress(address: string): boolean {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false;
  const body = address.slice(2);
  if (body === body.toLowerCase() || body === body.toUpperCase()) return true;
  const lower = body.toLowerCase();
  const hashHex = eip55HashHex(lower);
  for (let i = 0; i < 40; i++) {
    const c = body[i]!;
    if (c >= '0' && c <= '9') continue;
    const hn = parseInt(hashHex[i]!, 16);
    const wantUpper = hn > 7;
    if (wantUpper && c !== c.toUpperCase()) return false;
    if (!wantUpper && c !== c.toLowerCase()) return false;
  }
  return true;
}

/**
 * Validate TRON address (T + 34 base58).
 */
export function isValidTronAddress(address: string): boolean {
  return /^T[a-zA-HJ-NP-Z0-9]{33}$/.test(address);
}

/**
 * Validate address for a given network (ethereum/base/polygon = EVM, tron = TRON).
 */
export function isValidAddress(address: string, network: string): boolean {
  if (['ethereum', 'base', 'polygon'].includes(network)) return isValidEvmAddress(address);
  if (network === 'tron') return isValidTronAddress(address);
  return isValidEvmAddress(address) || isValidTronAddress(address);
}

/**
 * Get encryption password from env or a default for local dev (not for production).
 */
export async function getEncryptionPassword(): Promise<string> {
  const env = process.env.WALT_WDK_SECRET_KEY ?? process.env.OPENCLAW_SECRET_KEY;
  if (env) return env;
  return getOrCreateMasterKey();
}

/**
 * Generate or read the local master key used to encrypt wallet seeds.
 * Stored at <configDir>/.master-key with mode 0o600.
 */
export async function getOrCreateMasterKey(): Promise<string> {
  const dir = getConfigDir();
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true, mode: 0o700 });
  }
  const keyPath = path.join(dir, MASTER_KEY_FILE);
  if (existsSync(keyPath)) {
    const existing = await readFile(keyPath, 'utf-8');
    return existing.trim();
  }

  const key = randomBytes(KEY_LEN).toString('hex');
  await writeFile(keyPath, key, { encoding: 'utf-8', mode: 0o600 });

  // Best-effort migration of legacy-encrypted secrets.
  await migrateEncryptedFiles(key).catch(() => {
    // ignore migration errors; legacy secrets may not exist or may already be migrated
  });

  return key;
}

function getLegacyPassword(): string | null {
  const home = process.env.HOME ?? '';
  const user = process.env.USER ?? '';
  const combined = home + user;
  if (!combined) return null;
  return combined + LEGACY_SUFFIX;
}

/**
 * Migrate existing wallet secret files that used the legacy deterministic password
 * to the new master key.
 */
export async function migrateEncryptedFiles(newPassword: string): Promise<void> {
  const legacyPassword = getLegacyPassword();
  if (!legacyPassword) return;

  const secretsDir = path.join(getConfigDir(), SECRETS_SUBDIR);
  if (!existsSync(secretsDir)) return;

  const files = await readdir(secretsDir);
  for (const file of files) {
    if (!file.startsWith('wdk-wallet.') || !file.endsWith('.key')) continue;
    const fullPath = path.join(secretsDir, file);
    try {
      const encrypted = await readFile(fullPath, 'utf-8');
      const decrypted = decrypt(encrypted, legacyPassword);
      const reencrypted = encrypt(decrypted, newPassword);
      await writeFile(fullPath, reencrypted, { encoding: 'utf-8', mode: 0o600 });
    } catch {
      // Ignore files that cannot be decrypted with the legacy password.
    }
  }
}
