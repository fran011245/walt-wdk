/**
 * Comando: crear wallet WDK (seed + persistencia segura).
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { WdkClient } from '@walt-wdk/core';
import QRCode from 'qrcode';
import { saveWallet, hasWallet } from '../utils/wallet-store.js';
import { isValidWalletName, normalizeNetwork } from '../utils/validation.js';

export interface CreateWalletInput {
  name: string;
  network?: string;
  backup?: boolean;
}

export interface CreateWalletOutput {
  success: boolean;
  address: string;
  name: string;
  network: string;
  qrCode?: string;
  warning?: string;
}

export async function createWallet(input: CreateWalletInput): Promise<CreateWalletOutput> {
  const name = input.name.trim();
  if (!isValidWalletName(name)) {
    throw new Error('Invalid wallet name. Use only letters, numbers, dash and underscore (1–64 chars).');
  }
  if (await hasWallet(name)) {
    throw new Error(`A wallet named "${name}" already exists.`);
  }
  const network = normalizeNetwork(input.network);

  const seedPhrase = WdkClient.getRandomSeedPhrase();
  const client = WdkClient.fromSeed(seedPhrase);
  try {
    await client.init();
    const address = await client.getAddress(network, 0);
    await saveWallet(name, network, address, seedPhrase);

    let qrCode: string | undefined;
    try {
      qrCode = await QRCode.toDataURL(address, { margin: 2 });
    } catch {
      // ignore QR errors
    }

    const warning =
      'Your private key is encrypted and stored locally. Run "export <name> seed" to backup your recovery phrase.';

    return {
      success: true,
      address,
      name,
      network,
      qrCode,
      warning,
    };
  } finally {
    client.dispose();
  }
}
