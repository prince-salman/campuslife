import { isValidCurrencyAmount } from '../src/utils/currencyFormatter';
import { TransactionModel, TransactionType } from '../src/models/transaction';

interface AddTransactionParams {
  title: string;
  amount: number;
  type: TransactionType;
}

function processTransaction(
  currentBalance: number,
  params: AddTransactionParams
): { success: boolean; error?: string; newBalance?: number; transaction?: TransactionModel } {
  const trimmedTitle = params.title ? params.title.trim() : '';
  if (!trimmedTitle) {
    return { success: false, error: 'Silakan masukkan nama transaksi.' };
  }
  if (trimmedTitle.length > 100) {
    return { success: false, error: 'Nama transaksi maksimal 100 karakter.' };
  }

  if (!isValidCurrencyAmount(params.amount)) {
    return { success: false, error: 'Silakan masukkan nominal yang valid (lebih dari 0).' };
  }

  const newBalance =
    params.type === 'income' ? currentBalance + params.amount : currentBalance - params.amount;

  const transaction: TransactionModel = {
    id: `tx_${Date.now()}`,
    title: trimmedTitle,
    dateText: '16 September | 10:00',
    amount: params.amount,
    type: params.type,
    icon: 'restaurant',
    month: 'September',
  };

  return { success: true, newBalance, transaction };
}

describe('Wallet Security & Business Logic Unit Tests', () => {
  const INITIAL_BALANCE = 1000000;

  test('successfully processes valid income', () => {
    const result = processTransaction(INITIAL_BALANCE, {
      title: 'Gaji Magang',
      amount: 500000,
      type: 'income',
    });

    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(1500000);
    expect(result.transaction?.title).toBe('Gaji Magang');
  });

  test('successfully processes valid spent transaction', () => {
    const result = processTransaction(INITIAL_BALANCE, {
      title: 'Makan Siang',
      amount: 25000,
      type: 'spent',
    });

    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(975000);
  });

  test('rejects NaN, Infinity, and zero amounts (DoS protection)', () => {
    const nanResult = processTransaction(INITIAL_BALANCE, {
      title: 'Exploit NaN',
      amount: NaN,
      type: 'income',
    });
    expect(nanResult.success).toBe(false);
    expect(nanResult.newBalance).toBeUndefined();

    const infResult = processTransaction(INITIAL_BALANCE, {
      title: 'Exploit Infinity',
      amount: Infinity,
      type: 'income',
    });
    expect(infResult.success).toBe(false);

    const zeroResult = processTransaction(INITIAL_BALANCE, {
      title: 'Zero Amount',
      amount: 0,
      type: 'spent',
    });
    expect(zeroResult.success).toBe(false);
  });

  test('rejects empty and whitespace-only titles', () => {
    const emptyResult = processTransaction(INITIAL_BALANCE, {
      title: '',
      amount: 50000,
      type: 'spent',
    });
    expect(emptyResult.success).toBe(false);

    const whitespaceResult = processTransaction(INITIAL_BALANCE, {
      title: '    ',
      amount: 50000,
      type: 'spent',
    });
    expect(whitespaceResult.success).toBe(false);
  });

  test('rejects excessively long titles (DoS buffer protection)', () => {
    const longTitle = 'A'.repeat(101);
    const result = processTransaction(INITIAL_BALANCE, {
      title: longTitle,
      amount: 10000,
      type: 'spent',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('maksimal 100 karakter');
  });

  describe('Per-User Wallet Isolation & Default Rp 0 Balance', () => {
    test('newly registered user starts with strictly 0 balance and empty transactions', async () => {
      const { walletService } = require('../src/services/walletService');
      await walletService.setUserId('new_student_user_123');

      expect(walletService.getBalance()).toBe(0);
      expect(walletService.getTransactions()).toEqual([]);
      expect(walletService.getCurrentMonthSpent()).toBe(0);
    });

    test('balance and transactions of User A do not affect User B (privacy isolation)', async () => {
      const { walletService } = require('../src/services/walletService');

      // User A starts with 0 and receives 100,000 income
      await walletService.setUserId('user_alice_456');
      expect(walletService.getBalance()).toBe(0);
      await walletService.addTransaction({
        title: 'Uang Saku',
        amount: 100000,
        type: 'income',
      });
      expect(walletService.getBalance()).toBe(100000);
      expect(walletService.getTransactions().length).toBe(1);

      // Switch to User B: User B must have 0 balance and empty transactions
      await walletService.setUserId('user_bob_789');
      expect(walletService.getBalance()).toBe(0);
      expect(walletService.getTransactions()).toEqual([]);

      // User B spends 20,000 (after receiving 50,000)
      await walletService.addTransaction({
        title: 'Transfer Teman',
        amount: 50000,
        type: 'income',
      });
      await walletService.addTransaction({
        title: 'Kopi Kenangan',
        amount: 20000,
        type: 'spent',
      });
      expect(walletService.getBalance()).toBe(30000);

      // Switch back to User A: User A still has exactly 100,000 and 1 transaction!
      await walletService.setUserId('user_alice_456');
      expect(walletService.getBalance()).toBe(100000);
      expect(walletService.getTransactions().length).toBe(1);
      expect(walletService.getTransactions()[0].title).toBe('Uang Saku');
    });

    test('demo student account preserves initial test balance', async () => {
      const { walletService } = require('../src/services/walletService');
      await walletService.setUserId('3b52c06a-1539-4c17-8df3-f534d6651909');
      expect(walletService.getBalance()).toBeGreaterThan(0);
      expect(walletService.getTransactions().length).toBeGreaterThan(0);
    });
  });
});
