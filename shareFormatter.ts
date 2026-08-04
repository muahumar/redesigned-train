import dayjs from 'dayjs';
import { db } from '../db/database';
import { DEFAULT_SALAH } from '../constants/defaultSalah';
import { PrayerStatus, Habit, HabitLog, DayLog } from '../types';

const STATUS_MAP: Record<PrayerStatus, string> = {
  jamaat: '✅ Jamaat',
  alone: '🟡 Alone',
  qada: '🔁 Qada',
  missed: '❌ Missed',
};

function getDayLog(date: string): DayLog | undefined {
  const row = db.getFirstSync<DayLog>('SELECT * FROM day_logs WHERE date = ?', [date]);
  return row ?? undefined;
}

function getSalahEntries(date: string) {
  return db.getAllSync<{ prayerName: string; status: string }>('SELECT * FROM salah_entries WHERE date = ? ORDER BY id', [date]);
}

function getHabits() {
  return db.getAllSync<Habit>('SELECT * FROM habits WHERE archived = 0') as Habit[];
}

function getHabitLogsForDate(date: string) {
  return db.getAllSync<HabitLog>('SELECT * FROM habit_logs WHERE date = ?', [date]) as HabitLog[];
}

function calculateStreak(): number {
  let streak = 0;
  let d = dayjs();
  while (true) {
    const dateStr = d.format('YYYY-MM-DD');
    const logs = getHabitLogsForDate(dateStr);
    const salah = getSalahEntries(dateStr);
    const hasActivity = logs.some((l) => l.completed) || salah.some((s) => s.status !== 'missed');
    if (hasActivity) {
      streak++;
      d = d.subtract(1, 'day');
    } else {
      break;
    }
  }
  return streak;
}

export function generateShareText(dateStr: string): string {
  const date = dayjs(dateStr);
  const dayLog = getDayLog(dateStr);
  const salahEntries = getSalahEntries(dateStr);
  const habits = getHabits();
  const logs = getHabitLogsForDate(dateStr);
  const logMap = new Map(logs.map((l) => [l.habitId, l]));

  const weekday = date.format('dddd');
  const day = date.format('D');
  const month = date.format('MMMM');
  const year = date.format('YYYY');
  const generatedAt = dayjs().format('h:mm A');

  const lines: string[] = [];
  lines.push(`🌙 *My Day – ${weekday}, ${day} ${month} ${year}*`);
  lines.push(`🕐 Report generated at ${generatedAt}`);
  lines.push('');
  lines.push(`🌅 Woke up: ${dayLog?.wakeUpTime || '—'}`);
  lines.push('');
  lines.push('🕌 *Salah Tracker*');

  for (const prayer of DEFAULT_SALAH) {
    const entry = salahEntries.find((s) => s.prayerName === prayer.name);
    const status = entry ? STATUS_MAP[entry.status as PrayerStatus] : STATUS_MAP.missed;
    lines.push(`${prayer.emoji} ${prayer.label} — ${status}`);
  }

  lines.push('');
  lines.push('📋 *Habits & Routine*');

  const timedHabits: { habit: Habit; log?: HabitLog; time?: string }[] = [];
  const untimedHabits: { habit: Habit; log?: HabitLog }[] = [];

  for (const habit of habits) {
    const log = logMap.get(habit.id);
    if (habit.scheduledTime) {
      timedHabits.push({ habit, log, time: habit.scheduledTime });
    } else {
      untimedHabits.push({ habit, log });
    }
  }

  for (const item of timedHabits) {
    const check = item.log?.completed ? '✅' : '❌';
    lines.push(`${item.time} ${item.habit.name} ${check}`);
  }

  if (untimedHabits.length > 0) {
    lines.push('(Anytime)');
    for (const item of untimedHabits) {
      const check = item.log?.completed ? '✅' : '❌';
      lines.push(`${item.habit.name} ${check}`);
    }
  }

  lines.push('');
  lines.push(`😴 Slept: ${dayLog?.sleepTime || '—'}`);
  lines.push('');

  const totalObligatory = DEFAULT_SALAH.filter((p) => p.name !== 'tahajjud').length;
  const prayedCount = salahEntries.filter((s) => s.prayerName !== 'tahajjud' && s.status !== 'missed').length;
  const totalItems = totalObligatory + habits.length;
  const completedItems = prayedCount + logs.filter((l) => l.completed).length;
  const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const streak = calculateStreak();

  lines.push(`📊 Discipline Score: ${completedItems}/${totalItems} (${percent}%)`);
  lines.push(`🔥 Current Streak: ${streak} days`);
  lines.push('');
  lines.push('_Shared via Istiqamah_');

  return lines.join('\n');
}
