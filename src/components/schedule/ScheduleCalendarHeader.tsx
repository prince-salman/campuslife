import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { DaySchedule } from '../../models/schedule';
import { Ionicons } from '@expo/vector-icons';

interface ScheduleCalendarHeaderProps {
  currentMonthYear: string;
  days: DaySchedule[];
  selectedIndex: number;
  onDaySelected: (index: number) => void;
  onMonthDropdownTap?: () => void;
  topPadding?: number;
}

export const ScheduleCalendarHeader: React.FC<ScheduleCalendarHeaderProps> = ({
  currentMonthYear,
  days,
  selectedIndex,
  onDaySelected,
  onMonthDropdownTap,
  topPadding,
}) => {
  return (
    <View style={[styles.header, topPadding ? { paddingTop: topPadding } : null]}>
      <Pressable onPress={onMonthDropdownTap} style={styles.monthRow}>
        <Text style={styles.monthText}>{currentMonthYear}</Text>
        <Ionicons name="chevron-down" size={20} color={Colors.textWhite} style={styles.monthIcon} />
      </Pressable>

      <View style={styles.daysRow}>
        {days.map((day, index) => {
          const isSelected = index === selectedIndex;
          return (
            <Pressable
              key={`${day.dayName}-${day.dayNumber}`}
              onPress={() => onDaySelected(index)}
              style={[
                styles.dayCard,
                isSelected ? styles.dayCardSelected : styles.dayCardUnselected,
              ]}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected ? styles.dayNameSelected : styles.dayNameUnselected,
                ]}
              >
                {day.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected ? styles.dayNumberSelected : styles.dayNumberUnselected,
                ]}
              >
                {day.dayNumber}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#070F46',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: -0.3,
  },
  monthIcon: {
    marginLeft: 6,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCardSelected: {
    backgroundColor: Colors.yellowAccent,
  },
  dayCardUnselected: {
    backgroundColor: '#13265C',
  },
  dayName: {
    fontSize: 11,
    marginBottom: 4,
  },
  dayNameSelected: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  dayNameUnselected: {
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  dayNumber: {
    fontSize: 18,
  },
  dayNumberSelected: {
    fontWeight: '800',
    color: Colors.textDark,
  },
  dayNumberUnselected: {
    fontWeight: '700',
    color: Colors.textWhite,
  },
});