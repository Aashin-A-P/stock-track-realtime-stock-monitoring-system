import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login: React.FC = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false); // State for loading
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		const data = {
			userName: username,
			password: password,
		};

		setIsLoading(true); // Start loading when login is attempted

		try {
			const response = await fetch("http://localhost:3000/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json;charset=utf-8",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const result = await response.json();

			if (result.token && result.user) {
				// If login is successful, store token and user info
				login(result.token, result.user.userName, result.user.role);
				navigate("/");
			} else {
				setError("Invalid username or password");
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unknown error occurred."
			);
		} finally {
			setIsLoading(false); // End loading
		}
	};

	return (
		<div className="login-container">
			<form className="login-form" onSubmit={handleLogin}>
				<h2>Login</h2>
				{error && <p className="error">{error}</p>}
				<div className="form-group">
					<label htmlFor="username">Username</label>
					<input
						type="text"
						id="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="Enter your username"
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="password">Password</label>
					<input
						type="password"
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter your password"
						required
					/>
				</div>
				<button type="submit" className="login-button">
					Login
				</button>
			</form>

			{/* Show loading spinner if the login is in progress */}
			{isLoading && (
				<div className="loading-overlay">
					<div className="loading-spinner"></div>
				</div>
			)}
		</div>
	);
};

export default Login;
