import { TransactionModel, TransactionType } from '../models/transaction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

type Listener = () => void;

const DEMO_STUDENT_ID = '3b52c06a-1539-4c17-8df3-f534d6651909';
const STORAGE_PREFIX = '@campuslife_wallet_user_v7_';

const walletMemoryStore: Record<string, string> = {};
const safeWalletStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null && val !== undefined) return val;
      return walletMemoryStore[key] || null;
    } catch {
      return walletMemoryStore[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    walletMemoryStore[key] = value;
    try {
      await AsyncStorage.setItem(key, value);
    } catch {}
  },
};

const DEFAULT_DEMO_TRANSACTIONS: TransactionModel[] = [];

class WalletService {
  private static instance: WalletService;
  private listeners: Set<Listener> = new Set();

  private currentUserId: string | null = null;
  private balance: number = 0;
  private selectedMonth: string = 'September';
  private transactions: TransactionModel[] = [];

  private constructor() {
    this.selectedMonth = this.getDeviceMonthName();
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private getDeviceMonthName(): string {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return months[new Date().getMonth()];
  }

  private getStorageKey(userId: string): string {
    return `${STORAGE_PREFIX}${userId}`;
  }

  public async setUserId(userId: string | null): Promise<void> {
    this.currentUserId = userId;

    this.balance = 0;
    this.transactions = [];

    if (!userId) {
      this.notify();
      return;
    }

    try {
      const storageKey = this.getStorageKey(userId);
      const savedData = await safeWalletStorage.getItem(storageKey);

      if (savedData) {
        const parsed = JSON.parse(savedData);
        const storedBalance = typeof parsed.balance === 'number' ? parsed.balance : 0;
        const storedTransactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];

        const hasLegacyDemo =
          storedBalance === 1000025 ||
          storedTransactions.some(
            (t: TransactionModel) =>
              t.id === 'tx_1' ||
              t.id === 'tx_inc_1' ||
              t.title === 'Lightstick Babymonster' ||
              t.title === 'Uang Bulanan Ortu'
          );

        if (hasLegacyDemo) {
          this.balance = 0;
          this.transactions = [];
          await this.saveToStorage();
        } else {
          this.balance = storedBalance;
          this.transactions = storedTransactions;
        }
      } else {
        await this.saveToStorage();
      }

      this.syncWithSupabase(userId);
    } catch (e) {
      console.warn('Wallet load error:', e);
    }

    this.notify();
  }

  public getUserId(): string | null {
    return this.currentUserId;
  }

  public getBalance(): number {
    return this.balance;
  }

  public getSelectedMonth(): string {
    return this.selectedMonth;
  }

  public setSelectedMonth(month: string): void {
    this.selectedMonth = month;
    this.notify();
  }

  public getTransactions(): TransactionModel[] {
    return [...this.transactions];
  }

  public getMonthlySpent(month: string): number {
    return this.transactions
      .filter((t) => t.month.toLowerCase() === month.toLowerCase() && t.type === 'spent')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public getCurrentMonthSpent(): number {
    return this.getMonthlySpent(this.selectedMonth);
  }

  public async addTransaction(params: {
    title: string;
    amount: number;
    type: TransactionType;
    iconName?: string;
  }): Promise<void> {
    const now = new Date();
    const newTx: TransactionModel = {
      id: `tx_${Date.now()}`,
      title: params.title,
      dateText: `${now.getDate()} ${this.selectedMonth} | ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      amount: params.amount,
      type: params.type,
      iconName: params.iconName || (params.type === 'income' ? 'wallet' : 'restaurant'),
      month: this.selectedMonth,
    };

    this.transactions.unshift(newTx);
    if (params.type === 'income') {
      this.balance += params.amount;
    } else {
      this.balance -= params.amount;
    }

    await this.saveToStorage();
    this.notify();

    if (this.currentUserId) {
      this.syncTransactionToSupabase(this.currentUserId, newTx, this.balance);
    }
  }

  private async saveToStorage(): Promise<void> {
    if (!this.currentUserId) return;
    try {
      const storageKey = this.getStorageKey(this.currentUserId);
      await safeWalletStorage.setItem(
        storageKey,
        JSON.stringify({
          balance: this.balance,
          transactions: this.transactions,
        })
      );
    } catch (e) {
      console.warn('Failed to save wallet storage:', e);
    }
  }

  private async syncWithSupabase(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        const remoteBalance = Number(data.balance);
        if (remoteBalance === 1000025) {
          this.balance = 0;
          await supabase.from('wallets').update({ balance: 0 }).eq('user_id', userId);
          await this.saveToStorage();
          this.notify();
        } else {
          this.balance = remoteBalance;
          await this.saveToStorage();
          this.notify();
        }
      } else if (error && (error.code === 'PGRST116' || error.message?.includes('No rows'))) {
        await supabase.from('wallets').insert({
          user_id: userId,
          balance: this.balance,
        });
      }
    } catch {
    }
  }

  private async syncTransactionToSupabase(
    userId: string,
    tx: TransactionModel,
    newBalance: number
  ): Promise<void> {
    try {
      await supabase.from('wallets').upsert({ user_id: userId, balance: newBalance });
      await supabase.from('transactions').insert({
        id: tx.id,
        user_id: userId,
        title: tx.title,
        amount: tx.amount,
        type: tx.type,
        icon_name: tx.iconName,
        month: tx.month,
        date_text: tx.dateText,
      });
    } catch {
    }
  }
}

export const walletService = WalletService.getInstance();
