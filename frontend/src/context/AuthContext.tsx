import React, { createContext, useState, useEffect, useContext } from "react";

// Define the shape of the auth context
interface AuthContextType {
	token: string | null;
	username: string | null;
	role: string | null;
	login: (token: string, username: string, role: string) => void;
	logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [token, setToken] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [role, setRole] = useState<string | null>(null);

	// Load session data from localStorage on app load
	useEffect(() => {
		// Check localStorage for stored session data
		const savedToken = localStorage.getItem("token");
		const savedUsername = localStorage.getItem("username");
		const savedRole = localStorage.getItem("role");

		// If session data exists, update the state
		if (savedToken && savedUsername && savedRole) {
			setToken(savedToken);
			setUsername(savedUsername);
			setRole(savedRole);
		}
	}, []); // Empty dependency array to run only once on initial render

	// Login function
	const login = (token: string, username: string, role: string) => {
		setToken(token);
		setUsername(username);
		setRole(role);

		// Save session data in localStorage
		localStorage.setItem("token", token);
		localStorage.setItem("username", username);
		localStorage.setItem("role", role);
	};

	// Logout function
	const logout = () => {
		setToken(null);
		setUsername(null);
		setRole(null);

		// Clear session data from localStorage
		localStorage.removeItem("token");
		localStorage.removeItem("username");
		localStorage.removeItem("role");
	};

	return (
		<AuthContext.Provider value={{ token, username, role, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook to use AuthContext
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
