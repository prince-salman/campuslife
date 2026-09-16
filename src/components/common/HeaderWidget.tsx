import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface HeaderWidgetProps {
  userName?: string;
  hasUnread?: boolean;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const HeaderWidget: React.FC<HeaderWidgetProps> = ({
  userName = 'RICE',
  hasUnread = true,
  onNotificationPress,
  onProfilePress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <Pressable onPress={onProfilePress} style={styles.avatar}>
          <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
        </Pressable>
        <View style={styles.textContainer}>
          <Text style={styles.greetingText}>Hi, {userName}</Text>
          <Text style={styles.subGreeting}>Welcome back to campus</Text>
        </View>
      </View>

      <Pressable onPress={onNotificationPress} style={styles.notificationButton}>
        <Ionicons name="notifications-outline" size={20} color={Colors.textWhite} />
        {hasUnread && <View style={styles.badgeDot} />}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.badgeRed,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.textWhite,
  },
  avatarText: {
    color: Colors.textWhite,
    fontSize: 18,
    fontWeight: '800',
  },
  textContainer: {
    marginLeft: 12,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: -0.3,
  },
  subGreeting: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.badgeRed,
  },
});