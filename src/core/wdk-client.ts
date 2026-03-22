/**
 * WDK client wrapper — uses official @tetherto/wdk packages.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import WDK from '@tetherto/wdk';
import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import WalletManagerTron from '@tetherto/wdk-wallet-tron';
import TronWeb from 'tronweb';

import { loadConfig } from './config-manager.js';
import { resolveRpcProviders } from './rpc-resolve.js';

/** Supported network identifiers for the wrapper */
export type WdkNetwork = 'ethereum' | 'base' | 'polygon' | 'tron';

/** Normalized account interface returned by WdkClient */
export interface WdkAccount {
  address: string;
  getBalance: () => Promise<bigint>;
  getTokenBalance: (tokenAddress: string) => Promise<bigint>;
  sendTransaction: (tx: { to: string; value: bigint; data?: string }) => Promise<{ hash: string }>;
  transfer: (options: { to: string; token: string; amount: bigint }) => Promise<{ hash: string }>;
}

/** Raw WDK account with getAddress and transfer(recipient) */
interface WdkAccountRaw {
  getAddress(): Promise<string>;
  getBalance(): Promise<bigint>;
  getTokenBalance(tokenAddress: string): Promise<bigint>;
  sendTransaction(tx: { to: string; value: bigint; data?: string }): Promise<{ hash: string }>;
  transfer(options: { token: string; recipient: string; amount: number | bigint }): Promise<{ hash: string }>;
}

/**
 * Wraps Tether WDK: one instance per seed phrase.
 * Register EVM and TRON wallets; expose getAccount, getBalance, sendTransaction, transfer.
 */
export class WdkClient {
  private wdk: InstanceType<typeof WDK> | null = null;
  private seed: string | Uint8Array | null;

  private constructor(seed: string | Uint8Array) {
    this.seed = seed;
  }

  /**
   * Create a client from an existing BIP-39 seed phrase.
   * Call init() before using getAccount/getBalance/sendTransaction.
   */
  static fromSeed(seed: string | Uint8Array): WdkClient {
    if (!WDK.isValidSeed(seed)) {
      throw new Error('Invalid seed phrase or bytes.');
    }
    return new WdkClient(seed);
  }

  /** Generate a new BIP-39 seed phrase (for wallet creation). */
  static getRandomSeedPhrase(): string {
    return WDK.getRandomSeedPhrase();
  }

  /** Register wallet modules and prepare for getAccount/getBalance. Idempotent. */
  async init(): Promise<void> {
    if (this.wdk !== null) return;

    if (this.seed == null) {
      throw new Error('WdkClient has been disposed and cannot be reused.');
    }

    const cfg = await loadConfig();
    const providers = resolveRpcProviders(cfg);

    const tronProvider =
      providers.tron.kind === 'authed'
        ? new TronWeb({
            fullHost: providers.tron.fullHost,
            headers: { 'TRON-PRO-API-KEY': providers.tron.apiKey },
          })
        : providers.tron.fullHost;

    this.wdk = new WDK(this.seed)
      .registerWallet('ethereum', WalletManagerEvm, { provider: providers.ethereum })
      .registerWallet('base', WalletManagerEvm, { provider: providers.base })
      .registerWallet('polygon', WalletManagerEvm, { provider: providers.polygon })
      .registerWallet('tron', WalletManagerTron, { provider: tronProvider });

    // Best-effort: clear seed reference after initializing WDK instance.
    if (typeof this.seed === 'string') {
      this.seed = null;
    } else if (this.seed instanceof Uint8Array) {
      this.seed.fill(0);
      this.seed = null;
    }
  }

  /** Resolve WDK blockchain name (EVM and tron). */
  getBlockchain(network: WdkNetwork): string {
    return network;
  }

  /** Get account for network at index (default 0). Must call init() first. */
  async getAccount(network: WdkNetwork, index = 0): Promise<WdkAccount> {
    if (this.wdk === null) await this.init();
    const blockchain = this.getBlockchain(network);
    const account = await this.wdk!.getAccount(blockchain, index) as WdkAccountRaw;
    const address = await account.getAddress();
    return {
      address,
      getBalance: () => account.getBalance(),
      getTokenBalance: (tokenAddress: string) => account.getTokenBalance(tokenAddress),
      sendTransaction: (tx: { to: string; value: bigint; data?: string }) =>
        account.sendTransaction({ to: tx.to, value: tx.value, data: tx.data }),
      transfer: (options: { to: string; token: string; amount: bigint }) =>
        account.transfer({ token: options.token, recipient: options.to, amount: options.amount }),
    };
  }

  /** Get address for network (index 0). */
  async getAddress(network: WdkNetwork, index = 0): Promise<string> {
    const acc = await this.getAccount(network, index);
    return acc.address;
  }

  /** Get native balance (wei/sun). */
  async getBalance(network: WdkNetwork, index = 0): Promise<bigint> {
    const acc = await this.getAccount(network, index);
    return acc.getBalance();
  }

  /** Get token balance by contract address (base units). */
  async getTokenBalance(network: WdkNetwork, tokenAddress: string, index = 0): Promise<bigint> {
    const acc = await this.getAccount(network, index);
    return acc.getTokenBalance(tokenAddress);
  }

  /** Send native transaction. Returns tx hash. */
  async sendTransaction(network: WdkNetwork, params: { to: string; value: bigint; data?: string }, index = 0): Promise<{ hash: string }> {
    const acc = await this.getAccount(network, index);
    return acc.sendTransaction({ to: params.to, value: params.value, data: params.data });
  }

  /** Transfer ERC20/TRC20 token. Token is contract address. */
  async transfer(network: WdkNetwork, options: { to: string; token: string; amount: bigint }, index = 0): Promise<{ hash: string }> {
    const acc = await this.getAccount(network, index);
    return acc.transfer({ to: options.to, token: options.token, amount: options.amount });
  }

  /** Release in-memory seed and wallets. Call when done. */
  dispose(): void {
    if (this.wdk) {
      this.wdk.dispose();
      this.wdk = null;
    }
    if (typeof this.seed === 'string') {
      this.seed = null;
    } else if (this.seed instanceof Uint8Array) {
      this.seed.fill(0);
      this.seed = null;
    }
  }
}
