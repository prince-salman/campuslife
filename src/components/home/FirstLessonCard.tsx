import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { ScheduleItem } from '../../models/schedule';
import { notificationService } from '../../services/notificationService';

interface FirstLessonCardProps {
  schedule: ScheduleItem;
  onPressDetail?: () => void;
}

export const FirstLessonCard: React.FC<FirstLessonCardProps> = ({
  schedule,
  onPressDetail,
}) => {
  const [reminded, setReminded] = useState(false);

  const handleReminder = async () => {
    setReminded(true);
    await notificationService.sendClassReminder(schedule.title, schedule.room || 'B103', '08:00 WIB');
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>First Lesson</Text>
        </View>
        <Text style={styles.timeRange}>{schedule.timeRange || '08:00 WIB - 10:00 WIB'}</Text>
      </View>

      <Text style={styles.title}>{schedule.title}</Text>

      <View style={styles.footerRow}>
        <View style={styles.lecturerInfo}>
          <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.lecturerText}>{schedule.lecturer}</Text>
        </View>

        <View style={styles.rightActions}>
          <Pressable
            onPress={handleReminder}
            style={[styles.reminderBtn, reminded && styles.reminderBtnActive]}
            hitSlop={6}
          >
            <Ionicons
              name={reminded ? 'notifications' : 'notifications-outline'}
              size={15}
              color={reminded ? Colors.accentYellow : Colors.textWhite}
            />
            <Text style={[styles.reminderBtnText, reminded && styles.reminderBtnTextActive]}>
              {reminded ? 'Diingatkan' : 'Ingatkan'}
            </Text>
          </Pressable>

          <Pressable onPress={onPressDetail} style={styles.detailButton}>
            <Text style={styles.detailButtonText}>Lihat Detail</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.yellowAccent} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: Colors.badgeRed,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: Colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  timeRange: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  lecturerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lecturerText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1E36',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  reminderBtnActive: {
    backgroundColor: '#1E293B',
    borderColor: Colors.accentYellow,
  },
  reminderBtnText: {
    fontSize: 11,
    color: Colors.textWhite,
    fontWeight: '600',
  },
  reminderBtnTextActive: {
    color: Colors.accentYellow,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailButtonText: {
    color: Colors.yellowAccent,
    fontSize: 12,
    fontWeight: '700',
  },
});