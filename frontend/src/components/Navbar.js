import React from 'react';

function Navbar({ setPage }) {
  return (
    <nav style={{ padding: '10px', backgroundColor: '#282c34', color: 'white' }}>
      <h2>Dashboard</h2>
      <ul style={{ listStyleType: 'none', display: 'flex', gap: '20px' }}>
        <li style={{ cursor: 'pointer' }} onClick={() => setPage('Overview')}>Overview</li>
        <li style={{ cursor: 'pointer' }} onClick={() => setPage('Sales')}>Sales</li>
        <li style={{ cursor: 'pointer' }} onClick={() => setPage('Reports')}>Reports</li>
      </ul>
    </nav>
  );
}

export default Navbar;
