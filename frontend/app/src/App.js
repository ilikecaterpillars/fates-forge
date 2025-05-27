// frontend/app/src/App.js
import React, { useEffect, useState }from 'react'; // Added useState and useEffect for AppLayout
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css'; // Main app styles
import './theme.css'; // Your theme variables

import { CharacterWizardProvider, useCharacterWizard } from './contexts/CharacterWizardContext'; 

// Page Components
import HomePage from './pages/HomePage/HomePage';
import CampaignListPage from './pages/CampaignListPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import CharacterCreationWizard from './pages/CharacterCreationPage/CharacterCreationWizard'; 
import PlayerCharacterListPage from './pages/PlayerCharacterListPage/PlayerCharacterListPage';

// --- Configuration for Component Visibility ---

// Patterns for routes where the Character Creation Wizard is active
const WIZARD_ROUTE_PATTERNS = [
  '/create-player-character', 
  '/campaigns/:campaignId/create-character'
];

// Helper to check if the current path is a wizard route
const isWizardRoute = (pathname) => {
  return WIZARD_ROUTE_PATTERNS.some(pattern => {
    if (pattern.includes('/:campaignId')) {
      const base = pattern.split('/:campaignId')[0];
      const regex = new RegExp(`^${base}/[^/]+/create-character$`);
      return regex.test(pathname);
    }
    return pathname === pattern;
  });
};

// Patterns for routes where the MAIN header (DynamicAppTopBar) should be shown
const SHOW_HEADER_PATTERNS = [
  '/create-campaign',                 // Create Campaign page
  '/campaigns/:campaignId$',          // Campaign Detail page (exact match for pattern like /campaigns/123)
  ...WIZARD_ROUTE_PATTERNS            // All wizard routes
];

// Patterns for routes where the GLOBAL footer should be shown
const SHOW_FOOTER_PATTERNS = [
  '/create-campaign',
  '/campaigns/:campaignId$'           // Campaign Detail page
];

// Helper to check if current path matches any of the given patterns
const pathMatchesAny = (pathname, patterns) => {
  return patterns.some(pattern => {
    // Exact match for non-parameterized routes
    if (!pattern.includes(':')) {
      return pathname === pattern;
    }
    // Regex for parameterized routes (e.g., /campaigns/:campaignId)
    // This will match /campaigns/123 but not /campaigns/123/something-else
    if (pattern.endsWith('$')) { // Indicates an "exact" parameterized match
        const regexPattern = '^' + pattern.replace(/:\w+\$/, '[^/]+') + '$';
        return new RegExp(regexPattern).test(pathname);
    }
    // For wizard routes that might be nested or complex (already handled by isWizardRoute)
    // For other generic parameterized patterns (if any in future), a simple startsWith might be too broad.
    // The wizard check is more specific.
    return false; 
  });
};


// --- Components ---

function DynamicAppTopBar() {
  const wizardContext = useCharacterWizard();
  const location = useLocation();

  // Determine if the wizard navigation should be active for the current route
  const shouldDisplayWizardNav = wizardContext && wizardContext.isWizardActive && isWizardRoute(location.pathname);

  return (
    <header className="top-bar">
      {shouldDisplayWizardNav && wizardContext.wizardSteps && wizardContext.wizardSteps.length > 0 ? (
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
            {step.name}
          </div>
        ))
      ) : (
        // Default header links are now removed.
        // This part will be empty if the header is shown on a non-wizard page.
        null 
      )}
    </header>
  );
}

function AppLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isCurrentlyOnWizardRoute = isWizardRoute(currentPath); 

  const showHeader = pathMatchesAny(currentPath, SHOW_HEADER_PATTERNS);
  const showMainFooter = !isCurrentlyOnWizardRoute && pathMatchesAny(currentPath, SHOW_FOOTER_PATTERNS);

  return (
    <div className="App"> 
      {showHeader && <DynamicAppTopBar />}
      
      {/* Main content area will now be non-scrolling by default. 
          Individual pages/components inside it must manage their own scrolling if needed. */}
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


function App() {
  return (
    <Router>
      <CharacterWizardProvider>
        <AppLayout />
      </CharacterWizardProvider>
    </Router>
  );
}

export default App;