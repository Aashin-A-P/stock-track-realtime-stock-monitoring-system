import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";
import Navbar from "./components/Navbar"; // Sidebar removed

import Addstock from "./pages/Addstock";

const App = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

// MainApp component handles routing and authentication logic
const MainApp = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true); // Track if the app is still loading

  useEffect(() => {
    if (token !== null) {
      setLoading(false); // Set loading to false once the token is available
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <div>Loading...</div>; // Display loading state until token is checked
  }

  return (
    <BrowserRouter>
      {/* Display the Navbar on top */}
      {token && <Navbar />}
      <div className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={token ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/addstock"
            element={token ? <Addstock /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
