import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface HeaderWidgetProps {
  userName?: string;
  hasUnread?: boolean;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onLogoutPress?: () => void;
}

export const HeaderWidget: React.FC<HeaderWidgetProps> = ({
  userName = 'RICE',
  hasUnread = true,
  onNotificationPress,
  onProfilePress,
  onLogoutPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <Pressable onPress={onProfilePress} style={styles.avatar}>
          <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
        </Pressable>
        <View style={styles.textContainer}>
          <Text style={styles.greetingText} numberOfLines={1}>Hi, {userName}</Text>
          <Text style={styles.subGreeting} numberOfLines={1}>Welcome back to campus</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {onLogoutPress && (
          <Pressable onPress={onLogoutPress} style={styles.logoutButton} hitSlop={8}>
            <Ionicons name="log-out-outline" size={18} color="#FF8080" />
          </Pressable>
        )}
        <Pressable onPress={onNotificationPress} style={styles.notificationButton} hitSlop={8}>
          <Ionicons name="notifications-outline" size={20} color={Colors.textWhite} />
          {hasUnread && <View style={styles.badgeDot} />}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  leftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    flex: 1,
    marginLeft: 12,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: -0.3,
  },
  subGreeting: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
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