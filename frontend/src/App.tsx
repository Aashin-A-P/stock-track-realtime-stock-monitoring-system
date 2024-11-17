import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";

import "./App.css";
import Sidebar from "./components/Sidebar";
import Addstock from "./pages/Addstock";



const App = () => {
  return (
    <div className="dashboard-container">
      <Sidebar></Sidebar>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />}>
        </Route>
        <Route path="/addstock" element={<Addstock />}>
        </Route>
      </Routes>
    </BrowserRouter>
    </div>
  );
};

export default App;
