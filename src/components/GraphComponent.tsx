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
  const calculateViewBox = () => {
    if (vertices.length === 0) return '0 0 400 400';
    
    const xValues = vertices.map(v => v.position.x);
    const yValues = vertices.map(v => v.position.y);
    
    const minX = Math.min(...xValues) - 50;
    const minY = Math.min(...yValues) - 50;
    const maxX = Math.max(...xValues) + 50;
    const maxY = Math.max(...yValues) + 50;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    return `${minX} ${minY} ${width} ${height}`;
  };
  
  return (
    <div className="graph-container">
      <svg
        viewBox={calculateViewBox()}
        width="100%"
        height="400px"
        className="graph-svg"
        onClick={handleBackgroundClick}
      >
        {/* Semi-transparent overlay to capture clicks */}
        <rect
          x="-1000"
          y="-1000"
          width="2000"
          height="2000"
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