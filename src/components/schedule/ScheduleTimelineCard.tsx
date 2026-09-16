import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { ScheduleItem } from '../../models/schedule';
import { Ionicons } from '@expo/vector-icons';

interface ScheduleTimelineCardProps {
  item: ScheduleItem;
  onMorePressed?: () => void;
}

export const ScheduleTimelineCard: React.FC<ScheduleTimelineCardProps> = ({
  item,
  onMorePressed,
}) => {
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
          <Pressable onPress={onMorePressed} style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={14} color={Colors.textWhite} />
          </Pressable>
        </View>

        <View style={[styles.cardBody, { backgroundColor: item.cardColor }]}>
          <Text style={styles.roomLabel}>Room</Text>
          <Text style={styles.roomNumber}>{item.room}</Text>

          <View style={styles.lecturerRow}>
            <Text style={styles.withText}>with </Text>
            <Text style={styles.lecturerName}>{item.lecturer}</Text>
          </View>

          <View style={styles.durationRow}>
            <Ionicons name="time" size={14} color={Colors.textWhite} />
            <Text style={styles.durationText}>{item.duration}</Text>
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
  moreButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
    gap: 6,
    marginTop: 10,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textWhite,
  },
});