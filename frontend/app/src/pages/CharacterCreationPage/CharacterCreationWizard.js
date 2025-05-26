// frontend/app/src/pages/CharacterCreationPage/CharacterCreationWizard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import the custom hook to use the context
import { useCharacterWizard } from '../../contexts/CharacterWizardContext'; // Adjust path as needed

import styles from './CharacterCreationWizard.module.css'; // Make sure you have this file
import Button from '../../components/common/Button/Button';

// Import step components (ensure these paths are correct based on your renaming)
import Step0_BasicInfo from '../../components/characterCreation/steps/Step0_BasicInfo.js';
import Step1_ClassSelection from '../../components/characterCreation/steps/Step1_ClassSelection.js';
import Step2_RaceSelection from '../../components/characterCreation/steps/Step2_RaceSelection.js';
import Step3_BackgroundAlignment from '../../components/characterCreation/steps/Step3_BackgroundAlignment.js';
import Step4_AbilityScores from '../../components/characterCreation/steps/Step4_AbilityScores.js';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1001/api';

// Configuration for wizard steps using your new file names/order
const WIZARD_STEPS_CONFIG = [
  { name: 'BASIC INFO', component: Step0_BasicInfo, id: 'basic-info' },
  { name: 'CLASS', component: Step1_ClassSelection, id: 'class' },
  { name: 'RACE', component: Step2_RaceSelection, id: 'race' },
  { name: 'BACKGROUND', component: Step3_BackgroundAlignment, id: 'background' },
  { name: 'ABILITIES', component: Step4_AbilityScores, id: 'abilities' },
];
const TOTAL_WIZARD_STEPS_DISPLAY = WIZARD_STEPS_CONFIG.length;

function CharacterCreationWizard({ mode = "template" }) { // mode: "template" or "campaign"
  const { campaignId } = useParams();
  const navigate = useNavigate();
  
  // Get the function to update context from the CharacterWizardProvider in App.js
  const { updateWizardSharedState } = useCharacterWizard();

  // Internal state for the wizard's own operation
  const [currentDisplayStep, setCurrentDisplayStepInternal] = useState(0);
  const [characterData, setCharacterData] = useState({
    character_name: '', level: 1, race_id: null, class_id: null, class_hit_die: null,
    background_id: null, alignment_id: null, strength: 10, dexterity: 10,
    constitution: 10, intelligence: 10, wisdom: 10, charisma: 10, max_hp: 10,
    experience_points: 0, temporary_hp: 0,
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitedSteps, setVisitedStepsInternal] = useState({0: true});

  const isCampaignMode = mode === "campaign" && campaignId;
  const wizardTitle = "New Character"; 
  const stepTitlePrefix = "Create New Character";

  // This is the actual click handler for the top navigation steps (rendered by AppTopBar)
  const handleActualNavStepClick = useCallback((stepIndex) => {
    if (visitedSteps[stepIndex] && !isSubmitting) { 
      setCurrentDisplayStepInternal(stepIndex);
    }
  }, [visitedSteps, isSubmitting]); // Depends on this component's visitedSteps state

  // This useEffect hook updates the shared context when wizard's internal state changes or on mount/unmount.
  useEffect(() => {
    if (updateWizardSharedState) {
      updateWizardSharedState({
        wizardSteps: WIZARD_STEPS_CONFIG,
        currentDisplayStep: currentDisplayStep, // Share internal current step
        isWizardActive: true,                   // Mark wizard as active
        handleNavStepClick: handleActualNavStepClick, // Share the actual click handler
        visitedSteps: visitedSteps                 // Share internal visited steps
      });
    }
    // Cleanup function for when the component unmounts
    return () => {
      if (updateWizardSharedState) {
        updateWizardSharedState({ 
          isWizardActive: false, // Mark wizard as inactive
          wizardSteps: [],       // Clear wizard specific data from context
          currentDisplayStep: 0, 
          handleNavStepClick: () => {},
          visitedSteps: {}
        });
      }
    };
  }, [updateWizardSharedState, currentDisplayStep, visitedSteps, handleActualNavStepClick]); // Re-run if these change
  
  // Effect for initial setup and when mode/campaignId changes
  useEffect(() => {
    setCurrentDisplayStepInternal(0);
    setVisitedStepsInternal({0: true});
    setCharacterData({
      character_name: '', level: 1, race_id: null, class_id: null, class_hit_die: null,
      background_id: null, alignment_id: null, strength: 10, dexterity: 10,
      constitution: 10, intelligence: 10, wisdom: 10, charisma: 10, max_hp: 10,
      experience_points: 0, temporary_hp: 0,
    });
    setError(null);
    setIsSubmitting(false);
  }, [mode, campaignId]);
  
  const ActiveStepComponent = WIZARD_STEPS_CONFIG[currentDisplayStep].component;

  const handleNext = () => { 
    setError(null);
    const currentStepConfig = WIZARD_STEPS_CONFIG[currentDisplayStep];
    // --- Validation ---
    if (currentStepConfig.name === 'BASIC INFO' && !characterData.character_name?.trim()) {
      setError(`Character name cannot be empty to proceed.`); return;
    }
    if (currentStepConfig.name === 'CLASS' && !characterData.class_id) {
      setError('Please select a class.'); return;
    }
    if (currentStepConfig.name === 'RACE' && !characterData.race_id) {
      setError('Please select a race.'); return;
    }
    if (currentStepConfig.name === 'BACKGROUND') {
      if (!characterData.background_id) { setError('Please select a background.'); return; }
      if (!characterData.alignment_id) { setError('Please select an alignment.'); return; }
    }
    if (currentStepConfig.name === 'ABILITIES') {
      const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
      for (const abi of abilities) {
        const score = characterData[abi];
        if (score === null || score === undefined || score === '' || isNaN(parseInt(score, 10)) || parseInt(score, 10) < 1 || parseInt(score, 10) > 30) {
          setError(`${abi.charAt(0).toUpperCase() + abi.slice(1)} must be a number between 1 and 30.`); return;
        }
      }
      if (isNaN(parseInt(characterData.max_hp, 10)) || parseInt(characterData.max_hp, 10) < 1) {
        setError('Max HP must be a positive number.'); return;
      }
    }
    // --- End Validation ---

    if (currentDisplayStep < TOTAL_WIZARD_STEPS_DISPLAY - 1) {
      const nextStep = currentDisplayStep + 1;
      setCurrentDisplayStepInternal(nextStep);
      setVisitedStepsInternal(prev => ({...prev, [nextStep]: true}));
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => { 
    setError(null);
    if (currentDisplayStep > 0) {
      setCurrentDisplayStepInternal(prevStep => prevStep - 1);
    } else {
      navigate(isCampaignMode ? `/campaigns/${campaignId}` : '/player-characters');
    }
  };

  const updateCharacterData = (newData) => { 
    setCharacterData(prevData => ({ ...prevData, ...newData }));
    setError(null);
  };

  const handleSubmit = async () => { 
    setError(null);
    if (!characterData.character_name?.trim() || !characterData.race_id || !characterData.class_id || 
        !characterData.background_id || !characterData.alignment_id ) {
        setError('Please complete all required fields in previous steps.');
        return; 
    }
    // Additional comprehensive validation can go here if needed

    setIsSubmitting(true);
    const templatePayload = { ...characterData };
    // If you were collecting proficiencies, spells, inventory directly in the wizard's characterData state:
    // templatePayload.proficiencies = characterData.proficiencies; 
    // templatePayload.known_spells = characterData.known_spells;
    // templatePayload.inventory = characterData.inventory; 

    try {
      const templateResponse = await axios.post(`${API_BASE_URL}/character-templates`, templatePayload);
      const newTemplate = templateResponse.data;

      if (isCampaignMode) {
        await axios.post(`${API_BASE_URL}/campaigns/${campaignId}/characters-from-template`, {
          source_template_id: newTemplate.character_template_id
        });
        navigate(`/campaigns/${campaignId}`);
      } else {
        navigate('/player-characters');
      }
    } catch (err) {
      console.error("Error in character creation process:", err);
      const errorMsg = err.response?.data?.error || `Failed to create character. (${err.message || 'Unknown error'})`;
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // This component does NOT render CharacterWizardContext.Provider
  // It is assumed that App.js wraps the application with CharacterWizardProvider
  return (
      <div className={styles.wizardPageContainer}>
        {/* The top navigation bar is now rendered by AppLayout using the context data */}
        
        <h2 className={styles.pageTitle}>{wizardTitle}: {WIZARD_STEPS_CONFIG[currentDisplayStep].name}</h2>
        
        <main className={styles.wizardContent}>
          <ActiveStepComponent
            characterData={characterData}
            updateCharacterData={updateCharacterData}
            API_BASE_URL={API_BASE_URL} 
            setParentError={setError}   
          />
        </main>

        <footer className={styles.bottomNav}>
          <div className={styles.bottomNavInnerContainer}>
            {currentDisplayStep > 0 && (
              <Button onClick={handleBack} disabled={isSubmitting} className={`${styles.navButton} ${styles.backButton}`}>
                Back
              </Button>
            )}
            <Button onClick={handleNext} disabled={isSubmitting} className={`${styles.navButton} ${styles.nextButton}`}>
              {isSubmitting ? 'Saving...' : (currentDisplayStep < TOTAL_WIZARD_STEPS_DISPLAY - 1 ? 'Next' : 'Finish & Create Character')}
            </Button>
          </div>
        </footer>
        
        {error && <p className={styles.errorMessageFixed}>{error}</p>}
      </div>
  );
}

export default CharacterCreationWizard;