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
  
  return (
    <line
      x1={sourceVertex.position.x}
      y1={sourceVertex.position.y}
      x2={targetVertex.position.x}
      y2={targetVertex.position.y}
      stroke="#6c757d"
      strokeWidth={2}
      strokeOpacity={0.8}
    />
  );
};

export default EdgeComponent;