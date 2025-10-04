import React, { Component } from 'react';
import './index.css';

class MainInterface extends Component {
  state = { loading: false };

  quotes = [
    "Believe you can and you're halfway there.",
    "Success is not final, failure is not fatal.",
    "The expert in anything was once a beginner.",
    "Don't watch the clock; do what it does. Keep going.",
    "You've got this! Trust your preparation."
  ];

  start = () => {
    window.location.assign('/exam?quizId=1');
  };

  getRandomQuote = () => {
    return this.quotes[Math.floor(Math.random() * this.quotes.length)];
  };

  render() {
    const { loading } = this.state;
    return (
      <div className="page">
        <div className="wrap">
          <header className="header">
            <div className="name">QuizPortal</div>
          </header>

          <main className="hero">
            <div className="content">
              <h1 className="title">Full‑Stack Development Basics</h1>
              <p className="quote">"{this.getRandomQuote()}"</p>
              
              <div className="actions">
                <button className="btn primary" type="button" onClick={this.start} disabled={loading}>
                  {loading ? 'Loading…' : 'Start Quiz'}
                </button>
              </div>
            </div>

            <div className="art">
              <div className="card">
                <div className="card-title">Quiz Overview</div>
                <ul className="list">
                  <li className="row"><span>Topic</span><strong>Full‑Stack Basics</strong></li>
                  <li className="row"><span>Questions</span><strong>5</strong></li>
                  <li className="row"><span>Duration</span><strong>5 minutes</strong></li>
                  <li className="row"><span>Marks</span><strong>1 per question</strong></li>
                  <li className="row"><span>Format</span><strong>MCQ</strong></li>
                </ul>
                <div className="ring a" />
                <div className="ring b" />
                <div className="ring c" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default MainInterface;