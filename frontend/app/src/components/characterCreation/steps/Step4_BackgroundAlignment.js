// frontend/app/src/components/characterCreation/steps/Step4_BackgroundAlignment.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Step4_BackgroundAlignment({ characterData, updateCharacterData, API_BASE_URL, setParentError }) {
  const [backgrounds, setBackgrounds] = useState([]);
  const [alignments, setAlignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setParentError(null); // Clear parent error when step loads
    Promise.all([
      axios.get(`${API_BASE_URL}/dnd/backgrounds`),
      axios.get(`${API_BASE_URL}/dnd/alignments`)
    ])
    .then(([backgroundsResponse, alignmentsResponse]) => {
      setBackgrounds(backgroundsResponse.data);
      setAlignments(alignmentsResponse.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching backgrounds/alignments in Step4:", err);
      setParentError(`Failed to load backgrounds or alignments: ${err.message}`);
      setLoading(false);
    });
  }, [API_BASE_URL, setParentError]);

  const handleBackgroundChange = (event) => {
    const backgroundId = event.target.value ? parseInt(event.target.value, 10) : null;
    updateCharacterData({ background_id: backgroundId });
  };

  const handleAlignmentChange = (event) => {
    const alignmentId = event.target.value ? parseInt(event.target.value, 10) : null;
    updateCharacterData({ alignment_id: alignmentId });
  };

  const selectedBackgroundDetails = characterData.background_id ? backgrounds.find(b => b.background_id === characterData.background_id) : null;
  const selectedAlignmentDetails = characterData.alignment_id ? alignments.find(a => a.alignment_id === characterData.alignment_id) : null;


  if (loading) return <p>Loading backgrounds and alignments...</p>;
  // Parent wizard will display errors set by setParentError

  return (
    <div>
      <h3>Select Background & Alignment</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="background-select" style={{ marginRight: '10px' }}>Background:</label>
        <select 
          id="background-select"
          value={characterData.background_id || ''} 
          onChange={handleBackgroundChange}
        >
          <option value="">-- Select a Background --</option>
          {backgrounds.map(bg => (
            <option key={bg.background_id} value={bg.background_id}>
              {bg.name}
            </option>
          ))}
        </select>
        {selectedBackgroundDetails && (
          <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', backgroundColor: '#282c34' /* Your dark theme color */ }}>
            <h4>{selectedBackgroundDetails.name}</h4>
            {selectedBackgroundDetails.feature_name && <p><strong>Feature:</strong> {selectedBackgroundDetails.feature_name}</p>}
            {selectedBackgroundDetails.feature_description && <p>{selectedBackgroundDetails.feature_description}</p>}
            {/* You can add more details like proficiencies, equipment later */}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="alignment-select" style={{ marginRight: '10px' }}>Alignment:</label>
        <select 
          id="alignment-select"
          value={characterData.alignment_id || ''} 
          onChange={handleAlignmentChange}
        >
          <option value="">-- Select an Alignment --</option>
          {alignments.map(align => (
            <option key={align.alignment_id} value={align.alignment_id}>
              {align.name} ({align.abbreviation})
            </option>
          ))}
        </select>
        {selectedAlignmentDetails && (
          <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ddd', backgroundColor: '#282c34' /* Your dark theme color */ }}>
            <h4>{selectedAlignmentDetails.name} ({selectedAlignmentDetails.abbreviation})</h4>
            {selectedAlignmentDetails.description && <p>{selectedAlignmentDetails.description}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Step4_BackgroundAlignment;