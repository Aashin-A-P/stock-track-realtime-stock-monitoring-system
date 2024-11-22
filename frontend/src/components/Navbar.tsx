import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const { username, logout } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Toggle the visibility of the logout modal
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // Handle user logout
  const handleLogout = () => {
    logout();
    setDropdownVisible(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          {/* Sidebar items moved here */}
          <ul className="navbar-links">
			<li>
				<img src="" alt="" />
			</li>
			<li>
				<a href="/">Home</a>
			</li>
            <li>
              <a href="/addstock">Add Stock</a>
            </li>
            <li>
              <a href="/searchstock">Search Stock</a>
            </li>
            <li>
              <a href="/logs">Logs</a>
            </li>
            <li>
              <a href="/usermanagement">User Management</a>
            </li>
            <li>
              <a href="/reportgeneration">Report Generation</a>
            </li>
          </ul>
        </div>
        <div className="navbar-right">
          <div className="username-section" onClick={toggleDropdown}>
            <span className="username">{username}</span>
          </div>
        </div>
      </nav>

      {/* Small logout modal */}
      <div className={`logout-modal ${dropdownVisible ? "visible" : ""}`}>
        <div className="modal-content">
          <h4>Are you sure you want to logout?</h4>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
          <button
            className="cancel-button"
            onClick={() => setDropdownVisible(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
