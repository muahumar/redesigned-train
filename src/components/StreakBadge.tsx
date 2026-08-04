import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  streak: number;
}

export default function StreakBadge({ streak }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🔥 {streak} days</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8, backgroundColor: '#fff3e0', borderRadius: 16 },
  text: { fontSize: 14, fontWeight: '600', color: '#e65100' },
});
