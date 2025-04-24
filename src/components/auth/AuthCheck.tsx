"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export function AuthCheck() {
  const { user, loading, logout } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string>("Checking...");
  const router = useRouter();

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (storedToken) {
      setAuthStatus("Token found in localStorage");
    } else {
      setAuthStatus("No token found in localStorage");
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setAuthStatus("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      setAuthStatus("Error during logout");
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRefreshToken = () => {
    // This is a temporary solution - in a real app, you'd implement token refresh
    localStorage.removeItem("token");
    setToken(null);
    setAuthStatus("Token removed. Please log in again.");
    router.push("/login");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Status</CardTitle>
        <CardDescription>Check your authentication status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium">Auth Loading:</p>
            <p className="text-sm">{loading ? "Loading..." : "Not loading"}</p>
          </div>

          <div>
            <p className="font-medium">User:</p>
            <p className="text-sm">
              {user ? `Logged in as ${user.username}` : "Not logged in"}
            </p>
          </div>

          <div>
            <p className="font-medium">Token:</p>
            <p className="text-sm break-all">
              {token ? `${token.substring(0, 15)}...` : "No token"}
            </p>
          </div>

          <div>
            <p className="font-medium">Status:</p>
            <p className="text-sm">{authStatus}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {user ? (
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button onClick={handleLogin}>Login</Button>
        )}

        <Button variant="outline" onClick={handleRefreshToken}>
          Refresh Token
        </Button>
      </CardFooter>
    </Card>
  );
}
