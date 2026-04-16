import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import useAuthContext from '../../hooks/useAuthContext';

export default function SettingsScreen() {
  const { currentUserName, signOut, isCheckingAuth } = useAuthContext();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.description}>
          Signed in as: {currentUserName || 'Unknown User'}
        </Text>

        {isCheckingAuth ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>Signing out...</Text>
          </View>
        ) : null}

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isCheckingAuth}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
    marginBottom: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  loadingText: {
    marginLeft: 10,
    color: '#555555',
  },
  logoutButton: {
    backgroundColor: '#e53935',
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutButtonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '700',
  },
});