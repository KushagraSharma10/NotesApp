import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.description}>
          This is just a placeholder for the settings screen.
        </Text>
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
  },
});