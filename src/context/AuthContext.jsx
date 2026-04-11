import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setOnUnauthorized } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register the 401 interceptor so expired tokens auto-logout (edge cases 1.6, 1.7)
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      // Navigation to /login happens via the 401 error thrown in api.js
      // Individual pages already handle errors and can redirect
    });
  }, []);

  // On mount, check if we have a stored token and fetch the user
  useEffect(() => {
    const token = localStorage.getItem('homys_token');
    if (token) {
      authAPI.getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          // Token expired or invalid — clear it
          localStorage.removeItem('homys_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('homys_token', res.data.token);
    setUser(res.data.user);
    return res;
  };

  const register = async ({ fullName, email, password, gender, ageRange }) => {
    const res = await authAPI.register({ fullName, email, password, gender, ageRange });
    localStorage.setItem('homys_token', res.data.token);
    setUser(res.data.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('homys_token');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const res = await authAPI.updateProfile(updates);
    setUser(res.data.user);
    return res;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
