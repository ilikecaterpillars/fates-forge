// frontend/app/src/pages/CharacterCreationWizard.js
import React, { useState, useEffect } from 'react'; // Added useEffect
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Step1_RaceSelection from '../components/characterCreation/steps/Step1_RaceSelection'; 
import Step2_ClassSelection from '../components/characterCreation/steps/Step2_ClassSelection';// etc.
import Step3_AbilityScores from '../components/characterCreation/steps/Step3_AbilityScores';
import Step4_BackgroundAlignment from '../components/characterCreation/steps/Step4_BackgroundAlignment';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1001/api';

// Define TOTAL_STEPS at a scope accessible by the component
const TOTAL_WIZARD_STEPS = 4;

function CharacterCreationWizard() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // currentStep: 0 for initial name/level, 1 for Race, 2 for Class, etc.
  const [currentStep, setCurrentStep] = useState(0); 
  const [characterData, setCharacterData] = useState({
    project_id: parseInt(projectId, 10), // Ensure projectId is a number
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
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleNext = () => {
    // Validate current step before proceeding (can be done within step components too)
    if (currentStep === 0 && !characterData.character_name?.trim()) {
        setError('Character name cannot be empty to proceed.');
        return;
    }
    if (currentStep === 1 && !characterData.race_id) {
        setError('Please select a race to proceed.');
        return;
    }
    if (currentStep === 2 && !characterData.class_id) { // <-- ADD THIS CHECK
        setError('Please select a class to proceed.');
        return;
    }
    if (currentStep === 3) {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        for (const abi of abilities) {
            const score = characterData[abi];
            if (score === null || score === undefined || score === '' || isNaN(parseInt(score,10))) {
                setError(`Please enter a valid score for ${abi}.`);
                return;
            }
            if (parseInt(score, 10) < 1 || parseInt(score, 10) > 30) {
                setError(`${abi.charAt(0).toUpperCase() + abi.slice(1)} must be between 1 and 30.`);
                return;
            }
        }
    }
    if (currentStep === 4) {
        if (!characterData.background_id) {
            setError('Please select a background to proceed.');
            return;
        }
        if (!characterData.alignment_id) {
            setError('Please select an alignment to proceed.');
            return;
        }
    }

    setError(null); // Clear error if validation passes

    if (currentStep < TOTAL_WIZARD_STEPS) { 
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      // This is the final data collection step, handle submission
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError(null); // Clear error when going back
    if (currentStep > 0) { // Allow going back from step 1 to step 0
      setCurrentStep(prevStep => prevStep - 1);
    } else {
      // If on step 0 (name/level), navigate back to project detail page
      navigate(`/projects/${projectId}`);
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
    setIsSubmitting(true);

    // Final validation before submitting to backend
    if (!characterData.character_name?.trim()) { setError('Character name is required.'); setIsSubmitting(false); return; }
    if (!characterData.race_id) { setError('Race is required.'); setIsSubmitting(false); return; }
    if (!characterData.class_id) { setError('Class is required (add as next step).'); setIsSubmitting(false); return; } // Placeholder
    // Add other required field checks as they become part of the wizard


    // Prepare payload - ensure all IDs are integers, and remove any temp/UI state
    const payload = {
      character_name: characterData.character_name,
      level: parseInt(characterData.level, 10),
      race_id: parseInt(characterData.race_id, 10),
      class_id: characterData.class_id ? parseInt(characterData.class_id, 10) : null, 
      background_id: characterData.background_id ? parseInt(characterData.background_id, 10) : null,
      alignment_id: characterData.alignment_id ? parseInt(characterData.alignment_id, 10) : null,
      strength: parseInt(characterData.strength, 10),
      dexterity: parseInt(characterData.dexterity, 10),
      constitution: parseInt(characterData.constitution, 10),
      intelligence: parseInt(characterData.intelligence, 10),
      wisdom: parseInt(characterData.wisdom, 10),
      charisma: parseInt(characterData.charisma, 10),
      max_hp: parseInt(characterData.max_hp, 10),
    };
    
    // Remove null optional fields if backend doesn't expect them or has defaults
    Object.keys(payload).forEach(key => {
      if (payload[key] === null || Number.isNaN(payload[key])) { // Check for NaN as well after parseInt
        // Decide if you want to delete or send null based on backend
        // For now, let's assume backend can handle nulls for optional foreign keys
        if (key.endsWith('_id') && payload[key] === null) {
             // Keep null for optional FKs if schema allows, or delete
        } else if (payload[key] === null || Number.isNaN(payload[key])) {
            delete payload[key]; // Or set to a default if backend expects it
        }
      }
    });

    try {
      await axios.post(`${API_BASE_URL}/projects/${projectId}/characters`, payload);
      navigate(`/projects/${projectId}`);
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
              <h2>New Character: Basic Info (Project: {projectId})</h2>
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
              <div style={{ marginTop: '20px' }}>
                <button type="button" className="cancel-button" onClick={() => navigate(`/projects/${projectId}`)} style={{ marginRight: '10px' }}>
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
      <h2>Create New Character - Step {currentStep} of {TOTAL_WIZARD_STEPS} (Project: {projectId})</h2>
      
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
          {currentStep === 0 ? 'Cancel' : 'Back'} 
        </button>
        <button onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (currentStep < TOTAL_WIZARD_STEPS ? 'Next' : 'Finish & Create Character')}
        </button>
      </div>
      {error && <p className="error-message" style={{ marginTop: '10px' }}>{error}</p>}
      
      {/* Optional: Debug display */}
      <div style={{ marginTop: '20px', backgroundColor: '#282c34', padding: '10px', border: '1px solid #ccc', fontSize: '0.8em' }}>
        <h4>Debug: Current Character Data</h4>
        <pre>{JSON.stringify(characterData, null, 2)}</pre>
      </div>
    </div>
  );
}

export default CharacterCreationWizard;