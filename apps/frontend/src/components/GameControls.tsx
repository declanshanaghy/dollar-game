import React, { useState } from 'react';

interface GameControlsProps {
  onReset: (numVertices: number, edgeDensity: number, totalMoney: number) => void;
  onUndo: () => void;
  canUndo: boolean;
  isWon: boolean;
  genus: number;
  isWinnable: boolean;
  currentTotalMoney: number;
  showTutorialAgain?: () => void; // Optional function to replay tutorial
  hideTutorial?: () => void; // Optional function to hide tutorial
  isTutorialVisible?: boolean; // Whether the tutorial is currently visible
}

const GameControls: React.FC<GameControlsProps> = ({
  onReset,
  onUndo,
  canUndo,
  isWon,
  genus,
  isWinnable,
  currentTotalMoney,
  showTutorialAgain,
  hideTutorial,
  isTutorialVisible,
}) => {
  const [numVertices, setNumVertices] = useState<number>(5);
  const [edgeDensity, setEdgeDensity] = useState<number>(30);
  const [totalMoney, setTotalMoney] = useState<number>(5);

  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <div className="game-controls consciousness-slider">
      <div className="control-group">
        <label htmlFor="vertices-slider" style={{ fontSize: isMobile ? '0.85rem' : '0.9rem' }}>Nodes: {numVertices}</label>
        <input
          id="vertices-slider"
          type="range"
          min="3"
          max="10"
          value={numVertices}
          onChange={(e) => setNumVertices(parseInt(e.target.value))}
          className="slider wooden-slider"
          style={{ height: '8px' }}
        />
      </div>

      <div className="control-group">
        <label htmlFor="edges-slider" style={{ fontSize: isMobile ? '0.85rem' : '0.9rem' }}>Density: {edgeDensity}%</label>
        <input
          id="edges-slider"
          type="range"
          min="0"
          max="100"
          value={edgeDensity}
          onChange={(e) => setEdgeDensity(parseInt(e.target.value))}
          className="slider wooden-slider"
          style={{ height: '8px' }}
        />
      </div>

      <div className="control-group">
        <label htmlFor="money-slider" style={{ fontSize: isMobile ? '0.85rem' : '0.9rem' }}>Dollars: {totalMoney}</label>
        <input
          id="money-slider"
          type="range"
          min="-10"
          max="20"
          value={totalMoney}
          onChange={(e) => setTotalMoney(parseInt(e.target.value))}
          className="slider wooden-slider"
          style={{ height: '8px' }}
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
          <p style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', margin: '0.2rem 0' }}>All nodes have zero or positive dollars!</p>
        </div>
      )}
      
      <div className="genus-info">
        <h3>Game Statistics:</h3>
        <p style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', margin: '0.2rem 0' }}>
          <strong>Genus:</strong> {genus} (E - V + 1)
        </p>
        <p style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', margin: '0.2rem 0' }}>
          <strong>Total Dollars:</strong> {currentTotalMoney}
        </p>
        <p className={isWinnable ? "winnable-message" : "unwinnable-message"} style={{ fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
          {isWinnable
            ? "Winnable ($ ≥ Genus)"
            : "Not winnable ($ < Genus)"}
        </p>
      </div>
      
      {/* Tutorial button */}
      {(showTutorialAgain || hideTutorial) && (
        <div className="tutorial-button-container" style={{ marginTop: '1rem' }}>
          <button
            onClick={isTutorialVisible ? hideTutorial : showTutorialAgain}
            className="control-button tutorial-button"
            style={{
              backgroundColor: 'var(--amethyst-awareness)',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: isMobile ? '0.8rem' : '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <span style={{ marginRight: '6px' }}>🔮</span> {isTutorialVisible ? 'Hide Tutorial' : 'Show Tutorial Again'}
          </button>
        </div>
      )}
      
      {/* Game instructions moved to a separate component */}
    </div>
  );
};

export default GameControls;