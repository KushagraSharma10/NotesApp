import React, { createContext, useCallback, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReadableErrorMessage, logError } from '../utils/errorUtils';

type AuthState = {
  isCheckingAuth: boolean;
  isSignedIn: boolean;
  authErrorMessage: string;
  currentUserName: string;
};

type AuthContextValue = AuthState & {
  signIn: (userName: string, passwordValue: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AUTH_SESSION_STORAGE_KEY = '@notes_app/auth_session';

const initialState: AuthState = {
  isCheckingAuth: true,
  isSignedIn: false,
  authErrorMessage: '',
  currentUserName: '',
};

type AuthAction =
  | { type: 'SET_AUTH_CHECKING'; payload: boolean }
  | { type: 'SET_SIGNED_IN'; payload: { userName: string } }
  | { type: 'SET_SIGNED_OUT' }
  | { type: 'SET_AUTH_ERROR'; payload: string };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_AUTH_CHECKING':
      return {
        ...state,
        isCheckingAuth: action.payload,
      };

    case 'SET_SIGNED_IN':
      return {
        ...state,
        isSignedIn: true,
        currentUserName: action.payload.userName,
        authErrorMessage: '',
        isCheckingAuth: false,
      };

    case 'SET_SIGNED_OUT':
      return {
        ...state,
        isSignedIn: false,
        currentUserName: '',
        authErrorMessage: '',
        isCheckingAuth: false,
      };

    case 'SET_AUTH_ERROR':
      return {
        ...state,
        authErrorMessage: action.payload,
        isCheckingAuth: false,
      };

    default:
      return state;
  }
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const loadStoredAuthSession = useCallback(async () => {
    try {
      dispatch({ type: 'SET_AUTH_CHECKING', payload: true });

      const storedAuthSession = await AsyncStorage.getItem(
        AUTH_SESSION_STORAGE_KEY,
      );

      if (!storedAuthSession) {
        dispatch({ type: 'SET_SIGNED_OUT' });
        return;
      }

      const parsedAuthSession = JSON.parse(storedAuthSession);

      if (!parsedAuthSession?.userName) {
        dispatch({ type: 'SET_SIGNED_OUT' });
        return;
      }

      dispatch({
        type: 'SET_SIGNED_IN',
        payload: { userName: parsedAuthSession.userName },
      });
    } catch (error) {
      logError(error, 'AuthContext.loadStoredAuthSession');
      dispatch({ type: 'SET_SIGNED_OUT' });
    }
  }, []);

  const signIn = useCallback(async (userName: string, passwordValue: string) => {
    const trimmedUserName = userName.trim();
    const trimmedPassword = passwordValue.trim();

    if (!trimmedUserName) {
      const errorMessage = 'Username is required.';
      dispatch({ type: 'SET_AUTH_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }

    if (!trimmedPassword) {
      const errorMessage = 'Password is required.';
      dispatch({ type: 'SET_AUTH_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }

    try {
      dispatch({ type: 'SET_AUTH_CHECKING', payload: true });

      const authSessionPayload = {
        userName: trimmedUserName,
      };

      await AsyncStorage.setItem(
        AUTH_SESSION_STORAGE_KEY,
        JSON.stringify(authSessionPayload),
      );

      dispatch({
        type: 'SET_SIGNED_IN',
        payload: { userName: trimmedUserName },
      });
    } catch (error) {
      logError(error, 'AuthContext.signIn');

      dispatch({
        type: 'SET_AUTH_ERROR',
        payload: getReadableErrorMessage(
          error,
          'Unable to sign in. Please try again.',
        ),
      });

      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      dispatch({ type: 'SET_AUTH_CHECKING', payload: true });
      await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      dispatch({ type: 'SET_SIGNED_OUT' });
    } catch (error) {
      logError(error, 'AuthContext.signOut');

      dispatch({
        type: 'SET_AUTH_ERROR',
        payload: getReadableErrorMessage(
          error,
          'Unable to sign out. Please try again.',
        ),
      });

      throw error;
    }
  }, []);

  useEffect(() => {
    loadStoredAuthSession();
  }, [loadStoredAuthSession]);

  const contextValue: AuthContextValue = {
    ...state,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}