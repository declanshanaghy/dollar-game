import { useState, useEffect } from 'react';
import '../App.css';
import GraphComponent from '../components/GraphComponent';
import GameControls from '../components/GameControls';
import GameInstructions from '../components/GameInstructions';
import ThemeToggle from '../components/ThemeToggle';
import { GameState, VertexAction, ActionType } from '../types';
import { initializeGameState, performMove, undoMove, resetGame } from '../gameLogic';
import {
  trackVertexAction,
  trackGameReset,
  trackUndoMove,
  trackGameWin,
  trackExternalLinkClick
} from '../services/analyticsService';

// ✨ H0m3 P4g3 - Th3 c0r3 c0sm1c 3xp3r13nc3 0f th3 D0ll4r G4m3 ✨

interface HomePageProps {
  showTutorialAgain?: () => void;
  hideTutorial?: () => void;
  isTutorialVisible?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ showTutorialAgain, hideTutorial, isTutorialVisible }) => {
  const [gameState, setGameState] = useState<GameState>(initializeGameState(5, 30, 5));
  const [coffeeButtonClass, setCoffeeButtonClass] = useState<string>('');
  
  // Watch for game win state and trigger coffee button animation
  useEffect(() => {
    if (gameState.isWon) {
      // Track the game win
      trackGameWin(gameState.history.length - 1);
      
      // Delay adding the class to allow starburst to start first
      const timer = setTimeout(() => {
        setCoffeeButtonClass('celebration-mode');
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setCoffeeButtonClass('');
    }
  }, [gameState.isWon]);

  // 🌈 Handle vertex actions (give or receive)
  const handleVertexAction = (vertexId: number, actionType: ActionType) => {
    const action: VertexAction = { vertexId, actionType };
    setGameState(currentState => {
      // Track the vertex action
      trackVertexAction(vertexId, actionType);
      return performMove(currentState, action);
    });
  };

  // 🔄 Handle resetting the game
  const handleReset = (numVertices: number, edgeDensity: number, totalMoney: number) => {
    // Reset coffee button position first
    setCoffeeButtonClass('');
    
    // Track the game reset
    trackGameReset(numVertices, edgeDensity, totalMoney);
    
    // Then reset the game state
    setGameState(resetGame(numVertices, edgeDensity, totalMoney));
  };

  // ↩️ Handle undoing a move
  const handleUndo = () => {
    // Track the undo move
    trackUndoMove();
    
    setGameState(currentState => undoMove(currentState));
  };

  // 🧠 Check if undo is available
  const canUndo = gameState.history.length > 1;

  return (
    <div className="app-container cosmic-container">
      <ThemeToggle />
      
      <div className="header-container" style={{ position: 'relative', width: '100%' }}>
        <header className="app-header enlightened-header" style={{ width: '100%', minHeight: '80px', position: 'relative' }}>
          <a
            href="https://en.wikipedia.org/wiki/Chip-firing_game"
            target="_blank"
            rel="noopener noreferrer"
            className="title-link"
            style={{ display: 'block', width: '100%', textAlign: 'center' }}
            onClick={() => trackExternalLinkClick('https://en.wikipedia.org/wiki/Chip-firing_game')}
          >
            <img
              src="/logos/logo.png"
              alt="The Dollar Game Logo"
              style={{
                maxWidth: '800px',
                maxHeight: '450px',
                width: '100%',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </a>
        </header>
        
        <a
          href="https://www.buymeacoffee.com/firemandecko"
          target="_blank"
          rel="noopener noreferrer"
          className={`coffee-link ${coffeeButtonClass}`}
          onClick={() => trackExternalLinkClick('https://www.buymeacoffee.com/firemandecko')}
        >
          <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=firemandecko&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy Me A Coffee" className="coffee-button-img" />
        </a>
      </div>

      <main className="game-container game-experience">
        <div className="graph-section graph-universe">
          <GraphComponent
            graph={gameState.graph}
            onVertexAction={handleVertexAction}
            isWon={gameState.isWon}
            isWinnable={gameState.isWinnable}
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
            showTutorialAgain={showTutorialAgain}
            hideTutorial={hideTutorial}
            isTutorialVisible={isTutorialVisible}
          />
        </div>
      </main>

      <section className="instructions-section">
        <GameInstructions />
      </section>

      <footer className="app-footer grounded-footer">
        <p className="mindful-text" style={{ fontSize: "0.8rem", margin: "0.2rem 0" }}>
          Crafted with conscious code & single-origin coffee 🧘‍♂️ | Based on chip-firing games in graph theory
        </p>
        <p className="attribution-text" style={{ fontSize: "0.8rem", margin: "0.2rem 0" }}>
          Inspired by <a
            href="https://www.youtube.com/watch?v=U33dsEcKgeQ"
            target="_blank"
            rel="noopener noreferrer"
            className="attribution-link"
            onClick={() => trackExternalLinkClick('https://www.youtube.com/watch?v=U33dsEcKgeQ')}
          >Numberphile's "The Dollar Game"</a>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;