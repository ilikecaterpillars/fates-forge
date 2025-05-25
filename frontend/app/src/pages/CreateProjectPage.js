// frontend/app/src/pages/CreateProjectPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateProjectPage() {
  const [projectName, setProjectName] = useState('');
  const [suiteVersion] = useState('1.0.0'); 
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1001/api';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!projectName.trim()) {
      setError('Project name cannot be empty.');
      setSubmitting(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/projects`, { 
        projectName, 
        suiteVersion 
      });
      navigate('/projects'); 
    } catch (err) {
      console.error("Error creating project:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError(`Failed to create project. Check connection to ${API_BASE_URL}. (${err.message})`);
      }
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Create New Project</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="projectName">Project Name:</label>
          <input
            type="text"
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        {error && <p className="error-message">{error}</p>} 
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Project'}
        </button>
        <button type="button" className="cancel-button" onClick={() => navigate('/projects')} disabled={submitting}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default CreateProjectPage;