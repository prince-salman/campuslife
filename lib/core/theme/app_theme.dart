import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.background,
      primaryColor: AppColors.blueCardStart,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.blueCardStart,
        secondary: AppColors.yellowAccent,
        surface: AppColors.surface,
      ),
      fontFamily: 'Roboto',
      useMaterial3: true,
    );
  }
}
