# Fate's Forge

Fate's Forge is a web application designed to be an all-in-one interactive design and play environment for D&D-style text-based roleplaying games. It enables users to generate richly detailed fantasy worlds, develop intricate campaigns or one-shot adventures, create D&D 5e compliant player characters, and facilitate immersive text-based game sessions, with planned integration for the Google Gemini API.

This project is currently under development.

## Project Goal

To provide a comprehensive, integrated tool for:
* **World Design & Management:** Crafting reusable, detailed fantasy worlds with unique lore, geography, cultures (including naming conventions), factions, and specific locations.
* **Campaign Creation & Management:** Developing specific adventure narratives, plots, and quests set within a chosen World.
* **Character Creation & Management:** Assisting in building D&D 5e characters (both as reusable templates/blueprints and as specific participants in a campaign) and managing their progression.
* **Adventure Direction:** Running live game sessions based on the created world, campaign, and characters, with AI assistance.

## Current Architecture

* **Frontend (`frontend/app`):** React application built with Create React App.
    * Handles user interface and interaction.
    * Communicates with the backend via `axios`.
    * Uses `react-router-dom` for navigation.
    * Features a multi-step wizard for character creation.
    * Includes a `HomePage` with a "Tap to Start" mechanic leading to a main menu.
    * Uses CSS Modules for styling, including a universal `Button` component.
* **Backend (`backend`):** Node.js with Express.js.
    * Provides RESTful API endpoints.
    * Manages database interactions with PostgreSQL.
    * Planned integration with Google Gemini API.
* **Database (`00_database_setup`):** PostgreSQL.
    * Schema includes tables for: `worlds`, `world_regions`, `world_cultures`, `world_factions`, `world_locations`, `campaigns`, `player_characters` (to be `campaign_characters`), `npcs`, `campaign_npc_instances`, `campaign_item_instances`, `live_sessions`, and `dnd_*` lookup tables.

## Current Features Implemented (High-Level)

* **Database (`00_database_setup/001_schema.sql`, `00_database_setup/002_initial_data.sql`):**
    * Schema supports distinct `worlds` and `campaigns`.
    * Tables for `world_regions`, `world_cultures` (with `naming_conventions`), `world_factions`, `world_locations` are defined.
    * Tables for `npcs` (templates), `campaign_npc_instances`, and `campaign_item_instances` are defined.
    * `player_characters` and `live_sessions` link to `campaign_id`.
    * Initial data populates these structures.
* **Backend (`backend/server.js`):**
    * **Refactored Campaign Endpoints:**
        * `POST /api/campaigns` (creates a new campaign linked to a world, initializes live session)
        * `GET /api/campaigns` (lists all campaigns with linked world info)
        * `GET /api/campaigns/:campaignId` (gets detailed campaign data including world, characters, NPC/item instances, live session)
    * **Refactored Character Creation Endpoint:**
        * `POST /api/campaigns/:campaignId/characters` (creates a character within a campaign)
    * **New World Management Endpoints:**
        * `POST /api/worlds`
        * `GET /api/worlds`
        * `GET /api/worlds/:worldId` (includes regions)
    * **New NPC Template Endpoints:**
        * `POST /api/npcs` (generic or world-specific)
        * `GET /api/npcs` (filterable by `world_id`)
        * `GET /api/npcs/:npcId`
    * **New Campaign NPC Instance Endpoint:**
        * `POST /api/campaigns/:campaignId/npc-instances`
    * **D&D Lookup APIs Implemented:**
        * `GET /api/dnd/abilities`, `alignments`, `backgrounds`, `classes`, `conditions`, `damage-types`, `items`, `magic-schools`, `races`, `skills`, `spells`.
* **Frontend (`frontend/app`):**
    * Application shell with conditional top bar/footer (hidden on initial `HomePage` view).
    * `HomePage.js`:
        * Initial "Tap to Start" view.
        * Main menu view with navigation buttons (Campaigns, New Campaign).
        * Uses a universal `Button` component.
        * Basic mobile responsiveness for the initial screen and main menu.
    * `CampaignListPage.js`: Fetches and displays campaigns from `/api/campaigns`.
    * `CreateCampaignPage.js`: Allows creation of new campaigns, posts to `/api/campaigns`, includes world selection.
    * `CampaignDetailPage.js`: Fetches and displays detailed campaign data from `/api/campaigns/:campaignId`.
    * **Multi-Step Character Creation Wizard (`CharacterCreationWizard.js`):**
        * Uses `campaignId` from URL.
        * POSTs to `/api/campaigns/:campaignId/characters`.
        * Step 0: Name & Level.
        * Step 1: Race Selection.
        * Step 2: Class Selection (stores `hit_die`).
        * Step 3: Ability Scores (Max HP input moved here, with basic auto-suggestion for Lvl 1).
        * Step 4: Background & Alignment Selection.
    * Basic CSS Module structure initiated with `HomePage` and `Button` components.

## Getting Started (Development)

**Prerequisites:**
* Node.js (v18+ recommended)
* npm
* PostgreSQL server
* Git

**1. Clone the Repository (if applicable once it's on GitHub):**
   ```bash
   git clone [https://github.com/ilikecaterpillars/fates-forge](https://github.com/ilikecaterpillars/fates-forge) 
   ```
**2. Setup Database:**
* Create a PostgreSQL database (e.g., `fates_forge_db`).
* Configure your database connection details in `backend/.env`.
* Run the schema script: `00_database_setup/001_schema.sql`.
* Run the initial data script: `00_database_setup/002_initial_data.sql`.

**3. Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create/update .env file with DB credentials, GEMINI_API_KEY, and BACKEND_PORT (e.g., 1001)
   npm start
   ```
   The backend should be running on `http://localhost:1001` (or your configured port).

**4. Frontend Setup:**
   ```bash
   cd frontend/app
   npm install
   # Create/update .env file with PORT (e.g., 1000) and REACT_APP_API_BASE_URL=http://localhost:1001/api
   npm start
   ```
   The frontend should open on `http://localhost:1000` (or your configured port).

## Next Steps (Focus Areas)

* **Frontend - Character Creation Wizard Enhancements:**
    * Implement Skill & Proficiency selection (automatic based on race/class/background, and choice-based).
    * Add sections for Equipment and Spells.
* **Frontend - UI for World Management:**
    * `WorldListPage.js`, `CreateWorldPage.js`, `WorldDetailPage.js`.
* **Frontend - UI Polish:**
    * Improve `CampaignDetailPage.js` to display its rich data more effectively (beyond raw JSON).
    * Continue refining mobile responsiveness across all views, aiming for a no-scroll experience where intended.
    * Implement page transitions for smoother navigation.
* **Backend - Further API Expansion:**
    * `PUT` / `DELETE` endpoints for Campaigns, Worlds, Characters, NPCs, etc.
    * More granular endpoints for world sub-resources (cultures, factions, locations within regions).
    * Endpoints for `campaign_item_instances`.
* **AI Integration Planning:** Begin prototyping interactions with Google Gemini API for world generation, NPC dialogue, adventure hooks, etc.