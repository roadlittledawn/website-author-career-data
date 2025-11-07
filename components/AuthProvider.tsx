'use client';

import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { AuthUser } from '@/lib/auth';
import * as auth from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Verify token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await auth.verifyToken();
        if (result.valid && result.user) {
          setUser(result.user);
        } else {
          setUser(null);
          // Redirect to login if not on login page
          if (pathname !== '/login') {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        if (pathname !== '/login') {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogin = useCallback(
    async (username: string, password: string) => {
      try {
        const response = await auth.login(username, password);
        setUser(response.user);
        router.push('/');
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    [router]
  );

  const handleLogout = useCallback(async () => {
    try {
      await auth.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear state anyway
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login: handleLogin,
    logout: handleLogout,
  };

  // Show nothing while checking auth (or a loading spinner)
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
