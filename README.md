# Quiz Portal Frontend

A modern, interactive quiz application built with React that provides a seamless assessment experience with real-time timer, question navigation, and detailed result analysis.

## Features

- Interactive quiz interface with real-time countdown timer
- Question navigation with visual progress indicators
- Auto-submit functionality when time expires
- Tab change detection for quiz integrity (warns and auto-submits after 2 tab switches)
- State persistence using localStorage
- Detailed results page with question review
- Responsive design for all devices
- Motivational quotes on the landing page

## Tech Stack

- React.js
- CSS3 (Custom styling with modern design patterns)
- localStorage for state management
- REST API integration

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd quiz-portal/frontend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file in the frontend root directory
```env
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development server
```bash
npm start
```

The app will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── node_modules/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── main_interface/
│   │   │   ├── index.js          # Landing page component
│   │   │   └── index.css         # Landing page styles
│   │   ├── quiz_questions/
│   │   │   ├── index.js          # Quiz interface component
│   │   │   └── index.css         # Quiz interface styles
│   │   └── quiz_score/
│   │       ├── index.js          # Results page component
│   │       └── index.css         # Results page styles
│   ├── App.js                    # Main app component with routing
│   ├── App.css                   # Global app styles
│   ├── index.js                  # React entry point
│   └── index.css                 # Global CSS reset and base styles
├── .env                          # Environment variables
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies and scripts
├── package-lock.json             # Locked dependencies
└── README.md                     # This file
```

## Component Details

### 1. Main Interface (`src/components/main_interface/`)
- **Purpose**: Landing page with quiz information and start button
- **Features**:
  - Random motivational quotes
  - Quiz details (questions count, duration, type)
  - Quiz rules display
  - Start quiz button

### 2. Quiz Questions (`src/components/quiz_questions/`)
- **Purpose**: Main quiz interface
- **Features**:
  - Real-time countdown timer
  - Question navigation (Next/Previous buttons)
  - Question number pills for quick navigation
  - Answer selection
  - Tab switch detection and warning
  - Auto-submit on timeout
  - Progress tracking
  - State persistence across page refreshes

### 3. Quiz Score (`src/components/quiz_score/`)
- **Purpose**: Results and answer review page
- **Features**:
  - Score display with percentage
  - Statistics (correct/incorrect/unanswered)
  - Detailed question review
  - Correct answer highlights
  - Retake quiz option

## Usage

### Starting a Quiz

1. Visit the home page
2. Review quiz details (topic, questions, duration)
3. Read the quiz rules
4. Click "Start Quiz" button

### Taking the Quiz

1. Read the question carefully
2. Select an answer by clicking on an option
3. Navigate using:
   - "Next" button to move forward
   - "Previous" button to go back
   - Question number pills to jump to any question
4. Monitor the timer at the top of the screen
5. Click "Submit Quiz" when finished
6. Or let it auto-submit when time expires

### Important Quiz Rules

- **Timer**: 5-minute countdown timer
- **Tab Switching**: 
  - First tab switch: Warning message displayed
  - Second tab switch: Quiz auto-submits
- **Auto-Save**: Your progress is automatically saved
- **Auto-Submit**: Quiz submits automatically when timer reaches 0

### Viewing Results

After submission, you'll see:
- Your total score and percentage
- Number of correct, incorrect, and unanswered questions
- Detailed review of each question with:
  - Your selected answer
  - Correct answer
  - Color-coded highlighting (green for correct, red for incorrect)
- Option to retake the quiz

## API Endpoints

The frontend expects the following API endpoints from the backend:

### Get Quiz Questions
```
GET /api/quiz/:quizId/questions?sessionId=<sessionId>

Response:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
    }
  ]
}
```

### Submit Quiz
```
POST /api/quiz/:quizId/evaluate

Body: 
{
  "answers": {
    "1": 2,  // questionId: selectedOptionIndex
    "2": 0
  }
}

Response:
{
  "score": 8,
  "totalQuestions": 10,
  "percentage": 80,
  "results": [
    {
      "questionId": 1,
      "correct": true,
      "correctAnswer": 2,
      "userAnswer": 2
    }
  ]
}
```

## Key Features Explained

### Timer System

- **Duration**: 5 minutes (300 seconds)
- **Visual Indicators**:
  - Green: More than 60 seconds remaining
  - Orange: 10-60 seconds remaining
  - Red: Less than 10 seconds remaining
- **Audio Alert**: Tick sound in last 10 seconds (if implemented)
- **Auto-Submit**: Automatically submits quiz when timer reaches 0

### Tab Change Detection

The application monitors when users switch away from the quiz tab:

```javascript
// First tab switch
- Shows warning modal
- Allows user to continue

// Second tab switch
- Automatically submits the quiz
- Prevents further tab switches
```

### State Persistence

All quiz progress is saved to localStorage:
- Current question index
- Selected answers
- Time remaining
- Tab switch count

This means:
- Progress survives page refresh
- Users can close and reopen the browser
- State is cleared only on submission or explicit exit

## Customization

### Change Quiz Duration

In `src/components/quiz_questions/index.js`:
```javascript
const duration = 5 * 60; // Change to desired seconds
```

### Modify Tab Change Limit

In `src/components/quiz_questions/index.js`:
```javascript
if (newCount > 1) { // Change threshold (0-indexed, so 1 means 2 switches)
  // Auto-submit logic
}
```

### Update Timer Warning Threshold

```javascript
// Red warning at 10 seconds
const isLowTime = timeLeft <= 10;

// Orange warning at 60 seconds
const isMediumTime = timeLeft <= 60 && timeLeft > 10;
```

### Customize Colors

In component CSS files:
```css
/* Primary color */
--primary: #667eea;

/* Secondary color */
--secondary: #764ba2;

/* Success color */
--success: #48bb78;

/* Warning color */
--warning: #ed8936;

/* Danger color */
--danger: #f56565;
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## localStorage Keys Used

- `quizState`: Stores quiz progress
  ```javascript
  {
    answers: {},
    currentQuestion: 0,
    timeLeft: 300,
    tabSwitches: 0,
    inProgress: true
  }
  ```

## Development

### Run Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## Troubleshooting

### Timer not working
- Check if JavaScript is enabled
- Ensure no browser extensions are blocking timers

### State not persisting
- Check localStorage is enabled in browser
- Clear localStorage and try again: `localStorage.clear()`

### API connection issues
- Verify `.env` file has correct `REACT_APP_API_URL`
- Check if backend server is running
- Check browser console for CORS errors

## Performance Considerations

- Questions are loaded once at quiz start
- Answers are saved to localStorage on every selection
- Timer updates every second
- No unnecessary re-renders

## Security Considerations

- Tab switching is monitored for quiz integrity
- State is stored locally (not sent to server until submission)
- No sensitive data is stored in localStorage
- API calls should use proper authentication (implement in backend)

## Future Enhancements

- [ ] Add audio feedback for timer
- [ ] Implement question categories
- [ ] Add difficulty levels
- [ ] Support for multiple quiz types (true/false, fill-in-blank)
- [ ] Leaderboard functionality
- [ ] Quiz analytics and statistics
- [ ] Dark mode support
- [ ] Accessibility improvements (ARIA labels)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License

Copyright (c) 2025 Quiz Portal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## Support

For support, email kushvanthyalamanchi2004@gmail.com or open an issue in the GitHub repository.

## Acknowledgments

- React team for the amazing framework
- Contributors and testers
- Open source community

---

Made with ❤️ by the Quiz Portal Team
