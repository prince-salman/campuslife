import 'package:flutter/material.dart';

enum TransactionType {
  income,
  spent,
}

class TransactionModel {
  final String id;
  final String title;
  final String dateText;
  final double amount;
  final TransactionType type;
  final IconData icon;
  final String month;

  const TransactionModel({
    required this.id,
    required this.title,
    required this.dateText,
    required this.amount,
    required this.type,
    required this.icon,
    required this.month,
  });
}