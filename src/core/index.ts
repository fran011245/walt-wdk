/**
 * @walt-wdk/core — shared WDK client, config, and security for WaltWDK skills.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

export { WdkClient, WdkNetwork, WdkAccount } from './wdk-client.js';
export {
  loadConfig,
  saveConfig,
  getConfig,
  getConfigDir,
  type WaltWdkConfig,
  type WaltWdkRpcConfig,
} from './config-manager.js';
export { resolveRpcProviders, type ResolvedRpcProviders, type ResolvedTronProvider } from './rpc-resolve.js';
export {
  encrypt,
  decrypt,
  isValidEvmAddress,
  isValidTronAddress,
  isValidAddress,
  getEncryptionPassword,
  getOrCreateMasterKey,
  migrateEncryptedFiles,
} from './security-utils.js';
