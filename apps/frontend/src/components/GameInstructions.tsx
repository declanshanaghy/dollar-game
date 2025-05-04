import React from 'react';

const GameInstructions: React.FC = () => {
  return (
    <div className="game-instructions-panel">
      <div className="game-info">
        <h3>Metaphysical Interactions:</h3>
        <p>
          Channel your energy through each vertex with mindful clicks:
        </p>
        <ul className="game-instructions">
          <li>
            <strong>Give Energy 🌊:</strong> The node shares its essence with all connected neighbors, like a pour-over releasing its aromatic notes.
          </li>
          <li>
            <strong>Receive Energy 🌈:</strong> The node draws in the collective energy from its neighbors, like a deep meditation gathering cosmic vibrations.
          </li>
        </ul>
        <p>
          Seek to balance all nodes into positive or neutral energy states, achieving universal harmony.
        </p>
        <p className="tip">
          <strong>Cosmic Insight:</strong> Even nodes with negative energy can give! The universe works in mysterious ways. 🔮
        </p>
      </div>
    </div>
  );
};

export default GameInstructions;