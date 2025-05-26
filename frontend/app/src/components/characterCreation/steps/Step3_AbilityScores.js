// frontend/app/src/components/characterCreation/steps/Step3_AbilityScores.js
import React from 'react'; // No useEffect or useState needed if all data comes from props

function Step3_AbilityScores({ characterData, updateCharacterData, setParentError }) {

  const handleScoreChange = (abilityKey, value) => {
    const score = parseInt(value, 10);
    if (isNaN(score) && value !== '') { 
        updateCharacterData({ [abilityKey]: '' }); 
        return;
    }
    if (value === '' || (score >= 1 && score <= 30)) {
        updateCharacterData({ [abilityKey]: value === '' ? '' : score });
        setParentError(null);
    } else if (score < 1) {
        updateCharacterData({ [abilityKey]: 1 });
    } else if (score > 30) {
        updateCharacterData({ [abilityKey]: 30 });
    }
  };

  const handleMaxHpChange = (value) => {
    const hp = parseInt(value, 10);
    if (isNaN(hp) && value !== '') {
      updateCharacterData({ max_hp: '' });
      return;
    }
    if (value === '' || hp >= 1) { // Basic validation for HP
      updateCharacterData({ max_hp: value === '' ? '' : hp });
      setParentError(null);
    } else if (hp < 1) {
      updateCharacterData({ max_hp: 1 });
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

  // TODO: Future enhancement - Auto-calculate suggested HP based on class hit die and CON modifier
  // For now, it's a manual input.
  // const calculateSuggestedHp = () => {
  //   if (characterData.class_id && characterData.constitution) {
  //     // Logic to get class_hit_die based on characterData.class_id (might need API call or preloaded class data)
  //     // Logic to calculate con_modifier from characterData.constitution
  //     // return class_hit_die + con_modifier; // For level 1
  //   }
  //   return characterData.max_hp || 10; // Default or current value
  // };

  return (
    <div>
      <h3>Set Ability Scores & Max HP</h3>
      <p>Enter your character's ability scores (typically 1-20, max 30). Then set Max HP.</p>
      {abilities.map(ability => (
        <div key={ability.key} style={{ marginBottom: '10px' }}>
          <label htmlFor={ability.key} style={{ marginRight: '10px', display: 'inline-block', width: '150px' }}>
            {ability.label}:
          </label>
          <input
            type="number"
            id={ability.key}
            name={ability.key}
            value={characterData[ability.key] || ''}
            onChange={(e) => handleScoreChange(ability.key, e.target.value)}
            min="1"
            max="30"
            style={{ width: '60px' }}
          />
        </div>
      ))}

      <hr style={{ margin: '20px 0' }}/>
      <h4>Hit Points</h4>
       <div>
        <label htmlFor="maxHp" style={{ marginRight: '10px', display: 'inline-block', width: '150px' }}>Max HP:</label>
        <input
          type="number"
          id="maxHp"
          name="maxHp"
          value={characterData.max_hp || ''}
          onChange={(e) => handleMaxHpChange(e.target.value)}
          min="1"
          required
          style={{ width: '60px' }}
        />
        {/* <small> (Suggested for Level 1: {calculateSuggestedHp()})</small> */}
      </div>
      {/* Later, we can add options here for Standard Array, Point Buy, Rolling, etc. */}
    </div>
  );
}

export default Step3_AbilityScores;