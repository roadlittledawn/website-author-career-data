import { useContext } from 'react';
import { AuthContext } from '@/components/AuthProvider';

/**
 * useAuth Hook
 * Access authentication state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
