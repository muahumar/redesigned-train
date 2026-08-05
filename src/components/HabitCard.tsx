import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Habit, HabitLog } from '../types';

interface Props {
  habit: Habit;
  log?: HabitLog;
  onToggle: () => void;
}

export default function HabitCard({ habit, log, onToggle }: Props) {
  // P14 fix: SQLite stores booleans as 0/1 integers, not true/false.
  // Using `=== true || === 1` handles both the TypeScript type and the raw DB value.
  const completed = log?.completed === true || (log?.completed as any) === 1;
  const timeLabel = habit.scheduledTime ? `🕐 ${habit.scheduledTime}` : '';

  return (
    <TouchableOpacity style={styles.container} onPress={onToggle}>
      <View style={styles.left}>
        <Text style={styles.icon}>{habit.icon || '📌'}</Text>
        <View>
          <Text style={styles.name}>{habit.name}</Text>
          {timeLabel ? <Text style={styles.time}>{timeLabel}</Text> : null}
          {habit.target ? <Text style={styles.target}>{habit.target}</Text> : null}
        </View>
      </View>
      <View style={[styles.check, completed && styles.checkActive]}>
        {completed ? <Text style={styles.checkText}>✓</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { fontSize: 20, marginRight: 12 },
  name: { fontSize: 15, fontWeight: '600', color: '#1b1b1b' },
  time: { fontSize: 12, color: '#666', marginTop: 2 },
  target: { fontSize: 12, color: '#888', marginTop: 1 },
  check: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'center',
  },
  checkActive: { backgroundColor: '#4caf50', borderColor: '#4caf50' },
  checkText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
