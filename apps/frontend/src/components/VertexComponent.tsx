import React, { useState, useEffect } from 'react';
import './VertexComponent.css'; // Import CSS for animations
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
  const menuTimeoutRef = React.useRef<number | null>(null);
  
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

  // Handle mouse enter to show menu
  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (menuTimeoutRef.current !== null) {
      window.clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    setShowMenu(true);
  };

  // Handle mouse leave to hide menu after delay
  const handleMouseLeave = () => {
    // Set a timeout to hide the menu
    menuTimeoutRef.current = window.setTimeout(() => {
      setShowMenu(false);
      setHoveredAction(null);
    }, 500); // 500ms delay before hiding
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current !== null) {
        window.clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

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
  const handleActionButtonMouseEnter = (actionType: ActionType) => {
    setHoveredAction(actionType);
    calculateNeighborPreviews(actionType);
    
    // Ensure the menu stays open when hovering over buttons
    if (menuTimeoutRef.current !== null) {
      window.clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
  };

  // Handle mouse leave for action buttons
  const handleActionButtonMouseLeave = () => {
    setHoveredAction(null);
    setNeighborPreviews([]);
  };
  
  // Create animated curved lines to neighbors with cash icons
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
      
      // Calculate control point for curved path (perpendicular to line)
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      // Perpendicular vector for curve control point
      const perpX = -unitY * (length * 0.2); // Adjust multiplier for curve intensity
      const perpY = unitX * (length * 0.2);
      
      // Control point
      const ctrlX = midX + perpX;
      const ctrlY = midY + perpY;
      
      // Path for curved line
      const pathD = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
      
      // Determine animation class and color based on action type
      const isGiving = hoveredAction === ActionType.GIVE;
      const animationClass = isGiving ? 'give-animation' : 'receive-animation';
      const lineColor = isGiving ? "rgba(42, 157, 143, 0.9)" : "rgba(233, 196, 106, 0.9)";
      
      // Calculate position for animated cash icon along the path
      const cashIconPosition = 0.5; // Position along the path (0-1)
      
      return (
        <g key={`preview-line-${id}-${neighbor.id}`}>
          {/* Curved path */}
          <path
            d={pathD}
            fill="none"
            stroke={lineColor}
            strokeWidth={3}
            strokeDasharray="8,4"
            className={`animated-dash ${animationClass}`}
          />
          
          {/* Single animated cash icon along the path */}
          {(() => {
            // Calculate point along the quadratic curve
            // For a quadratic curve: P = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
            const t = cashIconPosition;
            const oneMinusT = 1 - t;
            const xPos = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * ctrlX + t * t * endX;
            const yPos = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * ctrlY + t * t * endY;
            
            // Determine which cash icon to use based on action
            const iconSize = 24; // Slightly larger for better visibility
            const iconOffset = iconSize / 2;
            
            return (
              <image
                key={`cash-icon-${id}-${neighbor.id}`}
                href={`/icons/cash_icons/cash_${isGiving ? 'plus' : 'minus'}1.png`}
                x={xPos - iconOffset}
                y={yPos - iconOffset}
                width={iconSize}
                height={iconSize}
                opacity={0.9}
                className={`cash-flow-icon ${animationClass}-icon`}
                style={{
                  animation: `float 1.2s infinite alternate ease-in-out`
                }}
              />
            );
          })()}
        </g>
      );
    });
  };
  
  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Aura layer for vertices */}
      {/* For negative values (red cash stacks), always show the circle */}
      {(chips < 0 || (chips >= 0 && (canGive || canReceive))) && (
        <>
          {/* Outer glow effect */}
          <circle
            r={40}
            fill="none"
            stroke={
              chips < 0
                ? 'var(--negative-space)'
                : (chips > 0
                    ? 'var(--positive-energy)'
                    : 'var(--neutral-karma)')
            }
            strokeWidth={1.5}
            strokeOpacity={0.4}
            filter="blur(3px)"
            className="aura-outer-glow"
          />
          {/* Main circle with increased thickness */}
          <circle
            r={37}
            fill="none"
            stroke={
              chips < 0
                ? 'var(--negative-space)'
                : (chips > 0
                    ? 'var(--positive-energy)'
                    : 'var(--neutral-karma)')
            }
            strokeWidth={chips < 0 ? 6 : 5}
            strokeOpacity={chips < 0 ? 0.9 : 0.85}
            className="aura-layer"
            style={{
              animation: `${chips < 0 ? 'pulseNegative' : 'pulsePositive'} 3s infinite ease-in-out`,
            }}
          />
          {/* Inner highlight for added dimension */}
          <circle
            r={34}
            fill="none"
            stroke={
              chips < 0
                ? 'rgba(255, 107, 107, 0.7)'
                : (chips > 0
                    ? 'rgba(42, 207, 193, 0.7)'
                    : 'rgba(253, 216, 126, 0.7)')
            }
            strokeWidth={1.5}
            strokeOpacity={0.6}
            className="aura-inner-highlight"
          />
        </>
      )}
      
      {/* Cash icon image */}
      <image
        href={`/icons/cash_icons/cash_${chips >= 0 ? 'plus' : 'minus'}${Math.abs(chips)}.png`}
        x={-32}
        y={-32}
        width={64}
        height={64}
        className={(canGive || canReceive) ? 'vertex-actionable vertex-core' : 'vertex vertex-core'}
        style={{
          filter: (canGive || canReceive)
            ? 'drop-shadow(0 0 4px var(--amethyst-awareness)) brightness(1.1)'
            : 'drop-shadow(0 0 3px var(--sunset-clay))'
        }}
      />

      {/* Action Menu */}
            {showMenu && (
              <g className="action-menu">
                {/* Calculate menu position to ensure it stays within canvas */}
                {(() => {
                  // Get SVG dimensions from parent
                  const svgElement = document.querySelector('.graph-svg');
                  const svgRect = svgElement?.getBoundingClientRect();
                  const viewBox = svgElement?.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 400, 400];
                  
                  // Check if we're on mobile
                  const isMobile = window.innerWidth <= 768;
                  
                  // Default position (above vertex)
                  let menuX = isMobile ? -70 : -80;
                  let menuY = isMobile ? -85 : -100;
                  
                  // Adjust if we have SVG dimensions
                  if (svgRect && viewBox.length === 4) {
                    const [minX, minY, width, height] = viewBox;
                    const svgWidth = width;
                    const svgHeight = height;
                    
                    // Menu width and height (smaller on mobile)
                    const menuWidth = isMobile ? 150 : 170;
                    const menuHeight = isMobile ? 75 : 85;
                    
                    // Check if menu would go off left edge
                    if (position.x + menuX < minX + 10) {
                      menuX = -(position.x - minX) + 10;
                    }
                    
                    // Check if menu would go off right edge
                    if (position.x + menuX + menuWidth > minX + svgWidth - 10) {
                      menuX = (minX + svgWidth) - (position.x + menuWidth) - 10;
                    }
                    
                    // Check if menu would go off top edge
                    if (position.y + menuY < minY + 10) {
                      menuY = -(position.y - minY) + 10;
                    }
                    
                    // Check if menu would go off bottom edge
                    if (position.y + menuY + menuHeight > minY + svgHeight - 10) {
                      menuY = (minY + svgHeight) - (position.y + menuHeight) - 10;
                    }
                    
                    // On mobile, prefer positioning to the side if possible
                    if (isMobile) {
                      // Try to position to the right of the vertex if there's room
                      if (position.x + 40 + menuWidth < minX + svgWidth - 10) {
                        menuX = 40;
                        menuY = -menuHeight/2;
                      }
                      // Otherwise try to the left if there's room
                      else if (position.x - 40 - menuWidth > minX + 10) {
                        menuX = -40 - menuWidth;
                        menuY = -menuHeight/2;
                      }
                    }
                  }
            
            return (
              <rect
                x={menuX}
                y={menuY}
                width={180}
                height={90}
                rx={10}
                ry={10}
                fill="var(--card-background)"
                filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))"
              />
            );
          })()}
          
          {/* Action Buttons - positioned dynamically based on menu position */}
          {(() => {
            // Get SVG dimensions from parent
            const svgElement = document.querySelector('.graph-svg');
            const svgRect = svgElement?.getBoundingClientRect();
            const viewBox = svgElement?.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 400, 400];
            
            // Check if we're on mobile
            const isMobile = window.innerWidth <= 768;
            
            // Default position (above vertex)
            let menuX = isMobile ? -70 : -80;
            let menuY = isMobile ? -85 : -100;
            
            // Adjust if we have SVG dimensions
            if (svgRect && viewBox.length === 4) {
              const [minX, minY, width, height] = viewBox;
              const svgWidth = width;
              const svgHeight = height;
              
              // Menu width and height (smaller on mobile)
              const menuWidth = isMobile ? 160 : 180;
              const menuHeight = isMobile ? 85 : 90;
              
              // Check if menu would go off left edge
              if (position.x + menuX < minX + 10) {
                menuX = -(position.x - minX) + 10;
              }
              
              // Check if menu would go off right edge
              if (position.x + menuX + menuWidth > minX + svgWidth - 10) {
                menuX = (minX + svgWidth) - (position.x + menuWidth) - 10;
              }
              
              // Check if menu would go off top edge
              if (position.y + menuY < minY + 10) {
                menuY = -(position.y - minY) + 10;
              }
              
              // Check if menu would go off bottom edge
              if (position.y + menuY + menuHeight > minY + svgHeight - 10) {
                menuY = (minY + svgHeight) - (position.y + menuHeight) - 10;
              }
              
              // On mobile, prefer positioning to the side if possible
              if (isMobile) {
                // Try to position to the right of the vertex if there's room
                if (position.x + 40 + menuWidth < minX + svgWidth - 10) {
                  menuX = 40;
                  menuY = -menuHeight/2;
                }
                // Otherwise try to the left if there's room
                else if (position.x - 40 - menuWidth > minX + 10) {
                  menuX = -40 - menuWidth;
                  menuY = -menuHeight/2;
                }
              }
            }
            
            // Calculate button positions based on menu position with padding
            // Adjust spacing for mobile
            const buttonSpacing = isMobile ? 90 : 100;
            const buttonPadding = isMobile ? 20 : 25;
            
            const giveButtonX = menuX + buttonPadding;
            const receiveButtonX = menuX + buttonSpacing;
            const buttonY = menuY + (isMobile ? 30 : 35);
            
            return (
              <>
                {/* Give Button */}
                <g
                  transform={`translate(${giveButtonX}, ${buttonY})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canGive) handleAction(ActionType.GIVE);
                  }}
                  onMouseEnter={() => handleActionButtonMouseEnter(ActionType.GIVE)}
                  onMouseLeave={handleActionButtonMouseLeave}
                  style={{
                    cursor: canGive ? 'pointer' : 'not-allowed',
                    opacity: canGive ? 1 : 0.5
                  }}
                  className={`action-button ${canGive ? '' : 'disabled'}`}
                >
                  <rect
                    x={0}
                    y={0}
                    width={65}
                    height={32}
                    rx={8}
                    ry={8}
                    fill={canGive ? "var(--meditation-moss)" : "#cccccc"}
                    className="give-button-bg"
                  />
                  <text
                    x={30}
                    y={21}
                    textAnchor="middle"
                    fontSize={12}
                    fill="white"
                    fontWeight="bold"
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
                  onMouseEnter={() => handleActionButtonMouseEnter(ActionType.RECEIVE)}
                  onMouseLeave={handleActionButtonMouseLeave}
                  style={{
                    cursor: canReceive ? 'pointer' : 'not-allowed',
                    opacity: canReceive ? 1 : 0.5
                  }}
                  className={`action-button ${canReceive ? '' : 'disabled'}`}
                >
                  <rect
                    x={0}
                    y={0}
                    width={85}
                    height={32}
                    rx={8}
                    ry={8}
                    fill={canReceive ? "var(--neutral-karma)" : "#cccccc"}
                    className="receive-button-bg"
                  />
                  <text
                    x={30}
                    y={21}
                    textAnchor="middle"
                    fontSize={12}
                    fill="white"
                    fontWeight="bold"
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
          {/* Preview cash icon with transparency */}
          <image
            href={`/icons/cash_icons/cash_${getPreviewChipCount(hoveredAction) >= 0 ? 'plus' : 'minus'}${Math.abs(getPreviewChipCount(hoveredAction))}.png`}
            x={-25}
            y={-25}
            width={50}
            height={50}
            opacity={0.7}
            style={{
              filter: 'drop-shadow(0 0 5px rgba(155, 93, 229, 0.8))'
            }}
          />
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
                {/* Neighbor preview cash icon with transparency */}
                <image
                  href={`/icons/cash_icons/cash_${neighbor.newChips >= 0 ? 'plus' : 'minus'}${Math.abs(neighbor.newChips)}.png`}
                  x={-20}
                  y={-20}
                  width={40}
                  height={40}
                  opacity={0.7}
                  style={{
                    filter: 'drop-shadow(0 0 5px rgba(155, 93, 229, 0.8))'
                  }}
                />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

export default VertexComponent;