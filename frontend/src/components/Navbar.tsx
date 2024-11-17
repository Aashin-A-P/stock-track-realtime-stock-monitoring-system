import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";
import Sidebar from "./Sidebar";

const Navbar: React.FC = () => {
	const { username, logout } = useAuth();
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const [sidebarVisible, setSidebarVisible] = useState(false);

	// Toggle the visibility of the logout modal
	const toggleDropdown = () => {
		setDropdownVisible(!dropdownVisible);
	};

	// Handle user logout
	const handleLogout = () => {
		logout();
		setDropdownVisible(false);
	};

	// Toggle sidebar visibility
	const toggleSidebar = () => {
		setSidebarVisible(!sidebarVisible);
	};

	return (
		<>
			<nav className="navbar">
				<div className="navbar-left">
					<button className="hamburger-menu" onClick={toggleSidebar}>
						☰
					</button>
				</div>
				<div className="navbar-right">
					<div className="username-section" onClick={toggleDropdown}>
						<span className="username">{username}</span>
					</div>
				</div>
			</nav>

			{/* Sidebar */}
			<Sidebar sidebarVisible={sidebarVisible} toggleSidebar={toggleSidebar} />

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
