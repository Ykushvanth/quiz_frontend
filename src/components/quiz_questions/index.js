import React, { useEffect, useState, useCallback } from 'react';
import './index.css';
const API_URL = process.env.REACT_APP_API_URL;
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
  const qId = Number(urlParams.get('quizId')) || quizId;
  const storageKey = `quizState_${qId}`;
  
  const getSessionId = useCallback(() => {
    const sessionKey = `quizSession_${qId}`;
    let sid = localStorage.getItem(sessionKey);
    if (!sid) {
      sid = Date.now().toString();
      localStorage.setItem(sessionKey, sid);
    }
    return sid;
  }, [qId]);

  const handleSubmit = useCallback(async () => {
    setSubmitted(true);
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/quiz/${qId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error('Failed to evaluate quiz');

      const scoreData = await res.json();
      localStorage.setItem('quizScoreData', JSON.stringify(scoreData));
      
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`quizSession_${qId}`);
      
      window.location.href = '/results';
    } catch (err) {
      console.log('Submit error:', err);
      setError('Failed to submit. Try again.');
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  }, [qId, answers, storageKey]);

  const startQuiz = useCallback(async () => {
    setLoading(true); 
    setError('');
    
    try {
      const sid = getSessionId();
      const url = `${API_URL}/api/quiz/${qId}/questions?sessionId=${sid}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error('Failed to load');
      
      const data = await res.json();
      const list = Array.isArray(data.questions) ? data.questions : [];
      setQuestions(list);

      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.answers) setAnswers(parsed.answers);
          if (typeof parsed?.currentIndex === 'number') {
            setCurrentIndex(Math.min(Math.max(parsed.currentIndex, 0), list.length - 1));
          }
          if (typeof parsed?.endTime === 'number') setEndTime(parsed.endTime);
        } catch(e) {
          console.log('Parse error', e);
        }
      }

      setEndTime(prev => {
        const now = Date.now();
        return (typeof prev === 'number' && prev > now) ? prev : now + 5 * 60 * 1000;
      });

      setStarted(true);
      setCurrentIndex(idx => (typeof idx === 'number' ? idx : 0));
    } catch(e) {
      setError('Could not load questions');
    } finally {
      setLoading(false);
    }
  }, [qId, storageKey, getSessionId]);

  useEffect(() => {
    if (!started) startQuiz();
  }, [started, startQuiz]);

  const selectOption = (qid, oid) => {
    setAnswers(prev => ({ ...prev, [qid]: oid }));
  };

  const goNext = () => setCurrentIndex(i => Math.min(i + 1, questions.length - 1));
  const goPrev = () => setCurrentIndex(i => Math.max(i - 1, 0));

  const handleExit = () => {
    if(window.confirm('Exit quiz? Progress will be lost.')) {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`quizSession_${qId}`);
      localStorage.removeItem(`quizState_${qId}`);
      window.location.href = '/';
    }
  };

  const handleTabChange = useCallback(() => {
    setTabChangeCount(prev => {
      const newCount = prev + 1;
      if (newCount > 1) { 
        alert('Tab switched. Auto-submitting quiz.');
        handleSubmit();
      } else {
        alert('Warning: One more tab switch will submit the quiz.');
      }
      return newCount;
    });
  }, [handleSubmit]);

  useEffect(() => {
    if (!started) return;
    
    const payload = { answers, currentIndex, endTime };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [answers, currentIndex, endTime, started, storageKey]);

  useEffect(() => {
    if (!started || !endTime || submitted) return;
    
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(endTime - now, 0);
      const secs = Math.ceil(diff / 1000);
      setRemainingSeconds(secs);
      
      // tick sound for last 10 secs
      if (secs <= 10 && secs > 0) {
        const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKjo78txJwYuf9Dx1IkyBxlpu+rknE4MD1Cp6O/LcSgGLoDN8tiIMQYbbLvq5J1ODA5QqOjvy3EnBi980fHSijEGG2y66uSdTgwOUKjo78pxKAYugM3y2IgxBhpsu+rknU4MD1Cp6O/LcSgGLoDN8tiIMQYbbLvq5J1ODA5QqOjvy3EnBi980fHSijEGG2y66uSdTgwPUKno78txKAYugM3y2IgxBhpsu+rknU4MD1Cp6O/LcSgGLoDN8tiIMQYbbLvq5J1ODA5QqOjvy3EnBi980fHSijEGG2y66uSdTgwPUKno78txKAYugM3y2IgxBhpsu+rknU4MD1Cp6O/LcSgGLoDN8tiIMQYbbLvq5J1ODA5QqOjvy3EnBi980fHSijEGG2y66uSdTg==');
        beep.play().catch(e => {});
      }
      
      if (secs <= 0) handleSubmit();
    };
    
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [started, endTime, submitted, handleSubmit]);

  useEffect(() => {
    if (!started || submitted) return;

    const onVisibilityChange = () => {
      if (document.hidden) handleTabChange();
    };

    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Leave? Progress will be lost.';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [started, submitted, handleTabChange]);

  const jumpTo = (idx) => setCurrentIndex(Math.min(Math.max(idx, 0), questions.length - 1));

  const formatTime = (secs) => {
    const s = Math.max(0, secs | 0);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const curr = questions[currentIndex];
  const isLast = currentIndex >= questions.length - 1;

  return (
    <div className="qq">
      {!started ? (
        <div>
          <h2 className="qq-title">Quiz</h2>
          {error ? <p className="qq-text">{error}</p> : <p className="qq-text">Start when ready.</p>}
          <div className="qq-actions">
            <button className="qq-btn primary" onClick={startQuiz} disabled={loading}>
              {loading ? 'Loading…' : 'Start Quiz'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="qq-bar">
            <div className={`qq-timer ${remainingSeconds <= 10 ? 'warning' : ''}`}>{formatTime(remainingSeconds)}</div>
            <div className="qq-nav-container">
              {tabChangeCount > 0 && (
                <div className="qq-tab-warning">
                  Tab Changes: {tabChangeCount}/1
                </div>
              )}
              <ul className="qq-nav">
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
            <button className="qq-exit-btn" onClick={handleExit}>
              ✕ Exit
            </button>
          </div>
          
          <h2 className="qq-title">Question {currentIndex + 1} of {questions.length}</h2>
          
          {curr && (
            <>
              <p className="qq-text">{curr.question_text}</p>
              <ul className="qq-list">
                {curr.options.map(opt => {
                  const checked = answers[curr.id] === opt.id;
                  return (
                    <li key={opt.id} className={`qq-row ${checked ? 'selected' : ''}`}>
                      <label className="qq-option">
                        <input
                          type="radio"
                          name={`q_${curr.id}`}
                          checked={checked}
                          onChange={() => selectOption(curr.id, opt.id)}
                        />
                        <span>{opt.option_text}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          
          <div className="qq-actions">
            <button className="qq-btn" onClick={goPrev} disabled={currentIndex === 0}>
              Previous
            </button>
            {!isLast ? (
              <button className="qq-btn primary" onClick={goNext} disabled={questions.length === 0}>
                Next
              </button>
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