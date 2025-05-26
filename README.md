# Fate's Forge

Fate's Forge is a web application designed to be an all-in-one interactive design and play environment for D&D-style text-based roleplaying games. It enables users to generate richly detailed fantasy worlds, develop intricate campaigns or one-shot adventures, create D&D 5e compliant player characters, and facilitate immersive text-based game sessions, with planned integration for the Google Gemini API.

This project is currently under development.

## Project Goal

To provide a comprehensive, integrated tool for:
* **World Design & Management:** Crafting reusable, detailed fantasy worlds with unique lore, geography, cultures (including naming conventions), factions, and specific locations.
* **Campaign Creation & Management:** Developing specific adventure narratives, plots, and quests set within a chosen World.
* **Character Creation & Management:** Assisting in building D&D 5e characters (both as reusable templates/blueprints and as specific participants in a campaign) and managing their progression.
* **Adventure Direction:** Running live game sessions based on the created world, campaign, and characters, with AI assistance.

## Architecture

* **Frontend (`frontend/app`):** React application built with Create React App.
    * Handles user interface and interaction.
    * Communicates with the backend via `axios`.
    * Uses `react-router-dom` for navigation.
    * Features a multi-step wizard for character creation.
    * Includes a `HomePage` with a main menu.
    * Uses CSS Modules for styling, including a universal `Button` component and a `theme.css` file for managing CSS Custom Properties (variables) for a universal color scheme.
* **Backend (`backend`):** Node.js with Express.js.
    * Provides RESTful API endpoints.
    * Manages database interactions with PostgreSQL.
* **Database (`00_database_setup`):** PostgreSQL.
    * Schema includes tables for worlds, campaigns, characters, NPCs, items, game sessions, and D&D lookup data.

## Current Features Implemented (High-Level)

* **Database (`00_database_setup/001_schema.sql`, `00_database_setup/002_initial_data.sql`):**
    * Schema supports distinct `worlds` and `campaigns`.
    * Tables for `world_regions`, `world_cultures` (with `naming_conventions`), `world_factions`, `world_locations` are defined.
    * Tables for `npcs` (templates), `campaign_npc_instances`, and `campaign_item_instances` are defined.
    * `player_characters` and `live_sessions` link to `campaign_id`.
* **Backend (`backend/server.js`):**
    * Endpoints for `worlds`, `campaigns`, character creation within campaigns, NPC templates, campaign NPC instances, and D&D data lookups.
* **Frontend (`frontend/app`):**
    * Application shell with conditional top bar/footer based on route.
    * `HomePage.js` with initial "Tap to Start" view and main menu.
    * `CampaignListPage.js`, `CreateCampaignPage.js`, `CampaignDetailPage.js`.
    * **NEW:** `PlayerCharacterListPage.js` for displaying "worldless" character templates:
        * Styled to resemble D&D Beyond's character list.
        * Features initial-letter avatars and a three-line info display (Name, Level/Race, Class/Subclass).
        * Includes a "Back to Main Menu" button and a "Create New Character" button.
        * Fixed header (title, back button) and fixed footer (create button) with a scrollable character list.
        * Scrollbar on the character list is hidden via CSS.
    * Multi-Step Character Creation Wizard (`CharacterCreationWizard.js`) for creating characters *within a campaign*.
    * Universal `Button` component with consistent styling (now more rectangular with 10px radius corners).
    * Implemented a `theme.css` using CSS Custom Properties (two-tiered: foundational palette and semantic variables) to manage the application's universal color scheme and other themeable aspects like border-radius.
    * CSS Modules used for component-specific styling.

## Current Focus & Ongoing Work

The primary focus has been on establishing a consistent UI and theming system, and initial implementation of key list and creation pages. Recent work completed:

1.  **Theming Integration:**
    * The `theme.css` file, utilizing a two-tiered CSS Custom Property system, has been established and refined (e.g., button radius updated to `10px`).
    * Core components like `Button.module.css` and global styles in `App.css` have been updated to use these theme variables.
2.  **Player Character List Page (`PlayerCharacterListPage.js`):**
    * **UI Finalized:** The layout for displaying worldless character templates is complete, including fixed headers/footers, a scrollable list with hidden scrollbars, initial-letter avatars, and D&D Beyond-inspired styling.
    * Button widths and page content widths have been standardized to align with the `HomePage` menu.
    * Navigation (back to menu, create new template) is in place (though create template leads to a placeholder route).
3.  **HomePage Navigation:**
    * "Characters" button now correctly links to the `PlayerCharacterListPage`.
    * Navigation to the main menu view of `HomePage` from other pages (like `PlayerCharacterListPage`) now correctly bypasses the initial welcome screen.

## Future Steps (Post-Current Focus)

* **Character Template Backend & Wizard:**
    * Define database schema and create backend API endpoints for "worldless character templates".
    * Implement fetching real data in `PlayerCharacterListPage.js`.
    * Develop/Adapt a Character Creation Wizard for these templates (linking from the "Create New Character" button).
* **UI for World Management:** Develop `WorldListPage.js`, `CreateWorldPage.js`, `WorldDetailPage.js`.
* **Character Creation Wizard - Campaign Characters:**
    * Complete enhancements for the existing `CharacterCreationWizard.js` for campaign characters: Skill selection, Proficiency choices, Equipment, Spells.
* **Further Backend API Expansion:** Add `PUT`/`DELETE` endpoints for all major entities.
* **AI Integration Planning:** Begin prototyping interactions with Google Gemini API.
* **Comprehensive Mobile Responsiveness and UI Polish:** Continue to ensure a seamless experience.

## Getting Started (Development)

**Prerequisites:**
* Node.js (v18+ recommended)
* npm
* PostgreSQL server
* Git

**1. Clone the Repository:**
   \`\`\`bash
   git clone [repository-url] 
   \`\`\`
**2. Setup Database:**
* Create a PostgreSQL database (e.g., \`fates_forge_db\`).
* Configure your database connection details in \`backend/.env\`.
* Run the schema script: \`00_database_setup/001_schema.sql\`.
* Run the initial data script: \`00_database_setup/002_initial_data.sql\`.

**3. Backend Setup:**
   \`\`\`bash
   cd backend
   npm install
   # Create/update .env file with DB credentials, GEMINI_API_KEY, and BACKEND_PORT
   npm start
   \`\`\`
   The backend should be running on \`http://localhost:1001\` (or your configured port).

**4. Frontend Setup:**
   \`\`\`bash
   cd frontend/app
   npm install
   # Create/update .env file with PORT and REACT_APP_API_BASE_URL=http://localhost:1001/api
   # Ensure src/index.js imports src/theme.css (and src/index.css if it has other global styles)
   npm start
   \`\`\`
   The frontend should open on \`http://localhost:1000\` (or your configured port).