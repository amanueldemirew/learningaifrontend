"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api";
import { toast } from "sonner";
import { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const checkAuth = useCallback(
    async (authToken?: string) => {
      try {
        const tokenToUse = authToken || token;
        if (!tokenToUse) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Use the API service to check authentication
        const userData = await authApi.me();
        setUser(userData);
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    },
    [token, router]
  );

  // Check for token on mount and when token changes
  useEffect(() => {
    // Try to get token from localStorage on mount
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      checkAuth(storedToken);
    } else {
      setLoading(false);
    }
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      // Use the API service to login
      const data = await authApi.login(email, password);
      const { access_token } = data;

      // Save token
      setToken(access_token);
      localStorage.setItem("token", access_token);

      // Fetch user data with the new token
      await checkAuth(access_token);

      // Show success message
      toast.success("Login successful");

      // Redirect to home page
      router.push("/");
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Login error:", error);
      toast.error(
        apiError.response?.data?.detail || "Login failed. Please try again."
      );
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      // Use the API service to signup
      await authApi.signup(username, email, password);

      // Show success message
      toast.success("Account created successfully. Please log in.");

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Signup error:", error);
      toast.error(
        apiError.response?.data?.detail || "Signup failed. Please try again."
      );
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear token and user data
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");

      // Show success message
      toast.success("Logged out successfully");

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
