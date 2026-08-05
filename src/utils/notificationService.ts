import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIFICATION_CHANNEL = 'istiqamah-reminders';
const notificationMap = new Map<number, string>();

// P5 fix: All functions are guarded — expo-notifications has no web support.
// On web, functions return safe defaults and do nothing.

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL, {
      name: 'Istiqamah Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1565c0',
    });
  }

  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

export async function scheduleSalahReminder(prayerName: string, hour: number, minute: number): Promise<string> {
  if (Platform.OS === 'web') return '';

  const trigger: Notifications.CalendarTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    hour,
    minute,
    repeats: true,
    channelId: Platform.OS === 'android' ? NOTIFICATION_CHANNEL : undefined,
  };

  const result = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Salah Reminder',
      body: `It's time for ${prayerName}`,
      sound: true,
    },
    trigger,
  });

  return result;
}

export async function scheduleHabitReminder(habitId: number, habitName: string, hour: number, minute: number): Promise<string> {
  if (Platform.OS === 'web') return '';

  const trigger: Notifications.CalendarTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    hour,
    minute,
    repeats: true,
    channelId: Platform.OS === 'android' ? NOTIFICATION_CHANNEL : undefined,
  };

  const result = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Habit Reminder',
      body: `Don't forget: ${habitName}`,
      sound: true,
    },
    trigger,
  });

  notificationMap.set(habitId, result);
  return result;
}

export async function cancelHabitReminder(habitId: number): Promise<void> {
  if (Platform.OS === 'web') return;

  const existing = notificationMap.get(habitId);
  if (existing) {
    await Notifications.cancelScheduledNotificationAsync(existing);
    notificationMap.delete(habitId);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  notificationMap.clear();
}

export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  if (Platform.OS === 'web') return [];

  return await Notifications.getAllScheduledNotificationsAsync();
}
