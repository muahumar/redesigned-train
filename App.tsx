import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
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

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { onboarded, hydrate } = useAppStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await requestNotificationPermissions();
      hydrate();
      setReady(true);
    })();
  }, [hydrate]);

  if (!ready) {
    return null;
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
