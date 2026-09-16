import { TransactionModel, TransactionType } from '../models/transaction';

type Listener = () => void;

class WalletService {
  private static instance: WalletService;
  private listeners: Set<Listener> = new Set();

  private balance: number = 1000025;
  private selectedMonth: string = 'Agustus';

  private transactions: TransactionModel[] = [
    {
      id: 'tx_1',
      title: 'Makan siang',
      dateText: '17 Agustus | 4pm',
      amount: 15000,
      type: 'spent',
      iconName: 'restaurant',
      month: 'Agustus',
    },
    {
      id: 'tx_2',
      title: 'Gojek',
      dateText: '19 Agustus | 9am',
      amount: 34000,
      type: 'spent',
      iconName: 'car',
      month: 'Agustus',
    },
    {
      id: 'tx_3',
      title: 'Fotocopy Berkas',
      dateText: '21 Agustus | 2pm',
      amount: 2000,
      type: 'spent',
      iconName: 'document',
      month: 'Agustus',
    },
    {
      id: 'tx_4',
      title: 'Lightstick Babymonster',
      dateText: '28 Agustus | 2pm',
      amount: 680000,
      type: 'spent',
      iconName: 'gift',
      month: 'Agustus',
    },
    {
      id: 'tx_inc_1',
      title: 'Uang Bulanan Ortu',
      dateText: '01 Agustus | 10am',
      amount: 1500000,
      type: 'income',
      iconName: 'wallet',
      month: 'Agustus',
    },
    {
      id: 'tx_inc_2',
      title: 'Gaji Asisten Dosen',
      dateText: '15 Agustus | 3pm',
      amount: 450000,
      type: 'income',
      iconName: 'briefcase',
      month: 'Agustus',
    },
  ];

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
      .filter((t) => t.month === month && t.type === 'spent')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public getCurrentMonthSpent(): number {
    return this.getMonthlySpent(this.selectedMonth);
  }

  public addTransaction(params: {
    title: string;
    amount: number;
    type: TransactionType;
    iconName?: string;
  }): void {
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
    this.notify();
  }

  private currentUserId: string | null = null;

  public setUserId(userId: string | null): void {
    this.currentUserId = userId;
  }

  public getUserId(): string | null {
    return this.currentUserId;
  }
}

export const walletService = WalletService.getInstance();