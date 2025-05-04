import React from 'react';
import { Edge, Vertex } from '../types';

interface EdgeComponentProps {
  edge: Edge;
  vertices: Vertex[];
}

const EdgeComponent: React.FC<EdgeComponentProps> = ({ edge, vertices }) => {
  const sourceVertex = vertices.find(v => v.id === edge.source);
  const targetVertex = vertices.find(v => v.id === edge.target);
  
  if (!sourceVertex || !targetVertex) {
    return null;
  }
  
  // Calculate a slightly curved path between vertices
  const calculateCurvedPath = () => {
    const dx = targetVertex.position.x - sourceVertex.position.x;
    const dy = targetVertex.position.y - sourceVertex.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate a control point for the quadratic curve
    // Perpendicular to the line between vertices
    const midX = (sourceVertex.position.x + targetVertex.position.x) / 2;
    const midY = (sourceVertex.position.y + targetVertex.position.y) / 2;
    
    // Offset the control point perpendicular to the line
    // The amount of curve is proportional to the distance
    const offset = distance * 0.15;
    const perpX = -dy / distance * offset;
    const perpY = dx / distance * offset;
    
    const controlX = midX + perpX;
    const controlY = midY + perpY;
    
    return `M ${sourceVertex.position.x} ${sourceVertex.position.y} Q ${controlX} ${controlY} ${targetVertex.position.x} ${targetVertex.position.y}`;
  };
  
  return (
    <g className="cosmic-connection">
      <path
        className="edge-path flowing-energy"
        d={calculateCurvedPath()}
        stroke="var(--sunset-clay)"
        strokeWidth={4}
        strokeOpacity={0.7}
        fill="none"
      />
      
      {/* Subtle gradient overlay */}
      <path
        className="energy-flow"
        d={calculateCurvedPath()}
        stroke="url(#edgeGradient)"
        strokeWidth={2.5}
        strokeOpacity={0.4}
        fill="none"
        strokeDasharray="5 5"
      />
      
      {/* Define gradient for edges */}
      <defs>
        <linearGradient id="edgeGradient" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--amethyst-awareness)" />
          <stop offset="50%" stopColor="var(--sapphire-syntax)" />
          <stop offset="100%" stopColor="var(--ruby-recursion)" />
        </linearGradient>
      </defs>
    </g>
  );
};

export default EdgeComponent;