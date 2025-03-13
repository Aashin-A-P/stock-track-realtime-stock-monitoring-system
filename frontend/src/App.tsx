import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Addstock from "./pages/Addstock";
import SearchStock from "./pages/SearchStock";
import StockDetails from "./pages/StockDetails";
import UsersListPage from "./pages/UsersListPage";
import Logs from "./pages/Logs";
import ReportGeneration from "./pages/ReportGeneration";
import { AuthProvider } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import { UIThemeProvider } from "./context/ThemeContext";

import "react-toastify/dist/ReactToastify.css";
import UserDetailsPage from "./pages/UserDetailsPage";
import CreateUserPage from "./pages/CreateUserPage";
import InvoiceDetails from "./pages/InvoiceDetails";
import CreateBudget from "./pages/CreateBudget";
import EditBudget from "./pages/EditBudget";
import BudgetList from "./pages/BudgetList";

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
              <Route path="/login" element={<Login />} />
              {/* protected routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/addstock" element={<Addstock />} />
              <Route path="/stocks" element={<SearchStock />} />
              <Route path="/create-budget" element={<CreateBudget />} />
              <Route path="/budgetform" element={<BudgetList />} />
              <Route path="/edit-budget/:id" element={<EditBudget />} />
              <Route path="/dashboard" element={<BudgetList />} />
              <Route path="/stocks/:stockId" element={<StockDetails />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/users" element={<UsersListPage />} />
              <Route path="/users/:id" element={<UserDetailsPage />} />
              <Route path="/reportgeneration" element={<ReportGeneration />} />
              <Route path="/users/create" element={<CreateUserPage />} />
              <Route path="/invoice/:id" element={<InvoiceDetails />} />
              {/* Default Route */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </BrowserRouter>
        </DashboardProvider>
      </AuthProvider>
    </UIThemeProvider>
  );
};

export default App;
