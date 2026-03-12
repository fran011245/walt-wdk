/**
 * WDK client wrapper — uses official @tetherto/wdk packages.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import WDK from '@tetherto/wdk';
import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import WalletManagerTron from '@tetherto/wdk-wallet-tron';

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

/** Default RPC URLs per network (public endpoints) */
const NETWORK_PROVIDERS: Record<WdkNetwork, string> = {
  ethereum: 'https://eth.drpc.org',
  base: 'https://mainnet.base.org',
  polygon: 'https://polygon-rpc.com',
  tron: 'https://api.trongrid.io',
};

/** EVM-based networks that use WalletManagerEvm */
const EVM_NETWORKS: WdkNetwork[] = ['ethereum', 'base', 'polygon'];

/**
 * Wraps Tether WDK: one instance per seed phrase.
 * Register EVM and TRON wallets; expose getAccount, getBalance, sendTransaction, transfer.
 */
export class WdkClient {
  private wdk: InstanceType<typeof WDK> | null = null;
  private readonly seed: string | Uint8Array;

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

    this.wdk = new WDK(this.seed)
      .registerWallet('ethereum', WalletManagerEvm, { provider: NETWORK_PROVIDERS.ethereum })
      .registerWallet('base', WalletManagerEvm, { provider: NETWORK_PROVIDERS.base })
      .registerWallet('polygon', WalletManagerEvm, { provider: NETWORK_PROVIDERS.polygon })
      .registerWallet('tron', WalletManagerTron, { provider: NETWORK_PROVIDERS.tron });
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
  }
}
