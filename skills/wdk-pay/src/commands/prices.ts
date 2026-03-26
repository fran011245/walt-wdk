/**
 * Comando: consultar precios de USDT/USDC.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { getPrices, formatPrice } from '../utils/price-rates.js';

export interface PricesOutput {
  usdt: string;
  usdc: string;
  timestamp: string;
}

/**
 * Get current USDT and USDC prices in USD.
 * Useful for agents to make informed decisions about value.
 */
export async function prices(): Promise<PricesOutput> {
  const { usdt, usdc } = await getPrices();

  return {
    usdt: formatPrice(usdt),
    usdc: formatPrice(usdc),
    timestamp: new Date().toISOString(),
  };
}
