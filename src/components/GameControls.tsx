import React, { useState } from 'react';

interface GameControlsProps {
  onReset: (numVertices: number) => void;
  onUndo: () => void;
  canUndo: boolean;
  isWon: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onReset,
  onUndo,
  canUndo,
  isWon,
}) => {
  const [numVertices, setNumVertices] = useState<number>(5);

  return (
    <div className="game-controls">
      <div className="control-group">
        <label htmlFor="vertices-slider">Number of Vertices: {numVertices}</label>
        <input
          id="vertices-slider"
          type="range"
          min="3"
          max="10"
          value={numVertices}
          onChange={(e) => setNumVertices(parseInt(e.target.value))}
          className="slider"
        />
      </div>
      
      <div className="button-group">
        <button 
          onClick={() => onReset(numVertices)}
          className="control-button reset-button"
        >
          New Game
        </button>
        
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`control-button undo-button ${!canUndo ? 'disabled' : ''}`}
        >
          Undo
        </button>
      </div>
      
      {isWon && (
        <div className="win-message">
          <h2>You Won! 🎉</h2>
          <p>All vertices have non-negative values.</p>
        </div>
      )}
      
      <div className="game-info">
        <h3>How to Play:</h3>
        <p>
          Click on a vertex to show action options:
        </p>
        <ul className="game-instructions">
          <li>
            <strong>Give:</strong> The vertex gives one chip to each of its neighbors.
          </li>
          <li>
            <strong>Receive:</strong> Each neighbor gives one chip to the vertex.
          </li>
        </ul>
        <p>
          The goal is to make all vertices have non-negative values.
        </p>
        <p className="tip">
          <strong>Tip:</strong> You can now give from vertices with negative chips!
        </p>
      </div>
    </div>
  );
};

export default GameControls;