/**
 * wdk-pay skill — Send and receive USDT/USDC via Tether WDK.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

export const name = 'wdk-pay';

export { send } from './commands/send.js';
export type { SendInput, SendOutput } from './commands/send.js';

export { request } from './commands/request.js';
export type { RequestInput, RequestOutput } from './commands/request.js';

export { history } from './commands/history.js';
export type { HistoryOutput, HistoryTransaction } from './commands/history.js';

export { generateQrDataUrl } from './commands/qr.js';

export { prices } from './commands/prices.js';
export type { PricesOutput } from './commands/prices.js';

export { getWalletMeta, getWalletSeed, getDefaultWalletName } from './utils/wallet-resolver.js';
export type { WalletMeta } from './utils/wallet-resolver.js';
export {
  parseTokenAmount,
  formatTokenAmount,
  getTokenAddress,
  TOKEN_ADDRESSES,
  EXPLORER_TX_URL,
} from './utils/tx-builder.js';
export { validateAmount, validateAddress, validateToken } from './utils/validation.js';
export { getPrices, formatPrice, calculateUsdValue } from './utils/price-rates.js';
