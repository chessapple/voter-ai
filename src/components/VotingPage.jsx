import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { getQuestions, submitVote } from '../api';
import './VotingPage.css';

const VotingPage = () => {
  const [votingQuestions, setVotingQuestions] = useState([]);
  const [selectedImages, setSelectedImages] = useState({});
  const [voterName, setVoterName] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [votingClosed, setVotingClosed] = useState(false);
  const [votingMessage, setVotingMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getQuestions();
        setVotingQuestions(response.data);
        
        // Initialize selected images state
        const initialSelections = {};
        response.data.forEach(question => {
          initialSelections[question.id] = [];
        });
        setSelectedImages(initialSelections);
        setLoading(false);
      } catch (err) {
        setError('Failed to load voting questions');
        setLoading(false);
        console.error('Error fetching questions:', err);
      }
    };

    fetchQuestions();
  }, []);

  const handleImageSelect = (questionId, imageId) => {
    setVotingQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      const question = updatedQuestions.find(q => q.id === questionId);
      const image = question.images.find(img => img.id === imageId);
      
      if (image) {
        const currentSelections = selectedImages[questionId] || [];
        
        if (currentSelections.includes(imageId)) {
          // Remove selection
          setSelectedImages(prev => ({
            ...prev,
            [questionId]: prev[questionId].filter(id => id !== imageId)
          }));
        } else if (currentSelections.length < question.maxSelections) {
          // Add selection
          setSelectedImages(prev => ({
            ...prev,
            [questionId]: [...prev[questionId], imageId]
          }));
        }
      }
      
      return updatedQuestions;
    });
  };

  const handleImageClick = (image) => {
    setCurrentImage(image);
    setIsModalOpen(true);
  };

  const handleSubmitVote = async (e) => {
    e.preventDefault();
    
    if (!voterName.trim()) {
      alert('Please enter your name');
      return;
    }

    // Check if all questions are answered
    for (const question of votingQuestions) {
      const selections = selectedImages[question.id] || [];
      if (selections.length !== question.maxSelections) {
        alert(`Please select exactly ${question.maxSelections} images for "${question.title}"`);
        return;
      }
    }

    try {
      await submitVote(voterName, selectedImages);
      setVotingMessage('Thank you for your vote!');
      setTimeout(() => {
        setVotingMessage('');
        // Reset form
        setVoterName('');
        const resetSelections = {};
        votingQuestions.forEach(question => {
          resetSelections[question.id] = [];
        });
        setSelectedImages(resetSelections);
      }, 2000);
    } catch (error) {
      console.error('Error submitting vote:', error);
      if (error.response) {
        alert(error.response.data.message || 'Error submitting vote. Please try again.');
      } else {
        alert('Error submitting vote. Please try again.');
      }
    }
  };

  const isQuestionComplete = (questionId) => {
    const selections = selectedImages[questionId] || [];
    return selections.length === votingQuestions.find(q => q.id === questionId)?.maxSelections;
  };

  if (loading) {
    return (
      <div className="voting-page">
        <h2>Loading voting questions...</h2>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="voting-page">
        <h2>Image Voting</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="voting-page">
      <h2>Image Voting</h2>
      
      {votingMessage && (
        <div className="voting-message success">
          {votingMessage}
        </div>
      )}
      
      {votingClosed ? (
        <div className="voting-closed">
          <h3>Voting is closed</h3>
          <p>Please check back later for results.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmitVote} className="voting-form">
          <div className="name-input">
            <label htmlFor="voterName">Your Name:</label>
            <input
              type="text"
              id="voterName"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>
          
          <div className="questions-container">
            {votingQuestions.map(question => (
              <div key={question.id} className="question-card">
                <h3>{question.title}</h3>
                <p className="question-description">{question.description}</p>
                <p className="selection-info">
                  Selected: {selectedImages[question.id]?.length || 0} / {question.maxSelections}
                  {isQuestionComplete(question.id) && <span className="complete"> ✓ Complete</span>}
                </p>
                
                <div className="images-grid">
                  {question.images.map(image => (
                    <div 
                      key={image.id}
                      className={`image-item ${selectedImages[question.id]?.includes(image.id) ? 'selected' : ''}`}
                      onClick={() => handleImageSelect(question.id, image.id)}
                    >
                      <img 
                        src={image.url} 
                        alt={image.name} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image);
                        }}
                      />
                      <div className="image-overlay">
                        <span>{image.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <button type="submit" className="submit-vote-btn">
            Submit Vote
          </button>
        </form>
      )}
      
      {isModalOpen && currentImage && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          image={currentImage}
        />
      )}
    </div>
  );
};

export default VotingPage;