import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIFICATION_CHANNEL = 'istiqamah-reminders';
const notificationMap = new Map<number, string>();

export async function requestNotificationPermissions(): Promise<boolean> {
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
  const existing = notificationMap.get(habitId);
  if (existing) {
    await Notifications.cancelScheduledNotificationAsync(existing);
    notificationMap.delete(habitId);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  notificationMap.clear();
}

export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
