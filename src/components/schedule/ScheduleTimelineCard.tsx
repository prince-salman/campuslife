import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { ScheduleItem } from '../../models/schedule';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../../services/notificationService';

interface ScheduleTimelineCardProps {
  item: ScheduleItem;
  onMorePressed?: () => void;
}

export const ScheduleTimelineCard: React.FC<ScheduleTimelineCardProps> = ({
  item,
  onMorePressed,
}) => {
  const [hasReminder, setHasReminder] = useState(false);

  const handleReminder = async () => {
    setHasReminder(!hasReminder);
    if (!hasReminder) {
      const timeStr = `${item.time}:00 ${item.timePeriod}`;
      // Immediate lockscreen notification
      await notificationService.sendClassReminder(item.title, item.room, timeStr);
      // Scheduled 15-minute prior lockscreen alert
      await notificationService.scheduleUpcomingClassReminder(item.title, item.room, timeStr, 15);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeCol}>
        <View style={styles.timeRow}>
          <Text style={styles.timeNumber}>{item.time}</Text>
          <Text style={styles.timePeriod}>{item.timePeriod}</Text>
        </View>
      </View>

      <View style={[styles.cardOuter, { backgroundColor: item.headerColor }]}>
        <View style={styles.headerBar}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.headerRightActions}>
            <Pressable
              onPress={handleReminder}
              style={[styles.bellButton, hasReminder && styles.bellButtonActive]}
              hitSlop={8}
            >
              <Ionicons
                name={hasReminder ? 'notifications' : 'notifications-outline'}
                size={14}
                color={hasReminder ? Colors.accentYellow : Colors.textWhite}
              />
            </Pressable>
            <Pressable onPress={onMorePressed} style={styles.moreButton} hitSlop={8}>
              <Ionicons name="ellipsis-horizontal" size={14} color={Colors.textWhite} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.cardBody, { backgroundColor: item.cardColor }]}>
          <Text style={styles.roomLabel}>Room</Text>
          <Text style={styles.roomNumber}>{item.room}</Text>

          <View style={styles.lecturerRow}>
            <Text style={styles.withText}>with </Text>
            <Text style={styles.lecturerName}>{item.lecturer}</Text>
          </View>

          <View style={styles.durationRow}>
            <View style={styles.durationLeft}>
              <Ionicons name="time" size={14} color={Colors.textWhite} />
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
            {hasReminder && (
              <View style={styles.reminderActiveTag}>
                <Ionicons name="alarm" size={12} color={Colors.accentYellow} />
                <Text style={styles.reminderActiveText}>Alarm H-15m Aktif</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  timeCol: {
    width: 62,
    paddingTop: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timeNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: -0.5,
  },
  timePeriod: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textWhite,
    marginLeft: 1,
  },
  cardOuter: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textWhite,
    flex: 1,
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bellButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellButtonActive: {
    borderColor: Colors.accentYellow,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  moreButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    marginHorizontal: 6,
    marginBottom: 6,
    borderRadius: 18,
    padding: 16,
  },
  roomLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  roomNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  lecturerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  withText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  lecturerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  durationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  reminderActiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  reminderActiveText: {
    fontSize: 10.5,
    color: Colors.accentYellow,
    fontWeight: '700',
  },
});