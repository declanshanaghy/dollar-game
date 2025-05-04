import React from 'react';

const GameInstructions: React.FC = () => {
  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  return (
    <div className="game-instructions-panel">
      <div className="game-info">
        <h3>Game Controls:</h3>
        <p style={{ margin: '0.2rem 0', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
          Control the game by clicking on nodes:
        </p>
        <ul className="game-instructions" style={{ paddingLeft: isMobile ? '0.8rem' : '1rem' }}>
          <li style={{ fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
            <strong>Give 🌊:</strong> Node gives 1$ to each neighbor
          </li>
          <li style={{ fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
            <strong>Take 🌈:</strong> Node takes 1$ from each neighbor
          </li>
        </ul>
        <p style={{ margin: '0.2rem 0', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
          Goal: Make all nodes have zero or positive dollars.
        </p>
        <p className="tip" style={{ fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
          <strong>Tip:</strong> Negative nodes can still give!
        </p>
      </div>
    </div>
  );
};

export default GameInstructions;