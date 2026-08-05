import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { db, initDatabase } from '../db/database';
import { salahRepository } from '../db/salahRepository';
import { habitRepository } from '../db/habitRepository';
import { dayLogRepository } from '../db/dayLogRepository';
import { DEFAULT_SALAH, SALAH_REMINDER_TIMES } from '../constants/defaultSalah'; // P6 fix: use shared constant
import { PrayerStatus, PrayerName, Habit, HabitLog, DayLog } from '../types';
import DayTimeline, { TimelineItem } from '../components/DayTimeline';
import TimePicker from '../components/TimePicker';
import { scheduleSalahReminder, cancelAllNotifications } from '../utils/notificationService';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList>; // P17 fix: typed navigation

const TODAY = dayjs().format('YYYY-MM-DD');

export default function TodayScreen() {
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);
  const [dayLog, setDayLog] = useState<DayLog | undefined>();
  const [salahEntries, setSalahEntries] = useState<{ id: string; prayerName: PrayerName; status: PrayerStatus }[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);

  const load = async () => {
    try {
      initDatabase();
      salahRepository.seedDaily(TODAY);
      const entries = salahRepository.getByDate(TODAY);
      setSalahEntries(entries.map((e) => ({ id: String(e.id), prayerName: e.prayerName, status: e.status })));
      const allHabits = habitRepository.getAll();
      setHabits(allHabits);
      const logs = allHabits.flatMap((h) => habitRepository.getLogsForDate(TODAY).filter((l) => l.habitId === h.id));
      setHabitLogs(logs);
      setDayLog(dayLogRepository.getByDate(TODAY));
    } catch (e) {
      // P3 fix: platform-aware error reporting
      if (Platform.OS !== 'web') {
        Alert.alert('Error', String(e));
      } else {
        console.warn('TodayScreen load error (web):', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let mounted = true;
    const schedule = async () => {
      await cancelAllNotifications();
      for (const salah of DEFAULT_SALAH) {
        const time = SALAH_REMINDER_TIMES[salah.name]; // P6 fix: use shared constant
        if (time && mounted) {
          await scheduleSalahReminder(salah.label, time.hour, time.minute);
        }
      }
    };
    schedule();
    return () => { mounted = false; };
  }, []);

  const updateSalahStatus = (id: string, status: PrayerStatus) => {
    const numericId = Number(id);
    const existing = salahRepository.getByDate(TODAY).find((e) => e.id === numericId);
    if (!existing) return;
    salahRepository.upsert({ ...existing, status, loggedAt: new Date().toISOString() });
    setSalahEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const toggleHabit = (habitId: number) => {
    const existing = habitRepository.getLogsForDate(TODAY).find((l) => l.habitId === habitId);
    if (existing) {
      const updated = { ...existing, completed: !existing.completed, completedAt: existing.completed ? undefined : new Date().toISOString() };
      habitRepository.updateLog(existing.id, updated);
      setHabitLogs((prev) => prev.map((l) => (l.id === existing.id ? updated : l)));
    } else {
      const created = habitRepository.logCompletion({ habitId, date: TODAY, completed: true, completedAt: new Date().toString() });
      setHabitLogs((prev) => [...prev, created]);
    }
  };

  const updateWakeUp = (time: string) => {
    const updated = dayLogRepository.upsert({ date: TODAY, wakeUpTime: time, sleepTime: dayLog?.sleepTime });
    setDayLog(updated);
  };

  const updateSleep = (time: string) => {
    const updated = dayLogRepository.upsert({ date: TODAY, wakeUpTime: dayLog?.wakeUpTime, sleepTime: time });
    setDayLog(updated);
  };

  const buildTimeline = (): TimelineItem[] => {
    const items: TimelineItem[] = [];
    items.push({ id: 'wake', type: 'wake', time: dayLog?.wakeUpTime });

    for (const salah of DEFAULT_SALAH) {
      const entry = salahEntries.find((s) => s.prayerName === salah.name);
      if (entry) {
        items.push({ id: String(entry.id), type: 'salah', prayerName: entry.prayerName, status: entry.status });
      }
    }

    const timedHabits: TimelineItem[] = habits
      .filter((h) => h.scheduledTime)
      .map((h) => {
        const log = habitLogs.find((l) => l.habitId === h.id);
        return { id: `habit-${h.id}`, type: 'habit', habit: h, log, time: h.scheduledTime! };
      });

    const untimedHabits: TimelineItem[] = habits
      .filter((h) => !h.scheduledTime)
      .map((h) => {
        const log = habitLogs.find((l) => l.habitId === h.id);
        return { id: `habit-${h.id}`, type: 'habit', habit: h, log };
      });

    items.push(...timedHabits);
    items.push(...untimedHabits);
    items.push({ id: 'sleep', type: 'sleep', time: dayLog?.sleepTime });
    return items;
  };

  // P15 fix: ActivityIndicator instead of plain text
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565c0" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          {/* P10 fix: smaller font + flex-wrap so button doesn't get squeezed */}
          <Text style={styles.title} accessibilityRole="header">{dayjs(TODAY).format('ddd, MMM D, YYYY')}</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => navigation.navigate('SharePreview', { date: TODAY })}
            accessibilityLabel="Share my day"
            accessibilityRole="button"
          >
            <Text style={styles.shareButtonText}>Share 📤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wake-up</Text>
          <TimePicker value={dayLog?.wakeUpTime} onChange={updateWakeUp} />
        </View>

        <DayTimeline
          items={buildTimeline()}
          onSalahStatusChange={updateSalahStatus}
          onHabitToggle={(id) => toggleHabit(Number(id.replace('habit-', '')))}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep</Text>
          <TimePicker value={dayLog?.sleepTime} onChange={updateSleep} />
        </View>
      </ScrollView>

      {/* P4 fix: FAB to navigate to AddHabit */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddHabit', {})}
        accessibilityLabel="Add new habit"
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  root: { flex: 1, backgroundColor: '#f9fafb' },
  content: { paddingBottom: 80 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '800', color: '#111', flex: 1, flexWrap: 'wrap' }, // P10 fix
  shareButton: { backgroundColor: '#1565c0', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  shareButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  section: { paddingHorizontal: 16, paddingVertical: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#666', textTransform: 'uppercase', marginBottom: 6 },
  // P4 fix: FAB styles
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1565c0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 34 },
});
