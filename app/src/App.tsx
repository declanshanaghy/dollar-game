import { useState } from 'react';
import './App.css';
import GraphComponent from './components/GraphComponent';
import GameControls from './components/GameControls';
import { GameState, VertexAction, ActionType } from './types';
import { initializeGameState, performMove, undoMove, resetGame } from './gameLogic';

function App() {
  const [gameState, setGameState] = useState<GameState>(initializeGameState(5, 30, 5));

  // Handle vertex actions (give or receive)
  const handleVertexAction = (vertexId: number, actionType: ActionType) => {
    const action: VertexAction = { vertexId, actionType };
    setGameState(currentState => performMove(currentState, action));
  };

  // Handle resetting the game
  const handleReset = (numVertices: number, edgeDensity: number, totalMoney: number) => {
    setGameState(resetGame(numVertices, edgeDensity, totalMoney));
  };

  // Handle undoing a move
  const handleUndo = () => {
    setGameState(currentState => undoMove(currentState));
  };

  // Check if undo is available
  const canUndo = gameState.history.length > 1;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>The Dollar Game</h1>
        <p className="subtitle">A Graph Theory Puzzle</p>
      </header>

      <main className="game-container">
        <div className="graph-section">
          <GraphComponent
            graph={gameState.graph}
            onVertexAction={handleVertexAction}
          />
        </div>

        <div className="controls-section">
          <GameControls 
            onReset={handleReset}
            onUndo={handleUndo}
            canUndo={canUndo}
            isWon={gameState.isWon}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          The Dollar Game is based on the mathematical concept of chip-firing games in graph theory.
        </p>
      </footer>
    </div>
  );
}

export default App;
