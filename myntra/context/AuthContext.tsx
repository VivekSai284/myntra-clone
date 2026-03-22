import { createContext, useContext, useEffect, useState } from "react";
import { getUserData, saveUserData, clearUserData } from "@/utils/storage";
import { syncRecentlyViewed } from "@/hooks/useRecentlyViewedSync";
import React from "react";
import axios from "axios";
type AuthContextType = {
  isAuthenticated: boolean;
  user: { _id: string; name: string; email: string } | null;
  Signup: (fullName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getUserData();
      if (data._id && data.name && data.email) {
        setUser({ _id: data._id, name: data.name, email: data.email });
        setIsAuthenticated(true);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post(
      "https://myntra-clone-j4a9.onrender.com/user/login",
      { email, password },
    );

    const { user, token } = res.data; // ✅ CORRECT

    console.log("LOGIN RESPONSE:", res.data);

    if (user && token) {
      // 🔥 SAVE TOKEN ALSO
      await saveUserData(user._id, user.fullName, user.email, token);

      setUser({
        _id: user._id,
        name: user.fullName,
        email: user.email,
      });

      setIsAuthenticated(true);

      await syncRecentlyViewed(user._id);
      return user;
    } else {
      throw new Error("Login failed");
    }
  };
  const Signup = async (fullName: string, email: string, password: string) => {
    const res = await axios.post(
      "https://myntra-clone-j4a9.onrender.com/user/signup",
      { fullName, email, password },
    );

    const data = res.data.user;

    if (data && data._id) {
      await saveUserData(data._id, data.fullName, data.email);

      setUser({
        _id: data._id,
        name: data.fullName, // ✅ FIXED
        email: data.email,
      });

      setIsAuthenticated(true);
      await syncRecentlyViewed(data._id);
    } else {
      throw new Error(res.data.message || "Signup failed");
    }
  };
  const logout = async () => {
    await clearUserData();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, Signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
