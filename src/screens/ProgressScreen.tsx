import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import dayjs from 'dayjs';
import { db, initDatabase } from '../db/database';
import { salahRepository } from '../db/salahRepository';
import { habitRepository } from '../db/habitRepository';
import { DEFAULT_SALAH } from '../constants/defaultSalah';
import { PrayerStatus, Habit, HabitLog } from '../types';
import ProgressCalendar from '../components/ProgressCalendar';
import StreakBadge from '../components/StreakBadge';
import EmptyState from '../components/EmptyState';
import { calculateStreak } from '../utils/streakCalculator';

type Range = 'weekly' | 'monthly' | 'yearly';

export default function ProgressScreen() {
  const [range, setRange] = useState<Range>('weekly');
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [salahStats, setSalahStats] = useState<{ prayerName: string; total: number; jamaat: number; qada: number; alone: number; missed: number }[]>([]);

  const dateRange = useMemo(() => {
    const end = dayjs();
    const start = range === 'weekly' ? end.subtract(7, 'day') : range === 'monthly' ? end.subtract(30, 'day') : end.subtract(365, 'day');
    return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') };
  }, [range]);

  const load = async () => {
    try {
      initDatabase();
      const allHabits = habitRepository.getAll();
      setHabits(allHabits);

      const stats = DEFAULT_SALAH.map((prayer) => {
        const entries = db.getAllSync<{ status: string }>('SELECT status FROM salah_entries WHERE prayerName = ? AND date BETWEEN ? AND ?', [prayer.name, dateRange.start, dateRange.end]);
        const total = entries.length;
        const jamaat = entries.filter((e) => e.status === 'jamaat').length;
        const qada = entries.filter((e) => e.status === 'qada').length;
        const alone = entries.filter((e) => e.status === 'alone').length;
        const missed = entries.filter((e) => e.status === 'missed').length;
        return { prayerName: prayer.name, total, jamaat, qada, alone, missed };
      });
      setSalahStats(stats);
    } catch (e) {
      // P3 fix: platform-aware error handling
      if (Platform.OS !== 'web') {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [range]);

  const getHabitStats = (habit: Habit) => {
    const logs = db.getAllSync<HabitLog>('SELECT * FROM habit_logs WHERE habitId = ? AND date BETWEEN ? AND ?', [habit.id, dateRange.start, dateRange.end]);
    const total = logs.length;
    const completed = logs.filter((l) => l.completed === true || (l.completed as any) === 1).length; // P14 fix
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const streak = calculateStreak(logs.map((l) => ({ date: l.date, completed: !!(l.completed) })));
    return { total, completed, percent, streak };
  };

  const getDayScore = (date: string): number => {
    const salahEntries = db.getAllSync<{ status: string }>('SELECT status FROM salah_entries WHERE date = ?', [date]);
    const logs = db.getAllSync<{ completed: number }>('SELECT completed FROM habit_logs WHERE date = ?', [date]);
    const obligatoryPrayed = salahEntries.filter((s) => s.status !== 'missed').length;
    const totalObligatory = DEFAULT_SALAH.filter((p) => p.name !== 'tahajjud').length;
    const habitCompleted = logs.filter((l) => l.completed === 1).length;
    const totalItems = totalObligatory + habits.length;
    const completedItems = obligatoryPrayed + habitCompleted;
    return totalItems > 0 ? completedItems / totalItems : 0;
  };

  // P15 fix: ActivityIndicator
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565c0" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">Progress</Text>
        <View style={styles.toggleRow}>
          {(['weekly', 'monthly', 'yearly'] as Range[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.toggleChip, range === r && styles.toggleActive]}
              onPress={() => setRange(r)}
              accessibilityLabel={`${r} range`}
              accessibilityRole="button"
            >
              <Text style={[styles.toggleText, range === r && styles.toggleTextActive]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Heat Map</Text>
        {/* P9 fix is in ProgressCalendar.tsx */}
        <ProgressCalendar range={dateRange} getDayScore={getDayScore} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habits</Text>
        {habits.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No habits yet"
            description="Tap the ＋ button on Today screen to create your first habit."
          />
        ) : (
          habits.map((habit) => {
            const stats = getHabitStats(habit);
            return (
              <View key={habit.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.icon}>{habit.icon || '📌'}</Text>
                  <View>
                    <Text style={styles.cardTitle}>{habit.name}</Text>
                    <Text style={styles.cardSub}>{stats.percent}% · {stats.completed}/{stats.total} completed</Text>
                  </View>
                </View>
                <StreakBadge streak={stats.streak} />
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Salah Stats</Text>
        {salahStats.map((stat) => {
          const prayer = DEFAULT_SALAH.find((p) => p.name === stat.prayerName);
          const percent = stat.total > 0 ? Math.round(((stat.jamaat + stat.qada) / stat.total) * 100) : 0;
          return (
            <View key={stat.prayerName} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.icon}>{prayer?.emoji || '🕌'}</Text>
                <View>
                  <Text style={styles.cardTitle}>{prayer?.label || stat.prayerName}</Text>
                  <Text style={styles.cardSub}>
                    Total: {stat.total} · Jamaat: {stat.jamaat} · Qada: {stat.qada} · Alone: {stat.alone} · Missed: {stat.missed}
                  </Text>
                </View>
              </View>
              <Text style={styles.percentText}>{percent}%</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#111', flex: 1 },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  toggleActive: { backgroundColor: '#1565c0', borderColor: '#1565c0' },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#555' },
  toggleTextActive: { color: '#fff' },
  section: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#666', textTransform: 'uppercase', marginBottom: 8 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { fontSize: 20, marginRight: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1b1b1b' },
  cardSub: { fontSize: 12, color: '#666', marginTop: 2 },
  percentText: { fontSize: 16, fontWeight: '700', color: '#1565c0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
});
