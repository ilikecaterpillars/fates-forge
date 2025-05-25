// frontend/app/src/pages/ProjectDetailPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function ProjectDetailPage() {
  const { projectId } = useParams(); 
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1001/api';

  useEffect(() => {
    if (projectId) {
      axios.get(`${API_BASE_URL}/projects/${projectId}`)
        .then(response => {
          setProject(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(`Error fetching project ${projectId}:`, err);
          setError(`Failed to load project details from ${API_BASE_URL}. (${err.message})`);
          setLoading(false);
        });
    }
  }, [projectId, API_BASE_URL]); // Add API_BASE_URL as a dependency

  if (loading) return <p>Loading project details...</p>;
  if (error) return <p className="error-message">{error}</p>; // Using error-message class
  if (!project) return <p>Project not found.</p>;

  return (
    <div>
      <h2>Project: {project.project_name}</h2>
      <p><strong>Suite Version at Creation:</strong> {project.suite_version_at_creation}</p>
      <p><strong>Created:</strong> {new Date(project.created_date).toLocaleString()}</p>
      <p><strong>Last Saved:</strong> {new Date(project.last_saved_date).toLocaleString()}</p>
      
      <hr style={{borderColor: '#4a4f58', margin: '20px 0'}} />

      <h3>World & Campaign Data</h3>
      {project.world_campaign_data ? (
        <>
          <p><strong>Core Concept:</strong> {project.world_campaign_data.core_concept || 'N/A'}</p>
          <p><strong>Themes:</strong> {project.world_campaign_data.themes || 'N/A'}</p>
          <p><strong>Generation Mode:</strong> {project.world_campaign_data.generation_mode || 'N/A'}</p>
        </>
      ) : (
        <p>No world and campaign data found for this project.</p>
      )}

      <hr style={{borderColor: '#4a4f58', margin: '20px 0'}} />

      <h3>Player Characters ({project.player_characters ? project.player_characters.length : 0})</h3>
      {project.player_characters && project.player_characters.length > 0 ? (
        <ul>
          {project.player_characters.map(pc => (
            <li key={pc.player_character_id}>{pc.character_name} - Level {pc.level}</li>
          ))}
        </ul>
      ) : (
        <p>No player characters created for this project yet.</p>
      )}

      <hr style={{borderColor: '#4a4f58', margin: '20px 0'}} />
      
      <h3>Live Session State</h3>
       {project.live_session_state ? (
        <>
          <p><strong>Narrative Focus:</strong> {project.live_session_state.narrative_focus || 'N/A'}</p>
          <p><strong>In-Game Date:</strong> {project.live_session_state.current_ingame_datetime || 'N/A'}</p>
        </>
      ) : (
        <p>No live session data found for this project.</p>
      )}

      <hr style={{borderColor: '#4a4f58', margin: '20px 0'}} />
      <Link to="/projects">Back to Project List</Link>
      
      <div style={{marginTop: '20px', border: '1px solid #4a4f58', padding: '10px', borderRadius: '4px'}}>
        <h4>Operate on this Project:</h4>
        <button>World & Campaign Design</button>
        <button>Character Creation/Management</button>
        <button>Run Adventure Session</button>
      </div>
    </div>
  );
}

export default ProjectDetailPage;