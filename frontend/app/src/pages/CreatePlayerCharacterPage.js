// frontend/app/src/pages/CreatePlayerCharacterPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function CreatePlayerCharacterPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [characterName, setCharacterName] = useState('');
  const [level, setLevel] = useState(1);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedBackgroundId, setSelectedBackgroundId] = useState('');
  const [selectedAlignmentId, setSelectedAlignmentId] = useState('');

  // Ability Scores & HP
  const [strength, setStrength] = useState(10);
  const [dexterity, setDexterity] = useState(10);
  const [constitution, setConstitution] = useState(10);
  const [intelligence, setIntelligence] = useState(10);
  const [wisdom, setWisdom] = useState(10);
  const [charisma, setCharisma] = useState(10);
  const [maxHp, setMaxHp] = useState(10);

  const [races, setRaces] = useState([]);
  const [classes, setClasses] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [alignments, setAlignments] = useState([]);

  const [loadingData, setLoadingData] = useState(true); 
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1001/api';

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingData(true);
      setError(null);
      try {
        const [
          racesResponse, 
          classesResponse, 
          backgroundsResponse, 
          alignmentsResponse
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/dnd/races`),
          axios.get(`${API_BASE_URL}/dnd/classes`),
          axios.get(`${API_BASE_URL}/dnd/backgrounds`),
          axios.get(`${API_BASE_URL}/dnd/alignments`)
        ]);
        setRaces(racesResponse.data);
        setClasses(classesResponse.data);
        setBackgrounds(backgroundsResponse.data);
        setAlignments(alignmentsResponse.data);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(`Failed to load initial data for character creation. ${err.message}`);
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, [API_BASE_URL]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    // Basic Validations (you can expand these)
    if (!characterName.trim()) { setError('Character name cannot be empty.'); return; }
    if (!selectedRaceId) { setError('Please select a race.'); return; }
    if (!selectedClassId) { setError('Please select a class.'); return; }
    if (!selectedBackgroundId) { setError('Please select a background.'); return; }
    if (!selectedAlignmentId) { setError('Please select an alignment.'); return; }
    if (isNaN(parseInt(level, 10)) || parseInt(level, 10) < 1) { setError('Level must be a positive number.'); return; }
    if (isNaN(parseInt(maxHp, 10)) || parseInt(maxHp, 10) < 1) { setError('Max HP must be a positive number.'); return; }
    // Add validation for ability scores if needed (e.g., range)


    const characterData = {
      character_name: characterName,
      level: parseInt(level, 10),
      race_id: parseInt(selectedRaceId, 10),
      class_id: parseInt(selectedClassId, 10),
      background_id: parseInt(selectedBackgroundId, 10),
      alignment_id: parseInt(selectedAlignmentId, 10),
      strength: parseInt(strength, 10),
      dexterity: parseInt(dexterity, 10),
      constitution: parseInt(constitution, 10),
      intelligence: parseInt(intelligence, 10),
      wisdom: parseInt(wisdom, 10),
      charisma: parseInt(charisma, 10),
      max_hp: parseInt(maxHp, 10)
    };

    try {
      await axios.post(`${API_BASE_URL}/projects/${projectId}/characters`, characterData);
      navigate(`/projects/${projectId}`); 
    } catch (err) {
      console.error("Error creating character:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError(`Failed to create character. ${err.message}`);
      }
    }
  };

  if (loadingData) return <p>Loading data for character creation...</p>;
  
  return (
    <div>
      <h2>Create New Character for Project {projectId}</h2>
      <form onSubmit={handleSubmit}>
        {/* Character Name and Level */}
        <div>
          <label htmlFor="characterName">Character Name:</label>
          <input type="text" id="characterName" value={characterName} onChange={(e) => setCharacterName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="level">Level:</label>
          <input type="number" id="level" value={level} onChange={(e) => setLevel(e.target.value)} min="1" required />
        </div>

        {/* Dropdowns */}
        <div>
          <label htmlFor="race">Race:</label>
          <select id="race" value={selectedRaceId} onChange={(e) => setSelectedRaceId(e.target.value)} required >
            <option value="">-- Select a Race --</option>
            {races.map(race => (<option key={race.race_id} value={race.race_id}>{race.name}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="class">Class:</label>
          <select id="class" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} required >
            <option value="">-- Select a Class --</option>
            {classes.map(dndClass => (<option key={dndClass.class_id} value={dndClass.class_id}>{dndClass.name}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="background">Background:</label>
          <select id="background" value={selectedBackgroundId} onChange={(e) => setSelectedBackgroundId(e.target.value)} required >
            <option value="">-- Select a Background --</option>
            {backgrounds.map(bg => (<option key={bg.background_id} value={bg.background_id}>{bg.name}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="alignment">Alignment:</label>
          <select id="alignment" value={selectedAlignmentId} onChange={(e) => setSelectedAlignmentId(e.target.value)} required >
            <option value="">-- Select an Alignment --</option>
            {alignments.map(align => (<option key={align.alignment_id} value={align.alignment_id}>{align.name} ({align.abbreviation})</option>))}
          </select>
        </div>

        {/* Ability Scores */}
        <h3>Ability Scores</h3>
        <div>
          <label htmlFor="strength">Strength:</label>
          <input type="number" id="strength" value={strength} onChange={(e) => setStrength(e.target.value)} min="1" max="30" required />
        </div>
        <div>
          <label htmlFor="dexterity">Dexterity:</label>
          <input type="number" id="dexterity" value={dexterity} onChange={(e) => setDexterity(e.target.value)} min="1" max="30" required />
        </div>
        <div>
          <label htmlFor="constitution">Constitution:</label>
          <input type="number" id="constitution" value={constitution} onChange={(e) => setConstitution(e.target.value)} min="1" max="30" required />
        </div>
        <div>
          <label htmlFor="intelligence">Intelligence:</label>
          <input type="number" id="intelligence" value={intelligence} onChange={(e) => setIntelligence(e.target.value)} min="1" max="30" required />
        </div>
        <div>
          <label htmlFor="wisdom">Wisdom:</label>
          <input type="number" id="wisdom" value={wisdom} onChange={(e) => setWisdom(e.target.value)} min="1" max="30" required />
        </div>
        <div>
          <label htmlFor="charisma">Charisma:</label>
          <input type="number" id="charisma" value={charisma} onChange={(e) => setCharisma(e.target.value)} min="1" max="30" required />
        </div>

        {/* HP */}
        <h3>Hit Points</h3>
        <div>
          <label htmlFor="maxHp">Max HP:</label>
          <input type="number" id="maxHp" value={maxHp} onChange={(e) => setMaxHp(e.target.value)} min="1" required />
        </div>

        {error && <p className="error-message">{error}</p>}
        <button type="submit">Create Character</button>
        <button type="button" className="cancel-button" onClick={() => navigate(`/projects/${projectId}`)}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default CreatePlayerCharacterPage;