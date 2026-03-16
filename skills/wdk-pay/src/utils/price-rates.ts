/**
 * Price rates utility — fetch USDT/USDC prices for informed agent decisions.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { Decimal } from 'decimal.js';

const PRICE_CACHE_TTL_MS = 60_000; // 1 minute cache
const FETCH_TIMEOUT_MS = 10_000; // 10 seconds

interface PriceCache {
  usdt: number;
  usdc: number;
  timestamp: number;
}

let priceCache: PriceCache | null = null;

/**
 * Fetch current USDT and USDC prices in USD.
 * Uses CoinGecko API (free tier, no API key required).
 * Cached for 1 minute to avoid rate limits.
 */
export async function getPrices(): Promise<{ usdt: number; usdc: number }> {
  // Return cached prices if fresh
  if (priceCache && Date.now() - priceCache.timestamp < PRICE_CACHE_TTL_MS) {
    return { usdt: priceCache.usdt, usdc: priceCache.usdc };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=tether,usd-coin&vs_currencies=usd',
      { headers: { 'Accept': 'application/json' }, signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Price API error: ${response.status}`);
    }

    const data = await response.json() as {
      tether: { usd: number };
      'usd-coin': { usd: number };
    };

    priceCache = {
      usdt: data.tether.usd,
      usdc: data['usd-coin'].usd,
      timestamp: Date.now(),
    };

    return { usdt: priceCache.usdt, usdc: priceCache.usdc };
  } catch (error) {
    // Fallback to $1.00 if API fails (stablecoins should be ~1.00)
    console.warn('Price fetch failed, using fallback:', error);
    return { usdt: 1.0, usdc: 1.0 };
  }
}

/**
 * Format price with 4 decimal places.
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(4)}`;
}

/**
 * Calculate USD value of token amount.
 * Uses Decimal.js for precision consistency with guard and pay.
 */
export function calculateUsdValue(amount: string, price: number): string {
  let n: Decimal;
  try {
    n = new Decimal(amount);
  } catch {
    return '$0.00';
  }
  if (n.lessThan(0)) return '$0.00';
  const value = n.times(price);
  return `$${value.toFixed(2)}`;
}
