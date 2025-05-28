# Fate's Forge

Fate's Forge is a web application designed to be an all-in-one interactive design and play environment for D&D-style text-based roleplaying games. It enables users to generate richly detailed fantasy worlds, develop intricate campaigns, create D&D 5e compliant player characters (as reusable blueprints and as campaign participants), and will in the future facilitate immersive text-based game sessions.

This project is currently under development.

## Project Goal

To provide a comprehensive, integrated tool for:

* **World Design & Management:** Crafting reusable, detailed fantasy worlds.
* **Campaign Creation & Management:** Developing specific adventure narratives within a chosen World.
* **Character Creation & Management:**
    * Creating reusable character blueprints/templates (worldless).
    * Creating specific characters for participation in campaigns (can be based on templates).
* **Adventure Direction:** (Future) Running live game sessions.

## Architecture

* **Frontend (`frontend/app`):** React application, bootstrapped with Create React App.
    * Handles user interface and interaction.
    * Communicates with the backend via `axios`.
    * Uses `react-router-dom` for navigation.
    * Features a multi-step wizard for character creation (`CharacterCreationWizard.js`).
    * Uses CSS Modules for component-specific styling (e.g., `HomePage.module.css`, `CharacterCreationWizard.module.css`, `PlayerCharacterListPage.module.css`, `Step1_Identity.module.css`) and global CSS files (`App.css`, `theme.css`) for theme variables and base styles.
    * Utilizes reusable common components like `Button`, `PillTextInput`, and `PillDropdown`.
* **Backend (`backend`):** Node.js with Express.js.
    * Provides RESTful API endpoints.
    * Manages database interactions with PostgreSQL using the `pg` library.
    * Uses `dotenv` for environment variable management.
* **Database (`00_database_setup`):** PostgreSQL.
    * Schema includes tables for worlds, campaigns, character templates, campaign-specific player characters, NPCs, items, and D&D lookup data (abilities, races, classes, spells, etc.).
    * Initial data populates lookup tables and provides examples.

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
* **`002_initial_data.sql`**: Populates lookup tables with core D&D entities and some example data.

### 2. Backend (`backend/server.js`)

Provides API endpoints for:

* Worlds (`/api/worlds`)
* Campaigns (`/api/campaigns`)
* Character Templates (`/api/character-templates`): For creating and listing general character blueprints.
* Campaign-Specific Characters:
    * `POST /api/campaigns/:campaignId/characters-from-template`: Creates a new character in a campaign by copying from an existing character template.
* NPCs (`/api/npcs`) and Campaign NPC Instances (`/api/campaigns/:campaignId/npc-instances`).
* D&D data lookups (e.g., `/api/dnd/races`, `/api/dnd/classes`, `/api/dnd/alignments`).

### 3. Frontend (`frontend/app/src/`)

* **`App.js`**:
    * Sets up `react-router-dom` for navigation.
    * Implements `AppLayout` which includes a `DynamicAppTopBar`.
    * Uses `CharacterWizardProvider` to allow the main top bar to display wizard progression steps when the character creation wizard is active.
* **Pages (`pages/`)**:
    * `HomePage/HomePage.js`: Main entry point with initial welcome screen and main menu.
    * `PlayerCharacterListPage/PlayerCharacterListPage.js`: Displays a list of character templates and links to create new characters.
    * `CharacterCreationPage/CharacterCreationWizard.js`: A multi-step wizard for creating characters.
        * Operates in "template" mode (saves to `/api/character-templates`) or "campaign" mode (saves as template, then copies to campaign).
        * The first step is "IDENTITY" (`Step1_Identity.js`).
        * The wizard title area in `CharacterCreationWizard.js` displays a descriptive prompt for the current step (e.g., "Define the core identity of your character.").
    * Campaign management pages: `CampaignListPage.js`, `CreateCampaignPage.js`, `CampaignDetailPage.js`.
* **Step Components (`components/characterCreation/steps/`)**:
    * `Step1_Identity.js` (formerly `Step0_BasicInfo.js`): Handles Character Name, Level, and Alignment selection. Alignment description is shown below the dropdown and is scrollable if long, with no background or border.
    * Other steps include Class, Race, Background, Abilities selection.
* **Common Components (`components/common/`)**:
    * `Button/Button.js`: Reusable button.
    * `PillTextInput/PillTextInput.js`: Reusable styled text input.
    * `PillDropdown/PillDropdown.js`: Reusable styled dropdown.
* **Styling**:
    * `theme.css`: Global CSS custom properties for theme variables (colors, fonts, radii, shadows, padding). `--page-padding-horizontal` is currently `35px`.
    * `App.css`: Global application styles, main layout.
    * `CharacterCreationWizard.module.css`: Styles for the wizard layout. `.wizardContent` has `max-width: 900px` and `overflow-y: auto` (though the current aim is for only specific child elements like the alignment description to scroll, not `.wizardContent` itself). `.errorMessageFixed` has `max-width: 350px`.
    * `Step1_Identity.module.css`: Styles for the first step of character creation, including side-by-side layout for Name/Level. Form element containers within this step do not have their own `max-width`, allowing them to utilize space within `.wizardContent`, while the common input components themselves might have a `max-width`.

## Current UI/UX Behaviors & Constraints:

* **Viewport & Scrolling:** The main application viewport (`.App`, `.wizardPageContainer`) is set to `overflow: hidden;`.
* **Wizard Content Area (`.wizardContent`):** This area is intended to hold the content of each wizard step. While its CSS has `overflow-y: auto;`, the current design goal is that this specific container should *not* scroll; rather, specific child elements (like the alignment description box in `Step1_Identity.js`) should handle their own scrolling if their content is too long to fit within the height allocated by the overall step layout.
* **Fixed Footer:** The character creation wizard has a fixed footer (`.pageFixedFooter`) for navigation buttons. Space is reserved for this footer by `padding-bottom` on `.wizardContent`.
* **Dynamic Application Header:** The top bar (`.top-bar` in `App.css`, styled as `.navStep` within `CharacterCreationWizard.module.css` when wizard is active) displays wizard progression steps.

## Getting Started (Development Environment)

(This section assumes Node.js, npm, and PostgreSQL are installed.)

1.  **Clone the Repository.**
2.  **Setup Database (`00_database_setup/`):**
    * Ensure PostgreSQL is running.
    * Create a database (e.g., `fates_forge_db`).
    * Configure `backend/.env` using `backend/.env.example` as a template with your database credentials (user, host, database name, password, port) and desired `BACKEND_PORT` (e.g., `1001`).
    * Run database scripts against your created database:
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
    (Typically runs on the `BACKEND_PORT` specified in `.env`, e.g., `http://localhost:1001`).
4.  **Frontend Setup (`frontend/app/`):**
    ```bash
    cd frontend/app
    npm install
    # Create a .env file (e.g., by copying .env.example if one exists) with:
    # REACT_APP_API_BASE_URL=http://localhost:1001/api (ensure port matches backend)
    # PORT=1000 (or your preferred frontend port)
    npm start
    ```
    (Typically runs on the `PORT` specified in `.env`, e.g., `http://localhost:1000`).

## Key Recent UI Decisions for Character Creation Step 1 ("Identity")

* The step title displayed on the page is a descriptive phrase (e.g., "Define the core identity of your character.") rather than just the step name.
* The "Player Name" field has been removed.
* "Character Name" and "Level" inputs are styled as pills and arranged side-by-side, with the Level input being narrower.
* The "Alignment" selection uses a stylized pill dropdown.
* The description for the selected alignment is always displayed directly below the dropdown (no toggle button, no custom background/border for the description box itself).
* The alignment description box is scrollable if its content is too long, and its height is managed to work on various phone sizes without being cut off by the fixed footer, and without causing the main `.wizardContent` area to scroll.