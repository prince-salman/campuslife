import 'package:flutter/material.dart';
import '../models/schedule_model.dart';

class ScheduleCalendarHeader extends StatelessWidget {
  final String currentMonthYear;
  final List<DaySchedule> days;
  final int selectedIndex;
  final ValueChanged<int> onDaySelected;
  final VoidCallback? onMonthDropdownTap;

  const ScheduleCalendarHeader({
    super.key,
    this.currentMonthYear = 'June, 2026',
    required this.days,
    required this.selectedIndex,
    required this.onDaySelected,
    this.onMonthDropdownTap,
  });

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Color(0xFF070F46),
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      padding: EdgeInsets.only(
        top: topPadding + 12,
        bottom: 18,
        left: 16,
        right: 16,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            onTap: onMonthDropdownTap,
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 4.0),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    currentMonthYear,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.keyboard_arrow_down,
                    color: Colors.white,
                    size: 24,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(days.length, (index) {
              final day = days[index];
              final isSelected = index == selectedIndex;

              return Expanded(
                child: Padding(
                  padding: EdgeInsets.only(
                    left: index == 0 ? 0 : 3.0,
                    right: index == days.length - 1 ? 0 : 3.0,
                  ),
                  child: InkWell(
                    onTap: () => onDaySelected(index),
                    borderRadius: BorderRadius.circular(16),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? const Color(0xFFECE548)
                            : const Color(0xFF13265C),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: isSelected
                            ? const [
                                BoxShadow(
                                  color: Color(0x59ECE548),
                                  blurRadius: 8,
                                  offset: Offset(0, 2),
                                ),
                              ]
                            : null,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            day.dayName,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight:
                                  isSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSelected
                                  ? const Color(0xFF111111)
                                  : const Color(0xBFFFFFFF),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            day.dayNumber,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight:
                                  isSelected ? FontWeight.w800 : FontWeight.w700,
                              color: isSelected
                                  ? const Color(0xFF111111)
                                  : Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}