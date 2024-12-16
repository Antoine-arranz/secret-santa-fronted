import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CreateGame, JoinGame } from './components/Game';
import './styles/Game.css';

function App() {
  useEffect(() => {
    // Création des flocons de neige
    const createSnowflake = () => {
      const snowflake = document.createElement('div');
      snowflake.className = 'snow';
      snowflake.style.left = Math.random() * window.innerWidth + 'px';
      snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
      snowflake.style.opacity = Math.random() * 0.6 + 0.4 + '';
      document.body.appendChild(snowflake);

      // Suppression du flocon après l'animation
      setTimeout(() => {
        snowflake.remove();
      }, 5000);
    };

    // Création de flocons à intervalles réguliers
    const snowInterval = setInterval(createSnowflake, 200);

    return () => clearInterval(snowInterval);
  }, []);

  return (
    <Router>
      <div className="App">
        <h1>🎄 Secret Santa 🎅</h1>
        <Routes>
          <Route path="/" element={<CreateGame />} />
          <Route path="/game/:id" element={<JoinGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
