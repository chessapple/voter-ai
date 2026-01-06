import React, { useState, useEffect } from 'react';
import { getResults } from '../api';
import './ResultsPage.css';

const ResultsPage = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load results from API
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await getResults();
        setResults(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load results');
        setLoading(false);
        console.error('Error fetching results:', err);
      }
    };

    fetchResults();
  }, []);

  const sortedResults = (questionId) => {
    if (!results[questionId]) return [];
    return [...results[questionId].images].sort((a, b) => b.votes - a.votes);
  };

  if (loading) {
    return (
      <div className="results-page">
        <h2>Results Loading...</h2>
        <div className="loading-spinner">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-page">
        <h2>Vote Results</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <h2>Vote Results</h2>
      
      <div className="results-container">
        {Object.keys(results).map(questionId => (
          <div key={questionId} className="question-results">
            <h3>{results[questionId].title}</h3>
            <p className="results-info">Max selections per voter: {results[questionId].maxSelections}</p>
            
            <div className="results-grid">
              {sortedResults(questionId).map(image => (
                <div key={image.id} className="result-item">
                  <div className="result-image-container">
                    <img src={image.url} alt={image.name} />
                    <div className="result-overlay">
                      <span className="vote-count">{image.votes} votes</span>
                    </div>
                  </div>
                  <div className="result-info">
                    <h4>{image.name}</h4>
                    <div className="vote-bar-container">
                      <div 
                        className="vote-bar" 
                        style={{ width: `${(image.votes / Math.max(...sortedResults(questionId).map(img => img.votes), 1)) * 100}%` }}
                      ></div>
                    </div>
                    <p className="vote-count-text">{image.votes} votes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPage;