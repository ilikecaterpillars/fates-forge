// frontend/app/src/components/characterCreation/steps/Step1_Identity.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PillTextInput from '../../common/PillTextInput/PillTextInput'; // Import new component
import PillDropdown from '../../common/PillDropdown/PillDropdown'; // Import new component
import compStyles from './Step1_Identity.module.css'; 

function Step1_Identity({ characterData, updateCharacterData, API_BASE_URL, setParentError }) {
  const [alignments, setAlignments] = useState([]);
  const [selectedAlignmentDescription, setSelectedAlignmentDescription] = useState('');
  const [loadingAlignments, setLoadingAlignments] = useState(true);

  useEffect(() => {
    setParentError(null);
    setLoadingAlignments(true);
    axios.get(`${API_BASE_URL}/dnd/alignments`)
      .then(response => {
        const fetchedAlignments = response.data || [];
        setAlignments(fetchedAlignments);
        if (characterData.alignment_id) {
          const currentAlignment = fetchedAlignments.find(a => a.alignment_id === parseInt(characterData.alignment_id));
          setSelectedAlignmentDescription(currentAlignment ? currentAlignment.description : '');
        } else {
          setSelectedAlignmentDescription('');
        }
        setLoadingAlignments(false);
      })
      .catch(err => {
        console.error("Error fetching alignments:", err);
        setParentError(`Failed to load alignments: ${err.message}`);
        setLoadingAlignments(false);
        setAlignments([]);
      });
  }, [API_BASE_URL, setParentError]);

   useEffect(() => {
    if (characterData.alignment_id && alignments.length > 0) {
      const currentAlignment = alignments.find(a => a.alignment_id === parseInt(characterData.alignment_id));
      setSelectedAlignmentDescription(currentAlignment ? currentAlignment.description : '');
    } else {
      setSelectedAlignmentDescription('');
    }
  }, [characterData.alignment_id, alignments]);

  const handleAlignmentChange = (event) => {
    const selectedId = event.target.value;
    const newAlignmentId = selectedId ? parseInt(selectedId, 10) : '';
    updateCharacterData({ alignment_id: newAlignmentId });
  };
  
  const alignmentOptions = alignments.map(align => ({ value: align.alignment_id, label: align.name }));

  return (
    <div className={compStyles.stepContainer}>
      
      {/* Name and Level Side-by-Side */}
      <div className={compStyles.formRow}>
        <div className={compStyles.formFieldCharacterName}>
          <label htmlFor="characterName">Character Name:</label>
          <PillTextInput
            type="text"
            id="characterName"
            name="character_name"
            value={characterData.character_name || ''}
            onChange={(e) => updateCharacterData({ character_name: e.target.value })}
            placeholder="Gilligan Leverhold"
          />
        </div>
        <div className={compStyles.formFieldLevel}>
          <label htmlFor="level">Level:</label>
          <PillTextInput
            type="number"
            id="level"
            name="level"
            value={characterData.level || 1}
            onChange={(e) => {
              const newLevel = parseInt(e.target.value, 10);
              updateCharacterData({ level: newLevel >= 1 ? newLevel : 1 });
            }}
            min="1"
            max="20"
            // The PillTextInput can accept inputStyle or rely on className for width
            // If PillTextInput's CSS makes it 100% width by default, the parent div controls its actual size.
          />
        </div>
      </div>

      {/* Alignment Section - Label removed */}
      <div className={compStyles.formFieldFull}>
        {loadingAlignments ? (
          <p>Loading alignments...</p>
        ) : (
          <div className={compStyles.alignmentControlContainer}>
            <PillDropdown
              id="alignment"
              name="alignment_id"
              value={characterData.alignment_id || ''}
              onChange={handleAlignmentChange}
              options={alignmentOptions}
              placeholder="-- Select an Alignment --"
              ariaLabel="Select Character Alignment"
              className={compStyles.alignmentDropdown} // For specific width/flex control if needed
            />
          </div>
        )}
      </div>

      {characterData.alignment_id && selectedAlignmentDescription && (
        <div className={compStyles.alignmentDescription}>
          <p>{selectedAlignmentDescription}</p>
        </div>
      )}
    </div>
  );
}

export default Step1_Identity;