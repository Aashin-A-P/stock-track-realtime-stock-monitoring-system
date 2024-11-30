import React from "react";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
	return (
		<div className="sidebar">
			<ul>
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
	);
};

export default Sidebar;
