export type TransactionType = 'income' | 'spent';

export interface TransactionModel {
  id: string;
  title: string;
  dateText: string;
  amount: number;
  type: TransactionType;
  iconName: string;
  month: string;
}