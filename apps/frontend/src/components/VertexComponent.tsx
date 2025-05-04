import React, { useState, useEffect } from 'react';
import { Vertex, Graph } from '../types';
import { ActionType } from '../types';
import { getVertexDegree, getNeighbors } from '../gameLogic';

interface VertexComponentProps {
  vertex: Vertex;
  canGive: boolean;
  canReceive: boolean;
  giveDisabledReason: string | null;
  receiveDisabledReason: string | null;
  onAction: (vertexId: number, actionType: ActionType) => void;
  graph: Graph; // Added to calculate preview states
}

interface NeighborPreview {
  id: number;
  position: { x: number; y: number };
  newChips: number;
}

const VertexComponent: React.FC<VertexComponentProps> = ({
  vertex,
  canGive,
  canReceive,
  giveDisabledReason,
  receiveDisabledReason,
  onAction,
  graph
}) => {
  const { id, chips, position } = vertex;
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<ActionType | null>(null);
  const [neighborPreviews, setNeighborPreviews] = useState<NeighborPreview[]>([]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (_: MouseEvent) => {
      setShowMenu(false);
      setHoveredAction(null);
    };
    
    if (showMenu) {
      // Add the event listener with a slight delay to prevent immediate closing
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showMenu]);
  
  // Determine color based on chip count and action abilities
  const getColor = () => {
    if (chips < 0) return 'var(--negative-space)'; // Red for negative
    if (chips === 0) return 'var(--neutral-karma)'; // Yellow for zero
    if (canGive || canReceive) return 'var(--positive-energy)';   // Teal for actionable
    return 'var(--meditation-moss)';  // Green for positive but not actionable
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
    if (!showMenu) {
      setHoveredAction(null);
    }
  };

  const handleAction = (actionType: ActionType) => {
    onAction(id, actionType);
    setShowMenu(false);
    setHoveredAction(null);
    setNeighborPreviews([]); // Clear neighbor previews when an action is performed
  };

  // Calculate preview chip count based on action type
  const getPreviewChipCount = (actionType: ActionType): number => {
    if (!actionType) return chips;
    
    const degree = getVertexDegree(graph, id);
    
    if (actionType === ActionType.GIVE) {
      // When giving, vertex loses one chip per neighbor
      return chips - degree;
    } else if (actionType === ActionType.RECEIVE) {
      // When receiving, vertex gains one chip per neighbor
      return chips + degree;
    }
    
    return chips;
  };
  
  // Calculate preview for neighbors
  const calculateNeighborPreviews = (actionType: ActionType) => {
    if (!actionType) {
      setNeighborPreviews([]);
      return;
    }
    
    const neighbors = getNeighbors(graph, id);
    const previews: NeighborPreview[] = [];
    
    neighbors.forEach(neighborId => {
      const neighbor = graph.vertices.find(v => v.id === neighborId);
      if (neighbor) {
        let newChips = neighbor.chips;
        
        if (actionType === ActionType.GIVE) {
          // Neighbor receives 1 chip
          newChips = neighbor.chips + 1;
        } else if (actionType === ActionType.RECEIVE) {
          // Neighbor gives 1 chip
          newChips = neighbor.chips - 1;
        }
        
        previews.push({
          id: neighborId,
          position: neighbor.position,
          newChips
        });
      }
    });
    
    setNeighborPreviews(previews);
  };

  // Handle mouse enter for action buttons
  const handleMouseEnter = (actionType: ActionType) => {
    setHoveredAction(actionType);
    calculateNeighborPreviews(actionType);
  };

  // Handle mouse leave for action buttons
  const handleMouseLeave = () => {
    setHoveredAction(null);
    setNeighborPreviews([]);
  };
  
  // Create animated dashed lines to neighbors
  const renderAnimatedLines = () => {
    if (!hoveredAction || neighborPreviews.length === 0) return null;
    
    return neighborPreviews.map(neighbor => {
      // Calculate direction vector
      const dx = neighbor.position.x - position.x;
      const dy = neighbor.position.y - position.y;
      
      // Calculate start and end points (slightly offset from vertices)
      const length = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / length;
      const unitY = dy / length;
      
      // Start at edge of current vertex, end at edge of neighbor vertex
      // These coordinates are relative to the SVG, not the vertex transform
      const startX = unitX * 30; // Relative to current vertex position
      const startY = unitY * 30;
      const endX = dx - unitX * 30; // Relative to current vertex position
      const endY = dy - unitY * 30;
      
      return (
        <line
          key={`preview-line-${id}-${neighbor.id}`}
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={hoveredAction === ActionType.GIVE ? "rgba(42, 157, 143, 0.7)" : "rgba(233, 196, 106, 0.7)"}
          strokeWidth={2}
          strokeDasharray="5,5"
          className={`animated-dash ${hoveredAction === ActionType.GIVE ? 'give-animation' : 'receive-animation'}`}
        />
      );
    });
  };
  
  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Aura layer for positive vertices */}
      {chips >= 0 && (canGive || canReceive) && (
        <circle
          r={48}
          fill="none"
          stroke={chips > 0 ? 'var(--positive-energy)' : 'var(--neutral-karma)'}
          strokeWidth={3}
          strokeOpacity={0.4}
          className="aura-layer"
        />
      )}
      
      <circle
        r={40}
        fill={getColor()}
        stroke={(canGive || canReceive) ? 'var(--amethyst-awareness)' : 'var(--sunset-clay)'}
        strokeWidth={2}
        className={(canGive || canReceive) ? 'vertex-actionable vertex-core' : 'vertex vertex-core'}
      />
      
      <text
        textAnchor="middle"
        dy=".3em"
        fontSize="22"
        fontWeight="bold"
        fill={chips >= 0 ? 'var(--cosmic-soil)' : 'var(--text-color)'}
        className="dollar-value"
      >
        {chips > 0 ? `+${chips}` : chips}
      </text>

      {/* Action Menu */}
      {showMenu && (
        <g className="action-menu">
          {/* Calculate menu position to ensure it stays within canvas */}
          {(() => {
            // Get SVG dimensions from parent
            const svgElement = document.querySelector('.graph-svg');
            const svgRect = svgElement?.getBoundingClientRect();
            const viewBox = svgElement?.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 400, 400];
            
            // Default position (above vertex)
            let menuX = -80;
            let menuY = -100;
            
            // Adjust if we have SVG dimensions
            if (svgRect && viewBox.length === 4) {
              const [minX, minY, width, height] = viewBox;
              const svgWidth = width;
              const svgHeight = height;
              
              // Check if menu would go off left edge
              if (position.x + menuX < minX + 10) {
                menuX = -(position.x - minX) + 10;
              }
              
              // Check if menu would go off right edge
              if (position.x + menuX + 160 > minX + svgWidth - 10) {
                menuX = (minX + svgWidth) - (position.x + 160) - 10;
              }
              
              // Check if menu would go off top edge
              if (position.y + menuY < minY + 10) {
                menuY = -(position.y - minY) + 10;
              }
              
              // Check if menu would go off bottom edge
              if (position.y + menuY + 80 > minY + svgHeight - 10) {
                menuY = (minY + svgHeight) - (position.y + 80) - 10;
              }
            }
            
            return (
              <rect
                x={menuX}
                y={menuY}
                width={160}
                height={80}
                rx={12}
                ry={12}
                fill="var(--card-background)"
                stroke="var(--sunset-clay)"
                strokeWidth={1.5}
                strokeDasharray="2 1"
              />
            );
          })()}
          
          {/* Action Buttons - positioned dynamically based on menu position */}
          {(() => {
            // Get SVG dimensions from parent
            const svgElement = document.querySelector('.graph-svg');
            const svgRect = svgElement?.getBoundingClientRect();
            const viewBox = svgElement?.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 400, 400];
            
            // Default position (above vertex)
            let menuX = -80;
            let menuY = -100;
            
            // Adjust if we have SVG dimensions
            if (svgRect && viewBox.length === 4) {
              const [minX, minY, width, height] = viewBox;
              const svgWidth = width;
              const svgHeight = height;
              
              // Check if menu would go off left edge
              if (position.x + menuX < minX + 10) {
                menuX = -(position.x - minX) + 10;
              }
              
              // Check if menu would go off right edge
              if (position.x + menuX + 160 > minX + svgWidth - 10) {
                menuX = (minX + svgWidth) - (position.x + 160) - 10;
              }
              
              // Check if menu would go off top edge
              if (position.y + menuY < minY + 10) {
                menuY = -(position.y - minY) + 10;
              }
              
              // Check if menu would go off bottom edge
              if (position.y + menuY + 80 > minY + svgHeight - 10) {
                menuY = (minY + svgHeight) - (position.y + 80) - 10;
              }
            }
            
            // Calculate button positions based on menu position
            const giveButtonX = menuX + 20;
            const receiveButtonX = menuX + 90;
            const buttonY = menuY + 30;
            
            return (
              <>
                {/* Give Button */}
                <g
                  transform={`translate(${giveButtonX}, ${buttonY})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canGive) handleAction(ActionType.GIVE);
                  }}
                  onMouseEnter={() => handleMouseEnter(ActionType.GIVE)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    cursor: canGive ? 'pointer' : 'not-allowed',
                    opacity: canGive ? 1 : 0.5
                  }}
                  className={`action-button ${canGive ? '' : 'disabled'}`}
                >
                  <rect
                    x={0}
                    y={0}
                    width={50}
                    height={30}
                    rx={5}
                    ry={5}
                    fill={canGive ? "var(--meditation-moss)" : "#cccccc"}
                    stroke="var(--cosmic-soil)"
                    strokeWidth={1.5}
                  />
                  <text
                    x={25}
                    y={20}
                    textAnchor="middle"
                    fontSize={12}
                    fill="white"
                  >
                    Give ✨
                  </text>
                  {!canGive && giveDisabledReason && (
                    <title>{giveDisabledReason}</title>
                  )}
                </g>
                
                {/* Receive Button */}
                <g
                  transform={`translate(${receiveButtonX}, ${buttonY})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canReceive) handleAction(ActionType.RECEIVE);
                  }}
                  onMouseEnter={() => handleMouseEnter(ActionType.RECEIVE)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    cursor: canReceive ? 'pointer' : 'not-allowed',
                    opacity: canReceive ? 1 : 0.5
                  }}
                  className={`action-button ${canReceive ? '' : 'disabled'}`}
                >
                  <rect
                    x={0}
                    y={0}
                    width={50}
                    height={30}
                    rx={5}
                    ry={5}
                    fill={canReceive ? "var(--neutral-karma)" : "#cccccc"}
                    stroke="var(--cosmic-soil)"
                    strokeWidth={1.5}
                  />
                  <text
                    x={25}
                    y={20}
                    textAnchor="middle"
                    fontSize={12}
                    fill="white"
                  >
                    Receive 🌈
                  </text>
                  {!canReceive && receiveDisabledReason && (
                    <title>{receiveDisabledReason}</title>
                  )}
                </g>
              </>
            );
          })()}
        </g>
      )}

      {/* Animated lines to neighbors */}
      {hoveredAction && renderAnimatedLines()}
      
      {/* Preview Chip for current vertex (shown when hovering over an action) */}
      {hoveredAction && (
        <g
          transform={`translate(${12}, ${12})`}
          className="preview-chip"
          onClick={(e) => e.stopPropagation()}
        >
          <circle
            r={30}
            fill={getPreviewChipCount(hoveredAction) < 0 ? 'rgba(255, 51, 102, 0.7)' : 'rgba(0, 245, 212, 0.7)'}
            stroke={(canGive || canReceive) ? 'rgba(155, 93, 229, 0.7)' : 'rgba(193, 127, 88, 0.7)'}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
          <text
            textAnchor="middle"
            dy=".3em"
            fontSize="16"
            fontWeight="bold"
            fill={getPreviewChipCount(hoveredAction) >= 0 ? 'var(--cosmic-soil)' : 'var(--text-color)'}
          >
            {getPreviewChipCount(hoveredAction)}
          </text>
        </g>
      )}
      
      {/* Preview Chips for neighbors - rendered at the root SVG level */}
      {neighborPreviews.length > 0 && (
        <g>
          {neighborPreviews.map(neighbor => {
            // Calculate vector from this vertex to neighbor
            const dx = neighbor.position.x - position.x;
            const dy = neighbor.position.y - position.y;
            
            // Calculate position for preview that's along the path between vertices
            // Position it 2/3 of the way from this vertex to the neighbor
            const previewX = dx * 0.67;
            const previewY = dy * 0.67;
            
            return (
              <g
                key={`preview-${neighbor.id}`}
                transform={`translate(${previewX}, ${previewY})`}
                className="preview-chip"
                onClick={(e) => e.stopPropagation()}
              >
                <circle
                  r={25}
                  fill={neighbor.newChips < 0 ? 'rgba(255, 51, 102, 0.7)' : 'rgba(0, 245, 212, 0.7)'}
                  stroke={'rgba(155, 93, 229, 0.7)'}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
                <text
                  textAnchor="middle"
                  dy=".3em"
                  fontSize="16"
                  fontWeight="bold"
                  fill={neighbor.newChips >= 0 ? 'var(--cosmic-soil)' : 'var(--text-color)'}
                >
                  {neighbor.newChips}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

export default VertexComponent;