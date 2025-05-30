// frontend/app/src/pages/CharacterCreationPage/CharacterCreationWizard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCharacterWizard } from '../../contexts/CharacterWizardContext';
import styles from './CharacterCreationWizard.module.css';
import Button from '../../components/common/Button/Button';

// Import step components
import Step1_Identity from '../../components/characterCreation/steps/Step1_Identity.js'; // Ensure Step0_BasicInfo.js is renamed to this
import Step1_ClassSelection from '../../components/characterCreation/steps/Step1_ClassSelection.js';
import Step2_RaceSelection from '../../components/characterCreation/steps/Step2_RaceSelection.js';
import Step3_BackgroundAlignment from '../../components/characterCreation/steps/Step3_BackgroundAlignment.js';
import Step4_AbilityScores from '../../components/characterCreation/steps/Step4_AbilityScores.js';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1001/api';

// UPDATED: Configuration for wizard steps with the desired pagePrompt
const WIZARD_STEPS_CONFIG = [
  { name: 'IDENTITY', component: Step1_Identity, id: 'identity', pagePrompt: 'Define the core identity of your character.' },
  { name: 'RACE', component: Step2_RaceSelection, id: 'race', pagePrompt: 'Select your character\'s race.' },
  { name: 'CLASS', component: Step1_ClassSelection, id: 'class', pagePrompt: 'Choose your character\'s class.' },
  { name: 'BACKGROUND', component: Step3_BackgroundAlignment, id: 'background', pagePrompt: 'Determine your character\'s background.' },
  { name: 'ABILITIES', component: Step4_AbilityScores, id: 'abilities', pagePrompt: 'Set your character\'s ability scores.' },
];
const TOTAL_WIZARD_STEPS_DISPLAY = WIZARD_STEPS_CONFIG.length;

function CharacterCreationWizard({ mode = "template" }) {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { updateWizardSharedState } = useCharacterWizard();

  const [currentDisplayStep, setCurrentDisplayStepInternal] = useState(0);
  // UPDATED: characterData state (player_name removed)
  const [characterData, setCharacterData] = useState({
    character_name: '',
    // player_name: '', // Removed
    level: 1,
    alignment_id: '',
    race_id: null,
    class_id: null,
    class_hit_die: null,
    background_id: null,
    strength: 10, dexterity: 10,
    constitution: 10, intelligence: 10, wisdom: 10, charisma: 10, max_hp: 10,
    experience_points: 0, temporary_hp: 0,
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitedSteps, setVisitedStepsInternal] = useState({0: true});

  const isCampaignMode = mode === "campaign" && campaignId;

  const handleActualNavStepClick = useCallback((stepIndex) => {
    if (visitedSteps[stepIndex] && !isSubmitting) {
      setCurrentDisplayStepInternal(stepIndex);
    }
  }, [visitedSteps, isSubmitting]);

  useEffect(() => {
    if (updateWizardSharedState) {
      const stepsForContext = WIZARD_STEPS_CONFIG.map(step => ({ name: step.name, id: step.id })); // Pass only name and id for top nav
      updateWizardSharedState({
        wizardSteps: stepsForContext,
        currentDisplayStep: currentDisplayStep,
        isWizardActive: true,
        handleNavStepClick: handleActualNavStepClick,
        visitedSteps: visitedSteps
      });
    }
    return () => {
      if (updateWizardSharedState) {
        updateWizardSharedState({
          isWizardActive: false, wizardSteps: [], currentDisplayStep: 0,
          handleNavStepClick: () => {}, visitedSteps: {}
        });
      }
    };
  }, [updateWizardSharedState, currentDisplayStep, visitedSteps, handleActualNavStepClick]);

  useEffect(() => {
    setCurrentDisplayStepInternal(0);
    setVisitedStepsInternal({0: true});
    setCharacterData({ // Reset state
      character_name: '',
      // player_name: '', // Removed
      level: 1,
      alignment_id: '',
      race_id: null,
      class_id: null,
      class_hit_die: null,
      background_id: null,
      strength: 10, dexterity: 10,
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

    if (currentStepConfig.id === 'identity') {
      if (!characterData.character_name?.trim()) {
        setError('Character name cannot be empty.'); return;
      }
      if (!characterData.alignment_id) {
        setError('Please select an alignment.'); return;
      }
    }
    if (currentStepConfig.id === 'class' && !characterData.class_id) {
        setError('Please select a class.'); return;
    }
    if (currentStepConfig.id === 'race' && !characterData.race_id) {
        setError('Please select a race.'); return;
    }
    if (currentStepConfig.id === 'background') {
      if (!characterData.background_id) { setError('Please select a background.'); return; }
    }
    if (currentStepConfig.id === 'abilities') {
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
    if (!characterData.character_name?.trim() || !characterData.alignment_id || !characterData.race_id || !characterData.class_id ||
        !characterData.background_id ) {
        setError('Please ensure all core selections (Identity, Class, Race, Background) are made.');
        return;
    }
     const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
      for (const abi of abilities) {
        if (isNaN(parseInt(characterData[abi], 10)) || parseInt(characterData[abi], 10) < 1 || parseInt(characterData[abi], 10) > 30) {
          setError('Ensure all ability scores are valid numbers between 1 and 30.'); return;
        }
      }
      if (isNaN(parseInt(characterData.max_hp, 10)) || parseInt(characterData.max_hp, 10) < 1) {
        setError('Ensure Max HP is a valid positive number.'); return;
      }

    setIsSubmitting(true);
    const templatePayload = { ...characterData };
     // Ensure player_name is not sent if it was removed from state
    // delete templatePayload.player_name; // Or ensure it's not added if not in characterData

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

  return (
      <div className={styles.wizardPageContainer}>
        {/* UPDATED: Page Title to use only pagePrompt */}
        <h2 className={styles.pageTitle}>
          {WIZARD_STEPS_CONFIG[currentDisplayStep]?.pagePrompt || 'Create Character'}
        </h2>

        <main className={styles.wizardContent}>
          <ActiveStepComponent
            characterData={characterData}
            updateCharacterData={updateCharacterData}
            API_BASE_URL={API_BASE_URL}
            setParentError={setError}
            allCharacterData={characterData}
          />
        </main>

        <footer className={styles.pageFixedFooter}>
          <div className={styles.pageFixedFooter_innerContainer}>
            {currentDisplayStep > 0 && (
              <Button
                onClick={handleBack}
                disabled={isSubmitting}
                className={styles.pageFixedFooter_secondaryAction}
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className={styles.pageFixedFooter_primaryAction}
            >
              {isSubmitting ? 'Saving...' : (currentDisplayStep < TOTAL_WIZARD_STEPS_DISPLAY - 1 ? 'Next' : 'Finish & Create Character')}
            </Button>
          </div>
        </footer>

        {error && <p className={styles.errorMessageFixed}>{error}</p>}
      </div>
  );
}

export default CharacterCreationWizard;