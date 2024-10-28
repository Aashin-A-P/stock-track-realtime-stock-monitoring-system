import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Overview from './components/Overview';
import Sales from './components/Sales';
import Reports from './components/Reports';
import './App.css';

function App() {
  const [page, setPage] = useState('Overview');

  const renderPage = () => {
    switch (page) {
      case 'Overview':
        return <Overview />;
      case 'Sales':
        return <Sales />;
      case 'Reports':
        return <Reports />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="App">
      <Navbar setPage={setPage} />
      <div style={{ padding: '20px' }}>
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
