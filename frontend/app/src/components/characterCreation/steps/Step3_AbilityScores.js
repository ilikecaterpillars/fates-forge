// frontend/app/src/components/characterCreation/steps/Step3_AbilityScores.js
import React from 'react'; // No useEffect or useState needed if all data comes from props

function Step3_AbilityScores({ characterData, updateCharacterData, setParentError }) {

  const handleScoreChange = (abilityKey, value) => {
    const score = parseInt(value, 10);
    // Basic validation: ensure it's a number and within a reasonable D&D range (e.g., 1-30)
    // More complex validation (e.g., for point buy limits) could be added later.
    if (isNaN(score) && value !== '') { // Allow clearing the input
        // setParentError(`${abilityKey} must be a number.`); // Or handle inline
        updateCharacterData({ [abilityKey]: '' }); // Allow temporarily empty for typing
        return;
    }
    if (value === '' || (score >= 1 && score <= 30)) {
        updateCharacterData({ [abilityKey]: value === '' ? '' : score });
        setParentError(null);
    } else if (score < 1) {
        updateCharacterData({ [abilityKey]: 1 });
        // setParentError(`${abilityKey} cannot be less than 1.`);
    } else if (score > 30) {
        updateCharacterData({ [abilityKey]: 30 });
        // setParentError(`${abilityKey} cannot be more than 30.`);
    }
  };

  const abilities = [
    { key: 'strength', label: 'Strength (STR)' },
    { key: 'dexterity', label: 'Dexterity (DEX)' },
    { key: 'constitution', label: 'Constitution (CON)' },
    { key: 'intelligence', label: 'Intelligence (INT)' },
    { key: 'wisdom', label: 'Wisdom (WIS)' },
    { key: 'charisma', label: 'Charisma (CHA)' },
  ];

  return (
    <div>
      <h3>Set Ability Scores</h3>
      <p>Enter your character's ability scores. These are typically between 3 and 20 for player characters, but can go up to 30.</p>
      {abilities.map(ability => (
        <div key={ability.key} style={{ marginBottom: '10px' }}>
          <label htmlFor={ability.key} style={{ marginRight: '10px', display: 'inline-block', width: '150px' }}>
            {ability.label}:
          </label>
          <input
            type="number"
            id={ability.key}
            name={ability.key}
            value={characterData[ability.key] || ''} // Use empty string for controlled input if value might be null/undefined initially
            onChange={(e) => handleScoreChange(ability.key, e.target.value)}
            min="1"
            max="30"
            style={{ width: '60px' }}
          />
        </div>
      ))}
      {/* Later, we can add options here for Standard Array, Point Buy, Rolling, etc. */}
    </div>
  );
}

export default Step3_AbilityScores;