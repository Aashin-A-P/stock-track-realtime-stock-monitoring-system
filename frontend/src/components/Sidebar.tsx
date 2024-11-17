import React from "react";

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <h3>Stock Management</h3>
      <ul>
        <li><a href="/"> Home </a></li>
        <li><a href="/addstock">Add Stock</a></li>
        <li><a href="/">Search Stock</a></li>
        <li><a href="/">Logs</a></li>
        <li><a href="/">User Management</a></li>
        <li><a href="/">Report Generation</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;
