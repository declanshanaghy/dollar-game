import React, { useState } from 'react';

interface GameControlsProps {
  onReset: (numVertices: number, edgeDensity: number, totalMoney: number) => void;
  onUndo: () => void;
  canUndo: boolean;
  isWon: boolean;
  genus: number;
  isWinnable: boolean;
  currentTotalMoney: number;
}

const GameControls: React.FC<GameControlsProps> = ({
  onReset,
  onUndo,
  canUndo,
  isWon,
  genus,
  isWinnable,
  currentTotalMoney,
}) => {
  const [numVertices, setNumVertices] = useState<number>(5);
  const [edgeDensity, setEdgeDensity] = useState<number>(30);
  const [totalMoney, setTotalMoney] = useState<number>(5);

  return (
    <div className="game-controls consciousness-slider">
      <div className="control-group">
        <label htmlFor="vertices-slider">Number of Nodes: {numVertices}</label>
        <input
          id="vertices-slider"
          type="range"
          min="3"
          max="10"
          value={numVertices}
          onChange={(e) => setNumVertices(parseInt(e.target.value))}
          className="slider wooden-slider"
        />
      </div>

      <div className="control-group">
        <label htmlFor="edges-slider">Connection Density: {edgeDensity}%</label>
        <input
          id="edges-slider"
          type="range"
          min="0"
          max="100"
          value={edgeDensity}
          onChange={(e) => setEdgeDensity(parseInt(e.target.value))}
          className="slider wooden-slider"
        />
      </div>

      <div className="control-group">
        <label htmlFor="money-slider">Starting Dollars: {totalMoney}</label>
        <input
          id="money-slider"
          type="range"
          min="-10"
          max="20"
          value={totalMoney}
          onChange={(e) => setTotalMoney(parseInt(e.target.value))}
          className="slider wooden-slider"
        />
      </div>
      
      <div className="button-group">
        <button
          onClick={() => onReset(numVertices, edgeDensity, totalMoney)}
          className="control-button reset-button cosmic-button primary-action"
        >
          <span className="button-aura"></span>
          <span className="button-text">Reset Game</span>
        </button>
        
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`control-button undo-button ${!canUndo ? 'disabled' : ''}`}
        >
          Undo Move
        </button>
      </div>
      
      {isWon && (
        <div className="win-message">
          <h2>You Won! 🎉</h2>
          <p>All nodes have zero or positive dollars. Great job!</p>
        </div>
      )}
      
      <div className="genus-info">
        <h3>Game Statistics:</h3>
        <p>
          <strong>Genus:</strong> {genus} (E - V + 1)
        </p>
        <p>
          <strong>Total Dollars:</strong> {currentTotalMoney}
        </p>
        <p className={isWinnable ? "winnable-message" : "unwinnable-message"}>
          {isWinnable
            ? "This game is winnable (Dollars ≥ Genus)"
            : "This game is not winnable (Dollars < Genus)"}
        </p>
      </div>
      
      {/* Game instructions moved to a separate component */}
    </div>
  );
};

export default GameControls;