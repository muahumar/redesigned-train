import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Habit, HabitFrequency } from '../types';
import { habitRepository } from '../db/habitRepository';
import TimePicker from '../components/TimePicker';
import { scheduleHabitReminder, cancelHabitReminder } from '../utils/notificationService';

const ICONS = ['📌', '📖', '💧', '🧘', '📿', '🏃', '💪', '📝', '🎯', '⏰', '🌅', '🌙', '📚', '🕌', '💊', '🥗'];

const FREQUENCIES: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekdays', label: 'Specific weekdays' },
];

type RootStackParamList = {
  AddHabit: { habitId?: number };
  Today: undefined;
};

type AddHabitRouteProp = RouteProp<RootStackParamList, 'AddHabit'>;
type AddHabitNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddHabit'>;

interface Props {
  route: AddHabitRouteProp;
  navigation: AddHabitNavigationProp;
}

export default function AddHabitScreen({ route, navigation }: Props) {
  const { habitId } = route.params || {};
  const isEditing = !!habitId;

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📌');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [scheduledTime, setScheduledTime] = useState<string | undefined>(undefined);
  const [target, setTarget] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && habitId) {
      const habit = habitRepository.getById(habitId);
      if (habit) {
        setName(habit.name);
        setIcon(habit.icon);
        setFrequency(habit.frequency);
        setScheduledTime(habit.scheduledTime);
        setTarget(habit.target || '');
        setReminderEnabled(habit.reminderEnabled);
      }
    }
  }, [habitId, isEditing]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }
    setSaving(true);
    try {
      if (isEditing && habitId) {
        const existing = habitRepository.getById(habitId);
        if (!existing) throw new Error('Habit not found');
        habitRepository.update(habitId, {
          name: name.trim(),
          icon,
          type: existing.type,
          frequency,
          scheduledTime,
          target: target.trim() || undefined,
          reminderEnabled,
          archived: existing.archived,
          createdAt: existing.createdAt,
        });

        if (reminderEnabled && scheduledTime) {
          const [hourStr, minuteStr] = scheduledTime.split(':');
          const hour = Number(hourStr);
          const minute = Number(minuteStr);
          await scheduleHabitReminder(habitId, name.trim(), hour, minute);
        } else {
          await cancelHabitReminder(habitId);
        }

        Alert.alert('Success', 'Habit updated');
      } else {
        const created = habitRepository.create({
          name: name.trim(),
          icon,
          type: 'custom',
          frequency,
          scheduledTime,
          target: target.trim() || undefined,
          reminderEnabled,
          archived: false,
          createdAt: new Date().toISOString(),
        });

        if (reminderEnabled && scheduledTime) {
          const [hourStr, minuteStr] = scheduledTime.split(':');
          const hour = Number(hourStr);
          const minute = Number(minuteStr);
          await scheduleHabitReminder(created.id, name.trim(), hour, minute);
        }

        Alert.alert('Success', 'Habit created');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.root}>
      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Drink water"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[styles.iconItem, icon === emoji && styles.iconSelected]}
              onPress={() => setIcon(emoji)}
            >
              <Text style={styles.iconText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.frequencyRow}>
          {FREQUENCIES.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.frequencyChip, frequency === f.value && styles.frequencyActive]}
              onPress={() => setFrequency(f.value)}
            >
              <Text style={[styles.frequencyText, frequency === f.value && styles.frequencyTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Scheduled Time (optional)</Text>
        <TimePicker value={scheduledTime} onChange={setScheduledTime} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Target (optional)</Text>
        <TextInput
          style={styles.input}
          value={target}
          onChangeText={setTarget}
          placeholder="e.g. 3x a day, 30 minutes"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Reminder</Text>
          <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>{isEditing ? 'Update Habit' : 'Create Habit'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  section: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 8, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconItem: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', marginRight: 8, marginBottom: 8 },
  iconSelected: { backgroundColor: '#e3f2fd', borderWidth: 2, borderColor: '#1565c0' },
  iconText: { fontSize: 22 },
  frequencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  frequencyChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  frequencyActive: { backgroundColor: '#1565c0', borderColor: '#1565c0' },
  frequencyText: { fontSize: 14, fontWeight: '600', color: '#555' },
  frequencyTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  saveButton: { margin: 16, padding: 16, borderRadius: 10, backgroundColor: '#1565c0', alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
