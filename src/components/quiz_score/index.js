import React, { useEffect, useState } from 'react';
import './index.css';

const QuizScore = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scoreData, setScoreData] = useState(null);

  useEffect(() => {
    const loadScoreData = async () => {
      try {
        const scoreDataStr = localStorage.getItem('quizScoreData');
        if (scoreDataStr) {
          const data = JSON.parse(scoreDataStr);
          setScoreData(data);
        } else {
          setError('No score data found. Please complete a quiz first.');
        }
      } catch (err) {
        setError('Failed to load score data');
      } finally {
        setLoading(false);
      }
    };

    loadScoreData();
  }, []);

  const handleRetakeQuiz = () => {
    // Clear score data and session for new random order
    localStorage.removeItem('quizScoreData');
    localStorage.removeItem('quizSession_1'); // Clear session for quiz ID 1
    window.location.href = '/exam';
  };

  const handleGoHome = () => {
    // Clear score data and session
    localStorage.removeItem('quizScoreData');
    localStorage.removeItem('quizSession_1'); // Clear session for quiz ID 1
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="qs">
        <div className="qs-container">
          <div className="qs-loading">Loading results...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="qs">
        <div className="qs-container">
          <div className="qs-error">{error}</div>
          <div className="qs-actions">
            <button className="qs-btn primary" onClick={handleGoHome}>Go Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (!scoreData) {
    return (
      <div className="qs">
        <div className="qs-container">
          <div className="qs-error">No score data available</div>
          <div className="qs-actions">
            <button className="qs-btn primary" onClick={handleGoHome}>Go Home</button>
          </div>
        </div>
      </div>
    );
  }

  const { total_questions, correct_answers, wrong_answers, score, results } = scoreData;

  return (
    <div className="qs">
      <div className="qs-container">
        <div className="qs-header">
          <h1 className="qs-title">Quiz Results</h1>
          <div className="qs-score-summary">
            <div className="qs-score-circle">
              <div className="qs-score-number">{score}%</div>
              <div className="qs-score-label">Score</div>
            </div>
            <div className="qs-stats">
              <div className="qs-stat">
                <div className="qs-stat-number">{correct_answers}</div>
                <div className="qs-stat-label">Correct</div>
              </div>
              <div className="qs-stat">
                <div className="qs-stat-number">{wrong_answers}</div>
                <div className="qs-stat-label">Wrong</div>
              </div>
              <div className="qs-stat">
                <div className="qs-stat-number">{total_questions}</div>
                <div className="qs-stat-label">Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="qs-results">
          <h2 className="qs-results-title">Question Review</h2>
          <div className="qs-questions">
            {results.map((result, index) => (
              <div key={result.question_id} className={`qs-question ${result.is_correct ? 'correct' : 'incorrect'}`}>
                <div className="qs-question-header">
                  <div className="qs-question-number">Q{index + 1}</div>
                  <div className={`qs-question-status ${result.is_correct ? 'correct' : 'incorrect'}`}>
                    {result.is_correct ? '✓ Correct' : '✗ Incorrect'}
                  </div>
                </div>
                <div className="qs-question-text">{result.question_text}</div>
                {!result.is_correct && (
                  <div className="qs-answer-feedback">
                    <div className="qs-correct-answer">
                      <strong>Correct Answer:</strong> {result.correct_answer_text}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="qs-actions">
          <button className="qs-btn" onClick={handleGoHome}>Go Home</button>
          <button className="qs-btn primary" onClick={handleRetakeQuiz}>Retake Quiz</button>
        </div>
      </div>
    </div>
  );
};

export default QuizScore;
