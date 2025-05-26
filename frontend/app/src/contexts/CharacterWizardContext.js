// frontend/app/src/contexts/CharacterWizardContext.js
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

// 1. Create the Context
// The default value (null) is only used if a component tries to consume the context
// without a matching Provider higher up in the tree.
const CharacterWizardContext = createContext(null);

// 2. Custom Hook to easily consume the context
export function useCharacterWizard() {
  const context = useContext(CharacterWizardContext);
  if (context === null) {
    throw new Error('useCharacterWizard must be used within a CharacterWizardProvider');
  }
  return context;
}

// 3. Provider Component
// This component will wrap parts of your application (likely App.js or its main layout component)
// to make the context value available to any child components (like AppTopBar and CharacterCreationWizard).
export function CharacterWizardProvider({ children }) {
  // State that will be shared via context
  const [wizardSteps, setWizardSteps] = useState([]); // Array of step objects { name, id }
  const [currentDisplayStep, setCurrentDisplayStepState] = useState(0);
  const [isWizardActive, setIsWizardActiveState] = useState(false);
  const [visitedSteps, setVisitedStepsState] = useState({ 0: true }); // Track visited steps
  
  // The actual navigation click handler will be set by the Wizard component
  const [navStepClickHandler, setNavStepClickHandlerState] = useState(() => () => {
    // Default no-op function, CharacterCreationWizard will provide the actual implementation
    console.warn("handleNavStepClick from context was called before being set by the Wizard component.");
  });

  // Function for CharacterCreationWizard to update the context's state
  // This function itself is stable due to useCallback
  const updateWizardSharedState = useCallback((newStateUpdates) => {
    if (typeof newStateUpdates.wizardSteps !== 'undefined') {
      setWizardSteps(newStateUpdates.wizardSteps);
    }
    if (typeof newStateUpdates.currentDisplayStep !== 'undefined') {
      setCurrentDisplayStepState(newStateUpdates.currentDisplayStep);
    }
    if (typeof newStateUpdates.isWizardActive !== 'undefined') {
      setIsWizardActiveState(newStateUpdates.isWizardActive);
    }
    if (typeof newStateUpdates.visitedSteps !== 'undefined') {
      setVisitedStepsState(newStateUpdates.visitedSteps);
    }
    if (typeof newStateUpdates.handleNavStepClick === 'function') {
      setNavStepClickHandlerState(() => newStateUpdates.handleNavStepClick);
    }
  }, []); // No dependencies, so this function identity is stable

  // Memoize the context value that will be passed down
  // This ensures consumers only re-render if these specific values change
  const contextValue = useMemo(() => ({
    wizardSteps,
    currentDisplayStep,
    isWizardActive,
    visitedSteps,
    handleNavStepClick: navStepClickHandler, // The actual handler function
    updateWizardSharedState // The function to update this shared state
  }), [
    wizardSteps, 
    currentDisplayStep, 
    isWizardActive, 
    visitedSteps, 
    navStepClickHandler
  ]);

  return (
    <CharacterWizardContext.Provider value={contextValue}>
      {children}
    </CharacterWizardContext.Provider>
  );
}

// You might not need to default export the context object itself if
// CharacterWizardProvider and useCharacterWizard are the primary ways to interact with it.
// However, it can be useful for advanced scenarios or direct Provider usage if needed.
export default CharacterWizardContext;