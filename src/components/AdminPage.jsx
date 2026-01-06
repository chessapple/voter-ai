import React, { useState, useEffect } from 'react';
import { adminLogin, getVotes, updateVoteValidity, getVotingStatus, updateVotingStatus } from '../api';
import './AdminPage.css';

const AdminPage = ({ adminToken, setAdminToken }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [votes, setVotes] = useState([]);
  const [votingClosed, setVotingClosed] = useState(false);
  const [votingEndTime, setVotingEndTime] = useState('');
  const [filteredVotes, setFilteredVotes] = useState([]);
  const [showInvalidVotes, setShowInvalidVotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load votes and status when logged in
  useEffect(() => {
    const loadVotesAndStatus = async () => {
      if (isLoggedIn && adminToken) {
        try {
          setLoading(true);
          const votesResponse = await getVotes(adminToken);
          const statusResponse = await getVotingStatus(adminToken);
          
          setVotes(votesResponse.data);
          setVotingClosed(statusResponse.data.votingClosed);
          setVotingEndTime(statusResponse.data.votingEndTime || '');
          setLoading(false);
        } catch (err) {
          setError('Failed to load data');
          setLoading(false);
          console.error('Error loading data:', err);
        }
      }
    };

    loadVotesAndStatus();
  }, [isLoggedIn, adminToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await adminLogin(password);
      const { token } = response.data;
      
      setIsLoggedIn(true);
      setAdminToken(token);
      localStorage.setItem('adminToken', token);
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
      alert('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminToken(null);
    localStorage.removeItem('adminToken');
    setPassword('');
  };

  const toggleVoteValidity = async (voteId) => {
    try {
      const vote = votes.find(v => v.id === voteId);
      const newValidity = !vote.isValid;
      
      await updateVoteValidity(adminToken, voteId, newValidity);
      
      // Update local state
      setVotes(prevVotes => 
        prevVotes.map(vote => 
          vote.id === voteId ? { ...vote, isValid: newValidity } : vote
        )
      );
    } catch (error) {
      console.error('Error updating vote validity:', error);
      alert('Failed to update vote validity');
    }
  };

  const filterVotes = () => {
    if (showInvalidVotes) {
      setFilteredVotes(votes.filter(vote => !vote.isValid));
    } else {
      setFilteredVotes(votes);
    }
  };

  useEffect(() => {
    filterVotes();
  }, [showInvalidVotes, votes]);

  const handleVotingStatusChange = async () => {
    try {
      await updateVotingStatus(adminToken, {
        closed: votingClosed,
        endTime: votingEndTime || null
      });
    } catch (error) {
      console.error('Error updating voting status:', error);
      alert('Failed to update voting status');
    }
  };

  // Check if already logged in
  useEffect(() => {
    if (adminToken) {
      setIsLoggedIn(true);
    }
  }, [adminToken]);

  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-controls">
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={votingClosed}
              onChange={(e) => {
                setVotingClosed(e.target.checked);
                // Update backend when checkbox changes
                if (adminToken) {
                  updateVotingStatus(adminToken, {
                    closed: e.target.checked,
                    endTime: votingEndTime || null
                  }).catch(err => console.error('Error updating voting status:', err));
                }
              }}
            />
            Close Voting
          </label>
        </div>

        <div className="control-group">
          <label htmlFor="votingEndTime">Voting End Time:</label>
          <input
            type="datetime-local"
            id="votingEndTime"
            value={votingEndTime}
            onChange={(e) => {
              setVotingEndTime(e.target.value);
              // Update backend when datetime changes
              if (adminToken) {
                updateVotingStatus(adminToken, {
                  closed: votingClosed,
                  endTime: e.target.value || null
                }).catch(err => console.error('Error updating voting status:', err));
              }
            }}
          />
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showInvalidVotes}
              onChange={(e) => setShowInvalidVotes(e.target.checked)}
            />
            Show Only Invalid Votes
          </label>
        </div>
      </div>

      <div className="votes-section">
        <h3>Votes ({filteredVotes.length})</h3>
        <div className="votes-table-container">
          <table className="votes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>IP</th>
                <th>Time</th>
                <th>Valid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVotes.map(vote => (
                <tr key={vote.id}>
                  <td>{vote.id}</td>
                  <td>{vote.voterName}</td>
                  <td>{vote.ip}</td>
                  <td>{new Date(vote.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`validity-badge ${vote.isValid ? 'valid' : 'invalid'}`}>
                      {vote.isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => toggleVoteValidity(vote.id)}
                      className="toggle-validity-btn"
                    >
                      {vote.isValid ? 'Mark Invalid' : 'Mark Valid'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;