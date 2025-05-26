// frontend/app/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import CampaignListPage from './pages/CampaignListPage'; 
import CreateCampaignPage from './pages/CreateCampaignPage'; 
import CampaignDetailPage from './pages/CampaignDetailPage';
import CharacterCreationWizard from './pages/CharacterCreationWizard';

function App() {
  return (
    <Router>
      <div className="App">
        
        <header className="top-bar">
          <Link to="/">Fate's Forge</Link> 
          <Link to="/campaigns" style={{ marginLeft: '20px' }}>Campaigns</Link> 
          <Link to="/create-campaign">Create New Campaign</Link>
        </header>

        <main className="main-content-area">
          <Routes>
            <Route path="/" element={<CampaignListPage />} /> 
            <Route path="/campaigns" element={<CampaignListPage />} /> 
            <Route path="/create-campaign" element={<CreateCampaignPage />} />
            <Route path="/campaigns/:campaignId" element={<CampaignDetailPage />} />
            <Route path="/campaigns/:campaignId/create-character" element={<CharacterCreationWizard />} /> 
          </Routes>
        </main>

        <footer className="bottom-input-bar">
          <textarea placeholder="DM / AI Input will go here... (Future Feature)"></textarea>
        </footer>

      </div>
    </Router>
  );
}

export default App;