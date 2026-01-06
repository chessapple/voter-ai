# Image Voting System

A full-stack voting application that allows users to vote on images with multiple questions and admin functionality.

## Features

- **Voting Interface**: Users can vote on multiple questions with image selections
- **Image Selection**: Choose fixed number of images per question
- **Full-screen Image View**: Click on images to view them in full-screen modal
- **Name Required**: Users must enter their name to vote
- **Admin Dashboard**: View voting statistics and manage votes
- **Vote Filtering**: Mark votes as valid/invalid
- **Time-based Voting**: Close voting at specific times
- **Results Display**: View voting results with vote counts

## Requirements Implemented

1. ✅ Clean and beautiful interface
2. ✅ Multiple questions with fixed image selections
3. ✅ Full-screen image viewing
4. ✅ Name required for voting
5. ✅ Admin dashboard with vote statistics
6. ✅ Vote filtering and validation
7. ✅ Time-based voting closure
8. ✅ Results display with vote counts

## Project Structure

```
/workspace/
├── src/
│   ├── components/
│   │   ├── VotingPage.jsx
│   │   ├── AdminPage.jsx
│   │   ├── ResultsPage.jsx
│   │   ├── Modal.jsx
│   │   └── ...
│   ├── styles/
│   ├── api/
│   └── utils/
├── public/
│   └── images/
├── server.js (backend)
├── package.json
└── README.md
```

## How to Run

1. Install dependencies: `npm install`
2. Start backend server: `node server.js`
3. In another terminal, start frontend: `npm run dev`
4. Access the application at `http://localhost:3000`

## Admin Access

- Admin password: `admin123`
- Admin dashboard available at the "Admin" tab

## Technologies Used

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: In-memory (would use MongoDB/PostgreSQL in production)
- Authentication: JWT
- Styling: CSS modules
