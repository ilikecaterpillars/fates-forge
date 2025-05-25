# Fate's Forge

  Fate's Forge is a web application designed to be an all-in-one interactive design and play environment for D&D-style text-based roleplaying games. It enables users to generate richly detailed fantasy worlds, develop intricate campaigns or one-shot adventures, create D&D 5e compliant player characters, and facilitate immersive text-based game sessions, all powered by the Google Gemini API.

  This project is currently under development.

  ## Project Goal

  To provide a comprehensive, integrated tool for:
  * **World & Campaign Design:** Crafting lore, geography, factions, plots, quests, and unique names.
  * **Character Creation & Management:** Assisting in building D&D 5e characters and managing their progression.
  * **Adventure Direction:** Running live game sessions based on the created world, campaign, and characters using AI assistance.

  ## Current Architecture

  * **Frontend (`frontend/app`):** React application built with Create React App.
      * Handles user interface and interaction.
      * Communicates with the backend via `axios`.
      * Uses `react-router-dom` for navigation.
  * **Backend (`backend`):** Node.js with Express.js.
      * Provides RESTful API endpoints.
      * Manages database interactions.
      * Integrates with the Google Gemini API.
  * **Database (`00_database_setup`):** PostgreSQL.
      * Schema includes tables for projects, world/campaign data, player characters, live session state, and D&D 5e lookup tables (races, classes, spells, items, etc.).
  * **AI:** Google Gemini API (to be integrated for various generative and interactive tasks).

  ## Current Features Implemented (High-Level)

  * **Backend:**
      * API endpoints for Project Management:
          * `POST /api/projects` - Create a new project.
          * `GET /api/projects` - List all projects.
          * `GET /api/projects/:projectId` - Get details for a specific project.
          * `POST /api/projects/:projectId/characters` - Create a new character for a project.
      * Database schema defined for core entities and D&D lookup tables.
  * **Frontend:**
      * Application shell with top bar, main content area, and bottom input bar.
      * Pages for listing projects, creating new projects, and viewing project details.
      * Basic form for character creation (dropdowns for race/class etc. to be populated from API in future).
      * Layout improvements for desktop and mobile browsers (using `svh`).
      * API base URL configured via environment variables.

  ## Getting Started (Development)

  **Prerequisites:**
  * Node.js (v18+ recommended)
  * npm
  * PostgreSQL server
  * Git

  **1. Clone the Repository (if applicable once it's on GitHub):**
     ```
     git clone [https://github.com/YOUR_USERNAME/Fates-Forge.git](https://github.com/YOUR_USERNAME/Fates-Forge.git) 
     cd Fates-Forge
     ```
     *(Replace `YOUR_USERNAME` and `Fates-Forge.git` as appropriate)*

  **2. Setup Database:**
     * Create a PostgreSQL database (e.g., `fates_forge_db` - you might want to rename your DB from `saga_sculptor_db` or update your `.env` files accordingly).
     * Configure your database connection details in `backend/.env`.
     * Run the schema script: `00_database_setup/001_schema.sql`.
     * (Optional) Run any initial data scripts: `00_database_setup/002_initial_data.sql`.

  **3. Backend Setup:**
     ```
     cd backend
     npm install
     rem # Create/update .env file with DB credentials, GEMINI_API_KEY, and BACKEND_PORT (e.g., 1001)
     npm start 
     rem # Or: node server.js
     ```
     The backend should be running on `http://localhost:1001` (or your configured port).

  **4. Frontend Setup:**
     ```
     cd frontend/app
     npm install
     rem # Create/update .env file with PORT (e.g., 1000) and REACT_APP_API_BASE_URL=http://localhost:1001/api
     npm start
     ```
     The frontend should open on `http://localhost:1000` (or your configured port).

  ## Project Roadmap (Conceptual)

  * **Phase 1 (In Progress):** Foundational Backend & Frontend for Project & basic Character Management.
  * **Phase 2:** Full Character Creation/Management UI & Backend (including D&D lookup data APIs, skill/spell/item selection).
  * **Phase 3:** World & Campaign Design Module implementation.
  * **Phase 4:** Adventure Direction Module implementation with Gemini API integration for DM assistance.
  * **Phase 5:** PWA features, enhanced mobile experience, voice input.