import 'package:flutter/material.dart';
import '../models/transaction_model.dart';
import '../services/wallet_service.dart';
import '../widgets/add_transaction_dialog.dart';
import '../widgets/transaction_item_card.dart';

class FinanceScreen extends StatefulWidget {
  const FinanceScreen({super.key});

  @override
  State<FinanceScreen> createState() => _FinanceScreenState();
}

class _FinanceScreenState extends State<FinanceScreen> {
  bool _isBalanceVisible = true;
  TransactionType _selectedTab = TransactionType.spent;
  int _selectedMonthIndex = 7; // Agustus (index 7, 0-indexed)

  final List<String> _months = const [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  @override
  void initState() {
    super.initState();
    WalletService.instance.addListener(_onWalletChanged);
  }

  @override
  void dispose() {
    WalletService.instance.removeListener(_onWalletChanged);
    super.dispose();
  }

  void _onWalletChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  String _formatNumber(double amount) {
    final int val = amount.toInt();
    final String str = val.toString();
    final StringBuffer buffer = StringBuffer();
    for (int i = 0; i < str.length; i++) {
      if (i > 0 && (str.length - i) % 3 == 0) {
        buffer.write('.');
      }
      buffer.write(str[i]);
    }
    return buffer.toString();
  }

  double get _totalBalance => WalletService.instance.balance;

  double get _currentMonthSpent {
    final currentMonthName = _months[_selectedMonthIndex];
    return WalletService.instance.getMonthlySpent(currentMonthName);
  }

  List<TransactionModel> get _filteredTransactions {
    final currentMonthName = _months[_selectedMonthIndex];
    return WalletService.instance.transactions
        .where((t) => t.month == currentMonthName && t.type == _selectedTab)
        .toList();
  }

  void _previousMonth() {
    setState(() {
      if (_selectedMonthIndex > 0) {
        _selectedMonthIndex--;
      } else {
        _selectedMonthIndex = _months.length - 1;
      }
      WalletService.instance.setMonth(_months[_selectedMonthIndex]);
    });
  }

  void _nextMonth() {
    setState(() {
      if (_selectedMonthIndex < _months.length - 1) {
        _selectedMonthIndex++;
      } else {
        _selectedMonthIndex = 0;
      }
      WalletService.instance.setMonth(_months[_selectedMonthIndex]);
    });
  }

  void _openAddTransaction(TransactionType type) {
    AddTransactionDialog.show(
      context,
      type: type,
      onSaved: () {
        setState(() {
          _selectedTab = type;
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final currentMonthName = _months[_selectedMonthIndex];
    final spentAmount = _currentMonthSpent;

    return Scaffold(
      backgroundColor: const Color(0xFF121419),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: EdgeInsets.only(
                top: topPadding + 10,
                left: 16,
                right: 16,
                bottom: 12,
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    padding: const EdgeInsets.all(4),
                    child: const Icon(
                      Icons.school_rounded,
                      color: Color(0xFF003C9E),
                      size: 20,
                    ),
                  ),
                  const Spacer(),
                  const Row(
                    children: [
                      Text(
                        'Schedule',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0x99FFFFFF),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      SizedBox(width: 12),
                      Text(
                        'Money_Management',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      SizedBox(width: 12),
                      Text(
                        'UMKM',
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0x99FFFFFF),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 12),
                  Container(
                    width: 32,
                    height: 32,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                    ),
                    padding: const EdgeInsets.all(2),
                    child: Container(
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFF7A1B1B),
                      ),
                      child: const Center(
                        child: Text(
                          'R',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0C389E), Color(0xFF072166)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x33000000),
                      blurRadius: 16,
                      offset: Offset(0, 6),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Stack(
                    children: [
                      Positioned(
                        right: -40,
                        bottom: -40,
                        child: Container(
                          width: 180,
                          height: 180,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: const Color(0x1AFFFFFF),
                              width: 30,
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 22.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      RichText(
                                        text: TextSpan(
                                          children: [
                                            const TextSpan(
                                              text: 'Rp',
                                              style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w600,
                                                color: Colors.white,
                                              ),
                                            ),
                                            TextSpan(
                                              text: _isBalanceVisible
                                                  ? _formatNumber(_totalBalance)
                                                  : ' ••••••••',
                                              style: const TextStyle(
                                                fontSize: 26,
                                                fontWeight: FontWeight.w800,
                                                color: Colors.white,
                                                letterSpacing: -0.5,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      InkWell(
                                        onTap: () {
                                          setState(() {
                                            _isBalanceVisible = !_isBalanceVisible;
                                          });
                                        },
                                        borderRadius: BorderRadius.circular(12),
                                        child: Padding(
                                          padding: const EdgeInsets.all(4.0),
                                          child: Icon(
                                            _isBalanceVisible
                                                ? Icons.visibility
                                                : Icons.visibility_off,
                                            size: 18,
                                            color: const Color(0xD9FFFFFF),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 24),
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.account_balance_wallet,
                                        size: 15,
                                        color: Colors.white70,
                                      ),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          'Rp${_formatNumber(spentAmount)} sudah terpakai di $currentMonthName >',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w400,
                                            color: Colors.white,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              children: [
                                InkWell(
                                  onTap: () => _openAddTransaction(TransactionType.income),
                                  borderRadius: BorderRadius.circular(20),
                                  child: Container(
                                    width: 105,
                                    height: 38,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFECE548),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: const Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.add, size: 16, color: Colors.black),
                                        SizedBox(width: 4),
                                        Text(
                                          'Income',
                                          style: TextStyle(
                                            color: Colors.black,
                                            fontWeight: FontWeight.w800,
                                            fontSize: 13,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 10),
                                InkWell(
                                  onTap: () => _openAddTransaction(TransactionType.spent),
                                  borderRadius: BorderRadius.circular(20),
                                  child: Container(
                                    width: 105,
                                    height: 38,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFECE548),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: const Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.remove, size: 16, color: Colors.black),
                                        SizedBox(width: 4),
                                        Text(
                                          'Spent',
                                          style: TextStyle(
                                            color: Colors.black,
                                            fontWeight: FontWeight.w800,
                                            fontSize: 13,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 12),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  InkWell(
                    onTap: _previousMonth,
                    borderRadius: BorderRadius.circular(24),
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        color: Color(0xFFECE548),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.reply,
                        color: Colors.black,
                        size: 20,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Container(
                    width: 190,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFF091438),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: const Color(0xFF182A6B),
                        width: 1.5,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        currentMonthName,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  InkWell(
                    onTap: _nextMonth,
                    borderRadius: BorderRadius.circular(24),
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        color: Color(0xFFECE548),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.forward,
                        color: Colors.black,
                        size: 20,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                RichText(
                  text: TextSpan(
                    children: [
                      const TextSpan(
                        text: 'Rp',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                      TextSpan(
                        text: _isBalanceVisible
                            ? _formatNumber(spentAmount)
                            : ' ••••••••',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 6),
                Icon(
                  _isBalanceVisible ? Icons.visibility : Icons.visibility_off,
                  size: 18,
                  color: Colors.white70,
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'sudah terpakai di $currentMonthName',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w400,
                color: Color(0xB3FFFFFF),
              ),
            ),

            const SizedBox(height: 22),

            Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Color(0xFF050D38),
                borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 22.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(left: 4.0, bottom: 16.0),
                    child: Text(
                      'Latest Transaction',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: -0.3,
                      ),
                    ),
                  ),

                  Container(
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFF131A33),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    padding: const EdgeInsets.all(4),
                    child: Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () {
                              setState(() {
                                _selectedTab = TransactionType.income;
                              });
                            },
                            borderRadius: BorderRadius.circular(20),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              decoration: BoxDecoration(
                                color: _selectedTab == TransactionType.income
                                    ? const Color(0xFFECE548)
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Center(
                                child: Text(
                                  'Income',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: _selectedTab == TransactionType.income
                                        ? FontWeight.w800
                                        : FontWeight.w600,
                                    color: _selectedTab == TransactionType.income
                                        ? Colors.black
                                        : Colors.white,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: InkWell(
                            onTap: () {
                              setState(() {
                                _selectedTab = TransactionType.spent;
                              });
                            },
                            borderRadius: BorderRadius.circular(20),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              decoration: BoxDecoration(
                                color: _selectedTab == TransactionType.spent
                                    ? const Color(0xFFECE548)
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Center(
                                child: Text(
                                  'Spent',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: _selectedTab == TransactionType.spent
                                        ? FontWeight.w800
                                        : FontWeight.w600,
                                    color: _selectedTab == TransactionType.spent
                                        ? Colors.black
                                        : Colors.white,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  if (_filteredTransactions.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 36.0),
                      child: Center(
                        child: Text(
                          'Belum ada transaksi di bulan $currentMonthName',
                          style: const TextStyle(
                            color: Color(0x80FFFFFF),
                            fontSize: 13,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _filteredTransactions.length,
                      itemBuilder: (context, index) {
                        final tx = _filteredTransactions[index];
                        return TransactionItemCard(transaction: tx);
                      },
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
