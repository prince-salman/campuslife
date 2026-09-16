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
});
