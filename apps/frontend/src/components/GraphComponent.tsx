import React, { useMemo } from 'react';
import { Graph, ActionType } from '../types';
import VertexComponent from './VertexComponent';
import EdgeComponent from './EdgeComponent';
import StarburstAnimation from './StarburstAnimation';
import { canGiveFromVertex, canReceiveToVertex, getActionDisabledReason } from '../gameLogic';

interface GraphComponentProps {
  graph: Graph;
  onVertexAction: (vertexId: number, actionType: ActionType) => void;
  isWon: boolean;
  isWinnable: boolean;
}

const GraphComponent: React.FC<GraphComponentProps> = ({
  graph,
  onVertexAction,
  isWon,
  isWinnable
}) => {
  const { vertices, edges } = graph;
  
  // Handle click on the SVG background to close any open menus
  const handleBackgroundClick = () => {
    // This will be handled by the document click listener in VertexComponent
  };
  
  // Calculate the SVG viewBox dimensions based on vertex positions
  // with extra padding to accommodate menus and overlays
  const calculateViewBox = () => {
    if (vertices.length === 0) return '0 0 600 600';
    
    const xValues = vertices.map(v => v.position.x);
    const yValues = vertices.map(v => v.position.y);
    
    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;
    
    // Add padding to accommodate menus and overlays, but more compact
    // Use more padding on mobile for better touch interaction
    const padding = isMobile ? 100 : 80;
    const minX = Math.min(...xValues) - padding;
    const minY = Math.min(...yValues) - padding;
    const maxX = Math.max(...xValues) + padding;
    const maxY = Math.max(...yValues) + padding;
    
    // Calculate center of the graph
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // Calculate dimensions with some padding
    // Add more padding on mobile for better visibility
    const scaleFactor = isMobile ? 1.2 : 1.1;
    const width = (maxX - minX) * scaleFactor;
    const height = (maxY - minY) * scaleFactor;
    
    // Ensure minimum dimensions and maintain aspect ratio
    // Use smaller minimum dimensions on mobile
    const minDimension = isMobile ? 400 : 500;
    const finalWidth = Math.max(width, minDimension);
    const finalHeight = Math.max(height, minDimension);
    
    // Calculate the new viewBox that centers the graph
    const viewBoxX = centerX - finalWidth / 2;
    const viewBoxY = centerY - finalHeight / 2;
    
    return `${viewBoxX} ${viewBoxY} ${finalWidth} ${finalHeight}`;
  };
  
  // Calculate the center of the graph for the starburst animation
  const graphCenter = useMemo(() => {
    if (vertices.length === 0) return { x: 300, y: 300 };
    
    const xValues = vertices.map(v => v.position.x);
    const yValues = vertices.map(v => v.position.y);
    
    const centerX = xValues.reduce((sum, x) => sum + x, 0) / vertices.length;
    const centerY = yValues.reduce((sum, y) => sum + y, 0) / vertices.length;
    
    return { x: centerX, y: centerY };
  }, [vertices]);
  
  // Determine if interactivity should be disabled
  const interactivityDisabled = isWon || !isWinnable;
  
  // Message to display when game is not winnable
  const gameStatusMessage = useMemo(() => {
    if (isWon) return "C0ngr4tul4t10ns! Y0u w0n! 🎉";
    if (!isWinnable) return "G4m3 1s n0t w1nn4bl3. R3s3t t0 try 4g41n.";
    return null;
  }, [isWon, isWinnable]);
  
  return (
    <div className="graph-container" style={{ alignSelf: 'stretch', width: '100%', height: '100%', position: 'relative' }}>
      {gameStatusMessage && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(49, 50, 68, 0.9)',
            color: '#f5c2e7',
            padding: '10px 20px',
            borderRadius: '10px',
            zIndex: 10,
            fontFamily: 'monospace',
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            border: '2px solid #cba6f7',
            maxWidth: '90%',
            fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
            whiteSpace: 'nowrap'
          }}
        >
          {gameStatusMessage}
        </div>
      )}
      
      <svg
        viewBox={calculateViewBox()}
        width="100%"
        height="100%"
        className="graph-svg"
        onClick={handleBackgroundClick}
        onTouchStart={() => {}} // Add empty touch handler to ensure touch events are captured
        style={{
          display: 'block',
          marginTop: 0,
          width: '100%',
          height: '100%',
          touchAction: 'none' // Prevent default touch actions like scrolling
        }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Semi-transparent overlay to capture clicks */}
        <rect
          x="-5000"
          y="-5000"
          width="10000"
          height="10000"
          fill="transparent"
          pointerEvents={interactivityDisabled ? "none" : "all"}
          style={{ touchAction: 'none' }} // Prevent default touch actions
        />
        
        {/* Render edges first so they appear behind vertices */}
        {edges.map((edge) => (
          <EdgeComponent
            key={`${edge.source}-${edge.target}`}
            edge={edge}
            vertices={vertices}
          />
        ))}
        
        {/* Render vertices */}
        {vertices.map((vertex) => (
          <VertexComponent
            key={vertex.id}
            vertex={vertex}
            canGive={!interactivityDisabled && canGiveFromVertex(graph, vertex.id)}
            canReceive={!interactivityDisabled && canReceiveToVertex(graph, vertex.id)}
            giveDisabledReason={interactivityDisabled ? "Game is over" : getActionDisabledReason(graph, vertex.id, ActionType.GIVE)}
            receiveDisabledReason={interactivityDisabled ? "Game is over" : getActionDisabledReason(graph, vertex.id, ActionType.RECEIVE)}
            onAction={onVertexAction}
            graph={graph}
          />
        ))}
        
        {/* Render starburst animation when game is won */}
        {isWon && (
          <StarburstAnimation centerX={graphCenter.x} centerY={graphCenter.y} />
        )}
        
        {/* Semi-transparent overlay when interactivity is disabled */}
        {interactivityDisabled && (
          <rect
            x="-5000"
            y="-5000"
            width="10000"
            height="10000"
            fill={isWon ? "rgba(166, 227, 161, 0.1)" : "rgba(243, 139, 168, 0.1)"}
            pointerEvents="all"
          />
        )}
      </svg>
    </div>
  );
};

export default GraphComponent;