import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Voting API
export const getQuestions = () => api.get('/api/questions');

export const submitVote = (voterName, selections) => 
  api.post('/api/vote', { voterName, selections });

// Admin API
export const adminLogin = (password) => 
  api.post('/api/admin/login', { password });

export const getVotes = (token) => 
  api.get('/api/admin/votes', {
    headers: { Authorization: `Bearer ${token}` }
  });

export const updateVoteValidity = (token, voteId, isValid) => 
  api.put(`/api/admin/votes/${voteId}`, { isValid }, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getVotingStatus = (token) => 
  api.get('/api/admin/status', {
    headers: { Authorization: `Bearer ${token}` }
  });

export const updateVotingStatus = (token, status) => 
  api.put('/api/admin/status', status, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Results API
export const getResults = () => api.get('/api/results');

export default api;