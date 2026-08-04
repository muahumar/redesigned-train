import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PrayerName, PrayerStatus, Habit, HabitLog } from '../types';
import SalahCard from './SalahCard';
import HabitCard from './HabitCard';

export type TimelineItem =
  | { id: string; type: 'wake'; time?: string }
  | { id: string; type: 'salah'; prayerName: PrayerName; status: PrayerStatus; time?: string }
  | { id: string; type: 'habit'; habit: Habit; log?: HabitLog; time?: string }
  | { id: string; type: 'sleep'; time?: string };

interface Props {
  items: TimelineItem[];
  onSalahStatusChange: (id: string, status: PrayerStatus) => void;
  onHabitToggle: (id: string) => void;
}

export default function DayTimeline({ items, onSalahStatusChange, onHabitToggle }: Props) {
  const nonHabits = items.filter((i) => i.type !== 'habit');
  const timedHabits = items.filter((i): i is TimelineItem & { type: 'habit' } => i.type === 'habit' && !!i.time);
  const untimedHabits = items.filter((i): i is TimelineItem & { type: 'habit' } => i.type === 'habit' && !i.time);

  return (
    <View style={styles.root}>
      {nonHabits.map((item) => {
        if (item.type === 'wake') {
          return (
            <View key={item.id} style={styles.section}>
              <Text style={styles.sectionLabel}>🌅 Woke up</Text>
              <Text style={styles.timeText}>{item.time || '--:--'}</Text>
            </View>
          );
        }
        if (item.type === 'salah') {
          return (
            <SalahCard
              key={item.id}
              prayerName={item.prayerName}
              status={item.status}
              onStatusChange={(status) => onSalahStatusChange(item.id, status)}
            />
          );
        }
        if (item.type === 'sleep') {
          return (
            <View key={item.id} style={styles.section}>
              <Text style={styles.sectionLabel}>😴 Slept</Text>
              <Text style={styles.timeText}>{item.time || '--:--'}</Text>
            </View>
          );
        }
        return null;
      })}

      {timedHabits.map((item) => (
        <HabitCard
          key={item.id}
          habit={item.habit}
          log={item.log}
          onToggle={() => onHabitToggle(item.id)}
        />
      ))}

      {untimedHabits.length > 0 ? (
        <View style={styles.anytime}>
          <Text style={styles.anytimeLabel}>Anytime</Text>
          {untimedHabits.map((item) => (
            <HabitCard
              key={item.id}
              habit={item.habit}
              log={item.log}
              onToggle={() => onHabitToggle(item.id)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingVertical: 8 },
  section: { paddingHorizontal: 16, paddingVertical: 10 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#333' },
  timeText: { fontSize: 18, fontWeight: '600', color: '#555', marginTop: 4 },
  anytime: { marginTop: 8 },
  anytimeLabel: { fontSize: 14, fontWeight: '700', color: '#888', paddingHorizontal: 16, marginBottom: 6, textTransform: 'uppercase' },
});
