import 'package:flutter/material.dart';
import '../models/transaction_model.dart';

class WalletService extends ChangeNotifier {
  static final WalletService _instance = WalletService._internal();
  factory WalletService() => _instance;
  WalletService._internal();

  static WalletService get instance => _instance;

  double _balance = 1000025;
  String _selectedMonth = 'Agustus';

  final List<TransactionModel> _transactions = [
    const TransactionModel(
      id: 'tx_1',
      title: 'Makan siang',
      dateText: '17 Agustus | 4pm',
      amount: 15000,
      type: TransactionType.spent,
      icon: Icons.restaurant,
      month: 'Agustus',
    ),
    const TransactionModel(
      id: 'tx_2',
      title: 'Gojek',
      dateText: '19 Agustus | 9am',
      amount: 34000,
      type: TransactionType.spent,
      icon: Icons.directions_car,
      month: 'Agustus',
    ),
    const TransactionModel(
      id: 'tx_3',
      title: 'Fotocopy Berkas',
      dateText: '21 Agustus | 2pm',
      amount: 2000,
      type: TransactionType.spent,
      icon: Icons.content_paste,
      month: 'Agustus',
    ),
    const TransactionModel(
      id: 'tx_4',
      title: 'Lightstick Babymonster',
      dateText: '28 Agustus | 2pm',
      amount: 680000,
      type: TransactionType.spent,
      icon: Icons.more_horiz,
      month: 'Agustus',
    ),
    const TransactionModel(
      id: 'tx_inc_1',
      title: 'Uang Bulanan Ortu',
      dateText: '01 Agustus | 10am',
      amount: 1500000,
      type: TransactionType.income,
      icon: Icons.account_balance_wallet,
      month: 'Agustus',
    ),
    const TransactionModel(
      id: 'tx_inc_2',
      title: 'Gaji Asisten Dosen',
      dateText: '15 Agustus | 3pm',
      amount: 450000,
      type: TransactionType.income,
      icon: Icons.work_outline,
      month: 'Agustus',
    ),
  ];

  double get balance => _balance;
  String get selectedMonth => _selectedMonth;
  List<TransactionModel> get transactions => List.unmodifiable(_transactions);

  double getMonthlySpent(String month) {
    return _transactions
        .where((t) => t.month == month && t.type == TransactionType.spent)
        .fold(0.0, (sum, t) => sum + t.amount);
  }

  double get currentMonthSpent => getMonthlySpent(_selectedMonth);

  void setMonth(String month) {
    _selectedMonth = month;
    notifyListeners();
  }

  void addTransaction({
    required String title,
    required double amount,
    required TransactionType type,
    IconData icon = Icons.account_balance_wallet,
  }) {
    final now = DateTime.now();
    final newTx = TransactionModel(
      id: 'tx_${now.millisecondsSinceEpoch}',
      title: title,
      dateText: '${now.day} $_selectedMonth | ${now.hour}:${now.minute.toString().padLeft(2, '0')}',
      amount: amount,
      type: type,
      icon: icon,
      month: _selectedMonth,
    );

    _transactions.insert(0, newTx);
    if (type == TransactionType.income) {
      _balance += amount;
    } else {
      _balance -= amount;
    }
    notifyListeners();
  }
}