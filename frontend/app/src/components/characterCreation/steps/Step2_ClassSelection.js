// frontend/app/src/components/characterCreation/steps/Step2_ClassSelection.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Step2_ClassSelection({ characterData, updateCharacterData, API_BASE_URL, setParentError }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setParentError(null); 
    axios.get(`${API_BASE_URL}/dnd/classes`)
      .then(response => {
        setClasses(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching classes in Step2:", err);
        setParentError(`Failed to load classes: ${err.message}`);
        setLoading(false);
      });
  }, [API_BASE_URL, setParentError]);

  const handleClassChange = (event) => {
    const classId = event.target.value ? parseInt(event.target.value, 10) : null;
    const selectedClass = classes.find(c => c.class_id === classId);
    
    updateCharacterData({ 
      class_id: classId,
      class_hit_die: selectedClass ? selectedClass.hit_die : null // Store hit_die
    });
  };

  const selectedClassDetails = characterData.class_id ? classes.find(c => c.class_id === characterData.class_id) : null;

  if (loading) return <p>Loading classes...</p>;

  return (
    <div>
      <h3>Select Class</h3>
      <p>Choose your character's class. This determines their primary abilities, skills, and features.</p>
      <label htmlFor="class-select" style={{ marginRight: '10px' }}>Class:</label>
      <select 
        id="class-select"
        value={characterData.class_id || ''} 
        onChange={handleClassChange}
      >
        <option value="">-- Select a Class --</option>
        {classes.map(dndClass => (
          <option key={dndClass.class_id} value={dndClass.class_id}>
            {dndClass.name} (Hit Die: d{dndClass.hit_die})
          </option>
        ))}
      </select>

      {selectedClassDetails && (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd', backgroundColor: '#282c34' }}>
          <h4>{selectedClassDetails.name}</h4>
          {selectedClassDetails.description && <p><strong>Description:</strong> {selectedClassDetails.description}</p>}
          <p><strong>Hit Die:</strong> d{selectedClassDetails.hit_die}</p>
          {/* You can add more class details here */}
        </div>
      )}
    </div>
  );
}

export default Step2_ClassSelection;