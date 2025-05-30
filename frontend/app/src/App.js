// frontend/app/src/App.js
import React, { useEffect, useState } from 'react'; // Added useState for any AppLayout specific state if needed in future
import { 
    BrowserRouter as Router, 
    Routes, 
    Route, 
    useLocation, 
    useParams,     // Potentially used by PageFooter
    useNavigate    // Potentially used by PageFooter
} from 'react-router-dom';
import './App.css'; // Main app structural styles
import './theme.css'; // Your theme variables

// Context
import { CharacterWizardProvider, useCharacterWizard } from './contexts/CharacterWizardContext'; 

// Layout Components (You will need to create/rename these files)
import PageHeader from './components/layout/PageHeader'; // Formerly DynamicAppTopBar
import PageFooter from './components/layout/PageFooter'; // Formerly DynamicAppBottomBar and will contain its logic

// Page Components
import HomePage from './pages/HomePage/HomePage';
import CampaignListPage from './pages/CampaignListPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import CharacterCreationWizard from './pages/CharacterCreationPage/CharacterCreationWizard'; 
import PlayerCharacterListPage from './pages/PlayerCharacterListPage/PlayerCharacterListPage';
import Button from './components/common/Button/Button'; // Imported Button for PageFooter example

// --- Configuration for Component Visibility ---

// Patterns for routes where the Character Creation Wizard is active (used by PageHeader and PageFooter)
const WIZARD_ROUTE_PATTERNS = [
  '/create-player-character', 
  '/campaigns/:campaignId/create-character'
];

// Helper to check if the current path is a wizard route
const isWizardRoute = (pathname) => {
  return WIZARD_ROUTE_PATTERNS.some(pattern => {
    if (pattern.includes('/:campaignId')) {
      const base = pattern.split('/:campaignId')[0];
      // Regex to match /campaigns/ANY_ID/create-character
      const regex = new RegExp(`^${base}/[^/]+/create-character$`);
      return regex.test(pathname);
    }
    return pathname === pattern;
  });
};

// Patterns for routes where the APP-LEVEL header (.appHeader + PageHeader component) should be shown
const SHOW_APP_HEADER_PATTERNS = [
  '/create-campaign',                 
  '/campaigns/:campaignId$',          // Campaign Detail page (exact match)
  ...WIZARD_ROUTE_PATTERNS            // All wizard routes also show app header
];

// Helper to check if current path matches any of the given patterns
const pathMatchesAny = (pathname, patterns) => {
  return patterns.some(pattern => {
    if (!pattern.includes(':')) { // Exact match for non-parameterized routes
      return pathname === pattern;
    }
    // Regex for parameterized routes (e.g., /campaigns/:campaignId$)
    if (pattern.endsWith('$')) { // Indicates an "exact" parameterized match
        const regexPattern = '^' + pattern.replace(/:\w+\$/, '[^/]+') + '$';
        return new RegExp(regexPattern).test(pathname);
    }
    // For other generic parameterized patterns (more complex matching might be needed if paths get more varied)
    // This basic check is for patterns like /campaigns/:campaignId/some-other-segment
    // const basePattern = pattern.split('/:')[0];
    // return pathname.startsWith(basePattern);
    return false; // Fallback if pattern type isn't recognized here, rely on specific checks like isWizardRoute
  });
};


// --- Main App Layout Component ---
function AppLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const showAppHeaderRegion = pathMatchesAny(currentPath, SHOW_APP_HEADER_PATTERNS) || isWizardRoute(currentPath);

  // The .appFooter region (and thus PageFooter component) will always be rendered.
  // The PageFooter component itself will decide what content (if any) to display based on the route.

  return (
    <div className="App"> {/* Root flex container for the app */}
      
      {showAppHeaderRegion && (
        <header className="appHeader"> {/* App-level header shell (no padding) */}
          <PageHeader /> {/* This component manages its own internal content and padding */}
        </header>
      )}
      
      <main className="appBody"> {/* App-level body shell (no padding, non-scrollable, flex-grow) */}
        {/* Page components rendered by <Routes> will fill this .appBody.
            They will have their own root div (e.g. styles.pageContent) that uses height:100%.
            Internal elements within the page component will handle padding and scrolling.
        */}
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
          {/* Add other routes here */}
        </Routes>
      </main>

      <footer className="appFooter"> {/* App-level footer shell (no padding) */}
          <PageFooter /> {/* This component manages its own internal content, padding, and layout */}
      </footer>
      
    </div>
  );
}

// --- Root App Component ---
function App() {
  return (
    <Router>
      <CharacterWizardProvider> {/* Context provider wraps layout and pages */}
        <AppLayout />
      </CharacterWizardProvider>
    </Router>
  );
}

export default App;