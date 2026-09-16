import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScheduleCalendarHeader } from '../components/schedule/ScheduleCalendarHeader';
import { ScheduleTimelineCard } from '../components/schedule/ScheduleTimelineCard';
import { DaySchedule } from '../models/schedule';
import { Ionicons } from '@expo/vector-icons';

export const ScheduleScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? Math.max(insets.top, 38) : Math.max(insets.top, 12);
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
          time: '08',
          timePeriod: 'am',
          title: 'Software Engineering',
          room: 'C301',
          lecturer: 'Dr. Julius Reichwein',
          duration: '3 Hours',
          headerColor: '#2E6F79',
          cardColor: '#55A4B2',
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
          title: 'Informatics',
          room: 'B103',
          lecturer: 'Mr. John Liebert',
          duration: '2 Hours',
          headerColor: '#2E7979',
          cardColor: '#5FB8B2',
        },
        {
          id: 'thu_2',
          time: '11',
          timePeriod: 'am',
          title: 'Linear Algebra',
          room: 'A201',
          lecturer: 'Dr. Johan',
          duration: '2 Hours',
          headerColor: '#274975',
          cardColor: '#4D7FA9',
        },
        {
          id: 'thu_3',
          time: '02',
          timePeriod: 'pm',
          title: 'Web Development Lab',
          room: 'Lab 1',
          lecturer: 'Mr. Salman',
          duration: '3 Hours',
          headerColor: '#5A2E79',
          cardColor: '#8C5FB8',
        },
      ],
    },
    {
      dayName: 'Fri',
      dayNumber: '15',
      items: [
        {
          id: 'fri_1',
          time: '09',
          timePeriod: 'am',
          title: 'Computer Networks',
          room: 'B102',
          lecturer: 'Mr. Richard Braun',
          duration: '2 Hours',
          headerColor: '#792E4D',
          cardColor: '#B85F82',
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
          title: 'Public Speaking Seminar',
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
      <View style={styles.responsiveContainer}>
        <ScheduleCalendarHeader
          currentMonthYear={monthYear}
          days={weekSchedule}
          selectedIndex={selectedDayIndex}
          onDaySelected={setSelectedDayIndex}
          topPadding={topPadding}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.timelineContent}
          showsVerticalScrollIndicator={true}
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: '100%',
    backgroundColor: '#191A1E',
  },
  responsiveContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
    height: '100%',
  },
  timelineContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 110,
    flexGrow: 1,
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