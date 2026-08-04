import { PrayerName } from '../types';

export const DEFAULT_SALAH: { name: PrayerName; label: string; emoji: string }[] = [
  { name: 'tahajjud', label: 'Tahajjud', emoji: '🌌' },
  { name: 'fajr', label: 'Fajr', emoji: '🌅' },
  { name: 'dhuhr', label: 'Dhuhr', emoji: '☀️' },
  { name: 'asr', label: 'Asr', emoji: '🌤️' },
  { name: 'maghrib', label: 'Maghrib', emoji: '🌇' },
  { name: 'isha', label: 'Isha', emoji: '🌃' },
];

export const SALAH_REMINDER_TIMES: Record<string, { hour: number; minute: number }> = {
  tahajjud: { hour: 2, minute: 30 },
  fajr: { hour: 5, minute: 0 },
  dhuhr: { hour: 12, minute: 30 },
  asr: { hour: 16, minute: 0 },
  maghrib: { hour: 18, minute: 30 },
  isha: { hour: 20, minute: 0 },
};
