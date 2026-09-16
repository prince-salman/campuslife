import 'package:flutter/material.dart';
import '../models/schedule_model.dart';
import '../widgets/schedule_calendar_header.dart';
import '../widgets/schedule_timeline_card.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  int _selectedDayIndex = 3; // Thu 14 is default (index 3)
  String _selectedMonth = 'June, 2026';

  final List<DaySchedule> _weekSchedule = const [
    DaySchedule(
      dayName: 'Mon',
      dayNumber: '11',
      items: [
        ScheduleItem(
          id: 'mon_1',
          time: '08',
          timePeriod: 'am',
          title: 'Algorithms & Data Structures',
          room: 'B101',
          lecturer: 'Dr. Kenzo Tenma',
          duration: '2.5 Hours',
          headerColor: Color(0xFF2E6F79),
          cardColor: Color(0xFF55A4B2),
        ),
        ScheduleItem(
          id: 'mon_2',
          time: '01',
          timePeriod: 'pm',
          title: 'Operating Systems',
          room: 'Lab 2',
          lecturer: 'Prof. Wolfgang Grimmer',
          duration: '2 Hours',
          headerColor: Color(0xFF3B3878),
          cardColor: Color(0xFF6560B0),
        ),
      ],
    ),
    DaySchedule(
      dayName: 'Tue',
      dayNumber: '12',
      items: [
        ScheduleItem(
          id: 'tue_1',
          time: '10',
          timePeriod: 'am',
          title: 'Database Management',
          room: 'B204',
          lecturer: 'Ms. Anna Liebert',
          duration: '2 Hours',
          headerColor: Color(0xFF2E7958),
          cardColor: Color(0xFF57B288),
        ),
        ScheduleItem(
          id: 'tue_2',
          time: '03',
          timePeriod: 'pm',
          title: 'Software Engineering',
          room: 'A302',
          lecturer: 'Dr. Heinrich Lunge',
          duration: '1.5 Hours',
          headerColor: Color(0xFF783E28),
          cardColor: Color(0xFFB0694E),
        ),
      ],
    ),
    DaySchedule(
      dayName: 'Wed',
      dayNumber: '13',
      items: [
        ScheduleItem(
          id: 'wed_1',
          time: '09',
          timePeriod: 'am',
          title: 'Web Application Development',
          room: 'Lab 1',
          lecturer: 'Mr. Roberto',
          duration: '3 Hours',
          headerColor: Color(0xFF244872),
          cardColor: Color(0xFF4C7BA8),
        ),
      ],
    ),
    DaySchedule(
      dayName: 'Thu',
      dayNumber: '14',
      items: [
        ScheduleItem(
          id: 'thu_1',
          time: '08',
          timePeriod: 'am',
          title: 'Computer Network',
          room: 'B103',
          lecturer: 'Mr. John Liebert',
          duration: '2 Hours',
          headerColor: Color(0xFF2E7979),
          cardColor: Color(0xFF5FB8B2),
        ),
        ScheduleItem(
          id: 'thu_2',
          time: '04',
          timePeriod: 'pm',
          title: 'Discrete Mathematics',
          room: 'B209',
          lecturer: 'Ms. Enami Asa',
          duration: '1.5 Hours',
          headerColor: Color(0xFF274975),
          cardColor: Color(0xFF4D7FA9),
        ),
      ],
    ),
    DaySchedule(
      dayName: 'Fri',
      dayNumber: '15',
      items: [
        ScheduleItem(
          id: 'fri_1',
          time: '08',
          timePeriod: 'am',
          title: 'Artificial Intelligence',
          room: 'B301',
          lecturer: 'Dr. Kenzo Tenma',
          duration: '2 Hours',
          headerColor: Color(0xFF4C2A78),
          cardColor: Color(0xFF7E54B0),
        ),
        ScheduleItem(
          id: 'fri_2',
          time: '02',
          timePeriod: 'pm',
          title: 'Cyber Security Basics',
          room: 'Lab 3',
          lecturer: 'Mr. John Liebert',
          duration: '2 Hours',
          headerColor: Color(0xFF2A6868),
          cardColor: Color(0xFF4EA3A3),
        ),
      ],
    ),
    DaySchedule(
      dayName: 'Sat',
      dayNumber: '16',
      items: [
        ScheduleItem(
          id: 'sat_1',
          time: '10',
          timePeriod: 'am',
          title: 'Workshop Cloud Computing',
          room: 'Auditorium',
          lecturer: 'Guest Speaker',
          duration: '3 Hours',
          headerColor: Color(0xFF755127),
          cardColor: Color(0xFFA87D4C),
        ),
      ],
    ),
    DaySchedule(
      dayName: 'Sun',
      dayNumber: '17',
      items: [],
    ),
  ];

  void _showItemOptions(ScheduleItem item) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E2028),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 20.0, horizontal: 20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: item.headerColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        item.title,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Padding(
                  padding: const EdgeInsets.only(left: 22.0),
                  child: Text(
                    'Ruang ${item.room} - ${item.lecturer} (${item.duration})',
                    style: const TextStyle(
                      fontSize: 13,
                      color: Colors.white70,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Divider(color: Colors.white12, height: 1),
                const SizedBox(height: 10),
                ListTile(
                  leading: const Icon(Icons.notifications_active_outlined, color: Color(0xFFECE548)),
                  title: const Text('Pasang Pengingat Kelas', style: TextStyle(color: Colors.white)),
                  contentPadding: EdgeInsets.zero,
                  onTap: () {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Pengingat untuk ${item.title} telah diatur.'),
                        backgroundColor: const Color(0xFF070F46),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.menu_book_outlined, color: Colors.white70),
                  title: const Text('Silabus & Bahan Kuliah', style: TextStyle(color: Colors.white)),
                  contentPadding: EdgeInsets.zero,
                  onTap: () {
                    Navigator.pop(ctx);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.person_outline, color: Colors.white70),
                  title: const Text('Kontak Dosen Pengampu', style: TextStyle(color: Colors.white)),
                  contentPadding: EdgeInsets.zero,
                  onTap: () {
                    Navigator.pop(ctx);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showMonthPicker() {
    const months = [
      'January, 2026',
      'February, 2026',
      'March, 2026',
      'April, 2026',
      'May, 2026',
      'June, 2026',
      'July, 2026',
      'August, 2026',
      'September, 2026',
      'October, 2026',
      'November, 2026',
      'December, 2026',
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E2028),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 20.0, horizontal: 16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.only(left: 12.0, bottom: 12.0),
                  child: Text(
                    'Pilih Bulan & Tahun',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
                const Divider(color: Colors.white12, height: 1),
                SizedBox(
                  height: 260,
                  child: ListView.builder(
                    itemCount: months.length,
                    itemBuilder: (context, index) {
                      final m = months[index];
                      final isSelected = m == _selectedMonth;
                      return ListTile(
                        title: Text(
                          m,
                          style: TextStyle(
                            color: isSelected ? const Color(0xFFECE548) : Colors.white,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          ),
                        ),
                        trailing: isSelected
                            ? const Icon(Icons.check, color: Color(0xFFECE548))
                            : null,
                        onTap: () {
                          setState(() {
                            _selectedMonth = m;
                          });
                          Navigator.pop(ctx);
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentDaySchedule = _weekSchedule[_selectedDayIndex];

    return Scaffold(
      backgroundColor: const Color(0xFF191A1E),
      body: Column(
        children: [
          ScheduleCalendarHeader(
            currentMonthYear: _selectedMonth,
            days: _weekSchedule,
            selectedIndex: _selectedDayIndex,
            onDaySelected: (index) {
              setState(() {
                _selectedDayIndex = index;
              });
            },
            onMonthDropdownTap: _showMonthPicker,
          ),
          Expanded(
            child: currentDaySchedule.items.isEmpty
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.event_available,
                            size: 64,
                            color: Color(0x33FFFFFF),
                          ),
                          SizedBox(height: 16),
                          Text(
                            'Tidak Ada Jadwal Kuliah',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(height: 6),
                          Text(
                            'Hari ini tidak ada kelas perkuliahan aktif.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13,
                              color: Color(0x99FFFFFF),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                      vertical: 24.0,
                    ),
                    itemCount: currentDaySchedule.items.length,
                    itemBuilder: (context, index) {
                      final item = currentDaySchedule.items[index];
                      return ScheduleTimelineCard(
                        item: item,
                        onMorePressed: () => _showItemOptions(item),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}