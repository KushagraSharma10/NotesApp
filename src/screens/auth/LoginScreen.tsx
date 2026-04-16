import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import useAuthContext from '../../hooks/useAuthContext';

export default function LoginScreen() {
  const { signIn, isCheckingAuth, authErrorMessage } = useAuthContext();

  const [userNameInputValue, setUserNameInputValue] = useState('');
  const [passwordInputValue, setPasswordInputValue] = useState('');
  const [localValidationErrorMessage, setLocalValidationErrorMessage] =
    useState('');

  const handleLogin = async () => {
    if (!userNameInputValue.trim()) {
      setLocalValidationErrorMessage('Username is required.');
      return;
    }

    if (!passwordInputValue.trim()) {
      setLocalValidationErrorMessage('Password is required.');
      return;
    }

    try {
      setLocalValidationErrorMessage('');
      await signIn(userNameInputValue, passwordInputValue);
    } catch (error) {
      // Context state already handles error message
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <KeyboardAvoidingView
        style={styles.screenContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.appTitle}>Notes App</Text>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome Back</Text>

            <TextInput
              placeholder="Enter username"
              value={userNameInputValue}
              onChangeText={(updatedUserName) => {
                setUserNameInputValue(updatedUserName);

                if (localValidationErrorMessage) {
                  setLocalValidationErrorMessage('');
                }
              }}
              style={styles.textInputField}
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Enter password"
              value={passwordInputValue}
              onChangeText={(updatedPasswordValue) => {
                setPasswordInputValue(updatedPasswordValue);

                if (localValidationErrorMessage) {
                  setLocalValidationErrorMessage('');
                }
              }}
              style={styles.textInputField}
              secureTextEntry={true}
            />

            {localValidationErrorMessage ? (
              <Text style={styles.errorText}>{localValidationErrorMessage}</Text>
            ) : null}

            {authErrorMessage ? (
              <Text style={styles.errorText}>{authErrorMessage}</Text>
            ) : null}

            {isCheckingAuth ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" />
                <Text style={styles.loadingText}>Signing in...</Text>
              </View>
            ) : null}

            <Pressable
              style={styles.signInButton}
              onPress={handleLogin}
              disabled={isCheckingAuth}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </Pressable>

          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  appTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
  },
  textInputField: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    marginBottom: 14,
    fontSize: 15,
    color: '#111111',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '500',
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
  signInButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  signInButtonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  hintText: {
    marginTop: 14,
    textAlign: 'center',
    color: '#777777',
    fontSize: 13,
  },
});