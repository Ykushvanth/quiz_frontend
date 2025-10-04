
import './App.css';
import MainInterface from './components/main_interface/index';
import QuizQuestions from './components/quiz_questions/index';
import QuizScore from './components/quiz_score/index';


function App() {
  const path = window.location.pathname;
  if (path.startsWith('/exam')) {
    return <QuizQuestions />;
  }
  if (path.startsWith('/results')) {
    return <QuizScore />;
  }
  return <MainInterface />;
}

export default App;
