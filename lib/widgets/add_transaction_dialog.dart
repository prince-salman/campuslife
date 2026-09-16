import 'package:flutter/material.dart';
import '../models/transaction_model.dart';
import '../services/wallet_service.dart';

class AddTransactionDialog extends StatefulWidget {
  final TransactionType initialType;
  final VoidCallback? onSaved;

  const AddTransactionDialog({
    super.key,
    required this.initialType,
    this.onSaved,
  });

  static Future<void> show(
    BuildContext context, {
    required TransactionType type,
    VoidCallback? onSaved,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF131A33),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => AddTransactionDialog(
        initialType: type,
        onSaved: onSaved,
      ),
    );
  }

  @override
  State<AddTransactionDialog> createState() => _AddTransactionDialogState();
}

class _AddTransactionDialogState extends State<AddTransactionDialog> {
  late TransactionType _type;
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  late IconData _selectedIcon;

  @override
  void initState() {
    super.initState();
    _type = widget.initialType;
    _selectedIcon = _type == TransactionType.income
        ? Icons.account_balance_wallet
        : Icons.restaurant;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  void _addQuickAmount(int amount) {
    final current = int.tryParse(_amountController.text.trim()) ?? 0;
    final updated = current + amount;
    _amountController.text = updated.toString();
  }

  void _submit() {
    final title = _titleController.text.trim();
    final amount = double.tryParse(_amountController.text.trim()) ?? 0.0;

    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Silakan masukkan nama transaksi.'),
          backgroundColor: Color(0xFF7A1B1B),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    if (amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Silakan masukkan nominal yang valid.'),
          backgroundColor: Color(0xFF7A1B1B),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    WalletService.instance.addTransaction(
      title: title,
      amount: amount,
      type: _type,
      icon: _selectedIcon,
    );

    widget.onSaved?.call();
    Navigator.pop(context);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _type == TransactionType.income
              ? 'Pemasukan berhasil dicatat.'
              : 'Pengeluaran berhasil dicatat.',
        ),
        backgroundColor: const Color(0xFF0C389E),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isIncome = _type == TransactionType.income;
    final quickTitles = isIncome
        ? ['Uang Saku', 'Gaji Magang', 'Hadiah', 'Freelance']
        : ['Makan', 'Kopi', 'Bensin', 'Fotocopy', 'Belanja'];

    final quickAmounts = [10000, 20000, 50000, 100000];

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        top: 20,
        left: 20,
        right: 20,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isIncome ? 'Tambah Pemasukan' : 'Tambah Pengeluaran',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: Colors.white70),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Toggle Type
            Container(
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFF091026),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          _type = TransactionType.income;
                          _selectedIcon = Icons.account_balance_wallet;
                        });
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        decoration: BoxDecoration(
                          color: isIncome ? const Color(0xFFECE548) : Colors.transparent,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Center(
                          child: Text(
                            '+ Income',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isIncome ? FontWeight.w800 : FontWeight.w500,
                              color: isIncome ? Colors.black : Colors.white70,
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
                          _type = TransactionType.spent;
                          _selectedIcon = Icons.restaurant;
                        });
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        decoration: BoxDecoration(
                          color: !isIncome ? const Color(0xFFECE548) : Colors.transparent,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Center(
                          child: Text(
                            '- Spent',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: !isIncome ? FontWeight.w800 : FontWeight.w500,
                              color: !isIncome ? Colors.black : Colors.white70,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),
            TextField(
              controller: _titleController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Nama Transaksi',
                labelStyle: const TextStyle(color: Colors.white60),
                filled: true,
                fillColor: const Color(0xFF091026),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF1F2F5E)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF1F2F5E)),
                ),
              ),
            ),
            const SizedBox(height: 8),

            // Quick Title Chips
            Wrap(
              spacing: 8,
              children: quickTitles.map((t) {
                return ActionChip(
                  label: Text(t),
                  labelStyle: const TextStyle(fontSize: 11, color: Colors.white),
                  backgroundColor: const Color(0xFF19254D),
                  onPressed: () {
                    setState(() {
                      _titleController.text = t;
                    });
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 14),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                labelText: 'Jumlah (Rp)',
                labelStyle: const TextStyle(color: Colors.white60),
                prefixText: 'Rp ',
                prefixStyle: const TextStyle(color: Color(0xFFECE548), fontWeight: FontWeight.bold),
                filled: true,
                fillColor: const Color(0xFF091026),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF1F2F5E)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF1F2F5E)),
                ),
              ),
            ),
            const SizedBox(height: 8),

            // Quick Amount Chips
            Wrap(
              spacing: 8,
              children: quickAmounts.map((amt) {
                return ActionChip(
                  label: Text('+${amt ~/ 1000}rb'),
                  labelStyle: const TextStyle(fontSize: 11, color: Color(0xFFECE548)),
                  backgroundColor: const Color(0xFF19254D),
                  onPressed: () => _addQuickAmount(amt),
                );
              }).toList(),
            ),

            const SizedBox(height: 16),
            const Text(
              'Pilih Ikon Kategori',
              style: TextStyle(fontSize: 13, color: Colors.white70),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Icons.restaurant,
                Icons.directions_car,
                Icons.content_paste,
                Icons.shopping_bag_outlined,
                Icons.account_balance_wallet,
                Icons.school,
              ].map((icon) {
                final isSel = _selectedIcon == icon;
                return InkWell(
                  onTap: () {
                    setState(() {
                      _selectedIcon = icon;
                    });
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isSel ? const Color(0xFFECE548) : const Color(0xFF091026),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSel ? const Color(0xFFECE548) : const Color(0xFF1F2F5E),
                      ),
                    ),
                    child: Icon(
                      icon,
                      color: isSel ? Colors.black : Colors.white70,
                      size: 22,
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 22),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFECE548),
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: Text(
                  isIncome ? 'Simpan Pemasukan' : 'Simpan Pengeluaran',
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}