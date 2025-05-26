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
    * Application shell with conditional top bar/footer.
    * `HomePage.js` with initial "Tap to Start" view and main menu.
    * `CampaignListPage.js`, `CreateCampaignPage.js`, `CampaignDetailPage.js`.
    * Multi-Step Character Creation Wizard (`CharacterCreationWizard.js`) for basic info, race, class, ability scores, background, and alignment.
    * Universal `Button` component with consistent styling.
    * Implemented a `theme.css` using CSS Custom Properties (two-tiered: foundational palette and semantic variables) to manage the application's universal color scheme and other themeable aspects.

## Current Focus & Ongoing Work

The primary focus is on refining the user interface and ensuring consistent styling across the application using the newly established theming system.

1.  **Theming Integration (In Progress):**
    * The `theme.css` file, utilizing a two-tiered CSS Custom Property system (foundational palette and semantic variables), has been finalized.
    * **Currently refactoring all relevant CSS files** (`Button.module.css`, `App.css`, `HomePage.module.css`, and subsequently all other component and page-specific CSS) to use the variables defined in `theme.css`. This will ensure a consistent look and feel and allow for easy global theme adjustments.
2.  **Page-by-Page UI Styling and Refinement:**
    * Once the initial CSS refactoring for theming is complete for core files, the next step is to **systematically go through each existing page and component.**
    * This involves ensuring all UI elements (buttons, inputs, lists, text, layout containers, etc.) are styled consistently using the universal `Button` component (where applicable for button-like actions) and the theme variables from `theme.css`.
    * The process includes refining layouts on each page for better clarity, user experience, and responsiveness.
3.  **Character Creation Wizard - Completion:**
    * After the broader UI styling and theming pass, the focus will return to the `CharacterCreationWizard.js`.
    * **Enhancements to be completed:** Implementing the remaining sections for detailed character creation, including Skill selection, Proficiency choices (automatic and choice-based, derived from race, class, background), Equipment selection/management, and Spells known/prepared.

## Future Steps (Post-Current Focus)

* **UI for World Management:** Develop `WorldListPage.js`, `CreateWorldPage.js`, `WorldDetailPage.js`.
* **Further Backend API Expansion:** Add `PUT`/`DELETE` endpoints for all major entities, implement more granular endpoints for world sub-resources.
* **AI Integration Planning:** Begin prototyping interactions with Google Gemini API.
* **Comprehensive Mobile Responsiveness and UI Polish:** Ensure a seamless and polished experience across all devices and screen sizes.

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