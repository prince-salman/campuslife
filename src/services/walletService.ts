import { TransactionModel, TransactionType } from '../models/transaction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

type Listener = () => void;

const DEMO_STUDENT_ID = '3b52c06a-1539-4c17-8df3-f534d6651909';
const STORAGE_PREFIX = '@campuslife_wallet_user_';

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

const DEFAULT_DEMO_TRANSACTIONS: TransactionModel[] = [
  {
    id: 'tx_1',
    title: 'Makan siang',
    dateText: '17 September | 4pm',
    amount: 15000,
    type: 'spent',
    iconName: 'restaurant',
    month: 'September',
  },
  {
    id: 'tx_2',
    title: 'Gojek',
    dateText: '19 September | 9am',
    amount: 34000,
    type: 'spent',
    iconName: 'car',
    month: 'September',
  },
  {
    id: 'tx_3',
    title: 'Fotocopy Berkas',
    dateText: '21 September | 2pm',
    amount: 2000,
    type: 'spent',
    iconName: 'document',
    month: 'September',
  },
  {
    id: 'tx_4',
    title: 'Lightstick Babymonster',
    dateText: '28 September | 2pm',
    amount: 680000,
    type: 'spent',
    iconName: 'gift',
    month: 'September',
  },
  {
    id: 'tx_inc_1',
    title: 'Uang Bulanan Ortu',
    dateText: '01 September | 10am',
    amount: 1500000,
    type: 'income',
    iconName: 'wallet',
    month: 'September',
  },
  {
    id: 'tx_inc_2',
    title: 'Gaji Asisten Dosen',
    dateText: '15 September | 3pm',
    amount: 450000,
    type: 'income',
    iconName: 'briefcase',
    month: 'September',
  },
];

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

  /**
   * Set user context and load their private isolated wallet data.
   * New registrations default strictly to Rp 0 balance and [] transactions.
   * Existing accounts retain their preserved balance and history.
   */
  public async setUserId(userId: string | null): Promise<void> {
    this.currentUserId = userId;

    if (!userId) {
      this.balance = 0;
      this.transactions = [];
      this.notify();
      return;
    }

    // Set immediate isolated in-memory default before async read
    if (userId === DEMO_STUDENT_ID) {
      this.balance = 1000025;
      this.transactions = [...DEFAULT_DEMO_TRANSACTIONS];
    } else {
      // ANY NEW REGISTRATION STRICTLY DEFAULTS TO 0 RUPIAH
      this.balance = 0;
      this.transactions = [];
    }

    try {
      const storageKey = this.getStorageKey(userId);
      const savedData = await safeWalletStorage.getItem(storageKey);

      if (savedData) {
        // Preserved existing user data
        const parsed = JSON.parse(savedData);
        this.balance = typeof parsed.balance === 'number' ? parsed.balance : 0;
        this.transactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];
      } else {
        await this.saveToStorage();
      }

      // Background remote sync with Supabase
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
        this.balance = Number(data.balance);
        await this.saveToStorage();
        this.notify();
      } else if (error && (error.code === 'PGRST116' || error.message?.includes('No rows'))) {
        await supabase.from('wallets').insert({
          user_id: userId,
          balance: this.balance,
        });
      }
    } catch {
      // Offline / unauthenticated fallback
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
      // Offline / unauthenticated fallback
    }
  }
}

export const walletService = WalletService.getInstance();