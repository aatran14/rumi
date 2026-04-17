import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { colors } from './src/theme';
import type { RootStackParamList, TabParamList } from './src/types';
import { SyncProvider } from './src/contexts/SyncContext';
import { AuthProvider } from './src/contexts/AuthContext';

import SplashScreen       from './src/screens/SplashScreen';
import LoginScreen        from './src/screens/LoginScreen';
import SignUpScreen       from './src/screens/SignUpScreen';
import HomeScreen         from './src/screens/HomeScreen';
import ToDoScreen         from './src/screens/ToDoScreen';
import RoomiesScreen      from './src/screens/RoomiesScreen';
import CalendarScreen     from './src/screens/CalendarScreen';
import UpdatesScreen      from './src/screens/UpdatesScreen';
import SettingsScreen     from './src/screens/SettingsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen      from './src/screens/ProfileScreen';
import AddEditTaskScreen  from './src/screens/AddEditTaskScreen';
import SupportScreen      from './src/screens/SupportScreen';
import FAQScreen          from './src/screens/FAQScreen';
import AboutScreen        from './src/screens/AboutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          // Floating pill
          borderRadius: 24,
          marginHorizontal: 16,
          marginBottom: 20,
          height: 56,
          position: 'absolute',
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarActiveTintColor:   colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          borderRadius: 20,
          marginVertical: 8,
          marginHorizontal: 4,
        },
        tabBarActiveBackgroundColor: colors.accentDim,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Updates"
        component={UpdatesScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'megaphone' : 'megaphone-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash"    component={SplashScreen} />
            <Stack.Screen name="Login"     component={LoginScreen} />
            <Stack.Screen name="SignUp"    component={SignUpScreen} />
            <Stack.Screen name="MainTabs"  component={MainTabs} />
            <Stack.Screen name="ToDo"      component={ToDoScreen} />
            <Stack.Screen name="AddTask"   component={AddEditTaskScreen} />
            <Stack.Screen name="EditTask"  component={AddEditTaskScreen} />
            <Stack.Screen name="Roomies"   component={RoomiesScreen} />
            <Stack.Screen name="Calendar"  component={CalendarScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Support"   component={SupportScreen} />
            <Stack.Screen name="FAQ"       component={FAQScreen} />
            <Stack.Screen name="About"     component={AboutScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SyncProvider>
    </AuthProvider>
  );
}
