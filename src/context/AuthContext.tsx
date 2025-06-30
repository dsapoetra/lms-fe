"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface DecodedToken {
  user_id: string;
  exp: number;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async (jwt: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(jwt);
      const userId = decoded.user_id;

      const res = await fetch(`http://localhost:8088/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setToken(jwt);
      } else {
        localStorage.removeItem('jwt');
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to decode token or fetch user', error);
      localStorage.removeItem('jwt');
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem('jwt');
      if (storedToken) {
        await fetchUser(storedToken);
      }
      setIsLoading(false);
    };
    checkUser();
  }, [fetchUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8088/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('jwt', data.token);
        await fetchUser(data.token);
        setIsLoading(false);
        return { success: true, message: 'Login successful!' };
      } else {
        const errorData = await res.json();
        localStorage.removeItem('jwt');
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return { success: false, message: errorData.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login failed', error);
      localStorage.removeItem('jwt');
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return { success: false, message: 'An error occurred.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
