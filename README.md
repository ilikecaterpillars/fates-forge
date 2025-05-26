Fate's Forge
Fate's Forge is a web application designed to be an all-in-one interactive design and play environment for D&D-style text-based roleplaying games. It enables users to generate richly detailed fantasy worlds, develop intricate campaigns, create D&D 5e compliant player characters (as reusable blueprints and as campaign participants), and facilitate immersive text-based game sessions.
This project is currently under development.
Project Goal
To provide a comprehensive, integrated tool for:
World Design & Management: Crafting reusable, detailed fantasy worlds.
Campaign Creation & Management: Developing specific adventure narratives within a chosen World.
Character Creation & Management: * Creating reusable character blueprints/templates.
Creating specific characters for participation in campaigns (potentially based on templates).
Adventure Direction: (Future) Running live game sessions.
Architecture
Frontend (frontend/app): React application (Create React App).
Handles user interface and interaction.
Communicates with the backend via axios.
Uses react-router-dom for navigation.
Features a multi-step wizard for character creation.
Uses CSS Modules for component-specific styling and a global theme.css for theme variables.
Backend (backend): Node.js with Express.js.
Provides RESTful API endpoints.
Manages database interactions with PostgreSQL.
Database (00_database_setup): PostgreSQL.
Schema includes tables for worlds, campaigns, character templates, campaign-specific player characters, NPCs, items, and D&D lookup data.
Core Features & Structure
1. Database (00_database_setup/)
001_schema.sql: Defines the structure for:
D&D 5e lookup tables (dnd_abilities, dnd_races, dnd_classes, dnd_backgrounds, dnd_skills, dnd_items, dnd_spells, etc.).
Core application tables:
worlds: For foundational world settings.
campaigns: For specific adventures linked to a world.
character_templates: For reusable, worldless character blueprints. Includes related tables like template_proficiencies, template_known_spells, template_inventory.
player_characters: For characters specifically part of a campaign (linked via campaign_id). Includes related tables like character_proficiencies, character_known_spells, character_inventory.
npcs (templates), campaign_npc_instances, campaign_item_instances.
live_sessions (linked to campaigns).
002_initial_data.sql: Populates lookup tables and provides sample data.
2. Backend (backend/server.js)
Provides API endpoints for:
Worlds (/api/worlds)
Campaigns (/api/campaigns)
Character Templates (/api/character-templates) - For creating and listing general character blueprints.
Campaign-Specific Characters:
POST /api/campaigns/:campaignId/characters-from-template - To create a new character in a campaign by copying from an existing character template.
(Potentially POST /api/campaigns/:campaignId/characters for direct creation into a campaign, though the template-first approach is primary).
NPCs, D&D data lookups.
3. Frontend (frontend/app/src/)
App.js:
Sets up react-router-dom for navigation.
Implements AppLayout which includes a dynamic top navigation bar.
Uses CharacterWizardContext to allow the main top bar to change its content when the character creation wizard is active.
contexts/CharacterWizardContext.js:
Provides shared state for the character creation wizard (step configuration, current step, active status, navigation handlers) to be consumed by App.js (for the header) and CharacterCreationWizard.js (to update the state).
Pages (pages/):
HomePage/HomePage.js: Main entry point.
PlayerCharacterListPage/PlayerCharacterListPage.js:
Displays a list of created characters (fetches from /api/character-templates).
"CREATE NEW CHARACTER" button links to /create-player-character.
CharacterCreationPage/CharacterCreationWizard.js (or pages/CharacterCreationWizard.js):
A multi-step wizard for creating characters.
Receives a mode prop ("template" or "campaign").
If mode="template" (accessed via /create-player-character): Saves the character to /api/character-templates.
If mode="campaign" (accessed via /campaigns/:campaignId/create-character):
First saves the character as a template via POST /api/character-templates.
Then, uses the returned template ID to make a POST request to /api/campaigns/:campaignId/characters-from-template to create a copy linked to the campaign.
Uses useCharacterWizard hook to update shared context for the dynamic header in App.js.
Step order: BASIC INFO, CLASS, RACE, BACKGROUND, ABILITIES.
Campaign management pages (CampaignListPage.js, CreateCampaignPage.js, CampaignDetailPage.js).
Step Components (components/characterCreation/steps/):
Step0_BasicInfo.js (Name, Level)
Step1_ClassSelection.js
Step2_RaceSelection.js
Step3_BackgroundAlignment.js
Step4_AbilityScores.js
(Future: Steps for Equipment, Spells, Details, Review)
Styling:
theme.css: Global CSS custom properties for theming.
App.css: Global application styles, including styles for the dynamic top bar and its wizard step navigation items.
CSS Modules for component-specific styles (e.g., CharacterCreationWizard.module.css, PlayerCharacterListPage.module.css).
Current Status & Setup
The project is focused on implementing a robust character creation flow with a dynamic application header.
Workflow for Creating a Character:
User navigates to "Characters" (/player-characters).
Clicks "CREATE NEW CHARACTER".
Navigates to /create-player-character, which renders CharacterCreationWizard in mode="template".
The main application header in App.js dynamically changes to show wizard steps ("BASIC INFO", "CLASS", etc.).
User goes through the steps.
Upon completion, the character is saved as a template (POST /api/character-templates). User is navigated back to /player-characters.
Workflow for Creating a Character for a Campaign:
User navigates to a specific campaign's detail page (/campaigns/:campaignId).
Clicks "Create New Character" (for this campaign).
Navigates to /campaigns/:campaignId/create-character, rendering CharacterCreationWizard in mode="campaign".
The main application header dynamically changes to show wizard steps.
User goes through steps.
Upon completion:
a. The character is first saved as a template (POST /api/character-templates).
b. Then, a request is made to POST /api/campaigns/:campaignId/characters-from-template to create a campaign-specific copy.
c. User is navigated back to the campaign detail page.
Getting Started (Development Environment Reset)
Prerequisites:
Node.js (v14+ recommended for frontend, v18+ for backend if using latest Express 5 features)
npm (usually comes with Node.js)
PostgreSQL server
Git
1. Clone the Repository (if starting fresh):
git clone [your-repository-url]
cd fates-forge 


(Or navigate to your existing project directory)
2. Setup Database:
Ensure your PostgreSQL server is running.
Create a database (e.g., fates_forge_db).
Configure your database connection details in backend/.env. A backend/.env.example file should list required variables:
DB_USER=your_db_user
DB_HOST=localhost
DB_DATABASE=fates_forge_db
DB_PASSWORD=your_db_password
DB_PORT=5432
BACKEND_PORT=1001 
# Add GEMINI_API_KEY=YOUR_API_KEY later for AI features


Run the schema script to create tables:
psql -U your_db_user -d fates_forge_db -f 00_database_setup/001_schema.sql


Run the initial data script to populate lookup tables:
psql -U your_db_user -d fates_forge_db -f 00_database_setup/002_initial_data.sql


3. Backend Setup (backend/ directory):
cd backend
npm install
# Ensure .env file is created from .env.example and populated
npm start 


The backend should run on the port specified in .env (e.g., http://localhost:1001).
4. Frontend Setup (frontend/app/ directory):
cd frontend/app
npm install
# Create a .env file for the frontend (if it doesn't exist)
# It should contain:
# REACT_APP_API_BASE_URL=http://localhost:1001/api 
# PORT=1000 (or your preferred frontend port)
npm start


The frontend React app should open in your browser (e.g., http://localhost:1000).
Troubleshooting Common Issues:
Module Not Found Errors (Frontend): Double-check import paths in your JS/JSX files. Ensure components are correctly exported and imported. If you've moved files (like CharacterCreationWizard.js to a subfolder), update all import statements that refer to it.
ESLint Errors: These often point to syntax issues, undefined variables, or unused imports. Address them based on the error messages. The react/jsx-no-undef error specifically means a JSX component/variable was used without being defined or imported.
API Errors (404 Not Found, 500 Server Error): Check that your backend server is running and that the API endpoints in your frontend axios calls match the routes defined in backend/server.js. Look at the backend console for more detailed error messages.
Styling Issues:
Ensure CSS Modules (.module.css) are correctly imported and used (e.g., import styles from './MyComponent.module.css'; <div className={styles.myClass}>).
Verify that global styles (App.css, theme.css, index.css) are imported in frontend/app/src/index.js or App.js as appropriate.
Clear browser cache if CSS changes don't seem to apply.
This README provides a snapshot of the intended structure and functionality based on our recent discussions. I hope this helps you get a clear baseline to move forward from. I am ready to assist with specific errors or the next steps you want to take, and I will try my best to stay focused on your immediate requests.
