// frontend/app/src/pages/CharacterCreationWizard.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Step1_RaceSelection from '../components/characterCreation/steps/Step1_RaceSelection'; 
import Step2_ClassSelection from '../components/characterCreation/steps/Step2_ClassSelection';
import Step3_AbilityScores from '../components/characterCreation/steps/Step3_AbilityScores';
import Step4_BackgroundAlignment from '../components/characterCreation/steps/Step4_BackgroundAlignment';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1001/api';
const TOTAL_WIZARD_STEPS = 4; // Assuming this remains the same

function CharacterCreationWizard() {
  const { campaignId } = useParams(); // Changed from projectId
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0); 
  const [characterData, setCharacterData] = useState({
    // campaign_id: parseInt(campaignId, 10), // campaignId is part of the URL, not usually in the body for this type of POST
    character_name: '',
    level: 1,
    race_id: null,
    class_id: null,
    background_id: null,
    alignment_id: null,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    max_hp: 10, // You might want to calculate this based on class/con later
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect to ensure campaignId is valid, though the route should handle non-existent campaigns.
  // If campaignId changes (e.g. browser back/fwd to a different wizard), reset state.
  useEffect(() => {
    setCurrentStep(0);
    setCharacterData({
      character_name: '',
      level: 1,
      race_id: null,
      class_id: null,
      background_id: null,
      alignment_id: null,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      max_hp: 10,
    });
    setError(null);
    setIsSubmitting(false);
  }, [campaignId]);


  const handleNext = () => {
    // Validation for current step
    if (currentStep === 0 && !characterData.character_name?.trim()) {
        setError('Character name cannot be empty to proceed.');
        return;
    }
    if (currentStep === 1 && !characterData.race_id) {
        setError('Please select a race to proceed.');
        return;
    }
    if (currentStep === 2 && !characterData.class_id) {
        setError('Please select a class to proceed.');
        return;
    }
    if (currentStep === 3) { // Ability Scores
      const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
      for (const abi of abilities) {
          const score = characterData[abi];
          if (score === null || score === undefined || score === '' || isNaN(parseInt(score,10))) {
              setError(`Please enter a valid score for ${abi}.`);
              return;
          }
          if (parseInt(score, 10) < 1 || parseInt(score, 10) > 30) { // Basic D&D range
              setError(`${abi.charAt(0).toUpperCase() + abi.slice(1)} must be between 1 and 30.`);
              return;
          }
      }
      // Also validate max_hp for step 3 if it's set here, or make it part of a later "review" step.
      // For now, assuming max_hp is collected and validated before final submission.
    }
    if (currentStep === 4) { // Background & Alignment
        if (!characterData.background_id) {
            setError('Please select a background to proceed.');
            return;
        }
        if (!characterData.alignment_id) {
            setError('Please select an alignment to proceed.');
            return;
        }
    }
    setError(null); 

    if (currentStep < TOTAL_WIZARD_STEPS) { 
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      // This means we are on the last step (step 4), and "Next" becomes "Finish"
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError(null); 
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    } else {
      // If on step 0 (name/level), navigate back to campaign detail page
      navigate(`/campaigns/${campaignId}`); // Changed navigation
    }
  };

  const updateCharacterData = (newData) => {
    setCharacterData(prevData => ({
      ...prevData,
      ...newData
    }));
    setError(null); 
  };

  const handleSubmit = async () => {
    setError(null);
    
    // Perform final comprehensive validation before submitting
    if (!characterData.character_name?.trim()) { setError('Character name is required.'); return; }
    if (!characterData.race_id) { setError('Race is required.'); return; }
    if (!characterData.class_id) { setError('Class is required.'); return; }
    if (!characterData.background_id) { setError('Background is required.'); return; }
    if (!characterData.alignment_id) { setError('Alignment is required.'); return; }
    if (isNaN(parseInt(characterData.level, 10)) || parseInt(characterData.level, 10) < 1) { setError('Level must be a positive number.'); return; }
    if (isNaN(parseInt(characterData.max_hp, 10)) || parseInt(characterData.max_hp, 10) < 1) { setError('Max HP must be a positive number.'); return; }
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    for (const abi of abilities) {
        const score = characterData[abi];
        if (score === null || score === undefined || score === '' || isNaN(parseInt(score,10)) || parseInt(score, 10) < 1 || parseInt(score, 10) > 30) {
            setError(`Please enter a valid score (1-30) for ${abi}.`);
            return;
        }
    }

    setIsSubmitting(true);

    const payload = {
      character_name: characterData.character_name,
      level: parseInt(characterData.level, 10),
      race_id: parseInt(characterData.race_id, 10),
      class_id: parseInt(characterData.class_id, 10),
      background_id: parseInt(characterData.background_id, 10),
      alignment_id: parseInt(characterData.alignment_id, 10),
      strength: parseInt(characterData.strength, 10),
      dexterity: parseInt(characterData.dexterity, 10),
      constitution: parseInt(characterData.constitution, 10),
      intelligence: parseInt(characterData.intelligence, 10),
      wisdom: parseInt(characterData.wisdom, 10),
      charisma: parseInt(characterData.charisma, 10),
      max_hp: parseInt(characterData.max_hp, 10),
      // campaign_id is in the URL, so not needed in payload for this endpoint
    };
    
    try {
      // Changed API endpoint
      await axios.post(`${API_BASE_URL}/campaigns/${campaignId}/characters`, payload);
      navigate(`/campaigns/${campaignId}`); // Changed navigation
    } catch (err) {
      console.error("Error creating character:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError(`Failed to create character. (${err.message})`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Step 0: Name and Level
  if (currentStep === 0) { 
      return (
          <div>
              <h2>New Character: Basic Info (Campaign ID: {campaignId})</h2>
              <div>
                  <label htmlFor="characterName">Character Name:</label>
                  <input
                      type="text"
                      id="characterName"
                      value={characterData.character_name}
                      onChange={(e) => updateCharacterData({ character_name: e.target.value })}
                      placeholder="Enter character name"
                  />
              </div>
              <div>
                  <label htmlFor="level">Starting Level:</label>
                  <input
                      type="number"
                      id="level"
                      value={characterData.level}
                      onChange={(e) => updateCharacterData({ level: parseInt(e.target.value, 10) || 1 })}
                      min="1"
                  />
              </div>
              {/* Max HP input REMOVED from here */}
              <div style={{ marginTop: '20px' }}>
                <button type="button" className="cancel-button" onClick={() => navigate(`/campaigns/${campaignId}`)} style={{ marginRight: '10px' }}>
                    Cancel
                </button>
                <button onClick={handleNext} disabled={!characterData.character_name?.trim()}>
                    Next: Select Race
                </button>
              </div>
              {error && <p className="error-message" style={{ marginTop: '10px' }}>{error}</p>}
          </div>
      )
  }

  // Main Wizard Area
  return (
    <div>
      <h2>Create New Character - Step {currentStep} of {TOTAL_WIZARD_STEPS} (Campaign ID: {campaignId})</h2> {/* Updated text */}
      
      {currentStep === 1 && (
        <Step1_RaceSelection
          characterData={characterData}
          updateCharacterData={updateCharacterData}
          API_BASE_URL={API_BASE_URL}
          setParentError={setError}
        />
      )}
      {currentStep === 2 && (
        <Step2_ClassSelection
          characterData={characterData}
          updateCharacterData={updateCharacterData}
          API_BASE_URL={API_BASE_URL}
          setParentError={setError}
        />
      )}
      {currentStep === 3 && (
        <Step3_AbilityScores
          characterData={characterData}
          updateCharacterData={updateCharacterData}
          setParentError={setError}
          // Pass max_hp and its setter if you want to manage it in Step3_AbilityScores
          // max_hp={characterData.max_hp}
          // updateMaxHp={(value) => updateCharacterData({ max_hp: parseInt(value, 10) || 1 })}
        />
      )}
      {currentStep === 4 && (
        <Step4_BackgroundAlignment
          characterData={characterData}
          updateCharacterData={updateCharacterData}
          API_BASE_URL={API_BASE_URL}
          setParentError={setError}
        />
      )}

      <hr style={{ margin: '20px 0' }}/>
      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={handleBack} disabled={isSubmitting}>
          {currentStep === 0 ? 'Cancel & Back to Campaign' : 'Back'}  {/* Updated text for cancel */}
        </button>
        <button onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (currentStep < TOTAL_WIZARD_STEPS ? 'Next' : 'Finish & Create Character')}
        </button>
      </div>
      {error && <p className="error-message" style={{ marginTop: '10px' }}>{error}</p>}
      
      <div style={{ marginTop: '20px', backgroundColor: '#282c34', padding: '10px', border: '1px solid #ccc', fontSize: '0.8em' }}>
        <h4>Debug: Current Character Data</h4>
        <pre>{JSON.stringify(characterData, null, 2)}</pre>
      </div>
    </div>
  );
}

export default CharacterCreationWizard;