import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Colors } from '../constants/colors';
import { ScheduleCalendarHeader } from '../components/schedule/ScheduleCalendarHeader';
import { ScheduleTimelineCard } from '../components/schedule/ScheduleTimelineCard';
import { DaySchedule } from '../models/schedule';
import { Ionicons } from '@expo/vector-icons';

export const ScheduleScreen: React.FC = () => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(3); // Thu 14 default
  const [monthYear] = useState<string>('June, 2026');

  const weekSchedule: DaySchedule[] = [
    {
      dayName: 'Mon',
      dayNumber: '11',
      items: [
        {
          id: 'mon_1',
          time: '08',
          timePeriod: 'am',
          title: 'Algorithms & Data Structures',
          room: 'B101',
          lecturer: 'Dr. Kenzo Tenma',
          duration: '2.5 Hours',
          headerColor: '#2E6F79',
          cardColor: '#55A4B2',
        },
        {
          id: 'mon_2',
          time: '01',
          timePeriod: 'pm',
          title: 'Operating Systems',
          room: 'Lab 2',
          lecturer: 'Prof. Wolfgang Grimmer',
          duration: '2 Hours',
          headerColor: '#3B3878',
          cardColor: '#6560B0',
        },
      ],
    },
    {
      dayName: 'Tue',
      dayNumber: '12',
      items: [
        {
          id: 'tue_1',
          time: '10',
          timePeriod: 'am',
          title: 'Database Management',
          room: 'B204',
          lecturer: 'Ms. Anna Liebert',
          duration: '2 Hours',
          headerColor: '#2E7958',
          cardColor: '#57B288',
        },
      ],
    },
    {
      dayName: 'Wed',
      dayNumber: '13',
      items: [
        {
          id: 'wed_1',
          time: '09',
          timePeriod: 'am',
          title: 'Web Application Development',
          room: 'Lab 1',
          lecturer: 'Mr. Roberto',
          duration: '3 Hours',
          headerColor: '#244872',
          cardColor: '#4C7BA8',
        },
      ],
    },
    {
      dayName: 'Thu',
      dayNumber: '14',
      items: [
        {
          id: 'thu_1',
          time: '08',
          timePeriod: 'am',
          title: 'Computer Network',
          room: 'B103',
          lecturer: 'Mr. John Liebert',
          duration: '2 Hours',
          headerColor: Colors.cardHeaderTeal,
          cardColor: Colors.cardBodyTeal,
        },
        {
          id: 'thu_2',
          time: '04',
          timePeriod: 'pm',
          title: 'Discrete Mathematics',
          room: 'B209',
          lecturer: 'Ms. Enami Asa',
          duration: '1.5 Hours',
          headerColor: Colors.cardHeaderBlue,
          cardColor: Colors.cardBodyBlue,
        },
      ],
    },
    {
      dayName: 'Fri',
      dayNumber: '15',
      items: [
        {
          id: 'fri_1',
          time: '08',
          timePeriod: 'am',
          title: 'Artificial Intelligence',
          room: 'B301',
          lecturer: 'Dr. Kenzo Tenma',
          duration: '2 Hours',
          headerColor: '#4C2A78',
          cardColor: '#7E54B0',
        },
      ],
    },
    {
      dayName: 'Sat',
      dayNumber: '16',
      items: [
        {
          id: 'sat_1',
          time: '10',
          timePeriod: 'am',
          title: 'Workshop Cloud Computing',
          room: 'Auditorium',
          lecturer: 'Guest Speaker',
          duration: '3 Hours',
          headerColor: '#755127',
          cardColor: '#A87D4C',
        },
      ],
    },
    {
      dayName: 'Sun',
      dayNumber: '17',
      items: [],
    },
  ];

  const currentDay = weekSchedule[selectedDayIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScheduleCalendarHeader
        currentMonthYear={monthYear}
        days={weekSchedule}
        selectedIndex={selectedDayIndex}
        onDaySelected={setSelectedDayIndex}
      />

      <ScrollView
        contentContainerStyle={styles.timelineContent}
        showsVerticalScrollIndicator={false}
      >
        {currentDay.items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={54} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyTitle}>Tidak Ada Jadwal Kuliah</Text>
            <Text style={styles.emptySubtitle}>
              Hari {currentDay.dayName} ini tidak ada kelas perkuliahan aktif.
            </Text>
          </View>
        ) : (
          currentDay.items.map((item) => (
            <ScheduleTimelineCard key={item.id} item={item} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#191A1E',
  },
  timelineContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 6,
    textAlign: 'center',
  },
});