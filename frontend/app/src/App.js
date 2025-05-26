// frontend/app/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage/HomePage';
import CampaignListPage from './pages/CampaignListPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import CharacterCreationWizard from './pages/CharacterCreationWizard';

function AppLayout() {
  const location = useLocation();
  const [showBars, setShowBars] = useState(false);

  useEffect(() => {
    // Only show bars if NOT on the root/home page.
    // HomePage itself will never trigger the global bars.
    if (location.pathname !== '/') {
      setShowBars(true);
    } else {
      setShowBars(false);
    }
  }, [location.pathname]);

  return (
    <div className="App">
      {showBars && (
        <header className="top-bar">
          <Link to="/">Fate's Forge</Link>
          <Link to="/campaigns" style={{ marginLeft: '20px' }}>Campaigns</Link>
          <Link to="/create-campaign">Create New Campaign</Link>
        </header>
      )}

      <main className="main-content-area">
        <Routes>
          {/* HomePage no longer needs onStartApp as App.js controls bars by route */}
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignListPage />} />
          <Route path="/create-campaign" element={<CreateCampaignPage />} />
          <Route path="/campaigns/:campaignId" element={<CampaignDetailPage />} />
          <Route path="/campaigns/:campaignId/create-character" element={<CharacterCreationWizard />} />
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