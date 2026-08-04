import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';

interface Props {
  range: { start: string; end: string };
  getDayScore: (date: string) => number;
}

export default function ProgressCalendar({ range, getDayScore }: Props) {
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const getColor = (score: number) => {
    if (score === 0) return '#f0f0f0';
    if (score < 0.33) return '#c8e6c9';
    if (score < 0.66) return '#66bb6a';
    return '#2e7d32';
  };

  return (
    <View style={styles.root}>
      <Calendar
        markingType="custom"
        hideExtraDays
        enableSwipeMonths
        style={styles.calendar}
        maxDate={maxDate}
        theme={{
          calendarBackground: '#fff',
          dayTextColor: '#333',
          textDisabledColor: '#ccc',
          todayTextColor: '#1565c0',
          arrowColor: '#1565c0',
          monthTextColor: '#111',
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
        markedDates={(() => {
          const marked: Record<string, { color: string; textColor: string }> = {};
          const current = dayjs(range.start);
          const end = dayjs(range.end);
          while (current.isBefore(end) || current.isSame(end, 'day')) {
            const dateStr = current.format('YYYY-MM-DD');
            const score = getDayScore(dateStr);
            marked[dateStr] = {
              color: getColor(score),
              textColor: score > 0 ? '#fff' : '#333',
            };
            current.add(1, 'day');
          }
          return marked;
        })()}
        onDayPress={(day) => {
          const score = getDayScore(day.dateString);
          const percent = Math.round(score * 100);
          Alert.alert('Day Score', `${day.dateString}\n${percent}% completed`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  calendar: { paddingBottom: 12 },
});
