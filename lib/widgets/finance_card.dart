import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_styles.dart';
import '../models/wallet_model.dart';

class FinanceCard extends StatefulWidget {
  final WalletModel wallet;
  final VoidCallback onIncomeTap;
  final VoidCallback onSpentTap;
  final VoidCallback onHistoryTap;

  const FinanceCard({
    super.key,
    required this.wallet,
    required this.onIncomeTap,
    required this.onSpentTap,
    required this.onHistoryTap,
  });

  @override
  State<FinanceCard> createState() => _FinanceCardState();
}

class _FinanceCardState extends State<FinanceCard> {
  bool _isBalanceVisible = true;

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return formatter.format(amount).replaceAll(' ', '');
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.border,
          width: 1,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      _isBalanceVisible
                          ? _formatCurrency(widget.wallet.balance)
                          : 'Rp ••••••••',
                      style: AppStyles.heading1.copyWith(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(width: 8),
                    InkWell(
                      onTap: () {
                        setState(() {
                          _isBalanceVisible = !_isBalanceVisible;
                        });
                      },
                      child: Icon(
                        _isBalanceVisible
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        color: AppColors.textSecondary,
                        size: 18,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                InkWell(
                  onTap: widget.onHistoryTap,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.credit_card,
                        color: AppColors.textSecondary,
                        size: 14,
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          '${_formatCurrency(widget.wallet.monthlySpent)} sudah terpakai di ${widget.wallet.currentMonth} >',
                          style: AppStyles.caption.copyWith(
                            color: AppColors.textSecondary,
                            fontSize: 11,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Column(
            children: [
              _buildActionButton(
                label: '+ Income',
                onPressed: widget.onIncomeTap,
              ),
              const SizedBox(height: 6),
              _buildActionButton(
                label: '- Spent',
                onPressed: widget.onSpentTap,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String label,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: 90,
      height: 32,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.yellowAccent,
          foregroundColor: AppColors.textDark,
          padding: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          elevation: 0,
        ),
        child: Text(
          label,
          style: AppStyles.buttonText,
        ),
      ),
    );
  }
}
