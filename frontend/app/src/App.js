// frontend/app/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'; // Ensure this is imported

import ProjectListPage from './pages/ProjectListPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CreatePlayerCharacterPage from './pages/CreatePlayerCharacterPage';
import CharacterCreationWizard from './pages/CharacterCreationWizard';

function App() {
  return (
    <Router>
      <div className="App"> {/* This should be the main flex container */}
        
        <header className="top-bar">
          <Link to="/">Fable's Forge</Link> 
          <Link to="/projects" style={{ marginLeft: '20px' }}>Projects</Link>
          <Link to="/create-project">Create New Project</Link>
        </header>

        <main className="main-content-area">
          <Routes>
            <Route path="/" element={<ProjectListPage />} /> 
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/create-project" element={<CreateProjectPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/projects/:projectId/create-character" element={<CharacterCreationWizard />} />          </Routes>
        </main>

        <footer className="bottom-input-bar">
          <textarea placeholder="DM / AI Input will go here... (Future Feature)"></textarea>
        </footer>

      </div>
    </Router>
  );
}

export default App;