// frontend/app/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage/HomePage';
import CampaignListPage from './pages/CampaignListPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import CharacterCreationWizard from './pages/CharacterCreationWizard';
import PlayerCharacterListPage from './pages/PlayerCharacterListPage/PlayerCharacterListPage';

const noBarsPaths = ['/', '/player-characters']; 

function AppLayout() {
  const location = useLocation();
  const [showBars, setShowBars] = useState(true);

  useEffect(() => {
    if (noBarsPaths.includes(location.pathname)) {
      setShowBars(false);
    } else {
      setShowBars(true);
    }
  }, [location.pathname]);

  return (
    <div className="App">
      {showBars && (
        <header className="top-bar">
          <Link to="/">Fate's Forge</Link>
          <Link to="/campaigns" style={{ marginLeft: '20px' }}>Campaigns</Link>
          <Link to="/player-characters" style={{ marginLeft: '20px' }}>Characters</Link>
        </header>
      )}

      <main className="main-content-area">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignListPage />} />
          <Route path="/create-campaign" element={<CreateCampaignPage />} />
          <Route path="/campaigns/:campaignId" element={<CampaignDetailPage />} />
          <Route path="/campaigns/:campaignId/create-character" element={<CharacterCreationWizard />} />
          <Route path="/player-characters" element={<PlayerCharacterListPage />} />
          {/* Add route for /create-player-character-template when ready */}
        </Routes>
      </main>

      {showBars && (
        <footer className="bottom-input-bar">
          <textarea placeholder="DM / AI Input will go here... (Future Feature)"></textarea>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;