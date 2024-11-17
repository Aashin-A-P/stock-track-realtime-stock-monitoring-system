import React from "react";
import "./Sidebar.css";




interface SidebarProps {
	sidebarVisible: boolean;
	toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarVisible, toggleSidebar }) => {
	return (
		<div className={`sidebar ${sidebarVisible ? "visible" : ""}`}>
			<button className="close-button" onClick={toggleSidebar}>
				✖
			</button>
			<ul>
				<li>
					<a href="/addstock">Add Stock</a>
				</li>
				<li>Search Stock</li>
				<li>Logs</li>
				<li>User Management</li>
				<li>Report Generation</li>
			</ul>
		</div>
	);

};

export default Sidebar;
