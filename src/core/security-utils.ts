/**
 * Encryption, validation, and secrets handling for WaltWDK.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALG = 'aes-256-gcm';
const KEY_LEN = 32;
const IV_LEN = 16;
const SALT_LEN = 32;
const TAG_LEN = 16;

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
 * Validate Ethereum/EVM address (0x + 40 hex). Does not checksum.
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
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
export function getEncryptionPassword(): string {
  const env = process.env.WALT_WDK_SECRET_KEY ?? process.env.OPENCLAW_SECRET_KEY;
  if (env) return env;
  return (process.env.HOME ?? '') + (process.env.USER ?? '') + '.walt-wdk-default'; // fallback for dev only
}
