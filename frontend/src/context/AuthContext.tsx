import React, { createContext, useState, useEffect, useContext } from "react";

// Define the shape of the auth context
interface AuthContextType {
  token: string | null;
  username: string | null;
  role: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType>({
  token: null,
  username: null,
  role: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
});

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(baseUrl + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: username, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      if (result.token && result.user) {
        setToken(result.token);
        setUsername(result.user.userName);
        setRole(result.user.role);

        localStorage.setItem("token", result.token);
        localStorage.setItem("username", result.user.userName);
        localStorage.setItem("role", result.user.role);

      } else {
        throw new Error("Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUsername(null);
    setRole(null);

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

  };

  // Load session data from localStorage on app load
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    const savedRole = localStorage.getItem("role");

    if (savedToken && savedUsername && savedRole) {
      setToken(savedToken);
      setUsername(savedUsername);
      setRole(savedRole);
    }
  }, [login,logout]);

  return (
    <AuthContext.Provider
      value={{ token, username, role, isLoading, error, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
