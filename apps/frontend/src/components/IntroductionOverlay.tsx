import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './IntroductionOverlay.css';

interface IntroductionOverlayProps {
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
  onMinimize?: () => void; // New prop for minimizing the tutorial
}

interface TutorialStep {
  title: string;
  content: React.ReactNode;
  highlightSelector?: string;
}

const IntroductionOverlay: React.FC<IntroductionOverlayProps> = ({
  onClose,
  onNext,
  onPrevious,
  currentStep: initialStep,
  totalSteps,
  onMinimize
}) => {
  const { theme } = useTheme();
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  
  // State for dragging functionality
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Use the initialStep prop directly instead of maintaining internal state
  const currentStep = initialStep;

  // Tutorial steps with content - more concise with visual cues
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to The Dollar Game! ✨",
      content: (
        <div>
          <p>
            Welcome to The Dollar Game! This quick guide will show you how to play.
          </p>
          <div className="action-hint">
            <div className="click-indicator">👆</div>
            <div>Click "Next" to continue</div>
          </div>
        </div>
      )
    },
    {
      title: "The Circles 🔮",
      content: (
        <div>
          <p>
            These circles are <strong>vertices</strong>. The number shows dollars.
          </p>
          <div className="color-legend">
            <div><span style={{ color: 'var(--positive-energy)' }}>Green (+)</span>: Has dollars</div>
            <div><span style={{ color: 'var(--negative-space)' }}>Red (-)</span>: In debt</div>
            <div><span style={{ color: 'var(--neutral-karma)' }}>Yellow (0)</span>: No dollars</div>
          </div>
          <div className="action-hint">
            <div className="click-indicator pulse-animation">👁️</div>
            <div>Look at the colored circles</div>
          </div>
        </div>
      ),
      highlightSelector: '.vertex-core'
    },
    {
      title: "Giving Dollars 🌊",
      content: (
        <div>
          <p>
            <strong>Try it:</strong> Click any circle, then click "Give"
          </p>
          <p>
            When giving, a vertex gives 1 dollar to each connected neighbor.
          </p>
          <div className="action-hint">
            <div className="click-indicator pulse-animation">👆</div>
            <div>Click any circle now</div>
          </div>
        </div>
      ),
      highlightSelector: '.vertex-core'
    },
    {
      title: "Receiving Dollars 🌈",
      content: (
        <div>
          <p>
            <strong>Try it:</strong> Click any circle, then click "Receive"
          </p>
          <p>
            When receiving, a vertex takes 1 dollar from each connected neighbor.
          </p>
          <div className="action-hint">
            <div className="click-indicator pulse-animation">👆</div>
            <div>Click any circle now</div>
          </div>
        </div>
      ),
      highlightSelector: '.vertex-core'
    },
    {
      title: "The Goal 🏆",
      content: (
        <div>
          <p>
            <strong>Goal:</strong> Make all vertices have zero or positive dollars.
          </p>
          <div className="action-hint">
            <div className="click-indicator">🎮</div>
            <div>Keep giving and receiving until all circles are green or yellow</div>
          </div>
        </div>
      )
    },
  ];
  
  // Function to update highlight position with debouncing
  const updateHighlightPosition = useCallback(() => {
    const step = tutorialSteps[initialStep - 1];
    if (step?.highlightSelector) {
      const element = document.querySelector(step.highlightSelector) as HTMLElement;
      if (element) {
        // Only update if element exists and is different from current
        if (!highlightElement || highlightElement !== element) {
          setHighlightElement(element);
          
          // Get bounding rect only once per element change
          const rect = element.getBoundingClientRect();
          
          // Only update rect if it's significantly different to avoid unnecessary re-renders
          if (!highlightRect ||
              Math.abs(rect.top - highlightRect.top) > 5 ||
              Math.abs(rect.left - highlightRect.left) > 5 ||
              Math.abs(rect.width - highlightRect.width) > 5 ||
              Math.abs(rect.height - highlightRect.height) > 5) {
            setHighlightRect(rect);
          }
          
          // Scroll element into view if needed - with smooth behavior
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        // Only clear if currently set
        if (highlightElement || highlightRect) {
          setHighlightElement(null);
          setHighlightRect(null);
        }
      }
    } else {
      // Only clear if currently set
      if (highlightElement || highlightRect) {
        setHighlightElement(null);
        setHighlightRect(null);
      }
    }
  }, [initialStep, highlightElement, highlightRect]);
  
  // Update highlight position when step changes
  useEffect(() => {
    updateHighlightPosition();
  }, [initialStep, updateHighlightPosition]);

  // Update highlight position on window resize with debouncing
  useEffect(() => {
    // Debounce function to prevent excessive updates
    let resizeTimer: NodeJS.Timeout;
    
    const handleResize = () => {
      // Clear previous timer
      clearTimeout(resizeTimer);
      
      // Set new timer to delay execution
      resizeTimer = setTimeout(() => {
        updateHighlightPosition();
      }, 100); // 100ms debounce
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [updateHighlightPosition]);

  // Get current step content
  const currentStepData = tutorialSteps[initialStep - 1];

  // Calculate highlight overlay position
  const getHighlightStyle = () => {
    if (!highlightRect) return {};
    
    return {
      position: 'absolute' as const,
      top: `${highlightRect.top}px`,
      left: `${highlightRect.left}px`,
      width: `${highlightRect.width}px`,
      height: `${highlightRect.height}px`,
      // Remove box-shadow completely to allow interaction with the game
      border: '3px solid var(--quantum-lime, #B8F84A)', // Bright border for contrast
      borderRadius: '50%',
      zIndex: 999,
      pointerEvents: 'none' as const
    };
  };

  // Calculate tutorial box position - draggable
  const getTutorialBoxPosition = () => {
    return {
      left: `${position.x}px`,
      top: `${position.y}px`,
      transform: 'none',
      position: 'fixed' as const
    };
  };
  
  // Handle start dragging (mouse or touch)
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement) {
      // Only start drag from the header, not from buttons or content
      if (e.target.closest('.tutorial-header') && !e.target.closest('button')) {
        setIsDragging(true);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        
        // Handle both mouse and touch events
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        setDragOffset({
          x: clientX - rect.left,
          y: clientY - rect.top
        });
        
        // Prevent default behavior
        if ('touches' in e) {
          // For touch events
        } else {
          // For mouse events
          e.preventDefault();
        }
      }
    }
  };
  
  // Handle dragging (mouse or touch)
  const handleDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isDragging) {
      // Handle both mouse and touch events
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      
      setPosition({
        x: clientX - dragOffset.x,
        y: clientY - dragOffset.y
      });
      
      // Prevent default behavior
      if ('touches' in e) {
        // For touch events
      } else {
        // For mouse events
        e.preventDefault();
      }
    }
  };
  
  // Handle end dragging (mouse or touch)
  const handleDragEnd = () => {
    setIsDragging(false);
    // Delay updating highlight position after dragging ends to prevent flashing
    setTimeout(() => {
      updateHighlightPosition();
    }, 50);
  };
  
  // Add event listeners for dragging (both mouse and touch)
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setIsDragging(false);
      // Delay updating highlight position after dragging ends to prevent flashing
      setTimeout(() => {
        updateHighlightPosition();
      }, 50);
    };
    
    const handleGlobalDrag = (e: MouseEvent | TouchEvent) => {
      if (isDragging) {
        // Handle both mouse and touch events
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
        
        setPosition({
          x: clientX - dragOffset.x,
          y: clientY - dragOffset.y
        });
      }
    };
    
    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handleGlobalDrag as EventListener);
      document.addEventListener('mouseup', handleGlobalDragEnd);
      
      // Touch events
      document.addEventListener('touchmove', handleGlobalDrag as EventListener);
      document.addEventListener('touchend', handleGlobalDragEnd);
      document.addEventListener('touchcancel', handleGlobalDragEnd);
    }
    
    return () => {
      // Mouse events
      document.removeEventListener('mousemove', handleGlobalDrag as EventListener);
      document.removeEventListener('mouseup', handleGlobalDragEnd);
      
      // Touch events
      document.removeEventListener('touchmove', handleGlobalDrag as EventListener);
      document.removeEventListener('touchend', handleGlobalDragEnd);
      document.removeEventListener('touchcancel', handleGlobalDragEnd);
    };
  }, [isDragging, dragOffset, updateHighlightPosition]);

  return (
    <div className="introduction-overlay">
      {/* No background overlay to allow interaction with the game */}
      
      {/* Highlight element if any - with no box-shadow */}
      {highlightRect && (
        <div
          className="highlight-element"
          style={getHighlightStyle()}
        ></div>
      )}
      
      {/* Tutorial content box */}
      <div
        className={`tutorial-box ${theme === 'dark' ? 'dark-theme' : 'light-theme'} ${isDragging ? 'dragging' : ''}`}
        style={getTutorialBoxPosition()}
        onMouseDown={handleDragStart}
        onMouseMove={isDragging ? handleDrag : undefined}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={isDragging ? handleDrag : undefined}
        onTouchEnd={handleDragEnd}
      >
        <div className="tutorial-header" style={{ cursor: 'move' }}>
          <h3>{currentStepData.title}</h3>
          <div className="header-buttons">
            {/* Minimize button */}
            {onMinimize && (
              <button className="minimize-button" onClick={onMinimize} title="Minimize tutorial">
                _
              </button>
            )}
            <button className="close-button" onClick={onClose} title="Close tutorial">×</button>
          </div>
        </div>
        
        <div className="tutorial-content">
          {currentStepData.content}
        </div>
        
        <div className="tutorial-footer">
          <div className="step-indicator">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`step-dot ${initialStep === index + 1 ? 'active' : ''}`}
                onClick={() => {
                  // Call parent handlers directly instead of updating internal state
                  if (index + 1 > initialStep) {
                    onNext();
                  } else if (index + 1 < initialStep) {
                    onPrevious();
                  }
                }}
                title={`Go to step ${index + 1}`}
              ></div>
            ))}
          </div>
          
          <div className="navigation-buttons">
            {currentStep > 1 && (
              <button className="nav-button prev-button" onClick={onPrevious}>
                ← Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button className="nav-button next-button" onClick={onNext}>
                Next →
              </button>
            ) : (
              <button className="nav-button finish-button" onClick={onClose}>
                Start Playing! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating toggle button for showing/hiding tutorial */}
      <button
        className="tutorial-toggle-button"
        onClick={onMinimize}
        style={{ display: onMinimize ? 'block' : 'none' }}
      >
        <span>?</span>
      </button>
    </div>
  );
};

export default IntroductionOverlay;