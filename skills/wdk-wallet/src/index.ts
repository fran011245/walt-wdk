/**
 * wdk-wallet skill — Create and manage Tether WDK wallets.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

export const name = 'wdk-wallet';

export { createWallet } from './commands/create.js';
export type { CreateWalletInput, CreateWalletOutput } from './commands/create.js';

export { getBalance } from './commands/balance.js';
export type { BalanceInput, BalanceOutput } from './commands/balance.js';

export { listWalletsCommand } from './commands/list.js';
export type { ListOutput, ListWalletItem } from './commands/list.js';

export { exportWallet } from './commands/export.js';
export type { ExportWalletInput, ExportWalletOutput, ExportFormat } from './commands/export.js';

export { hasWallet, listWallets, getWalletMeta } from './utils/wallet-store.js';
export type { WalletMeta } from './utils/wallet-store.js';
export { isValidWalletName, isValidNetwork, normalizeNetwork, SUPPORTED_NETWORKS } from './utils/validation.js';
