import React, { useState, useEffect, useCallback } from 'react';
import IntroductionOverlay from './IntroductionOverlay';

interface TutorialManagerProps {
  children: React.ReactNode;
  showTutorialAgain?: () => void;
  hideTutorial?: () => void;
  isTutorialVisible?: boolean;
}

const TutorialManager: React.FC<TutorialManagerProps> = ({ children }) => {
  // State for tutorial visibility and current step
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [minimizedTutorial, setMinimizedTutorial] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5; // Total number of steps in the tutorial
  
  // Check localStorage on component mount
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('dollarGame_hasSeenTutorial');
    
    // If user hasn't seen the tutorial, show it
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);
  
  // Handle tutorial completion
  const handleTutorialClose = () => {
    setShowTutorial(false);
    setMinimizedTutorial(false);
    // Mark tutorial as seen in localStorage
    localStorage.setItem('dollarGame_hasSeenTutorial', 'true');
  };
  
  // Handle tutorial minimize/maximize with debounce to prevent flashing
  const handleTutorialToggle = useCallback(() => {
    // Use a callback to ensure we're working with the latest state
    setMinimizedTutorial(prevState => !prevState);
  }, []);
  
  // Handle next step with useCallback to prevent unnecessary re-renders
  const handleNextStep = useCallback(() => {
    setCurrentStep(prevStep => {
      if (prevStep < totalSteps) {
        return prevStep + 1;
      }
      return prevStep;
    });
  }, [totalSteps]);
  
  // Handle previous step with useCallback to prevent unnecessary re-renders
  const handlePreviousStep = useCallback(() => {
    setCurrentStep(prevStep => {
      if (prevStep > 1) {
        return prevStep - 1;
      }
      return prevStep;
    });
  }, []);
  
  // Function to show tutorial (for replay)
  const showTutorialAgain = () => {
    setCurrentStep(1);
    setShowTutorial(true);
  };
  
  // Function to hide tutorial
  const hideTutorial = () => {
    setShowTutorial(false);
  };
  
  return (
    <div className="tutorial-manager">
      {/* Render children with the showTutorialAgain function */}
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            showTutorialAgain,
            hideTutorial,
            isTutorialVisible: showTutorial
          });
        }
        return child;
      })}
      
      {/* Render tutorial overlay if visible and not minimized */}
      {showTutorial && !minimizedTutorial && (
        <IntroductionOverlay
          onClose={handleTutorialClose}
          onNext={handleNextStep}
          onPrevious={handlePreviousStep}
          currentStep={currentStep}
          totalSteps={totalSteps}
          onMinimize={handleTutorialToggle}
        />
      )}
      
      {/* Render floating button if tutorial is minimized */}
      {showTutorial && minimizedTutorial && (
        <button
          className="tutorial-toggle-button"
          onClick={handleTutorialToggle}
          title="Show tutorial"
        >
          <span>?</span>
        </button>
      )}
    </div>
  );
};

export default TutorialManager;