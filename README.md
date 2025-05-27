# Fate's Forge

Fate's Forge is a web application designed to be an all-in-one interactive design and play environment for D&D-style text-based roleplaying games. It enables users to generate richly detailed fantasy worlds, develop intricate campaigns, create D&D 5e compliant player characters (as reusable blueprints and as campaign participants), and will in the future facilitate immersive text-based game sessions.

This project is currently under development.

## Project Goal

To provide a comprehensive, integrated tool for:

* **World Design & Management:** Crafting reusable, detailed fantasy worlds.
* **Campaign Creation & Management:** Developing specific adventure narratives within a chosen World.
* **Character Creation & Management:**
    * Creating reusable character blueprints/templates.
    * Creating specific characters for participation in campaigns (potentially based on templates).
* **Adventure Direction:** (Future) Running live game sessions.

## Architecture

* **Frontend (`frontend/app`):** React application, bootstrapped with Create React App.
    * Handles user interface and interaction.
    * Communicates with the backend via `axios`.
    * Uses `react-router-dom` for navigation.
    * Features a multi-step wizard for character creation.
    * Uses CSS Modules for component-specific styling (e.g., `HomePage.module.css`, `CharacterCreationWizard.module.css`, `PlayerCharacterListPage.module.css`) and a global `theme.css` for theme variables.
* **Backend (`backend`):** Node.js with Express.js.
    * Provides RESTful API endpoints.
    * Manages database interactions with PostgreSQL.
* **Database (`00_database_setup`):** PostgreSQL.
    * Schema includes tables for worlds, campaigns, character templates, campaign-specific player characters, NPCs, items, and D&D lookup data.

## Core Features & Structure

### 1. Database (`00_database_setup/`)

* **`001_schema.sql`**: Defines the structure for:
    * D&D 5e lookup tables (e.g., `dnd_abilities`, `dnd_races`, `dnd_classes`, `dnd_items`, `dnd_spells`).
    * Core application tables:
        * `worlds`: For foundational world settings.
        * `campaigns`: For specific adventures linked to a world.
        * `character_templates`: For reusable, worldless character blueprints. Includes related tables for proficiencies, spells, and inventory.
        * `player_characters`: For characters specifically part of a campaign. Includes related tables for proficiencies, spells, and inventory.
        * `npcs` (templates), `campaign_npc_instances`, `campaign_item_instances`.
        * `live_sessions` (linked to campaigns).
* **`002_initial_data.sql`**: Populates lookup tables and provides sample data for core D&D entities and example world/campaign data.

### 2. Backend (`backend/server.js`)

Provides API endpoints for:

* Worlds (`/api/worlds`)
* Campaigns (`/api/campaigns`)
* Character Templates (`/api/character-templates`): For creating and listing general character blueprints.
* Campaign-Specific Characters:
    * `POST /api/campaigns/:campaignId/characters-from-template`: Creates a new character in a campaign by copying from an existing character template.
* NPCs (`/api/npcs`)
* D&D data lookups (e.g., `/api/dnd/races`, `/api/dnd/classes`).

### 3. Frontend (`frontend/app/src/`)

* **`App.js`**:
    * Sets up `react-router-dom` for navigation.
    * Implements `AppLayout` which includes a `DynamicAppTopBar`.
    * Uses `CharacterWizardContext` to allow the main top bar to change its content when the character creation wizard is active.
* **`contexts/CharacterWizardContext.js`**:
    * Provides shared state for the character creation wizard (step configuration, current step, active status, navigation handlers). This state is consumed by `App.js` (for the header) and `CharacterCreationWizard.js`.
* **Pages (`pages/`)**:
    * `HomePage/HomePage.js`: Main entry point with initial welcome screen and main menu.
    * `PlayerCharacterListPage/PlayerCharacterListPage.js`:
        * Displays a list of created characters (currently uses mock data, intended to fetch from `/api/character-templates`).
        * "CREATE NEW CHARACTER" button links to `/create-player-character`.
    * `CharacterCreationPage/CharacterCreationWizard.js`:
        * A multi-step wizard for creating characters.
        * Receives a `mode` prop (`"template"` or `"campaign"`).
        * If `mode="template"` (accessed via `/create-player-character`): Saves the character to `/api/character-templates`.
        * If `mode="campaign"` (accessed via `/campaigns/:campaignId/create-character`):
            * First saves the character as a template via `POST /api/character-templates`.
            * Then, uses the returned template ID to make a `POST` request to `/api/campaigns/:campaignId/characters-from-template`.
        * Updates shared context via `useCharacterWizard` for the dynamic header in `App.js`.
        * Current step order: BASIC INFO, CLASS, RACE, BACKGROUND, ABILITIES.
    * Campaign management pages: `CampaignListPage.js`, `CreateCampaignPage.js`, `CampaignDetailPage.js`.
    * (Deprecated) `CreatePlayerCharacterPage.js`: An older, non-wizard character creation form, likely superseded by `CharacterCreationWizard.js`.
* **Step Components (`components/characterCreation/steps/`)**:
    * `Step0_BasicInfo.js` (Name, Level)
    * `Step1_ClassSelection.js`
    * `Step2_RaceSelection.js`
    * `Step3_BackgroundAlignment.js`
    * `Step4_AbilityScores.js`
* **Common Components (`components/common/`)**:
    * `Button/Button.js`: A reusable button component.
* **Styling**:
    * `theme.css`: Global CSS custom properties for colors, fonts, radii, shadows, and standardized padding variables (e.g., `--page-padding-horizontal`, `--page-padding-vertical`).
    * `App.css`: Global application styles, including the main layout structure (`.App`, `.main-content-area`), and styles for the dynamic `top-bar` and its wizard step navigation items.
    * CSS Modules are used for component-specific styles (e.g., `HomePage.module.css`, `CharacterCreationWizard.module.css`, `PlayerCharacterListPage.module.css`).

## Current Status & Key UI/UX Behaviors

* **Universal Non-Scrolling Viewport:** The application is designed so that the main browser window does not scroll. Scrolling is handled by specific content areas within pages (e.g., character lists, wizard step content).
* **Dynamic Application Header (`App.js` -> `DynamicAppTopBar`):**
    * The header's visibility is conditional, controlled by path. It is hidden on the `HomePage` (`/`), `PlayerCharacterListPage` (`/player-characters`), and `CampaignListPage` (`/campaigns`).
    * When visible on Character Creation Wizard routes, it displays wizard progression steps.
    * When visible on other designated pages (e.g., `CreateCampaignPage`, `CampaignDetailPage`), it displays default navigation links (or will be adapted for other dynamic content).
* **Global Footer (`App.js` -> `bottom-input-bar`):**
    * Visibility is conditional. Currently shown on pages like `CreateCampaignPage` and `CampaignDetailPage`. Hidden on wizard routes and other pages like `HomePage`, `PlayerCharacterListPage`.
* **Standardized Padding:** Padding for main page content areas and fixed footers is being standardized using CSS variables defined in `theme.css`.
* **Character Creation Workflow:**
    1.  **Template Creation:** Access via `/player-characters` -> "CREATE NEW CHARACTER" button to `/create-player-character`. This uses `CharacterCreationWizard` in `mode="template"`. The main app header shows wizard steps. Saves to `/api/character-templates`.
    2.  **Campaign Character Creation:** Access via a campaign's detail page -> "Create New Character" button to `/campaigns/:campaignId/create-character`. This uses `CharacterCreationWizard` in `mode="campaign"`. Main app header shows wizard steps. Saves first as a template, then creates a campaign-linked copy.

## Getting Started (Development Environment)

(This section assumes you have Node.js, npm, and PostgreSQL installed.)

1.  **Clone the Repository** (if you haven't already).
2.  **Setup Database (`00_database_setup/`):**
    * Ensure PostgreSQL is running.
    * Create a database (e.g., `fates_forge_db`).
    * Configure `backend/.env` using `backend/.env.example` as a template with your database credentials and desired ports:
        ```env
        DB_USER=your_db_user
        DB_HOST=localhost
        DB_DATABASE=fates_forge_db
        DB_PASSWORD=your_db_password
        DB_PORT=5432
        BACKEND_PORT=1001 
        # REACT_APP_API_BASE_URL for the frontend should point to BACKEND_PORT/api
        ```
    * Run database scripts:
        ```bash
        psql -U your_db_user -d fates_forge_db -f 00_database_setup/001_schema.sql
        psql -U your_db_user -d fates_forge_db -f 00_database_setup/002_initial_data.sql
        ```
3.  **Backend Setup (`backend/`):**
    ```bash
    cd backend
    npm install
    npm start 
    ```
    (Backend typically runs on `http://localhost:1001` as per default `.env` values).
4.  **Frontend Setup (`frontend/app/`):**
    ```bash
    cd frontend/app
    npm install
    # Create a .env file if it doesn't exist:
    # REACT_APP_API_BASE_URL=http://localhost:1001/api 
    # PORT=1000 (or your preferred frontend port)
    npm start
    ```
    (Frontend typically runs on `http://localhost:1000`).

## Troubleshooting Notes

* **Module Not Found (Frontend):** Verify import paths in `.js`/`.jsx` files. Ensure components are correctly exported/imported. Path changes require updating all references.
* **ESLint Errors:** Address based on messages. `react/jsx-no-undef` means a component/variable was used without import/definition.
* **API Errors (404, 500):** Confirm backend is running. Match frontend `axios` call URLs to `backend/server.js` routes. Check backend console for details.
* **Styling Issues:**
    * Ensure correct CSS Module import (`import styles from './MyComponent.module.css';`).
    * Verify global styles (`App.css`, `theme.css`) are imported (usually in `index.js` or `App.js`).
    * Clear browser cache.
    * Use browser developer tools to inspect computed styles.