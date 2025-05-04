import React from 'react';
import { Graph, ActionType } from '../types';
import VertexComponent from './VertexComponent';
import EdgeComponent from './EdgeComponent';
import { canGiveFromVertex, canReceiveToVertex, getActionDisabledReason } from '../gameLogic';

interface GraphComponentProps {
  graph: Graph;
  onVertexAction: (vertexId: number, actionType: ActionType) => void;
}

const GraphComponent: React.FC<GraphComponentProps> = ({
  graph,
  onVertexAction
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
    
    // Add padding to accommodate menus and overlays, but more compact
    const minX = Math.min(...xValues) - 80;
    const minY = Math.min(...yValues) - 80;
    const maxX = Math.max(...xValues) + 80;
    const maxY = Math.max(...yValues) + 80;
    
    // Calculate center of the graph
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // Calculate dimensions with some padding
    const width = (maxX - minX) * 1.1;
    const height = (maxY - minY) * 1.1;
    
    // Ensure minimum dimensions and maintain aspect ratio
    const finalWidth = Math.max(width, 500);
    const finalHeight = Math.max(height, 500);
    
    // Calculate the new viewBox that centers the graph
    const viewBoxX = centerX - finalWidth / 2;
    const viewBoxY = centerY - finalHeight / 2;
    
    return `${viewBoxX} ${viewBoxY} ${finalWidth} ${finalHeight}`;
  };
  
  return (
    <div className="graph-container" style={{ alignSelf: 'stretch', width: '100%', height: '100%' }}>
      <svg
        viewBox={calculateViewBox()}
        width="100%"
        height="100%"
        className="graph-svg"
        onClick={handleBackgroundClick}
        style={{ display: 'block', marginTop: 0, width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Semi-transparent overlay to capture clicks */}
        <rect
          x="-5000"
          y="-5000"
          width="10000"
          height="10000"
          fill="transparent"
          pointerEvents="all"
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
            canGive={canGiveFromVertex(graph, vertex.id)}
            canReceive={canReceiveToVertex(graph, vertex.id)}
            giveDisabledReason={getActionDisabledReason(graph, vertex.id, ActionType.GIVE)}
            receiveDisabledReason={getActionDisabledReason(graph, vertex.id, ActionType.RECEIVE)}
            onAction={onVertexAction}
            graph={graph}
          />
        ))}
      </svg>
    </div>
  );
};

export default GraphComponent;