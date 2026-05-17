import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';


import { useApi } from 'devil-frontend';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { get, post, del, setAuthToken } = useApi();

  useEffect(() => {
    let ignoreStale = false; // prevent stale async responses from updating state after unmount

    const doCheck = async () => {
      try {
        const res = await get("/auth/me");
        if (ignoreStale) return;
        setUser(res.data?.user ?? res.data);
        setIsAuthenticated(true);
      } catch (err) {
        if (ignoreStale) return;
        const token = localStorage.getItem("token");
        if (token && token !== "null" && token !== "undefined") {
          try {
            setAuthToken(token);
            const res = await get("/auth/me");
            if (ignoreStale) return;
            setUser(res.data?.user ?? res.data);
            setIsAuthenticated(true);
          } catch (e) {
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            setAuthToken(null);
          }
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        if (!ignoreStale) setLoading(false);
      }
    };

    doCheck();

    // Cleanup: if StrictMode remounts, ignore the stale response from the first run
    return () => { ignoreStale = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const login = async (email, password) => {
    try {
      const res = await post("/auth/login", { email, password });
      const token = res.data?.token ?? res.token;
      const userData = res.data?.user ?? res.user ?? res.data;

      if (token) {
        localStorage.setItem("token", token);
        setAuthToken(token);
      }
      setUser(userData);
      setIsAuthenticated(true);
      toast.success("Welcome back!");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      return false;
    }
  };

  const register = async (data) => {
    try {
      const res = await post("/auth/register", data);
      const token = res.data?.token ?? res.token;
      const userData = res.data?.user ?? res.user ?? res.data;

      if (token) {
        localStorage.setItem("token", token);
        setAuthToken(token);
      }
      setUser(userData);
      setIsAuthenticated(true);
      toast.success("Account created successfully!");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
      return false;
    }
  };

  const deleteAccount = async () => {
    if (!user || (!user.id && !user._id)) return false;
    const userId = user.id || user._id;

    try {
      await del(`/users/${userId}`);
      toast.success("Account deleted successfully");
      
      // Complete logout
      localStorage.removeItem("token");
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = "/register";
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Logged out");
    window.location.href = "/login";
  };

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    deleteAccount,
  }), [user, loading, isAuthenticated]); // eslint-disable-line


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
