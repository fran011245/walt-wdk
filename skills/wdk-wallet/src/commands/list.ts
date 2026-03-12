/**
 * Comando: listar todos los wallets guardados.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { listWallets, getWalletSeed } from '../utils/wallet-store.js';
import { WdkClient } from '@walt-wdk/core';

export interface ListWalletItem {
  name: string;
  address: string;
  network: string;
  hasBalance: boolean;
}

export interface ListOutput {
  wallets: ListWalletItem[];
}

/**
 * Lista wallets. hasBalance se resuelve con un balance > 0 (nativo o no) cuando sea posible.
 */
export async function listWalletsCommand(): Promise<ListOutput> {
  const metas = await listWallets();
  const wallets: ListWalletItem[] = [];

  for (const meta of metas) {
    let hasBalance = false;
    try {
      const seed = await getWalletSeed(meta.name);
      const client = WdkClient.fromSeed(seed);
      try {
        await client.init();
        const bal = await client.getBalance(meta.network as 'ethereum' | 'base' | 'polygon' | 'tron', 0);
        hasBalance = bal > 0n;
      } finally {
        client.dispose();
      }
    } catch {
      // si falla lectura o balance, dejamos hasBalance en false
    }
    wallets.push({
      name: meta.name,
      address: meta.address,
      network: meta.network,
      hasBalance,
    });
  }

  return { wallets };
}
