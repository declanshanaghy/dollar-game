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
        <label htmlFor="vertices-slider">V3rt3x D3ns1ty 🔮: {numVertices}</label>
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
        <label htmlFor="edges-slider">C0nn3ct10n Fl0w 🧠: {edgeDensity}%</label>
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
        <label htmlFor="money-slider">K4rm4 B4l4nc3 ✨: {totalMoney}</label>
        <input
          id="money-slider"
          type="range"
          min="0"
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
          <span className="button-text">Initiate Harmony 🌱</span>
        </button>
        
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`control-button undo-button ${!canUndo ? 'disabled' : ''}`}
        >
          Undo Vibration 🔄
        </button>
      </div>
      
      {isWon && (
        <div className="win-message">
          <h2>Cosmic Harmony Achieved! 🎉✨</h2>
          <p>All nodes have reached energetic equilibrium, like the carefully extracted notes of a single-origin Ethiopian pour-over.</p>
        </div>
      )}
      
      <div className="genus-info">
        <h3>Algorithmic Consciousness:</h3>
        <p>
          <strong>Genus Potential:</strong> {genus} (E - V + 1) 🧮
        </p>
        <p>
          <strong>Energy Flow Total:</strong> {currentTotalMoney} 💫
        </p>
        <p className={isWinnable ? "winnable-message" : "unwinnable-message"}>
          {isWinnable
            ? "This graph vibrates with winnable potential (Energy ≥ Genus)"
            : "This graph requires additional cosmic energy (Energy < Genus)"}
        </p>
      </div>
      
      {/* Game instructions moved to a separate component */}
    </div>
  );
};

export default GameControls;