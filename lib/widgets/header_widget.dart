import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_styles.dart';

class HeaderWidget extends StatelessWidget {
  final String userName;

  const HeaderWidget({
    super.key,
    required this.userName,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 38,
          height: 38,
          decoration: const BoxDecoration(
            color: AppColors.textWhite,
            shape: BoxShape.circle,
          ),
          child: const Center(
            child: Icon(
              Icons.rice_bowl,
              color: Color(0xFFC0392B),
              size: 20,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hi, $userName',
              style: AppStyles.heading2.copyWith(fontSize: 16),
            ),
          ],
        ),
      ],
    );
  }
}
