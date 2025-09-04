import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { authAPI } from '../api/api';

const parseJwt = (t: string) => {
  try {
    const base = t.split('.')[1];
    const json = atob(base.replace(/-/g, '+').replace(/_/g, '/'));
    // decodeURIComponent trick to handle unicode
    const decoded = decodeURIComponent(
      Array.prototype.map.call(json, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(decoded);
  } catch { return {}; }
};

const hasAdminRole = (payload: any): boolean => {
  if (!payload) return false;
  const candidates = [
    payload.role, // "Admin"
    payload.roles, // array or '["Admin"]'
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"], // "Admin"
  ];
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === 'string') {
      if (c === 'Admin') return true;
      try { const arr = JSON.parse(c); if (Array.isArray(arr) && arr.includes('Admin')) return true; } catch {}
    } else if (Array.isArray(c) && c.includes('Admin')) {
      return true;
    }
  }
  return false;
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('jwt');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const user = JSON.parse(savedUser);
          const payload = parseJwt(token);
          const adminStatus = hasAdminRole(payload);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          setIsAdmin(adminStatus);
        } catch (error) {
          localStorage.removeItem('jwt');
          localStorage.removeItem('user');
          setAuthState(prev => ({ ...prev, isLoading: false }));
          setIsAdmin(false);
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        setIsAdmin(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response;
      
      localStorage.setItem('jwt', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      const payload = parseJwt(token);
      const adminStatus = hasAdminRole(payload);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authAPI.register(email, password, name);
      const { user, token } = response;
      
      localStorage.setItem('jwt', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      const payload = parseJwt(token);
      const adminStatus = hasAdminRole(payload);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, isAdmin }}>
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