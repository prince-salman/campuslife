import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { ScheduleItem } from '../../models/schedule';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../../services/notificationService';

interface ScheduleTimelineCardProps {
  item: ScheduleItem;
  dayIndex?: number;
  dayName?: string;
  canManage?: boolean;
  onMorePressed?: () => void;
  onToggleCancel?: () => void;
}

export const ScheduleTimelineCard: React.FC<ScheduleTimelineCardProps> = ({
  item,
  dayIndex,
  dayName,
  canManage = false,
  onMorePressed,
  onToggleCancel,
}) => {
  const [hasReminder, setHasReminder] = useState(
    item.reminderMinutes !== undefined ? item.reminderMinutes > 0 : false
  );
  const [scheduledNotifId, setScheduledNotifId] = useState<string | null>(null);

  const handleReminder = async () => {
    const nextState = !hasReminder;
    setHasReminder(nextState);
    if (nextState) {
      const timeStr = item.timeRange || `${item.time}:00 ${item.timePeriod || 'am'}`;
      const minutes = item.reminderMinutes && item.reminderMinutes > 0 ? item.reminderMinutes : 15;
      const res = await notificationService.scheduleUpcomingClassReminder(
        item.title,
        item.room,
        timeStr,
        minutes,
        item.timePeriod,
        dayIndex
      );
      if (res.notificationId) {
        setScheduledNotifId(res.notificationId);
      }
    } else {
      if (scheduledNotifId) {
        await notificationService.cancelNotification(scheduledNotifId);
        setScheduledNotifId(null);
      }
    }
  };

  const isCancelled = item.isCancelled === true;

  return (
    <View style={styles.container}>
      <View style={styles.timeCol}>
        <View style={styles.timeRow}>
          <Text style={[styles.timeNumber, isCancelled && styles.timeCancelled]}>{item.time}</Text>
          <Text style={[styles.timePeriod, isCancelled && styles.timeCancelled]}>{item.timePeriod}</Text>
        </View>
        {isCancelled && (
          <View style={styles.cancelledMiniBadge}>
            <Text style={styles.cancelledMiniText}>BATAL</Text>
          </View>
        )}
      </View>

      <View
        style={[
          styles.cardOuter,
          { backgroundColor: isCancelled ? '#2A1818' : item.headerColor },
          isCancelled && styles.cardOuterCancelled,
        ]}
      >
        <View style={styles.headerBar}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={[styles.title, isCancelled && styles.titleCancelled]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {isCancelled && (
              <View style={styles.cancelledTag}>
                <Text style={styles.cancelledTagText}>DIBATALKAN</Text>
              </View>
            )}
          </View>

          <View style={styles.headerRightActions}>
            {!isCancelled && (
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
            )}

            {canManage && (
              <Pressable onPress={onMorePressed} style={styles.moreButton} hitSlop={8}>
                <Ionicons name="ellipsis-horizontal" size={14} color={Colors.textWhite} />
              </Pressable>
            )}
          </View>
        </View>

        <View
          style={[
            styles.cardBody,
            { backgroundColor: isCancelled ? '#381C1C' : item.cardColor },
            isCancelled && styles.cardBodyCancelled,
          ]}
        >
          {isCancelled && (
            <View style={styles.cancelledBanner}>
              <Ionicons name="alert-circle" size={16} color="#F87171" style={{ marginRight: 6 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cancelledBannerTitle}>KELAS PERKULIAHAN DITIADAKAN</Text>
                <Text style={styles.cancelledBannerReason}>
                  {item.cancelledReason || 'Dosen Berhalangan Hadir'}
                </Text>
                {item.cancelledBy ? (
                  <Text style={styles.cancelledBannerBy}>
                    PIC: {item.cancelledBy}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          <Text style={styles.roomLabel}>Room</Text>
          <Text style={[styles.roomNumber, isCancelled && styles.textMuted]}>{item.room}</Text>

          <View style={styles.lecturerRow}>
            <Text style={styles.withText}>with </Text>
            <Text style={[styles.lecturerName, isCancelled && styles.textMuted]}>{item.lecturer}</Text>
          </View>

          <View style={styles.durationRow}>
            <View style={styles.durationLeft}>
              <Ionicons name="time" size={14} color={Colors.textWhite} />
              <Text style={styles.durationText}>{item.timeRange || item.duration}</Text>
            </View>
            {hasReminder && !isCancelled && (
              <View style={styles.reminderActiveTag}>
                <Ionicons name="alarm" size={12} color={Colors.accentYellow} />
                <Text style={styles.reminderActiveText}>
                  Pengingat H-{item.reminderMinutes && item.reminderMinutes > 0 ? item.reminderMinutes : 15}m Aktif
                </Text>
              </View>
            )}
          </View>

          {canManage && onToggleCancel && (
            <Pressable
              onPress={onToggleCancel}
              style={[
                styles.cancelToggleBtn,
                isCancelled ? styles.cancelToggleBtnActive : styles.cancelToggleBtnInactive,
              ]}
            >
              <Ionicons
                name={isCancelled ? 'checkmark-circle-outline' : 'close-circle-outline'}
                size={14}
                color={isCancelled ? '#4ADE80' : '#FCA5A5'}
              />
              <Text
                style={[
                  styles.cancelToggleBtnText,
                  { color: isCancelled ? '#4ADE80' : '#FCA5A5' },
                ]}
              >
                {isCancelled ? 'Aktifkan Kembali Jadwal Kuliah' : 'Batalkan Jadwal Kuliah Ini'}
              </Text>
            </Pressable>
          )}
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
  timeCancelled: {
    color: 'rgba(255, 255, 255, 0.35)',
    textDecorationLine: 'line-through',
  },
  cancelledMiniBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  cancelledMiniText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  cardOuterCancelled: {
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.6)',
  },
  titleCancelled: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  cancelledTag: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cancelledTagText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  cardBodyCancelled: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.45)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  cancelledBannerTitle: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '800',
  },
  cancelledBannerReason: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  cancelledBannerBy: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    marginTop: 2,
  },
  textMuted: {
    color: 'rgba(255, 255, 255, 0.45)',
  },
  cancelToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  cancelToggleBtnInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  cancelToggleBtnActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  cancelToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
