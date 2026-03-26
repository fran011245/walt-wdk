import { describe, it, expect } from 'vitest';
import { prices } from '../src/commands/prices.js';
import { getPrices, formatPrice, calculateUsdValue } from '../src/utils/price-rates.js';

describe('wdk-pay > prices', () => {
  it('prices() returns formatted USDT and USDC prices', async () => {
    const result = await prices();

    expect(result).toHaveProperty('usdt');
    expect(result).toHaveProperty('usdc');
    expect(result).toHaveProperty('timestamp');

    // Should be formatted as $X.XXXX
    expect(result.usdt).toMatch(/^\$\d+\.\d{4}$/);
    expect(result.usdc).toMatch(/^\$\d+\.\d{4}$/);
  });

  it('getPrices() returns numeric prices', async () => {
    const result = await getPrices();

    expect(result).toHaveProperty('usdt');
    expect(result).toHaveProperty('usdc');
    expect(typeof result.usdt).toBe('number');
    expect(typeof result.usdc).toBe('number');

    // Stablecoins should be close to $1.00
    expect(result.usdt).toBeGreaterThan(0.95);
    expect(result.usdt).toBeLessThan(1.05);
    expect(result.usdc).toBeGreaterThan(0.95);
    expect(result.usdc).toBeLessThan(1.05);
  });

  it('formatPrice() formats correctly', () => {
    expect(formatPrice(1.0)).toBe('$1.0000');
    expect(formatPrice(0.9998)).toBe('$0.9998');
    expect(formatPrice(1.0002)).toBe('$1.0002');
  });

  it('calculateUsdValue() calculates correctly', () => {
    expect(calculateUsdValue('100', 1.0)).toBe('$100.00');
    expect(calculateUsdValue('50.5', 1.0)).toBe('$50.50');
    expect(calculateUsdValue('0', 1.0)).toBe('$0.00');
  });
});
