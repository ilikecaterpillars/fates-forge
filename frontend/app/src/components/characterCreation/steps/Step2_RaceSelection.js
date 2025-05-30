// frontend/app/src/components/characterCreation/steps/Step2_RaceSelection.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import PillDropdown from '../../common/PillDropdown/PillDropdown';
import styles from './Step2_RaceSelection.module.css';

function Step2_RaceSelection({ characterData, updateCharacterData, API_BASE_URL, setParentError }) {
  const [allRaces, setAllRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBaseRaceId, setSelectedBaseRaceId] = useState('');
  const [selectedSubRaceId, setSelectedSubRaceId] = useState('');

  useEffect(() => {
    setLoading(true);
    setParentError(null);
    axios.get(`${API_BASE_URL}/dnd/races`)
      .then(response => {
        const fetchedRaces = response.data || [];
        setAllRaces(fetchedRaces);
        if (characterData.race_id) {
          const existingRace = fetchedRaces.find(r => r.race_id === characterData.race_id);
          if (existingRace) {
            if (existingRace.parent_race_id) {
              setSelectedBaseRaceId(String(existingRace.parent_race_id));
              setSelectedSubRaceId(String(existingRace.race_id));
            } else {
              setSelectedBaseRaceId(String(existingRace.race_id));
              setSelectedSubRaceId('');
            }
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching races:", err);
        setParentError(`Failed to load races: ${err.message}`);
        setLoading(false);
      });
  }, [API_BASE_URL, setParentError, characterData.race_id]);

  const baseRaces = useMemo(() => {
    return allRaces.filter(race => !race.parent_race_id);
  }, [allRaces]);

  const subRacesForSelectedBase = useMemo(() => {
    if (!selectedBaseRaceId) return [];
    return allRaces.filter(race => race.parent_race_id === parseInt(selectedBaseRaceId));
  }, [allRaces, selectedBaseRaceId]);

  const finalSelectedRaceDetails = useMemo(() => {
    const raceIdToFind = selectedSubRaceId ? parseInt(selectedSubRaceId) : (selectedBaseRaceId ? parseInt(selectedBaseRaceId) : null);
    if (!raceIdToFind) return null;
    const raceDetail = allRaces.find(r => r.race_id === raceIdToFind);
    // If a base race is selected but it has subraces, and no subrace is selected yet,
    // don't consider it "final" for display, prompt to select subrace.
    if (raceDetail && !raceDetail.parent_race_id && subRacesForSelectedBase.length > 0 && !selectedSubRaceId) {
        return null; 
    }
    return raceDetail;
  }, [allRaces, selectedBaseRaceId, selectedSubRaceId, subRacesForSelectedBase.length]);

  const parentRaceOfSelectedSubrace = useMemo(() => {
    if (finalSelectedRaceDetails && finalSelectedRaceDetails.parent_race_id) {
      return allRaces.find(r => r.race_id === finalSelectedRaceDetails.parent_race_id);
    }
    return null;
  }, [allRaces, finalSelectedRaceDetails]);

  const handleBaseRaceChange = (event) => {
    const baseId = event.target.value;
    setSelectedBaseRaceId(baseId);
    setSelectedSubRaceId(''); // Reset subrace

    const baseRaceDetails = allRaces.find(r => r.race_id === parseInt(baseId));
    const potentialSubRaces = allRaces.filter(race => race.parent_race_id === parseInt(baseId));

    if (baseRaceDetails && potentialSubRaces.length === 0) {
      updateCharacterData({
        race_id: baseRaceDetails.race_id,
        racial_asi: baseRaceDetails.asi_bonus || {},
        parent_racial_asi: null
      });
    } else {
      updateCharacterData({ race_id: null, racial_asi: {}, parent_racial_asi: {} });
    }
  };

  const handleSubRaceChange = (event) => {
    const subId = event.target.value;
    setSelectedSubRaceId(subId);

    if (!subId) { // Handles if a "None" or placeholder subrace option is selected
        const baseRaceDetails = allRaces.find(r => r.race_id === parseInt(selectedBaseRaceId));
        if (baseRaceDetails) { // Re-select base race if "None" subrace
             updateCharacterData({
                race_id: baseRaceDetails.race_id,
                racial_asi: baseRaceDetails.asi_bonus || {},
                parent_racial_asi: null
            });
        } else {
            updateCharacterData({ race_id: null, racial_asi: {}, parent_racial_asi: {} });
        }
        return;
    }

    const subRaceDetails = allRaces.find(r => r.race_id === parseInt(subId));
    const parentRaceDetails = subRaceDetails ? allRaces.find(r => r.race_id === subRaceDetails.parent_race_id) : null;

    if (subRaceDetails) {
      updateCharacterData({
        race_id: subRaceDetails.race_id,
        racial_asi: subRaceDetails.asi_bonus || {},
        parent_racial_asi: parentRaceDetails ? parentRaceDetails.asi_bonus || {} : null
      });
    }
  };

  const formatAsi = (asiData, parentAsiData = null) => {
    if (!asiData && !parentAsiData) return 'None';
    let combinedAsi = {};

    if (parentAsiData) {
      for (const key in parentAsiData) {
        if (key.toLowerCase() === 'type' && parentAsiData[key].toLowerCase() === 'choice_two_different') {
          combinedAsi['Choose two different'] = `+${parentAsiData.value || 1}`;
        } else if (key.toLowerCase() !== 'type' && key.toLowerCase() !== 'value' && key.toLowerCase() !== 'all') {
          combinedAsi[key.toUpperCase()] = `+${parentAsiData[key]}`;
        } else if (key.toLowerCase() === 'all') {
             combinedAsi['All'] = `+${parentAsiData[key]}`;
        }
      }
    }
    if (asiData) {
      for (const key in asiData) {
        if (key.toLowerCase() === 'type' && asiData[key].toLowerCase() === 'choice_two_different') {
          combinedAsi['Choose two different'] = `+${asiData.value || 1}`;
        } else if (key.toLowerCase() !== 'type' && key.toLowerCase() !== 'value' && key.toLowerCase() !== 'all') {
          combinedAsi[key.toUpperCase()] = `+${asiData[key]}`;
        } else if (key.toLowerCase() === 'all') {
             combinedAsi['All'] = `+${asiData[key]}`;
        }
      }
    }
    return Object.entries(combinedAsi).map(([key, value]) => `${key} ${value}`).join(', ') || 'None';
  };

  const formatRacialFeatures = (features, isSubRaceFeatureSet = false) => {
    if (!features || typeof features !== 'object' || Object.keys(features).length === 0) {
      return isSubRaceFeatureSet ? null : <p className={styles.noFeaturesText}>No specific racial features listed.</p>;
    }
    return (
      <ul className={styles.featureList}>
        {Object.entries(features).map(([key, value]) => {
          // Avoid rendering "name" or "description" if they are part of a structured feature object
          // and not a simple key-value pair like "darkvision": "60ft"
          let featureName = value.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          let featureDescription = value.description || (typeof value === 'string' && value !== featureName ? value : null);

          if (typeof value === 'object' && value !== null && !value.name && !value.description && Object.keys(value).length > 0) {
            // Handle cases where 'value' is an object itself, like asi_details inside a feature
            featureDescription = Object.entries(value)
                .map(([objKey, objVal]) => `${objKey.replace(/_/g, ' ')}: ${objVal}`)
                .join(', ');
          } else if (Array.isArray(value)) {
            featureDescription = value.join(', ');
          }


          return (
            <li key={key}>
              <strong>{featureName}:</strong>
              {featureDescription && <p className={styles.featureDescription}>{featureDescription}</p>}
            </li>
          );
        })}
      </ul>
    );
  };

  if (loading) return <p>Loading race options...</p>;

  const baseRaceOptions = baseRaces.map(r => ({ value: String(r.race_id), label: r.name }));
  const subRaceOptions = subRacesForSelectedBase.map(r => ({ value: String(r.race_id), label: r.name }));

  // Add a "None" option to sub-races if the base race has sub-races, allowing selection of base race only
  // This might not be standard 5e for many races (e.g. Elf must be High/Wood/Drow etc.)
  // But if you want this flexibility:
  // if (subRacesForSelectedBase.length > 0) {
  //   subRaceOptions.unshift({ value: '', label: `Just ${allRaces.find(r => r.race_id === parseInt(selectedBaseRaceId))?.name || 'Base Race'}` });
  // }
  if (subRacesForSelectedBase.length > 0) {
    subRaceOptions.unshift({ value: '', label: `None` });
  }


  return (
    <div className={styles.stepContainer}>
      <div className={styles.raceSelectionRow}>
        <div className={`${styles.formField} ${styles.baseRaceField}`}>
          <label htmlFor="base-race-select">Race:</label>
          <PillDropdown
            id="base-race-select"
            value={selectedBaseRaceId}
            onChange={handleBaseRaceChange}
            options={baseRaceOptions}
            placeholder="-- Select Race --"
          />
        </div>

        {subRacesForSelectedBase.length > 0 && (
          <div className={`${styles.formField} ${styles.subRaceField}`}>
            <label htmlFor="sub-race-select">Subrace:</label>
            <PillDropdown
              id="sub-race-select"
              value={selectedSubRaceId}
              onChange={handleSubRaceChange}
              options={subRaceOptions}
              placeholder="-- Select Subrace --" // Or "None" if you add that option explicitly
            />
          </div>
        )}
      </div>

      {finalSelectedRaceDetails && (
        <div className={styles.detailsContainer}>
          <h3>{finalSelectedRaceDetails.name}</h3>
          {finalSelectedRaceDetails.description && <p className={styles.descriptionText}>{finalSelectedRaceDetails.description}</p>}
          
          <div className={styles.detailItem}>
            <strong>Ability Score Increases:</strong>
            <span> {formatAsi(finalSelectedRaceDetails.asi_bonus, parentRaceOfSelectedSubrace ? parentRaceOfSelectedSubrace.asi_bonus : null)}</span>
          </div>

          <div className={styles.detailItem}>
            <strong>Speed:</strong>
            <span> {finalSelectedRaceDetails.speed} ft.</span>
          </div>
          
          <div className={styles.detailItem}>
            <strong>Size:</strong>
            <span> {finalSelectedRaceDetails.size_category}</span>
          </div>

          <h4>Racial Traits</h4>
          {formatRacialFeatures(finalSelectedRaceDetails.racial_features, !!finalSelectedRaceDetails.parent_race_id)}
          
          {parentRaceOfSelectedSubrace && parentRaceOfSelectedSubrace.racial_features && (
            <>
              <h5 className={styles.parentFeaturesTitle}>Inherited Traits ({parentRaceOfSelectedSubrace.name}):</h5>
              {formatRacialFeatures(parentRaceOfSelectedSubrace.racial_features)}
            </>
          )}
        </div>
      )}
      {!finalSelectedRaceDetails && selectedBaseRaceId && subRacesForSelectedBase.length > 0 && !selectedSubRaceId && (
        <p className={styles.promptText}>Please select a subrace for {allRaces.find(r => r.race_id === parseInt(selectedBaseRaceId))?.name || 'the selected race'}.</p>
      )}
    </div>
  );
}

export default Step2_RaceSelection;