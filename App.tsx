import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { NotesProvider } from './src/context/NotesContext';

export default function App() {
  return (
    <NavigationContainer>
      <NotesProvider>
        <RootNavigator />
      </NotesProvider>
    </NavigationContainer>
  );
}