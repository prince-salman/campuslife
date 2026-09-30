import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { AssignmentTask } from '../../models/assignment';
import { notificationService } from '../../services/notificationService';

interface AssignmentCardProps {
  task: AssignmentTask;
  isCompleted: boolean;
  canManage: boolean;
  onToggleComplete: (taskId: string) => void;
  onEdit?: (task: AssignmentTask) => void;
  onDelete?: (taskId: string) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  task,
  isCompleted,
  canManage,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [reminded, setReminded] = useState<boolean>(false);

  const calculateDaysLeft = (deadlineDateStr: string): { label: string; isUrgent: boolean; isPast: boolean } => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [year, month, day] = deadlineDateStr.split('-').map(Number);
      const target = new Date(year, month - 1, day);
      target.setHours(0, 0, 0, 0);

      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return { label: `Lewat ${Math.abs(diffDays)} Hari`, isUrgent: true, isPast: true };
      } else if (diffDays === 0) {
        return { label: 'Deadline Hari Ini!', isUrgent: true, isPast: false };
      } else if (diffDays === 1) {
        return { label: 'Besok!', isUrgent: true, isPast: false };
      } else {
        return { label: `Sisa ${diffDays} Hari`, isUrgent: diffDays <= 3, isPast: false };
      }
    } catch {
      return { label: deadlineDateStr, isUrgent: false, isPast: false };
    }
  };

  const deadlineInfo = calculateDaysLeft(task.deadlineDate);

  const handleReminder = async () => {
    setReminded(true);
    await notificationService.sendLocalNotification(
      `Pengingat Tugas [${task.className}]: ${task.title}`,
      `Batas pengumpulan: ${task.deadlineDate} pukul ${task.deadlineTime}. Mata kuliah: ${task.courseName}.`
    );
    Alert.alert('Pengingat Aktif', `Notifikasi tugas ${task.title} berhasil dikirim ke bilah status HP Anda.`);
  };

  const handleOpenLink = () => {
    if (task.submissionLink) {
      Linking.openURL(task.submissionLink).catch(() => {
        Alert.alert('Gagal Membuka Link', 'Pastikan tautan pengumpulan valid.');
      });
    }
  };

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      <View style={styles.topMetaRow}>
        <View style={styles.badgeRow}>
          <View style={styles.classBadge}>
            <Ionicons name="people" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.classBadgeText}>{task.className}</Text>
          </View>

          <View
            style={[
              styles.priorityBadge,
              task.priority === 'high'
                ? styles.priorityHigh
                : task.priority === 'medium'
                ? styles.priorityMedium
                : styles.priorityNormal,
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                task.priority === 'medium' && styles.priorityTextDark,
              ]}
            >
              {task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Normal'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.daysBadge,
            isCompleted
              ? styles.daysBadgeCompleted
              : deadlineInfo.isUrgent
              ? styles.daysBadgeUrgent
              : styles.daysBadgeNormal,
          ]}
        >
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : 'time-outline'}
            size={12}
            color={isCompleted ? '#4ADE80' : deadlineInfo.isUrgent ? '#FF6B6B' : '#38BDF8'}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.daysText,
              isCompleted
                ? styles.daysTextCompleted
                : deadlineInfo.isUrgent
                ? styles.daysTextUrgent
                : styles.daysTextNormal,
            ]}
          >
            {isCompleted ? 'Selesai' : deadlineInfo.label}
          </Text>
        </View>
      </View>

      <Text style={styles.courseName}>{task.courseName}</Text>

      <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
        {task.title}
      </Text>

      <View style={styles.deadlineRow}>
        <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.deadlineText}>
          Deadline: {task.deadlineDate} • {task.deadlineTime}
        </Text>
      </View>

      {task.description ? (
        <View style={styles.descriptionSection}>
          <Pressable onPress={() => setExpanded(!expanded)} style={styles.expandRow}>
            <Text style={styles.descriptionLabel}>Petunjuk Pengerjaan</Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={Colors.accentYellow}
            />
          </Pressable>

          {expanded && (
            <Text style={styles.descriptionText}>{task.description}</Text>
          )}
        </View>
      ) : null}

      <View style={styles.creatorRow}>
        <Ionicons name="person-circle-outline" size={13} color="rgba(255,255,255,0.4)" />
        <Text style={styles.creatorText} numberOfLines={1}>
          Oleh: {task.createdBy}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <Pressable
          style={[styles.checkBtn, isCompleted && styles.checkBtnCompleted]}
          onPress={() => onToggleComplete(task.id)}
        >
          <Ionicons
            name={isCompleted ? 'checkbox' : 'square-outline'}
            size={18}
            color={isCompleted ? Colors.accentYellow : Colors.textSecondary}
          />
          <Text style={[styles.checkBtnText, isCompleted && styles.checkBtnTextCompleted]}>
            {isCompleted ? 'Selesai' : 'Tandai Selesai'}
          </Text>
        </Pressable>

        <View style={styles.actionButtonsRow}>
          {task.submissionLink ? (
            <Pressable style={styles.linkBtn} onPress={handleOpenLink} hitSlop={6}>
              <Ionicons name="open-outline" size={16} color="#38BDF8" />
            </Pressable>
          ) : null}

          <Pressable
            style={[styles.reminderBtn, reminded && styles.reminderBtnActive]}
            onPress={handleReminder}
            hitSlop={6}
          >
            <Ionicons
              name={reminded ? 'notifications' : 'notifications-outline'}
              size={16}
              color={reminded ? Colors.accentYellow : Colors.textWhite}
            />
          </Pressable>

          {canManage && onEdit ? (
            <Pressable style={styles.editBtn} onPress={() => onEdit(task)} hitSlop={6}>
              <Ionicons name="create-outline" size={16} color="#A380FF" />
            </Pressable>
          ) : null}

          {canManage && onDelete ? (
            <Pressable style={styles.deleteIconBtn} onPress={() => onDelete(task.id)} hitSlop={6}>
              <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#101726',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    marginBottom: 14,
  },
  cardCompleted: {
    backgroundColor: '#0D1420',
    borderColor: 'rgba(74, 222, 128, 0.25)',
    opacity: 0.88,
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  classBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C389E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  classBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  priorityMedium: {
    backgroundColor: Colors.accentYellow,
  },
  priorityNormal: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  priorityTextDark: {
    color: '#000000',
  },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  daysBadgeUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  daysBadgeNormal: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  daysBadgeCompleted: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  daysText: {
    fontSize: 11,
    fontWeight: '700',
  },
  daysTextUrgent: {
    color: '#FF6B6B',
  },
  daysTextNormal: {
    color: '#38BDF8',
  },
  daysTextCompleted: {
    color: '#4ADE80',
  },
  courseName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentYellow,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  deadlineText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  descriptionSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  descriptionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  descriptionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.78)',
    marginTop: 6,
    lineHeight: 18,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  creatorText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
  },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  checkBtnCompleted: {
    opacity: 0.9,
  },
  checkBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  checkBtnTextCompleted: {
    color: Colors.accentYellow,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderBtnActive: {
    backgroundColor: 'rgba(247, 206, 69, 0.2)',
    borderWidth: 1,
    borderColor: Colors.accentYellow,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#2D204A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
