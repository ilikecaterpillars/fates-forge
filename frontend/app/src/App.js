// frontend/app/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css'; // Main app styles
import './theme.css'; // Your theme variables

// 1. Import Context Provider and Hook
// Ensure this path is correct based on where you saved CharacterWizardContext.js
import { CharacterWizardProvider, useCharacterWizard } from './contexts/CharacterWizardContext'; 

// Page Components
import HomePage from './pages/HomePage/HomePage';
import CampaignListPage from './pages/CampaignListPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
// Adjust path if you moved CharacterCreationWizard, e.g., './pages/CharacterCreationPage/CharacterCreationWizard'
import CharacterCreationWizard from './pages/CharacterCreationWizard'; 
import PlayerCharacterListPage from './pages/PlayerCharacterListPage/PlayerCharacterListPage';

// Define which routes are for the character wizard
const WIZARD_ROUTES_PATTERNS = [
  '/create-player-character', 
  '/campaigns/:campaignId/create-character'
];

// Define routes where the default global footer bar should be hidden
const NO_GLOBAL_FOOTER_PATHS = ['/', '/player-characters']; 

// Component to render the dynamic top bar content
function DynamicAppTopBar() {
  const wizardContext = useCharacterWizard(); // Consume the context
  const location = useLocation();

  // Check if the current route is a wizard route
  const isWizardRouteActive = WIZARD_ROUTES_PATTERNS.some(pattern => {
    if (pattern.includes('/:campaignId')) {
      const routeBase = pattern.split('/:campaignId')[0]; 
      return location.pathname.startsWith(basePattern) && location.pathname.endsWith('/create-character');
    }
    return location.pathname === pattern;
  });

  const displayWizardNav = wizardContext && wizardContext.isWizardActive && isWizardRouteActive;

  return (
    <header className="top-bar"> {/* Uses styles from App.css for the bar itself */}
      {displayWizardNav && wizardContext.wizardSteps && wizardContext.wizardSteps.length > 0 ? (
        // Render wizard steps
        wizardContext.wizardSteps.map((step, index) => (
          <div
            key={step.id || step.name} 
            className={`nav-step-in-app-header ${wizardContext.currentDisplayStep === index ? 'active' : ''} ${!wizardContext.visitedSteps?.[index] ? 'disabled' : ''}`}
            onClick={() => {
              if (wizardContext.visitedSteps?.[index] && typeof wizardContext.handleNavStepClick === 'function') {
                wizardContext.handleNavStepClick(index);
              }
            }}
            role="button"
            tabIndex={wizardContext.visitedSteps?.[index] ? 0 : -1}
            onKeyDown={(e) => { 
              if ((e.key === 'Enter' || e.key === ' ') && wizardContext.visitedSteps?.[index] && typeof wizardContext.handleNavStepClick === 'function') {
                e.preventDefault(); 
                wizardContext.handleNavStepClick(index);
              }
            }}
          >
            {step.name} {/* Display step name (e.g., "BASIC INFO") */}
          </div>
        ))
      ) : (
        // Render default navigation links
        <>
          <Link to="/">Fate's Forge</Link>
          <Link to="/campaigns">Campaigns</Link>
          <Link to="/player-characters">Characters</Link>
        </>
      )}
    </header>
  );
}

// Main AppLayout component
function AppLayout() {
  const location = useLocation();
  const [showMainFooter, setShowMainFooter] = useState(true);

  useEffect(() => {
    const isWizardRouteActive = WIZARD_ROUTES_PATTERNS.some(pattern => {
      if (pattern.includes('/:campaignId')) {
        const basePattern = pattern.split('/:campaignId')[0];
        return location.pathname.startsWith(basePattern) && location.pathname.endsWith('/create-character');
      }
      return location.pathname === pattern;
    });

    if (isWizardRouteActive || NO_GLOBAL_FOOTER_PATHS.some(path => location.pathname === path || (path !=='/' && location.pathname.startsWith(path)))) {
      setShowMainFooter(false);
    } else {
      setShowMainFooter(true);
    }
  }, [location.pathname]);

  return (
    <div className="App"> 
      <DynamicAppTopBar /> 
      
      <main className="main-content-area">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignListPage />} />
          <Route path="/create-campaign" element={<CreateCampaignPage />} />
          <Route path="/campaigns/:campaignId" element={<CampaignDetailPage />} />
          
          <Route 
            path="/campaigns/:campaignId/create-character" 
            element={<CharacterCreationWizard mode="campaign" />} 
          />
          
          <Route path="/player-characters" element={<PlayerCharacterListPage />} />
          
          <Route 
            path="/create-player-character" 
            element={<CharacterCreationWizard mode="template" />} 
          />
        </Routes>
      </main>

      {showMainFooter && (
        <footer className="bottom-input-bar">
          <textarea placeholder="DM / AI Input will go here... (Future Feature)"></textarea>
        </footer>
      )}
    </div>
  );
}

// Main App component: Wrap the entire application with the CharacterWizardProvider
function App() {
  return (
    <Router>
      <CharacterWizardProvider> {/* Provider now wraps the whole app */}
        <AppLayout />
      </CharacterWizardProvider>
    </Router>
  );
}

export default App;
