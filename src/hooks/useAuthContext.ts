import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function useAuthContext() {
  const authContextValue = useContext(AuthContext);

  if (!authContextValue) {
    throw new Error('useAuthContext must be used inside AuthProvider');
  }

  return authContextValue;
}