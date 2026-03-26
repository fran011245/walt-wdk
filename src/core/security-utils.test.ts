/**
 * Tests for security-utils address validation (EIP-55).
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { describe, it, expect } from 'vitest';
import { isValidEvmAddress } from './security-utils.js';

describe('isValidEvmAddress', () => {
  it('accepts all-lowercase and all-uppercase', () => {
    expect(isValidEvmAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa96045')).toBe(true);
    expect(isValidEvmAddress('0xD8DA6BF26964AF9D7EED9E03E53415D37AA96045')).toBe(true);
  });

  it('accepts correct EIP-55 checksum', () => {
    expect(isValidEvmAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toBe(true);
  });

  it('rejects incorrect mixed-case checksum', () => {
    expect(isValidEvmAddress('0xd8Da6BF26964aF9D7eEd9e03E53415D37aA96045')).toBe(false);
  });

  it('rejects wrong length and missing prefix', () => {
    expect(isValidEvmAddress('0xabc')).toBe(false);
    expect(isValidEvmAddress('d8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toBe(false);
  });
});
