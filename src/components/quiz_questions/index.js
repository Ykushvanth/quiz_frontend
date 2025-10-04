import React, { useEffect, useState } from 'react';
import './index.css';

const QuizQuestions = ({ quizId = 1, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [endTime, setEndTime] = useState(null); 
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [tabChangeCount, setTabChangeCount] = useState(0);

  const urlParams = new URLSearchParams(window.location.search);
  const effectiveQuizId = Number(urlParams.get('quizId')) || quizId;
  const storageKey = `quizState_${effectiveQuizId}`;
  
  const getSessionId = () => {
    const sessionKey = `quizSession_${effectiveQuizId}`;
    let sessionId = localStorage.getItem(sessionKey);
    if (!sessionId) {
      sessionId = Date.now().toString();
      localStorage.setItem(sessionKey, sessionId);
    }
    return sessionId;
  };

  const startQuiz = async () => {
    setLoading(true); setError('');
    try {
      const sessionId = getSessionId();
      const url = `/api/quiz/${effectiveQuizId}/questions?sessionId=${sessionId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load questions');
      const data = await res.json();
      const list = Array.isArray(data.questions) ? data.questions : [];
      setQuestions(list);


      const savedRaw = localStorage.getItem(storageKey);
      if (savedRaw) {
        try {
          const saved = JSON.parse(savedRaw);
          if (saved?.answers) setAnswers(saved.answers);
          if (typeof saved?.currentIndex === 'number') {
            const maxIdx = Math.max(list.length - 1, 0);
            setCurrentIndex(Math.min(Math.max(saved.currentIndex, 0), maxIdx));
          }
          if (typeof saved?.endTime === 'number') setEndTime(saved.endTime);
        } catch { }
      }

      setEndTime(prev => {
        const now = Date.now();
        return typeof prev === 'number' && prev > now ? prev : now + 5 * 60 * 1000;
      });

      setStarted(true);
      setCurrentIndex(idx => (typeof idx === 'number' ? idx : 0));
    } catch (e) {
      setError('Could not load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!started) {
      startQuiz();
    }

  }, []);

  const selectOption = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const goNext = () => setCurrentIndex(i => Math.min(i + 1, Math.max(questions.length - 1, 0)));
  const goPrev = () => setCurrentIndex(i => Math.max(i - 1, 0));

  const handleSubmit = async () => {
    setSubmitted(true);
    setLoading(true);
    
    try {
      const response = await fetch(`/api/quiz/${effectiveQuizId}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate quiz');
      }

      const scoreData = await response.json();
      
      localStorage.setItem('quizScoreData', JSON.stringify(scoreData));
      
      try { 
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`quizSession_${effectiveQuizId}`);
      } catch { }
      
      window.location.href = '/results';
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz. Please try again.');
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    const confirmed = window.confirm('Are you sure you want to exit the quiz? Your progress will be lost.');
    if (confirmed) {
      try { 
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`quizSession_${effectiveQuizId}`);
        localStorage.removeItem(`quizState_${effectiveQuizId}`);
      } catch { }

      window.location.href = '/';
    }
  };

  const handleTabChange = () => {
    setTabChangeCount(prev => prev + 1);
    if (tabChangeCount >= 1) { 
      alert('You have switched tabs. The quiz will now be submitted automatically.');
      handleSubmit();
    } else {
      alert('Warning: You have switched tabs. Switching tabs one more time will automatically submit the quiz.');
    }
  };
  useEffect(() => {
    if (!started) return;
    try {
      const payload = { answers, currentIndex, endTime };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch { }
  }, [answers, currentIndex, endTime, started, storageKey]);

  useEffect(() => {
    if (!started || !endTime || submitted) return;
    const tick = () => {
      const now = Date.now();
      const diffMs = Math.max(endTime - now, 0);
      const secs = Math.ceil(diffMs / 1000);
      setRemainingSeconds(secs);
      if (secs <= 0) {
        handleSubmit();
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [started, endTime, submitted]);


  useEffect(() => {
    if (!started || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleTabChange();
      }
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [started, submitted, tabChangeCount]);

  const jumpTo = (index) => setCurrentIndex(Math.min(Math.max(index, 0), Math.max(questions.length - 1, 0)));

  const formatTime = (totalSeconds) => {
    const s = Math.max(0, totalSeconds | 0);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const current = questions[currentIndex];
  const isLast = currentIndex >= questions.length - 1;

  return (
    <div className="qq">
      {!started ? (
        <div>
          <h2 className="qq-title">Quiz</h2>
          {error ? <p className="qq-text">{error}</p> : <p className="qq-text">Start when you are ready.</p>}
          <div className="qq-actions">
            <button className="qq-btn primary" onClick={startQuiz} disabled={loading}>
              {loading ? 'Loading…' : 'Start Quiz'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="qq-bar">
            <div className="qq-timer" aria-label="Remaining time">{formatTime(remainingSeconds)}</div>
            <div className="qq-nav-container">
              <div className="qq-tab-warning" style={{ display: tabChangeCount > 0 ? 'block' : 'none' }}>
                Tab Changes: {tabChangeCount}/1
              </div>
              <ul className="qq-nav" aria-label="Question navigator">
              {questions.map((q, idx) => {
                const attempted = answers[q.id] != null;
                const isCurrent = idx === currentIndex;
                return (
                  <li key={q.id}>
                    <button
                      className={`qq-pill ${attempted ? 'attempted' : ''} ${isCurrent ? 'current' : ''}`}
                      onClick={() => jumpTo(idx)}
                    >
                      {idx + 1}
                    </button>
                  </li>
                );
              })}
              </ul>
            </div>
            <button className="qq-exit-btn" onClick={handleExit} title="Exit Quiz">
              ✕ Exit
            </button>
          </div>
          <h2 className="qq-title">Question {currentIndex + 1} of {questions.length}</h2>
          {current ? (
            <>
              <p className="qq-text">{current.question_text}</p>
              <ul className="qq-list">
                {current.options.map(opt => {
                  const checked = answers[current.id] === opt.id;
                  return (
                    <li key={opt.id} className={`qq-row ${checked ? 'selected' : ''}`}>
                      <label className="qq-option">
                        <input
                          type="radio"
                          name={`q_${current.id}`}
                          checked={checked}
                          onChange={() => selectOption(current.id, opt.id)}
                        />
                        <span>{opt.option_text}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
          <div className="qq-actions">
            <button className="qq-btn" onClick={goPrev} disabled={currentIndex === 0}>Previous</button>
            {!isLast ? (
              <button className="qq-btn primary" onClick={goNext} disabled={questions.length === 0}>Next</button>
            ) : (
              <button className="qq-btn primary" onClick={handleSubmit} disabled={questions.length === 0 || loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizQuestions;


