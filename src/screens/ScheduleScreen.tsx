import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScheduleCalendarHeader } from '../components/schedule/ScheduleCalendarHeader';
import { ScheduleTimelineCard } from '../components/schedule/ScheduleTimelineCard';
import { MonthPickerModal } from '../components/schedule/MonthPickerModal';
import {
  AddEditScheduleModal,
  ScheduleFormData,
} from '../components/schedule/AddEditScheduleModal';
import { scheduleService } from '../services/scheduleService';
import { DaySchedule, ScheduleItem } from '../models/schedule';
import { Ionicons } from '@expo/vector-icons';

export const ScheduleScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? Math.max(insets.top, 38) : Math.max(insets.top, 12);

  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>(scheduleService.getWeekSchedule());
  const [monthYear, setMonthYear] = useState<string>(scheduleService.getSelectedMonthYear());
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(scheduleService.getSelectedDayIndex());

  const [monthPickerVisible, setMonthPickerVisible] = useState<boolean>(false);
  const [addEditModalVisible, setAddEditModalVisible] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  useEffect(() => {
    const unsubscribe = scheduleService.subscribe(() => {
      setWeekSchedule(scheduleService.getWeekSchedule());
      setMonthYear(scheduleService.getSelectedMonthYear());
      setSelectedDayIndex(scheduleService.getSelectedDayIndex());
    });
    return unsubscribe;
  }, []);

  const handleDaySelect = (index: number) => {
    scheduleService.setSelectedDayIndex(index);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setModalMode('add');
    setAddEditModalVisible(true);
  };

  const handleEditItem = (item: ScheduleItem) => {
    setEditingItem(item);
    setModalMode('edit');
    setAddEditModalVisible(true);
  };

  const handleSaveSchedule = (data: ScheduleFormData) => {
    if (modalMode === 'add') {
      scheduleService.addScheduleItem({
        dayIndex: data.dayIndex,
        title: data.title,
        lecturer: data.lecturer,
        room: data.room,
        time: data.time,
        timePeriod: data.timePeriod,
        duration: data.duration,
        timeRange: data.timeRange,
        headerColor: data.headerColor,
        cardColor: data.cardColor,
      });
    } else if (modalMode === 'edit' && editingItem) {
      scheduleService.updateScheduleItem({
        dayIndex: data.dayIndex,
        itemId: editingItem.id,
        title: data.title,
        lecturer: data.lecturer,
        room: data.room,
        time: data.time,
        timePeriod: data.timePeriod,
        duration: data.duration,
        timeRange: data.timeRange,
        headerColor: data.headerColor,
        cardColor: data.cardColor,
      });
    }
  };

  const handleDeleteSchedule = (dayIdx: number, itemId: string) => {
    scheduleService.deleteScheduleItem(dayIdx, itemId);
  };

  const handleSelectMonthYear = (newMonthYear: string) => {
    scheduleService.setSelectedMonthYear(newMonthYear);
  };

  const currentDay = weekSchedule[selectedDayIndex] || {
    dayName: 'Hari',
    dayNumber: '01',
    items: [],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.responsiveContainer}>
        <ScheduleCalendarHeader
          currentMonthYear={monthYear}
          days={weekSchedule}
          selectedIndex={selectedDayIndex}
          onDaySelected={handleDaySelect}
          onMonthDropdownTap={() => setMonthPickerVisible(true)}
          topPadding={topPadding}
        />

        {/* Action Header Bar */}
        <View style={styles.actionHeaderBar}>
          <View style={styles.dayInfoCol}>
            <Text style={styles.dayInfoTitle}>
              Jadwal {currentDay.dayName}, {currentDay.dayNumber} {monthYear.split(',')[0]}
            </Text>
            <Text style={styles.dayInfoSub}>
              {currentDay.items.length} mata kuliah terdaftar
            </Text>
          </View>

          <Pressable style={styles.addScheduleBtn} onPress={handleAddNew}>
            <Ionicons name="add" size={16} color="#000000" />
            <Text style={styles.addScheduleBtnText}>Tambah Jadwal</Text>
          </Pressable>
        </View>

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
                Hari {currentDay.dayName} ini belum ada agenda kuliah aktif.
              </Text>
              <Pressable style={styles.emptyAddBtn} onPress={handleAddNew}>
                <Ionicons name="add-circle-outline" size={18} color={Colors.accentYellow} />
                <Text style={styles.emptyAddBtnText}>Tambah Jadwal Hari Ini</Text>
              </Pressable>
            </View>
          ) : (
            currentDay.items.map((item) => (
              <ScheduleTimelineCard
                key={item.id}
                item={item}
                onMorePressed={() => handleEditItem(item)}
              />
            ))
          )}
        </ScrollView>
      </View>

      {/* Month Picker Modal */}
      <MonthPickerModal
        visible={monthPickerVisible}
        currentMonthYear={monthYear}
        onClose={() => setMonthPickerVisible(false)}
        onSelect={handleSelectMonthYear}
      />

      {/* Add / Edit Schedule Modal */}
      <AddEditScheduleModal
        visible={addEditModalVisible}
        mode={modalMode}
        initialDayIndex={selectedDayIndex}
        initialItem={editingItem}
        onClose={() => setAddEditModalVisible(false)}
        onSave={handleSaveSchedule}
        onDelete={handleDeleteSchedule}
      />
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
  actionHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  dayInfoCol: {
    flex: 1,
    paddingRight: 10,
  },
  dayInfoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  dayInfoSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  addScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentYellow,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addScheduleBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
    height: '100%',
  },
  timelineContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 14,
  },
  emptyAddBtnText: {
    color: Colors.accentYellow,
    fontSize: 13,
    fontWeight: '700',
  },
});