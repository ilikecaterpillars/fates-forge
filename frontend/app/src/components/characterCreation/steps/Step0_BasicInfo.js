// frontend/app/src/components/characterCreation/steps/Step0_BasicInfo.js
import React from 'react';

function Step0_BasicInfo({ characterData, updateCharacterData }) {
  return (
    <div>
      {/* Standard form styling will apply from App.css or a wizard-specific form style */}
      <div>
        <label htmlFor="characterName">Character Name:</label>
        <input
          type="text"
          id="characterName"
          name="character_name" // Ensure name matches state key
          value={characterData.character_name}
          onChange={(e) => updateCharacterData({ character_name: e.target.value })}
          placeholder="Enter character name"
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="level">Starting Level:</label>
        <input
          type="number"
          id="level"
          name="level" // Ensure name matches state key
          value={characterData.level}
          onChange={(e) => updateCharacterData({ level: parseInt(e.target.value, 10) || 1 })}
          min="1"
        />
      </div>
      {/* You can add more fields here later if needed for basic setup */}
    </div>
  );
}

export default Step0_BasicInfo;