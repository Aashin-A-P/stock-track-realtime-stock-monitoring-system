import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Addstock from "./pages/Addstock";
import SearchStock from "./pages/SearchStock";
import StockDetails from "./pages/StockDetails";
import UserManagement from "./pages/UserManagement";
import Logs from "./pages/Logs";

import { AuthProvider } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import { UIThemeProvider } from "./context/ThemeContext";

import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <UIThemeProvider>
      <AuthProvider>
        <ToastContainer
          position="top-center"
          autoClose={5000} // Close after 5 seconds
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
        <DashboardProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/addstock" element={<Addstock />} />
              <Route path="/stocks" element={<SearchStock />} />
              <Route path="/stocks/:stockId" element={<StockDetails />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/user-management" element={<UserManagement />} />

              {/* Redirect Route */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </BrowserRouter>
        </DashboardProvider>
        
      </AuthProvider>
    </UIThemeProvider>
  );
};

export default App;
