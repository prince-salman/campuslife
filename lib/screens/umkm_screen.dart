import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_styles.dart';

class UmkmScreen extends StatelessWidget {
  const UmkmScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        title: const Text(
          'Direktori UMKM Kampus',
          style: AppStyles.heading2,
        ),
      ),
      body: const Center(
        child: Text(
          'Spill Tempat & Lapak UMKM',
          style: AppStyles.body,
        ),
      ),
    );
  }
}
