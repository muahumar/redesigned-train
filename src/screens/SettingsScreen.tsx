import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../utils/theme';
import { useAppStore } from '../store/useAppStore';
import TimePicker from '../components/TimePicker';
import { scheduleSalahReminder, cancelAllNotifications } from '../utils/notificationService';
import { DEFAULT_SALAH, SALAH_REMINDER_TIMES } from '../constants/defaultSalah';
import { settingsRepository } from '../db/settingsRepository';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList>; // P17 fix

const SALAH_NAMES = [
  { key: 'tahajjud', label: 'Tahajjud' },
  { key: 'fajr', label: 'Fajr' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
];

// Default times from shared constant
const DEFAULT_TIMES: Record<string, string> = {
  tahajjud: '02:30',
  fajr: '05:00',
  dhuhr: '12:30',
  asr: '16:00',
  maghrib: '18:30',
  isha: '20:00',
};

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { theme, toggleTheme } = useTheme();
  const { setOnboarded } = useAppStore();
  const [reminders, setReminders] = useState<Record<string, boolean>>({
    tahajjud: true, fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true,
  });
  const [times, setTimes] = useState<Record<string, string>>(DEFAULT_TIMES);

  // P7 fix: Load persisted settings on mount
  useEffect(() => {
    try {
      const savedTimes: Record<string, string> = {};
      const savedReminders: Record<string, boolean> = {};
      SALAH_NAMES.forEach(({ key }) => {
        const t = settingsRepository.get(`reminder_time_${key}`);
        const r = settingsRepository.get(`reminder_on_${key}`);
        if (t) savedTimes[key] = t;
        if (r !== undefined) savedReminders[key] = r === 'true';
      });
      if (Object.keys(savedTimes).length) setTimes((prev) => ({ ...prev, ...savedTimes }));
      if (Object.keys(savedReminders).length) setReminders((prev) => ({ ...prev, ...savedReminders }));
    } catch (e) {
      console.warn('Settings load error:', e);
    }
  }, []);

  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#111' : '#f9fafb';
  const cardColor = isDark ? '#1e1e1e' : '#fff';
  const textColor = isDark ? '#fff' : '#111';
  const subtextColor = isDark ? '#aaa' : '#666';

  // P7 fix: Persist on toggle
  const toggleReminder = async (key: string) => {
    const newValue = !reminders[key];
    setReminders((prev) => ({ ...prev, [key]: newValue }));
    try {
      settingsRepository.set(`reminder_on_${key}`, newValue ? 'true' : 'false');
    } catch (e) { /* web: ignore */ }
    if (newValue) {
      const time = SALAH_REMINDER_TIMES[key] || { hour: 0, minute: 0 };
      await scheduleSalahReminder(key, time.hour, time.minute);
    } else {
      await cancelAllNotifications();
    }
  };

  // P7 fix: Persist on time change
  const updateTime = (key: string, time: string) => {
    setTimes((prev) => ({ ...prev, [key]: time }));
    try {
      settingsRepository.set(`reminder_time_${key}`, time);
    } catch (e) { /* web: ignore */ }
  };

  const resetOnboarding = () => {
    Alert.alert('Reset Onboarding', 'This will show the onboarding flow again on next launch.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        onPress: () => {
          setOnboarded(false);
          Alert.alert('Success', 'Onboarding has been reset');
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor }]}>
      <View style={[styles.section, { backgroundColor: cardColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Appearance</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: textColor }]}>Dark Mode</Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: cardColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Salah Reminders</Text>
        {SALAH_NAMES.map((salah) => (
          <View key={salah.key} style={[styles.card, { borderBottomColor: isDark ? '#333' : '#f0f0f0' }]}>
            <View style={styles.cardRow}>
              <Text style={[styles.cardLabel, { color: textColor }]}>{salah.label}</Text>
              <Switch value={reminders[salah.key]} onValueChange={() => toggleReminder(salah.key)} />
            </View>
            <View style={styles.timeRow}>
              <Text style={[styles.timeLabel, { color: subtextColor }]}>Reminder Time</Text>
              <TimePicker value={times[salah.key]} onChange={(time) => updateTime(salah.key, time)} />
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: cardColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>About</Text>
        <Text style={[styles.aboutText, { color: subtextColor }]}>
          Istiqamah is a habit and Salah tracker designed to help you stay consistent with your daily worship and good habits.
          {'\n\n'}
          This app is fully offline and local-first. No data is sent to any server.
          {'\n\n'}
          Version 1.0.0
        </Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.resetButton} onPress={resetOnboarding}>
          <Text style={styles.resetText}>Reset Onboarding</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  section: { marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 16 },
  card: { paddingVertical: 12, borderBottomWidth: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLabel: { fontSize: 15, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  timeLabel: { fontSize: 13 },
  aboutText: { fontSize: 14, lineHeight: 20 },
  resetButton: { padding: 16, borderRadius: 10, backgroundColor: '#ff5252', alignItems: 'center' },
  resetText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
