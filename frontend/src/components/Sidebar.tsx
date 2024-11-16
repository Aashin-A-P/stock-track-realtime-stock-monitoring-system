import React from "react";

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <h3>Stock Management</h3>
      <ul>
        <li><a href="/addstock">Add Stock</a></li>
        <li>Search Stock</li>
        <li>Logs</li>
        <li>User Management</li>
        <li>Report Generation</li>
      </ul>
    </div>
  );
};

export default Sidebar;
