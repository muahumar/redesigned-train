import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { requestNotificationPermissions } from './src/utils/notificationService';
import { useAppStore } from './src/store/useAppStore';
import { ThemeProvider } from './src/utils/theme';

import TodayScreen from './src/screens/TodayScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddHabitScreen from './src/screens/AddHabitScreen';
import ShareScreen from './src/screens/ShareScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  AddHabit: { habitId?: number };
  SharePreview: { date: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// P11 fix: Tab bar with emoji icons and active color
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1565c0',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { paddingBottom: 4, height: 56 },
        tabBarIcon: ({ focused }) => {
          const icons: Record<string, string> = {
            Today: '🗓️',
            Progress: '📊',
            Settings: '⚙️',
          };
          return (
            <Text style={{ fontSize: focused ? 22 : 19, opacity: focused ? 1 : 0.55 }}>
              {icons[route.name] ?? '●'}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { onboarded, hydrate } = useAppStore();
  const [ready, setReady] = useState(false);

  // P2 fix: wrap in try/catch so setReady(true) is ALWAYS called,
  // even if notifications or DB hydration fail (e.g. on web).
  useEffect(() => {
    (async () => {
      try {
        await requestNotificationPermissions();
        hydrate();
      } catch (e) {
        console.warn('App init error (safe to ignore on web):', e);
      } finally {
        setReady(true);
      }
    })();
  }, [hydrate]);

  // P2 fix: show spinner instead of null while loading
  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1565c0" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName={onboarded ? 'Main' : 'Onboarding'}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="AddHabit" component={AddHabitScreen} options={{ title: 'Add Habit' }} />
          <Stack.Screen name="SharePreview" component={ShareScreen} options={{ title: 'Share Preview' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
