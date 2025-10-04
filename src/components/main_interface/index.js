import React, { Component } from 'react';
import './index.css';

class MainInterface extends Component {
  state = { loading: false };

  start = () => {
    window.location.assign('/exam?quizId=1');
  };

  render() {
    const { loading } = this.state;
    return (
      <div className="page">
        <div className="wrap">
          <header className="header">
            <div className="logo" aria-hidden="true" />
            <div className="name">Quick Quiz</div>
          </header>

          <main className="hero" role="main">
            <div className="content">
              <h1 className="title">Full‑Stack Development Basics</h1>
              <p className="text">Random questions • 5 minutes • 1 mark each</p>
              
              <div className="actions">
                <button className="btn primary" type="button" onClick={this.start} disabled={loading}>
                  {loading ? 'Loading…' : 'Start Quiz'}
                </button>
              </div>
            </div>

            <div className="art" aria-hidden="true">
              <div className="card">
                <div className="card-title">Quiz Overview</div>
                <ul className="list">
                  <li className="row"><span>Topic</span><strong>Full‑Stack Basics</strong></li>
                  <li className="row"><span>Questions</span><strong>5 (Random)</strong></li>
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
export default  MainInterface

