import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import API from "@/utils/api";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        setUser(res.data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error("User restore failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]); // ✅ stable dependency

  // ✅ Prevent rendering children until auth check is complete
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        loading,
        loadUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const getData = () => useContext(UserContext);