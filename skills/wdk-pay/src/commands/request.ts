/**
 * Comando: generar payment request (link + QR).
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import QRCode from 'qrcode';
import { getWalletMeta, getDefaultWalletName } from '../utils/wallet-resolver.js';
import { validateAmount, validateToken } from '../utils/validation.js';

export interface RequestInput {
  from: string;  // wallet name (who receives)
  amount: string;
  token: 'USDT' | 'USDC';
}

export interface RequestOutput {
  paymentRequestUrl: string;
  qrCodeDataUrl?: string;
  address: string;
  amount: string;
  token: string;
  network: string;
}

/**
 * Genera link/URI y QR para que alguien envíe USDT/USDC a la wallet indicada.
 */
export async function request(input: RequestInput): Promise<RequestOutput> {
  validateAmount(input.amount);
  if (!validateToken(input.token)) throw new Error('Token must be USDT or USDC.');

  const walletName = input.from || (await getDefaultWalletName());
  if (!walletName) throw new Error('No wallet specified. Set "from" or defaultWallet in config.');

  const meta = await getWalletMeta(walletName);
  const params = new URLSearchParams({
    address: meta.address,
    amount: input.amount,
    token: input.token,
    network: meta.network,
  });
  const paymentRequestUrl = `https://walt-wdk.app/pay?${params.toString()}`;

  let qrCodeDataUrl: string | undefined;
  try {
    qrCodeDataUrl = await QRCode.toDataURL(paymentRequestUrl, { margin: 2 });
  } catch {
    // ignore
  }

  return {
    paymentRequestUrl,
    qrCodeDataUrl,
    address: meta.address,
    amount: input.amount,
    token: input.token,
    network: meta.network,
  };
}
