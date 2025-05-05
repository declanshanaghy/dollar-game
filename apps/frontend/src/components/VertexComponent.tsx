import React, { useState, useEffect } from 'react';
// Global state to track which vertex has an open menu
const globalMenuState: {
  openVertexId: number | null;
  setOpenVertexId: (id: number | null) => void;
  closeAllMenus: () => void;
} = {
  openVertexId: null,
  setOpenVertexId: (id: number | null) => {
    globalMenuState.openVertexId = id;
  },
  closeAllMenus: () => {
    if (globalMenuState.openVertexId !== null) {
      const previousId = globalMenuState.openVertexId;
      globalMenuState.openVertexId = null;
      // Force a re-render of all vertices
      document.querySelectorAll('.vertex-core').forEach(el => {
        el.dispatchEvent(new Event('mouseleave', { bubbles: true }));
      });
    }
  }
};
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
    
    // Close any other open menus before opening this one
    if (globalMenuState.openVertexId !== null && globalMenuState.openVertexId !== id) {
      globalMenuState.closeAllMenus();
    }
    
    // Set this vertex as the one with open menu
    globalMenuState.setOpenVertexId(id);
    setShowMenu(true);
  };

  // Handle mouse leave to hide menu after delay
  const handleMouseLeave = () => {
    // Set a timeout to hide the menu
    menuTimeoutRef.current = window.setTimeout(() => {
      setShowMenu(false);
      setHoveredAction(null);
      globalMenuState.setOpenVertexId(null);
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
  
  // Create animated curved lines to neighbors with cash icons and arrows
  const renderAnimatedLines = () => {
    if (!hoveredAction || neighborPreviews.length === 0) return null;
    
    // Create a single cash stack for all lines
    const isGiving = hoveredAction === ActionType.GIVE;
    const animationClass = isGiving ? 'give-animation' : 'receive-animation';
    const lineColor = isGiving ? "rgba(42, 157, 143, 0.9)" : "rgba(233, 196, 106, 0.9)";
    
    // Calculate position for the single cash icon
    // We'll place it near the vertex but not on top of it
    // Position it away from the vertex and slightly to the side to avoid overlap with lines
    const cashIconOffset = 50; // Increased distance from vertex center
    const cashIconPosition = {
      x: isGiving ? cashIconOffset : -cashIconOffset,
      y: isGiving ? -15 : 15 // Offset vertically to avoid direct overlap with lines
    };
    
    return (
      <g>
        {/* Single cash icon that applies to all lines */}
        <image
          key={`cash-icon-${id}`}
          href={`/icons/cash_icons/cash_${isGiving ? 'plus' : 'minus'}1.png`}
          x={cashIconPosition.x - 12}
          y={cashIconPosition.y - 12}
          width={24}
          height={24}
          opacity={0.9}
          className={`cash-flow-icon ${animationClass}-icon`}
          style={{
            animation: `float 1.2s infinite alternate ease-in-out`
          }}
        />
        
        {/* Render all the lines */}
        {neighborPreviews.map(neighbor => {
          // Calculate direction vector
          const dx = neighbor.position.x - position.x;
          const dy = neighbor.position.y - position.y;
          
          // Calculate start and end points with different logic for give vs receive
          const length = Math.sqrt(dx * dx + dy * dy);
          const unitX = dx / length;
          const unitY = dy / length;
          
          // Calculate the position of the cash stack icon
          // The cash stack is positioned at an offset from the vertex center
          const cashIconOffset = isGiving ? 50 : -50; // From line 198-200
          const cashIconX = isGiving ? cashIconOffset : -cashIconOffset;
          const cashIconY = isGiving ? -15 : 15;
          
          // Calculate start and end points differently for give vs receive
          let startX, startY, endX, endY;
          
          // Calculate cash stack positions for both current vertex and neighbor
          // For the current vertex, we know the exact position of the cash stack
          const currentCashX = 0; // Cash stack is centered on the vertex
          const currentCashY = 0; // Cash stack is centered on the vertex
          
          // For the neighbor vertex, we need to calculate the position of its cash stack
          // The cash stack is centered on the neighbor vertex
          const neighborCashX = dx; // Neighbor's cash stack is at the neighbor's center
          const neighborCashY = dy; // Neighbor's cash stack is at the neighbor's center
          
          // Helper function to shorten arrows by a fixed amount
          const shortenArrow = (fromX: number, fromY: number, toX: number, toY: number, shortenAmount: number) => {
            // Calculate direction vector from start to end
            const dirX = toX - fromX;
            const dirY = toY - fromY;
            
            // Calculate length of the vector
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            
            // Normalize the direction vector
            const normDirX = dirX / length;
            const normDirY = dirY / length;
            
            // Apply shortening in the opposite direction of the arrow
            // This makes the arrow shorter by a fixed amount
            const shortenedX = toX - normDirX * shortenAmount;
            const shortenedY = toY - normDirY * shortenAmount;
            
            return { x: shortenedX, y: shortenedY };
          };
          
          if (isGiving) {
            // For giving: start at current vertex cash stack, end at neighbor's cash stack
            startX = currentCashX;
            startY = currentCashY;
            
            // End at the neighbor's cash stack, shortened by 10 pixels
            const shortenedEnd = shortenArrow(currentCashX, currentCashY, neighborCashX, neighborCashY, 10);
            endX = shortenedEnd.x;
            endY = shortenedEnd.y;
          } else {
            // For receiving: start at neighbor's cash stack, end at current vertex's cash stack
            startX = neighborCashX;
            startY = neighborCashY;
            
            // End at the current vertex's cash stack, shortened by 10 pixels
            const shortenedEnd = shortenArrow(neighborCashX, neighborCashY, currentCashX, currentCashY, 10);
            endX = shortenedEnd.x;
            endY = shortenedEnd.y;
          }
          
          // Calculate different control points for give vs receive actions
          // This creates visually distinct paths for each action type
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          
          // Base curve intensity - higher for more pronounced curves
          const baseCurveIntensity = showMenu ? 0.5 : 0.3;
          
          // Determine curve direction based on relative positions and action type
          const shouldCurveUp = isGiving ?
            // For giving: curve based on relative angle between vertices
            (Math.atan2(dy, dx) > 0) :
            // For receiving: curve in opposite direction to giving
            (Math.atan2(dy, dx) <= 0);
          
          // Different curve intensities for give vs receive
          // Give actions have more pronounced curves
          const curveIntensity = isGiving ?
            baseCurveIntensity * 1.2 : // More curved for giving
            baseCurveIntensity * 0.8;  // Less curved for receiving
          
          // Calculate perpendicular vector with different approaches for give vs receive
          let perpX, perpY;
          
          if (isGiving) {
            // For giving: create a more arched path
            perpX = -unitY * (length * curveIntensity) * (shouldCurveUp ? 1 : -1);
            perpY = unitX * (length * curveIntensity) * (shouldCurveUp ? 1 : -1);
          } else {
            // For receiving: create a flatter, more direct path
            // Rotate the perpendicular vector slightly for visual distinction
            const rotationFactor = shouldCurveUp ? 0.8 : -0.8;
            perpX = (-unitY * Math.cos(rotationFactor) - unitX * Math.sin(rotationFactor)) * (length * curveIntensity);
            perpY = (unitX * Math.cos(rotationFactor) - unitY * Math.sin(rotationFactor)) * (length * curveIntensity);
          }
          
          // Control point
          const ctrlX = midX + perpX;
          const ctrlY = midY + perpY;
          
          // Path for curved line
          const pathD = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
          
          // Calculate the tangent direction directly from the endpoints
          // This ensures the arrow heads are aligned with the line direction
          const directTangentX = endX - startX;
          const directTangentY = endY - startY;
          
          // Normalize the direct tangent
          const directTangentLength = Math.sqrt(directTangentX * directTangentX + directTangentY * directTangentY);
          const normalizedDirectTangentX = directTangentX / directTangentLength;
          const normalizedDirectTangentY = directTangentY / directTangentLength;
          
          // Use the direct tangent for arrow calculations
          const normalizedTangentX = normalizedDirectTangentX;
          const normalizedTangentY = normalizedDirectTangentY;
          
          // Calculate arrow points with improved alignment
          const arrowSize = 12; // Size of arrow head
          const arrowAngle = Math.PI / 7; // Narrower angle (25.7 degrees) for sharper arrows
          
          // Calculate arrow points based on action type
          let leftArrowX, leftArrowY, rightArrowX, rightArrowY;
          let arrowBaseX, arrowBaseY;
          
          if (isGiving) {
            // For giving, arrow points toward neighbor's cash stack
            // Position the arrow at the end of the path
            arrowBaseX = endX;
            arrowBaseY = endY;
            
            // Calculate arrow points with reversed direction (pointing into the target)
            leftArrowX = arrowBaseX - arrowSize * (normalizedTangentX * Math.cos(arrowAngle) - normalizedTangentY * Math.sin(arrowAngle));
            leftArrowY = arrowBaseY - arrowSize * (normalizedTangentY * Math.cos(arrowAngle) + normalizedTangentX * Math.sin(arrowAngle));
            rightArrowX = arrowBaseX - arrowSize * (normalizedTangentX * Math.cos(arrowAngle) + normalizedTangentY * Math.sin(arrowAngle));
            rightArrowY = arrowBaseY - arrowSize * (normalizedTangentY * Math.cos(arrowAngle) - normalizedTangentX * Math.sin(arrowAngle));
          } else {
            // For receiving, arrow points toward current vertex's cash stack
            // Position the arrow at the end of the path (near current vertex)
            arrowBaseX = endX;
            arrowBaseY = endY;
            
            // For receive arrows, we want them pointing into the cash stack
            // So we need to reverse the direction of the tangent
            leftArrowX = arrowBaseX + arrowSize * (normalizedTangentX * Math.cos(arrowAngle) - normalizedTangentY * Math.sin(arrowAngle));
            leftArrowY = arrowBaseY + arrowSize * (normalizedTangentY * Math.cos(arrowAngle) + normalizedTangentX * Math.sin(arrowAngle));
            rightArrowX = arrowBaseX + arrowSize * (normalizedTangentX * Math.cos(arrowAngle) + normalizedTangentY * Math.sin(arrowAngle));
            rightArrowY = arrowBaseY + arrowSize * (normalizedTangentY * Math.cos(arrowAngle) - normalizedTangentX * Math.sin(arrowAngle));
          }
          
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
              
              {/* Arrow at the appropriate end of the path - enhanced with stroke for better visibility */}
              <polygon
                points={`${arrowBaseX},${arrowBaseY} ${leftArrowX},${leftArrowY} ${rightArrowX},${rightArrowY}`}
                fill={lineColor}
                stroke={lineColor}
                strokeWidth={1.5}
                strokeLinejoin="round"
                className={`arrow-head ${animationClass}-arrow`}
                style={{
                  filter: `drop-shadow(0 0 3px ${lineColor})`
                }}
              />
            </g>
          );
        })}
      </g>
    );
  };
  
  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onMouseEnter={() => {
        // Close any existing menus first
        globalMenuState.closeAllMenus();
        // Then open this menu
        handleMouseEnter();
      }}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => {
        // Close any existing menus first
        globalMenuState.closeAllMenus();
        // Then open this menu
        handleMouseEnter();
      }} // Add touch support for mobile
      onTouchEnd={(e) => {
        // Prevent default to avoid unwanted behaviors
        e.preventDefault();
        // Don't immediately close the menu on touch end
      }}
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
      
      {/* Animated lines to neighbors - render before action menu but after circles */}
      {hoveredAction && renderAnimatedLines()}
      
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
                    const menuWidth = isMobile ? 220 : 260;
                    const menuHeight = isMobile ? 60 : 60;
                    
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
                width={260}
                height={60}
                rx={10}
                ry={10}
                fill="rgba(0, 0, 0, 0.5)"
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
              const menuWidth = isMobile ? 220 : 260;
              const menuHeight = isMobile ? 60 : 60;
              
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
            // Calculate button positions with 10px padding all around
            // and centered within the panel
            const buttonSpacing = 120; // Space between buttons
            const panelWidth = 260;
            const panelHeight = 60;
            
            // Calculate total width of both buttons
            const giveButtonWidth = 75;
            const receiveButtonWidth = 95;
            const totalButtonsWidth = giveButtonWidth + buttonSpacing;
            
            // Center the buttons horizontally
            const startX = menuX + (panelWidth - totalButtonsWidth) / 2;
            const giveButtonX = startX;
            const receiveButtonX = startX + buttonSpacing;
            
            // Center the buttons vertically (10px from top)
            const buttonY = menuY + 10;
            
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
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    handleActionButtonMouseEnter(ActionType.GIVE);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    if (canGive) handleAction(ActionType.GIVE);
                  }}
                  style={{
                    cursor: canGive ? 'pointer' : 'not-allowed',
                    opacity: canGive ? 1 : 0.5
                  }}
                  className={`action-button ${canGive ? '' : 'disabled'}`}
                >
                  <rect
                    x={0}
                    y={0}
                    width={75}
                    height={40}
                    rx={8}
                    ry={8}
                    fill={canGive ? "var(--meditation-moss)" : "#cccccc"}
                    className="give-button-bg"
                  />
                  <text
                    x={37}
                    y={25}
                    textAnchor="middle"
                    fontSize={14}
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
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    handleActionButtonMouseEnter(ActionType.RECEIVE);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    if (canReceive) handleAction(ActionType.RECEIVE);
                  }}
                  style={{
                    cursor: canReceive ? 'pointer' : 'not-allowed',
                    opacity: canReceive ? 1 : 0.5
                  }}
                  className={`action-button ${canReceive ? '' : 'disabled'}`}
                >
                  <rect
                    x={0}
                    y={0}
                    width={95}
                    height={40}
                    rx={8}
                    ry={8}
                    fill={canReceive ? "var(--neutral-karma)" : "#cccccc"}
                    className="receive-button-bg"
                  />
                  <text
                    x={47}
                    y={25}
                    textAnchor="middle"
                    fontSize={14}
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