import React, { useState, useEffect } from 'react';
import VotingPage from './components/VotingPage';
import AdminPage from './components/AdminPage';
import ResultsPage from './components/ResultsPage';
import './styles/App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('voting'); // voting, admin, results
  const [adminToken, setAdminToken] = useState(null);

  // Check if admin is logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAdminToken(token);
    }
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>Image Voting System</h1>
        <nav>
          <button 
            className={currentPage === 'voting' ? 'active' : ''}
            onClick={() => setCurrentPage('voting')}
          >
            Voting
          </button>
          <button 
            className={currentPage === 'admin' ? 'active' : ''}
            onClick={() => setCurrentPage('admin')}
          >
            Admin
          </button>
          <button 
            className={currentPage === 'results' ? 'active' : ''}
            onClick={() => setCurrentPage('results')}
          >
            Results
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {currentPage === 'voting' && <VotingPage />}
        {currentPage === 'admin' && <AdminPage adminToken={adminToken} setAdminToken={setAdminToken} />}
        {currentPage === 'results' && <ResultsPage />}
      </main>
    </div>
  );
}

export default App;