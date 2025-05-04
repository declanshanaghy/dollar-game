import React from 'react';

const GameInstructions: React.FC = () => {
  return (
    <div className="game-instructions-panel">
      <div className="game-info">
        <h3>Game Controls:</h3>
        <p style={{ margin: '0.2rem 0' }}>
          Control the game by clicking on nodes:
        </p>
        <ul className="game-instructions">
          <li>
            <strong>Give 🌊:</strong> Node gives 1$ to each neighbor
          </li>
          <li>
            <strong>Take 🌈:</strong> Node takes 1$ from each neighbor
          </li>
        </ul>
        <p style={{ margin: '0.2rem 0' }}>
          Goal: Make all nodes have zero or positive dollars.
        </p>
        <p className="tip">
          <strong>Tip:</strong> Negative nodes can still give!
        </p>
      </div>
    </div>
  );
};

export default GameInstructions;