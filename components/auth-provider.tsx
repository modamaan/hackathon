"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Successfully logged in!");
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error("Failed to log in with Google.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully logged out");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
