import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NotesStackNavigator from './NotesStackNavigator';
import SettingsScreen from '../screens/settings/SettingsScreen';
import { RootTabParamList } from '../types/navigationTypes';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="NotesTab"
        component={NotesStackNavigator}
        options={{ title: 'Notes' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}