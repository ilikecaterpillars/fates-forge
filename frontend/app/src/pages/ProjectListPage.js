// frontend/app/src/pages/ProjectListPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Construct API URL from environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1001/api';

  useEffect(() => {
    axios.get(`${API_BASE_URL}/projects`)
      .then(response => {
        setProjects(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching projects:", err);
        setError(`Failed to load projects from ${API_BASE_URL}. (${err.message})`);
        setLoading(false);
      });
  }, [API_BASE_URL]); // Add API_BASE_URL as a dependency if it could change (good practice)

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p className="error-message">{error}</p>; // Using error-message class

  return (
    <div>
      <h2>Projects</h2>
      <Link to="/create-project">Create New Project</Link>
      {projects.length === 0 ? (
        <p>No projects found. Create one!</p>
      ) : (
        <ul>
          {projects.map(project => (
            <li key={project.project_id}>
              <Link to={`/projects/${project.project_id}`}>
                {project.project_name}
              </Link>
              {' '}(ID: {project.project_id}, Version: {project.suite_version_at_creation})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectListPage;