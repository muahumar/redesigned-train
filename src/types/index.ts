export type PrayerName = 'tahajjud' | 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type PrayerStatus = 'jamaat' | 'alone' | 'qada' | 'missed';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'weekdays';

export interface Habit {
  id: number;
  name: string;
  icon: string;
  type: 'salah' | 'custom';
  frequency: HabitFrequency;
  scheduledTime?: string;
  target?: string;
  reminderEnabled: boolean;
  archived: boolean;
  createdAt: string;
}

export interface SalahEntry {
  id: number;
  date: string;
  prayerName: PrayerName;
  status: PrayerStatus;
  loggedAt: string;
}

export interface HabitLog {
  id: number;
  habitId: number;
  date: string;
  completed: boolean;
  completedAt?: string;
  note?: string;
}

export interface DayLog {
  id: number;
  date: string;
  wakeUpTime?: string;
  sleepTime?: string;
}
