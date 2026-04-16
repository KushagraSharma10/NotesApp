import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { NotesProvider } from './src/context/NotesContext';
import { AuthProvider } from './src/context/AuthContext';
import useAuthContext from './src/hooks/useAuthContext';

function AppContent() {
  const { isCheckingAuth, isSignedIn } = useAuthContext();

  if (isCheckingAuth) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <View style={styles.centerStateContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.stateText}>Checking session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return <AuthNavigator />;
  }

  return (
    <NotesProvider>
      <RootNavigator />
    </NotesProvider>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  centerStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555555',
  },
});