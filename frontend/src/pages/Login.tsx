import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [formState, setFormState] = useState({ username: "", password: "" });
  const { login, isLoading, error, token } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formState.username, formState.password);
  };

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex justify-center items-center flex-1 bg-cover bg-top relative bg-[url('/images/mit-it-front.jpg')]">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tl from-black to-transparent opacity-100 mix-blend-darken"></div>

        {/* Login Container */}
        <div className="relative z-10 bg-white bg-opacity-30 backdrop-blur-md p-6 w-11/12 max-w-sm border border-gray-200 shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Login</h2>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          {/* Username Input */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={formState.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white bg-opacity-70"
              placeholder="Enter your username"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // move cursor to password input
                  document.getElementById("password")?.focus();
                }
              }}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formState.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white bg-opacity-70"
              placeholder="Enter your password"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin(e);
                }
              }}
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 bg-opacity-80 text-white font-bold rounded-lg hover:bg-blue-700 hover:bg-opacity-90 transition disabled:opacity-50"
            disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
