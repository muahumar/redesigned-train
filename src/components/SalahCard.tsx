import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PrayerStatus, PrayerName } from '../types';
import { DEFAULT_SALAH } from '../constants/defaultSalah';

const STATUS_OPTIONS: { status: PrayerStatus; label: string; emoji: string }[] = [
  { status: 'jamaat', label: 'Jamaat', emoji: '✅' },
  { status: 'alone', label: 'Alone', emoji: '🟡' },
  { status: 'qada', label: 'Qada', emoji: '🔁' },
  { status: 'missed', label: 'Missed', emoji: '❌' },
];

interface Props {
  prayerName: PrayerName;
  status: PrayerStatus;
  onStatusChange: (status: PrayerStatus) => void;
}

export default function SalahCard({ prayerName, status, onStatusChange }: Props) {
  const prayer = DEFAULT_SALAH.find((p) => p.name === prayerName);
  const current = STATUS_OPTIONS.find((s) => s.status === status);

  return (
    <TouchableOpacity style={styles.container} onPress={() => {
      const idx = STATUS_OPTIONS.findIndex((s) => s.status === status);
      const next = STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length];
      onStatusChange(next.status);
    }}>
      <View style={styles.left}>
        <Text style={styles.emoji}>{prayer?.emoji || '🕌'}</Text>
        <View>
          <Text style={styles.name}>{prayer?.label || prayerName}</Text>
          <Text style={styles.status}>
            {current?.emoji} {current?.label || status}
          </Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  emoji: { fontSize: 22, marginRight: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#1b1b1b' },
  status: { fontSize: 13, color: '#444', marginTop: 2 },
  chevron: { fontSize: 22, color: '#888', fontWeight: '300' },
});
