// frontend/app/src/pages/Step1_RaceSelection.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Step1_RaceSelection({ characterData, updateCharacterData, API_BASE_URL, setParentError }) {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  // Step-specific error can be managed here if needed, or use setParentError

  useEffect(() => {
    setLoading(true);
    setParentError(null); // Clear parent error when step loads
    axios.get(`${API_BASE_URL}/dnd/races`)
      .then(response => {
        setRaces(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching races in Step1:", err);
        setParentError(`Failed to load races: ${err.message}`); // Use parent error state
        setLoading(false);
      });
  }, [API_BASE_URL, setParentError]);

  const handleRaceChange = (event) => {
    const raceId = event.target.value ? parseInt(event.target.value, 10) : null;
    // Find the selected race object to potentially pass more data if needed later
    // const selectedRace = races.find(r => r.race_id === raceId); 
    updateCharacterData({ race_id: raceId });
  };

  const selectedRaceDetails = characterData.race_id ? races.find(r => r.race_id === characterData.race_id) : null;

  if (loading) return <p>Loading races...</p>;
  // Parent will display the error

  return (
    <div>
      <h3>Select Race</h3>
      <p>Choose your character's race. This will influence their abilities and features.</p>
      <label htmlFor="race-select" style={{ marginRight: '10px' }}>Race:</label>
      <select 
        id="race-select"
        value={characterData.race_id || ''} 
        onChange={handleRaceChange}
      >
        <option value="">-- Select a Race --</option>
        {races.map(race => (
          <option key={race.race_id} value={race.race_id}>
            {race.name}
          </option>
        ))}
      </select>

      {selectedRaceDetails && (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd', backgroundColor: '#282c34' }}>
          <h4>{selectedRaceDetails.name}</h4>
          {selectedRaceDetails.description && <p>{selectedRaceDetails.description}</p>}
          <p><strong>Speed:</strong> {selectedRaceDetails.speed} ft.</p>
          <p><strong>Size:</strong> {selectedRaceDetails.size_category}</p>
          {selectedRaceDetails.asi_bonus && (
            <p><strong>Ability Score Increase:</strong> {JSON.stringify(selectedRaceDetails.asi_bonus)}</p>
          )}
          {selectedRaceDetails.racial_features && (
            <div>
              <strong>Racial Features:</strong>
              <ul>
                {Object.entries(selectedRaceDetails.racial_features).map(([key, value]) => (
                  <li key={key}><strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {Array.isArray(value) ? value.join(', ') : String(value)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Step1_RaceSelection;