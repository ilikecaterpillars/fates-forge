import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const CharacterWizardContext = createContext(null);

export function useCharacterWizard() {
  const context = useContext(CharacterWizardContext);
  if (context === null) {
    throw new Error('useCharacterWizard must be used within a CharacterWizardProvider');
  }
  return context;
}

export function CharacterWizardProvider({ children }) {
  const [isWizardActive, setIsWizardActiveState] = useState(false);
  const [wizardSteps, setWizardSteps] = useState([]);
  const [currentWizardStep, setCurrentWizardStepState] = useState(0);
  const [totalWizardSteps, setTotalWizardStepsState] = useState(0);
  const [visitedSteps, setVisitedStepsState] = useState({ 0: true });
  
  const [isWizardSubmitting, setIsWizardSubmittingState] = useState(false);
  const [wizardError, setWizardErrorState] = useState(null);

  const [onWizardBackCallback, setOnWizardBackCallback] = useState(() => () => {});
  const [onWizardNextCallback, setOnWizardNextCallback] = useState(() => () => {});
  const [onWizardNavStepClickCallback, setOnWizardNavStepClickCallback] = useState(() => () => {});

  const updateWizardSharedState = useCallback((newStateUpdates) => {
    if (typeof newStateUpdates.isWizardActive !== 'undefined') {
      setIsWizardActiveState(newStateUpdates.isWizardActive);
    }
    if (typeof newStateUpdates.wizardSteps !== 'undefined') {
      setWizardSteps(newStateUpdates.wizardSteps);
    }
    if (typeof newStateUpdates.currentWizardStep !== 'undefined') {
      setCurrentWizardStepState(newStateUpdates.currentWizardStep);
    }
    if (typeof newStateUpdates.totalWizardSteps !== 'undefined') {
      setTotalWizardStepsState(newStateUpdates.totalWizardSteps);
    }
    if (typeof newStateUpdates.visitedSteps !== 'undefined') {
      setVisitedStepsState(newStateUpdates.visitedSteps);
    }
    if (typeof newStateUpdates.isWizardSubmitting !== 'undefined') {
      setIsWizardSubmittingState(newStateUpdates.isWizardSubmitting);
    }
    if (typeof newStateUpdates.wizardError !== 'undefined') { // Allows null to clear error
      setWizardErrorState(newStateUpdates.wizardError);
    }
    if (typeof newStateUpdates.onWizardBack === 'function') {
      setOnWizardBackCallback(() => newStateUpdates.onWizardBack);
    }
    if (typeof newStateUpdates.onWizardNext === 'function') {
      setOnWizardNextCallback(() => newStateUpdates.onWizardNext);
    }
    if (typeof newStateUpdates.onWizardNavStepClick === 'function') {
      setOnWizardNavStepClickCallback(() => newStateUpdates.onWizardNavStepClick);
    }
  }, []);

  const contextValue = useMemo(() => ({
    isWizardActive,
    wizardSteps,
    currentWizardStep,
    totalWizardSteps,
    visitedSteps,
    isWizardSubmitting,
    wizardError,
    onWizardBack: onWizardBackCallback,
    onWizardNext: onWizardNextCallback,
    onWizardNavStepClick: onWizardNavStepClickCallback,
    updateWizardSharedState,
    setWizardError: setWizardErrorState 
  }), [
    isWizardActive, 
    wizardSteps, 
    currentWizardStep, 
    totalWizardSteps,
    visitedSteps, 
    isWizardSubmitting,
    wizardError,
    onWizardBackCallback,
    onWizardNextCallback,
    onWizardNavStepClickCallback,
    updateWizardSharedState
  ]);

  return (
    <CharacterWizardContext.Provider value={contextValue}>
      {children}
    </CharacterWizardContext.Provider>
  );
}

export default CharacterWizardContext;