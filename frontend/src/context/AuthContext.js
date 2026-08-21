// frontend/src/context/AuthContext.js
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
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  // ── Signup with email/password ──
  const signup = async (username, email, password) => {
    try {
      const response = await api.post('/auth/signup', { username, email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Signup failed' };
    }
  };

  // ── Google Login ──
  const googleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

const handleOAuthRedirect = async (token) => {
  console.log('handleOAuthRedirect called with token');
  localStorage.setItem('token', token);
  setToken(token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  try {
    console.log('Fetching user...');
    const response = await api.get('/auth/me');
    console.log('User fetched:', response.data);
    setUser(response.data);
    navigate('/');
  } catch (err) {
    console.error('Error fetching user:', err);
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
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      console.log('User fetched:', response.data);
      setUser(response.data);
    } catch (err) {
      console.error(' Error fetching user:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ── Load user on mount ──
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