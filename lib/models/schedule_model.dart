import 'package:flutter/material.dart';

class ScheduleItem {
  final String id;
  final String time;
  final String timePeriod;
  final String timeRange;
  final String title;
  final String room;
  final String lecturer;
  final String duration;
  final Color headerColor;
  final Color cardColor;

  const ScheduleItem({
    this.id = '',
    this.time = '',
    this.timePeriod = '',
    this.timeRange = '',
    required this.title,
    this.room = '',
    required this.lecturer,
    required this.duration,
    this.headerColor = const Color(0xFF2E7979),
    this.cardColor = const Color(0xFF5FB8B2),
  });
}

class DaySchedule {
  final String dayName;
  final String dayNumber;
  final List<ScheduleItem> items;

  const DaySchedule({
    required this.dayName,
    required this.dayNumber,
    required this.items,
  });
}