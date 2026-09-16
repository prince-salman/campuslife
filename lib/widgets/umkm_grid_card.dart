import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_styles.dart';
import '../models/umkm_model.dart';

class UmkmGridCard extends StatelessWidget {
  final UmkmModel item;
  final VoidCallback onTap;

  const UmkmGridCard({
    super.key,
    required this.item,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Color(item.cardColorHex),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.08),
            width: 1,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            Positioned.fill(
              child: Center(
                child: Icon(
                  Icons.restaurant,
                  size: 32,
                  color: Colors.white.withValues(alpha: 0.2),
                ),
              ),
            ),
            if (item.bannerText != null)
              Positioned(
                top: 8,
                left: 8,
                right: 8,
                child: Text(
                  item.bannerText!,
                  style: AppStyles.caption.copyWith(
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    fontSize: 10,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            Positioned(
              left: 6,
              bottom: 6,
              right: 6,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (item.rating != null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 4,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.star,
                            color: AppColors.yellowAccent,
                            size: 10,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            item.rating.toString(),
                            style: AppStyles.caption.copyWith(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  if (item.priceTag.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 5,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.yellowAccent,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        item.priceTag,
                        style: AppStyles.caption.copyWith(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textDark,
                        ),
                      ),
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
