/**
 * Comando: exportar seed o clave privada. Requiere confirmación explícita.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { getWalletMeta, getWalletSeed, hasWallet } from '../utils/wallet-store.js';

export type ExportFormat = 'seed' | 'privateKey';

export interface ExportWalletInput {
  name: string;
  format: ExportFormat;
  /** Confirmación explícita del usuario (ej. "I understand") */
  confirmed?: boolean;
}

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

  if (!input.confirmed) {
    return {
      success: false,
      warning:
        'SECURITY: You must confirm by setting confirmed=true or saying "I understand" before the seed or key is revealed. Anyone with this data can steal your funds.',
    };
  }

  const meta = await getWalletMeta(input.name);
  const seed = await getWalletSeed(input.name);

  if (input.format === 'seed') {
    return {
      success: true,
      seedPhrase: seed,
      warning: 'Store this phrase securely. Never share it. It will NOT be shown again in this session.',
    };
  }

  // privateKey: WDK no expone getPrivateKey(); el usuario debe derivar desde la seed
  return {
    success: true,
    privateKeyMessage: `Use your seed phrase in a compliant wallet or WDK to derive the private key for address ${meta.address}. Never share your seed or private key.`,
    warning: 'Never share your private key or seed. Anyone with it can steal your funds.',
  };
}
