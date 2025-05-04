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
    <div className="app-container cosmic-container">
      <header className="app-header enlightened-header">
        <h1>The Dollar Game ✨</h1>
        <p className="subtitle cosmic-subtitle">A Graph Theory Odyssey 🌌</p>
      </header>

      <main className="game-container game-experience">
        <div className="graph-section graph-universe">
          <GraphComponent
            graph={gameState.graph}
            onVertexAction={handleVertexAction}
          />
        </div>

        <div className="controls-section control-dimension">
          <GameControls
            onReset={handleReset}
            onUndo={handleUndo}
            canUndo={canUndo}
            isWon={gameState.isWon}
            genus={gameState.genus}
            isWinnable={gameState.isWinnable}
            currentTotalMoney={gameState.graph.vertices.reduce((sum, vertex) => sum + vertex.chips, 0)}
          />
        </div>
      </main>

      <footer className="app-footer grounded-footer">
        <p className="mindful-text">
          Crafted with conscious code & single-origin coffee 🧘‍♂️ | Based on the mathematical concept of chip-firing games in graph theory
        </p>
      </footer>
    </div>
  );
}

export default App;
