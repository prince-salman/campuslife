import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_styles.dart';
import '../models/schedule_model.dart';

class FirstLessonCard extends StatelessWidget {
  final ScheduleItem schedule;
  final VoidCallback onTapDetail;

  const FirstLessonCard({
    super.key,
    required this.schedule,
    required this.onTapDetail,
  });

  @override
  Widget build(BuildContext context) {
    final double screenWidth = MediaQuery.of(context).size.width;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.blueCardStart,
            AppColors.blueCardEnd,
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.blueCardStart.withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: 0,
            top: 0,
            child: CustomPaint(
              size: Size(screenWidth * 0.35, 120),
              painter: GridPatternPainter(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your first lesson is',
                  style: AppStyles.body.copyWith(
                    color: AppColors.textWhite.withValues(alpha: 0.85),
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  schedule.title,
                  style: AppStyles.heading1.copyWith(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 12),
                RichText(
                  text: TextSpan(
                    text: 'at ',
                    style: AppStyles.body.copyWith(
                      color: AppColors.textWhite.withValues(alpha: 0.7),
                      fontSize: 13,
                    ),
                    children: [
                      TextSpan(
                        text: schedule.timeRange,
                        style: AppStyles.bodyBold.copyWith(
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 2),
                RichText(
                  text: TextSpan(
                    text: 'with ',
                    style: AppStyles.body.copyWith(
                      color: AppColors.textWhite.withValues(alpha: 0.7),
                      fontSize: 13,
                    ),
                    children: [
                      TextSpan(
                        text: schedule.lecturer,
                        style: AppStyles.bodyBold.copyWith(
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.access_time_filled,
                          color: AppColors.textWhite,
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          schedule.duration,
                          style: AppStyles.bodyBold.copyWith(fontSize: 14),
                        ),
                      ],
                    ),
                    InkWell(
                      onTap: onTapDetail,
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        width: 36,
                        height: 36,
                        decoration: const BoxDecoration(
                          color: AppColors.yellowAccent,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.arrow_outward,
                          color: AppColors.textDark,
                          size: 20,
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
    );
  }
}

class GridPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.08)
      ..strokeWidth = 1.0;

    const double step = 20.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
