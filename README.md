# Fate's Forge

Fate's Forge is a web application designed to be an all-in-one interactive design and play environment for D&D-style text-based roleplaying games. It enables users to generate richly detailed fantasy worlds, develop intricate campaigns or one-shot adventures, create D&D 5e compliant player characters, and facilitate immersive text-based game sessions, all with planned integration for the Google Gemini API.

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
* **Backend (`backend`):** Node.js with Express.js.
    * Provides RESTful API endpoints.
    * Manages database interactions with PostgreSQL.
    * Planned integration with Google Gemini API.
* **Database (`00_database_setup`):** PostgreSQL.
    * Schema includes tables for:
        * `worlds`: Stores detailed, reusable world settings including core concepts, themes, defining features (as JSONB for unique lore like "The Axion Tide"), and links to its regions.
        * `world_regions`: Defines distinct geographical/political areas within a `world`.
        * `world_cultures`: Details cultural groups within regions, including aesthetics, traditions, and `naming_conventions` (JSONB for AI guidance).
        * `world_factions`: Describes organizations within regions or worlds.
        * `world_locations`: Defines specific points of interest (cities, dungeons) within regions, supporting hierarchical structures and map grid representations.
        * `campaigns` (formerly `projects`): Stores specific adventure/campaign data, linking to a `world` and containing plot details, quests, and campaign-specific NPCs/items.
        * `player_characters` (to be refactored to `campaign_characters`): Stores characters specific to a campaign instance. (Future: `player_character_templates` for reusable blueprints).
        * `npcs`: Stores NPC templates/archetypes (generic or world-specific) and unique named NPCs with their stat blocks.
        * `campaign_npc_instances`: Tracks specific instances of NPCs within a campaign, their current status, location, and any deviations from their template.
        * `campaign_item_instances`: Tracks items found within specific locations in a campaign, not carried by PCs.
        * `live_sessions`: Tracks the state of active game sessions for a campaign.
        * `dnd_*` lookup tables: For D&D 5e rules (races, classes, spells, items, skills, abilities, alignments, backgrounds, conditions, damage types, magic schools).

## Current Features Implemented (High-Level)

* **Database (`00_database_setup/001_schema.sql`, `00_database_setup/002_initial_data.sql`):**
    * Schema refactored to support distinct `worlds` and `campaigns` (formerly `projects`).
    * Tables for `world_regions`, `world_cultures` (with `naming_conventions`), `world_factions`, `world_locations` (linked to regions) are defined.
    * Tables for `npcs` (templates), `campaign_npc_instances`, and `campaign_item_instances` are defined to track entities in the world.
    * `player_characters` and `live_sessions` now link to `campaign_id`.
    * Initial data (`002_initial_data.sql`) updated to populate these new structures with examples from "Timeworn Bonds."
* **Backend (`backend/server.js`):**
    * Original API endpoints for Project Management (`POST /api/projects`, `GET /api/projects`, `GET /api/projects/:projectId`) are still in place but **require refactoring** to align with the new "Campaigns" and "Worlds" structure.
    * API endpoint for Character Creation (`POST /api/projects/:projectId/characters`) is functional but also **requires refactoring**.
    * **D&D Lookup APIs Implemented:**
        * `GET /api/dnd/abilities`
        * `GET /api/dnd/alignments`
        * `GET /api/dnd/backgrounds`
        * `GET /api/dnd/classes`
        * `GET /api/dnd/conditions`
        * `GET /api/dnd/damage-types`
        * `GET /api/dnd/items`
        * `GET /api/dnd/magic-schools`
        * `GET /api/dnd/races`
        * `GET /api/dnd/skills`
        * `GET /api/dnd/spells`
* **Frontend (`frontend/app`):**
    * Application shell with top bar, main content area, and bottom input bar.
    * Pages for listing "Projects," creating new "Projects," and viewing "Project" details (these **require UI and logic updates** to reflect "Campaigns").
    * **Multi-Step Character Creation Wizard (`CharacterCreationWizard.js`):**
        * Step 0: Character Name & Level input.
        * Step 1: Race Selection (fetches from `/api/dnd/races`, displays details).
        * Step 2: Class Selection (fetches from `/api/dnd/classes`, displays details).
        * Step 3: Ability Score Input (manual entry).
        * Step 4: Background & Alignment Selection (fetches from respective APIs, displays details).
    * Frontend components for wizard steps organized under `frontend/app/src/components/characterCreation/steps/`.

## Getting Started (Development)

**Prerequisites:**
* Node.js (v18+ recommended)
* npm
* PostgreSQL server
* Git

**1. Clone the Repository (if applicable once it's on GitHub):**
git clone https://github.com/ilikecaterpillars/fates-forge
**2. Setup Database:**
* Create a PostgreSQL database (e.g., `fates_forge_db`).
* Configure your database connection details in `backend/.env`.
* Run the schema script: `00_database_setup/001_schema.sql`.
* Run the initial data script: `00_database_setup/002_initial_data.sql`.

**3. Backend Setup:**
cd backend
npm install
rem # Create/update .env file with DB credentials, GEMINI_API_KEY, and BACKEND_PORT (e.g., 1001)
npm start
rem # Or: node server.jsThe backend should be running on `http://localhost:1001` (or your configured port).

**4. Frontend Setup:**
cd frontend/appnpm install
rem # Create/update .env file with PORT (e.g., 1000) and REACT_APP_API_BASE_URL=http://localhost:1001/apinpm start
The frontend should open on `http://localhost:1000` (or your configured port).

## Next Steps: Backend API Refactor & Expansion

The immediate next steps involve refactoring the backend API (`server.js`) to align with the new database schema (`campaigns`, `worlds`, etc.) and then expanding API capabilities.

1.  **Refactor Existing "Project" Endpoints to "Campaign" Endpoints:**
 * **`POST /api/projects` -> `POST /api/campaigns`**:
     * Update route and internal logic to use the `campaigns` table.
     * Modify to accept a `world_id` in the request body to link the new campaign to an existing world (from the `worlds` table).
     * Ensure plot-specific fields (e.g., `plot_arc_title`, `main_questline`, `dm_intro`) are saved to the `campaigns` table.
 * **`GET /api/projects` -> `GET /api/campaigns`**:
     * Update route and query to fetch from the `campaigns` table.
     * The response should include essential campaign data and potentially the name and ID of the linked world.
 * **`GET /api/projects/:projectId` -> `GET /api/campaigns/:campaignId`**:
     * Update route and parameter name (`campaignId`).
     * Modify query to fetch data from the `campaigns` table for the specified `campaignId`.
     * Join with the `worlds` table to include details of the world this campaign is set in.
     * Fetch related `campaign_characters` (formerly `player_characters`) for this `campaignId`.
     * Fetch related `live_sessions` data for this `campaignId`.
     * Fetch related `campaign_npc_instances` and `campaign_item_instances` for this campaign to provide a full picture of the campaign state.

2.  **Update Character Creation Endpoint:**
 * **`POST /api/projects/:projectId/characters` -> `POST /api/campaigns/:campaignId/characters`**:
     * Update route and parameter names.
     * Ensure it correctly inserts into `player_characters` (soon to be `campaign_characters`) using `campaign_id`.

3.  **Create New API Endpoints for Worlds Management:**
 * `POST /api/worlds`: To create a new world template. This would accept core world data and the `defining_features` JSONB. (Managing nested regions, cultures, factions within this single call can be complex; might initially focus on creating the world shell, then separate endpoints for adding details).
 * `GET /api/worlds`: To list all available world templates.
 * `GET /api/worlds/:worldId`: To get detailed information for a specific world, including its regions, cultures, factions, and locations (this will involve multiple joins or sequential queries).
 * `PUT /api/worlds/:worldId`: To update a world template.
 * (Consider `DELETE /api/worlds/:worldId` for later).
 * **Sub-resource Endpoints (Examples):**
     * `GET /api/worlds/:worldId/regions`
     * `POST /api/worlds/:worldId/regions`
     * `GET /api/regions/:regionId/cultures` (or `/api/worlds/:worldId/regions/:regionId/cultures`)
     * And so on for factions and locations within regions.

4.  **Create New API Endpoints for NPC and Item Instance Management:**
 * `POST /api/npcs`: Create a new NPC template (generic or world-specific).
 * `GET /api/npcs`: List all NPC templates (can be filtered, e.g., by `world_id` or generic).
 * `GET /api/npcs/:npcId`: Get details for a specific NPC template.
 * `POST /api/campaigns/:campaignId/npc-instances`: Add an instance of an NPC (from `npcs` table) to a campaign, specifying its location and initial state.
 * `GET /api/campaigns/:campaignId/locations/:locationId/npc-instances`: Get all NPC instances at a specific location within a campaign.
 * Similar CRUD endpoints for `campaign_item_instances`.

## Project Roadmap (Conceptual - Revised)

* **Phase 1 (Completed):** Initial D&D Lookup data, Basic Project/Character Backend & Frontend.
* **Phase 2 (In Progress):**
 * **Database:** Conceptual refactor (Projects->Campaigns, Worlds, Regions, Cultures, Factions, NPCs, Item Instances) - **Largely Complete.**
 * **Backend:** API Refactor & Expansion to support new schema. **(Current Focus)**
 * **Frontend:** Multi-step Character Creation Wizard UI (Name, Race, Class, Abilities, Background, Alignment implemented).
* **Phase 3:**
 * **Frontend:**
     * Complete Character Creation Wizard (Skills, Equipment, Spells, Details).
     * UI for managing Worlds (creating, viewing, editing world lore, regions, cultures, factions).
     * UI for managing Campaigns (creating, linking to worlds, viewing campaign plot, managing campaign characters).
* **Phase 4:** World & Campaign Design Module - Deeper AI Integration (e.g., generating regional details, cultural naming conventions based on stored rules, plot hooks, NPC dialogue).
* **Phase 5:** Adventure Direction Module - AI DM Assistance, Live Session Management UI (tracking initiative, conditions, NPC states dynamically).
* **Phase 6:** Player Character Templates (standalone, importable/exportable), Import/Export features for Worlds & Campaigns, PWA enhancements.
I've tried to make the "Next Steps" section very explicit about the backend API changes we discussed. This should give you a clear starting point for your next development session.Please replace the content of your README.md file with the text above. Let me know if it accurately captures our current status and planned work!