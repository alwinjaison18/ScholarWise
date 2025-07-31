import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import type { CredentialResponse } from '@react-oauth/google';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  educationLevel?: string;
  fieldOfStudy?: string;
  state?: string;
  city?: string;
  profileCompletion?: number;
  isEmailVerified: boolean;
  savedScholarships?: string[];
  appliedScholarships?: Array<{
    scholarshipId: string;
    appliedAt: string;
    status: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  loginWithGoogle: (credential: CredentialResponse) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  educationLevel?: string;
  fieldOfStudy?: string;
  state?: string;
  city?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:5000/api';

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          await fetchUser(storedToken);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { user, token: authToken, refreshToken } = data.data;
        setUser(user);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        localStorage.setItem('refreshToken', refreshToken);
        Cookies.set('token', authToken, { expires: 7 });
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        const { user, token: authToken, refreshToken } = data.data;
        setUser(user);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        localStorage.setItem('refreshToken', refreshToken);
        Cookies.set('token', authToken, { expires: 7 });
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential: CredentialResponse) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          credential: credential.credential,
          clientId: credential.clientId 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const { user, token: authToken, refreshToken } = data.data;
        setUser(user);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        localStorage.setItem('refreshToken', refreshToken);
        Cookies.set('token', authToken, { expires: 7 });
      } else {
        throw new Error(data.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    Cookies.remove('token');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setUser(result.data.user);
      } else {
        throw new Error(result.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
