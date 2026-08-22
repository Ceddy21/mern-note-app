import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // ── Login with email/password ──
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/');
      return { success: true };
    } catch (err) {
      const errorData = err.response?.data || {};
      return {
        success: false,
        error: errorData.message || 'Login failed',
        needsVerification: errorData.needsVerification || false,
        email: errorData.email || '',
      };
    }
  };

  // ── Signup with email/password ──
  const signup = async (username, email, password) => {
    try {
      const response = await api.post('/auth/signup', { username, email, password });
      return {
        success: true,
        needsVerification: true,
        email: response.data.email || email,
        message: response.data.message,
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Signup failed',
      };
    }
  };

  // ── Google Login ──
  const googleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  // ── Handle OAuth Redirect ──
  const handleOAuthRedirect = async (token) => {
    console.log('✅ handleOAuthRedirect: Token received');
    localStorage.setItem('token', token);
    setToken(token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
      console.log('Fetching user after OAuth...');
      const response = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('User fetched after OAuth:', response.data);
      setUser(response.data);
      navigate('/');
    } catch (err) {
      console.error('Error fetching user after OAuth:', err.response?.data || err.message);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      navigate('/login');
    }
  };

  // ── Logout ──
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  // ── Fetch User ──
  const fetchUser = useCallback(async () => {
    console.log('fetchUser called, token:', token ? 'exists' : 'none');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      console.log('Making API call to /auth/me');
      const response = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('User fetched:', response.data);
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        console.log('401 Unauthorized - clearing token');
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refreshUser = async () => {
    if (!token) {
      console.log('No token, cannot refresh user');
      return;
    }
    try {
      console.log('Refreshing user data...');
      const response = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('User refreshed:', response.data);
      setUser(response.data);
    } catch (err) {
      console.error('Failed to refresh user:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    googleLogin,
    handleOAuthRedirect,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};