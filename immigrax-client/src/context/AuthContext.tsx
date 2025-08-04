import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginRequest, LoginResponse, RegisterRequest, UserRole } from '../types';
import apiService from '../services/apiService';

interface AuthContextType {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  isMaster: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = apiService.getStoredUser();
    if (storedUser && apiService.isAuthenticated()) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const userData = await apiService.login(credentials);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      await apiService.register(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    apiService.logout();
    setUser(null);
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isMaster = user?.role === UserRole.Master;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && apiService.isAuthenticated(),
    isLoading,
    login,
    register,
    logout,
    hasRole,
    isMaster,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
