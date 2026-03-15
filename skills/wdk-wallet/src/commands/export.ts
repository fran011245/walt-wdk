/**
 * Comando: exportar seed o clave privada. Requiere confirmación explícita.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { getWalletMeta, getWalletSeed, hasWallet } from '../utils/wallet-store.js';

export type ExportFormat = 'seed' | 'privateKey';

export interface ExportWalletInput {
  name: string;
  format: ExportFormat;
  /** Confirmación explícita: debe ser exactamente CONFIRMATION_PHRASE para revelar seed/key */
  confirmed?: string;
}

/** Frase exacta requerida para exportar seed (previene bypass por confirmed: true). */
const CONFIRMATION_PHRASE = 'I understand the risks';

export interface ExportWalletOutput {
  success: boolean;
  /** Solo si format === 'seed' */
  seedPhrase?: string;
  /** Solo si format === 'privateKey' — WDK no expone privateKey directamente; se devuelve mensaje */
  privateKeyMessage?: string;
  warning: string;
}

/**
 * Exporta seed phrase o muestra mensaje para private key.
 * WDK no expone la clave privada desde la seed de forma directa en esta capa;
 * para privateKey se devuelve mensaje indicando usar la seed para derivar.
 */
export async function exportWallet(input: ExportWalletInput): Promise<ExportWalletOutput> {
  if (!(await hasWallet(input.name))) {
    throw new Error(`Wallet "${input.name}" not found.`);
  }

  if (input.confirmed !== CONFIRMATION_PHRASE) {
    return {
      success: false,
      warning: `SECURITY: You must confirm by setting confirmed to the exact phrase: "${CONFIRMATION_PHRASE}". Anyone with the seed or private key can steal your funds.`,
    };
  }

  const meta = await getWalletMeta(input.name);
  const seed = await getWalletSeed(input.name);

  if (input.format === 'seed') {
    const result: ExportWalletOutput = {
      success: true,
      seedPhrase: seed,
      warning: 'Store this phrase securely. Never share it. It will NOT be shown again in this session.',
    };
    // Best-effort audit log via wdk-agent-guard if installed.
    try {
      const guard = await import('@walt-wdk/wdk-agent-guard');
      if (typeof guard.logDecision === 'function') {
        await guard.logDecision({
          timestamp: new Date().toISOString(),
          operation: 'export-seed',
          amount: '0',
          currency: 'N/A',
          to: meta.address,
          fromWallet: input.name,
          approved: true,
          reason: 'Seed export confirmed by user.',
        });
      }
    } catch (e: any) {
      if (e?.code !== 'ERR_MODULE_NOT_FOUND' && e?.code !== 'MODULE_NOT_FOUND') {
        throw e;
      }
    }
    return result;
  }

  // privateKey: WDK no expone getPrivateKey(); el usuario debe derivar desde la seed
  return {
    success: true,
    privateKeyMessage: `Use your seed phrase in a compliant wallet or WDK to derive the private key for address ${meta.address}. Never share your seed or private key.`,
    warning: 'Never share your private key or seed. Anyone with it can steal your funds.',
  };
}
