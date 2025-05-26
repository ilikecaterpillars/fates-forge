// frontend/app/src/components/characterCreation/steps/Step3_AbilityScores.js
import React, { useEffect, useState } from 'react';

// Helper function to calculate D&D ability modifier
const calculateModifier = (score) => {
  if (isNaN(parseInt(score, 10))) return 0;
  return Math.floor((parseInt(score, 10) - 10) / 2);
};

function Step3_AbilityScores({ characterData, updateCharacterData, setParentError }) {
  const [suggestedHp, setSuggestedHp] = useState('');

  const handleScoreChange = (abilityKey, value) => {
    const score = parseInt(value, 10);
    let newScore = value === '' ? '' : score;

    if (isNaN(score) && value !== '') {
      newScore = '';
    } else if (value !== '') {
      if (score < 1) newScore = 1;
      if (score > 30) newScore = 30;
    }
    
    updateCharacterData({ [abilityKey]: newScore });
    setParentError(null);
  };

  const handleMaxHpChange = (value) => {
    const hp = parseInt(value, 10);
    let newHp = value === '' ? '' : hp;

    if (isNaN(hp) && value !== '') {
      newHp = '';
    } else if (value !== '' && hp < 1) {
      newHp = 1;
    }
    updateCharacterData({ max_hp: newHp });
    setParentError(null);
  };

  useEffect(() => {
    const conScore = parseInt(characterData.constitution, 10);
    const classHitDie = parseInt(characterData.class_hit_die, 10);
    const level = parseInt(characterData.level, 10);

    if (level === 1 && !isNaN(conScore) && !isNaN(classHitDie) && classHitDie > 0) {
      const conModifier = calculateModifier(conScore);
      const calculatedHp = classHitDie + conModifier;
      setSuggestedHp(`Suggested for Level 1: ${calculatedHp}`);
      // Automatically set this as the max_hp for convenience at level 1
      // User can still override if they type into the input manually
      if (characterData.max_hp === '' || characterData.max_hp === 10) { // Only auto-set if it's default or empty
         updateCharacterData({ max_hp: Math.max(1, calculatedHp) }); // Ensure HP is at least 1
      }
    } else {
      setSuggestedHp(''); // Clear suggestion if not applicable
    }
  }, [characterData.constitution, characterData.class_hit_die, characterData.level, updateCharacterData, characterData.max_hp]);


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
      <h3>Set Ability Scores & Max HP</h3>
      <p>Enter ability scores (1-30). For Level 1 characters, Max HP will be suggested based on Class and Constitution.</p>
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
          {ability.key === 'constitution' && 
           <span style={{ marginLeft: '10px' }}>(Mod: {calculateModifier(characterData.constitution)})</span>}
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
        {suggestedHp && <small style={{ marginLeft: '10px' }}>({suggestedHp})</small>}
      </div>
    </div>
  );
}

export default Step3_AbilityScores;