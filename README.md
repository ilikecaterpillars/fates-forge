# Fate's Forge

Fate's Forge is a web application designed to be an all-in-one interactive design and play environment for D&D-style text-based roleplaying games. It enables users to generate richly detailed fantasy worlds, develop intricate campaigns, create D&D 5e compliant player characters (as reusable blueprints and as campaign participants), and will in the future facilitate immersive text-based game sessions.

This project is being developed as a **Progressive Web Application (PWA)** with a strong focus on mobile-first usability and **comprehensive offline capabilities by storing all application data locally on the client device using IndexedDB (via Dexie.js).**

## Project Goal

To provide a comprehensive, integrated tool for:

*   **World Design & Management:** Crafting reusable, detailed fantasy worlds.
*   **Campaign Creation & Management:** Developing specific adventure narratives within a chosen World.
*   **Character Creation & Management:**
    *   Creating reusable character blueprints/templates (worldless).
    *   Creating specific characters for participation in campaigns (can be based on templates).
*   **Adventure Direction:** (Future) Running live game sessions.

## Current Development Status & Focus

1.  **Client-Side Database Implementation (Dexie.js):**
    *   **Schema Defined:** A comprehensive Dexie.js schema has been defined in `src/db.js` for all D&D lookup tables (e.g., `dnd_races`, `dnd_classes`) and user-generated content tables (worlds, campaigns, character templates, player characters, NPCs, items, locations, etc.), mirroring the PostgreSQL `001_schema.sql`.
    *   **Data Model:** D&D lookup tables will use their original IDs from source JSON data (e.g., `race_id`) as primary keys. User-generated content tables (worlds, campaigns, characters) use client-side auto-incrementing `local_<entity>_id` primary keys, with `server_<entity>_id` fields allocated for optional future server synchronization. Foreign keys within user-generated content reference these `local_` IDs.
    *   **Seeding Mechanism:** `src/db.js` includes logic for data versioning (`app_meta` table) and a function (`initializeAndSeedDatabase`) to populate Dexie tables from JSON files located in the `public/data/` directory on first app load or when `CURRENT_APP_DATA_VERSION` is incremented.
    *   **Core CRUD Functions:** Implemented in `src/db.js` for Worlds, Campaigns, Character Templates, and Player Characters, including handling of related sub-table data within transactions.
2.  **UI Layout Refactor & SASS Conversion:**
    *   **SASS Conversion:** All original `.css` files have been renamed to `.scss` (e.g., `App.scss`, `theme.scss`, `CharacterCreationWizard.module.scss`), and component import statements have been updated accordingly. The project is now using SASS.
    *   **Global App Layout (`App.scss`, `App.js`):**
        *   A consistent three-region app layout is being implemented: `.appHeader` (top, fixed height), `.appBody` (middle, flex-grow, non-scrollable host), and `.appFooter` (bottom, fixed height). These app-level shells defined in `App.scss` have **no padding themselves**.
        *   Content *within* these regions is handled by dedicated layout components:
            *   `PageHeader.js` (formerly `DynamicAppTopBar`, located in `src/components/layout/`): Renders dynamic top navigation (e.g., wizard steps from `CharacterWizardContext`) into the `.appHeader` shell. This component manages its own internal content padding using theme variables (e.g., `--page-header-content-padding-...`).
            *   `PageFooter.js` (formerly `DynamicAppBottomBar`, located in `src/components/layout/`): Renders dynamic bottom action buttons or inputs (e.g., wizard navigation, list page "Create New" button, DM input) into the `.appFooter` shell. This component manages its own internal content padding and layout (e.g., centering a `max-width` block for buttons) using theme variables.
    *   **Page-Level Layout (within Page Components like `CharacterCreationWizard.js`):**
        *   Page components render their root `div` (e.g., `<div className={styles.pageContent}>` as per user specification) to fill the `.appBody` shell.
        *   Inside this root `div`, pages structure their content typically with:
            *   An `<h2>` element classed `styles.pageTitle` for the page's main title/description. This element receives its padding/margins from `theme.scss` variables via the page's SCSS module.
            *   A `div` classed `styles.pageBody` (as per user specification) serving as the main content container for that page, below the title. This div also receives its padding from `theme.scss` variables. This `styles.pageBody` div itself **does not scroll**.
            *   Specific child elements *within* the page's `styles.pageBody` (e.g., a details pane for race features, an alignment description box, a list of characters) are responsible for their own scrolling if their content is too long, using `overflow-y: auto` and appropriate `height` or `max-height`.
3.  **Character Creation Wizard - `Step2_RaceSelection.js` Enhancements:**
    *   Implemented selection for base races and their subraces using `PillDropdown` components.
    *   Dropdowns for race and subrace are displayed side-by-side.
    *   Displays detailed racial traits and Ability Score Increases (ASIs) for the selected race/subrace, including inherited traits from a parent race.
    *   Logic correctly updates `characterData` in `CharacterCreationWizard` with the final `race_id` and ASI information.

## Next Immediate Steps (To be continued with AI Assistance)

1.  **Complete UI Layout Refactor & Component Creation:**
    *   **`PageHeader.js` & `PageFooter.js`:** Ensure these components are fully implemented (JSX, SCSS using theme variables for internal padding, logic for dynamic content).
    *   **`CharacterWizardContext.js`:** Update to expose all necessary state (`isWizardActive`, `wizardSteps`, `currentWizardStep`, `totalWizardSteps`, `isWizardSubmitting`, `wizardError`) and callback functions (`onWizardBack`, `onWizardNext`, `onWizardNavStepClick`) required by `PageHeader.js` and `PageFooter.js`.
    *   **`CharacterCreationWizard.js` Refactor:**
        *   Adopt the `styles.pageContent` (root), `styles.pageTitle`, `styles.pageBody` structure in its JSX and SCSS module.
        *   Remove its local fixed footer and error message display; these functionalities are now handled by `PageFooter.js` via the context.
        *   Ensure `ActiveStepComponent` is correctly placed within `styles.pageBody` (likely within a `max-width` wrapper like `styles.activeStepContainer`).
        *   Verify that scrollable elements within each step (e.g., race details in `Step2_RaceSelection`, alignment description in `Step1_Identity`) function correctly within this new page structure and fixed-height `ActiveStepComponent` container.
    *   **`PlayerCharacterListPage.js` Refactor:** Apply the same page layout (`styles.pageContent` root, `.pageTitle`, `.pageBody`). Its "Create New Character" button will be rendered by `PageFooter.js`. Ensure its character list (`.characterList`) correctly scrolls within the page's `.pageBody`.
    *   **`HomePage.js` Refactor:** Apply the page layout structure. Its main menu buttons will likely be rendered by `PageFooter.js` when in the "menu" state.
2.  **Data Layer Integration & Finalization:**
    *   **Convert SQL Data to JSON:** Complete the conversion of all data from `002_initial_data.sql` and `002_most_data.sql` into JSON files (in `public/data/`). Ensure `dnd_*` JSON files use their original IDs (e.g., `race_id`, `class_id`) as direct properties for primary key mapping in Dexie.
    *   **Test Full Data Seeding:** Thoroughly test the `initializeAndSeedDatabase` function in `db.js` to ensure all tables are populated correctly from the new JSON files.
    *   **Refactor Components to Use Dexie:** Systematically update all components that currently fetch data via `axios` (e.g., `Step1_Identity` for alignments, `Step2_RaceSelection` for races, `CampaignListPage` for campaigns, etc.) to use the asynchronous CRUD functions from `src/db.js` to query the local Dexie database.
3.  **Further `Step2_RaceSelection.js` Enhancements (Character Wizard - Race Step):**
    *   Implement UI and logic for handling **interactive racial choices** if a selected race/subrace offers them (e.g., selecting bonus languages from a list, choosing a skill proficiency, picking a High Elf cantrip). This will involve querying relevant Dexie tables (e.g., `dnd_languages`, `dnd_skills`, `dnd_spells`).
    *   Ensure Ability Score Increases derived from race/subrace selection are correctly stored (perhaps temporarily in `characterData`) to be applied during the "Ability Scores" step of the wizard.
4.  **Reorder Character Creation Wizard Steps & Refine Other Steps:**
    *   Once the layout refactor and Dexie integration for initial steps are stable, update `WIZARD_STEPS_CONFIG` in `CharacterCreationWizard.js` to the target order: **1. Identity, 2. Race, 3. Class, 4. Background, 5. Abilities.**
    *   Update `pagePrompt` for each reordered step.
    *   **Simplify `Step3_BackgroundAlignment.js`**: Modify this component (which will become the "Background" step) to *only* handle Background selection, removing the redundant Alignment selection UI.
    *   Review and update `Step1_ClassSelection.js` and `Step4_AbilityScores.js` to fetch data from Dexie and fit the new layout and data flow.

## Architecture

*   **Frontend (`frontend/app`):** React application (Create React App).
    *   **PWA & Offline First:** All application data (D&D rules, user-created content) stored client-side in **IndexedDB via Dexie.js**.
    *   **Styling:** SASS (`.scss` files) with CSS Modules and a global `theme.scss` for variables (colors, fonts, padding, max-widths).
    *   Uses `react-router-dom` for navigation.
    *   `axios` used for initial data seeding from backend, and potentially for future optional server sync.
*   **Backend (`backend`):** Node.js with Express.js.
    *   **Primary Role:** Serves as the initial data seeding source for the client-side PWA database. Reads from PostgreSQL.
    *   **Secondary Role (Optional Future):** Server-side backup and synchronization of user-generated data.
    *   Manages database interactions with PostgreSQL using the `pg` library. Uses `dotenv`.
*   **Database (Server-Side Source - `00_database_setup`):** PostgreSQL.
    *   The canonical master source for all D&D lookup data and initial example content.
    *   Schema defined in `001_schema.sql`.
    *   Data provided by `002_initial_data.sql` (example game content) & `002_most_data.sql` (D&D ruleset).

## PWA & Data Strategy

*   **Primary Datastore:** Client-side IndexedDB, managed via the **Dexie.js** library (`src/db.js`).
*   **Data Seeding:** On first app load or data version change, the PWA fetches data (converted to JSON from the backend's PostgreSQL DB, served via API, and stored in `public/data/`) and uses `bulkPut` to populate local Dexie tables.
*   **Offline Functionality:** Full offline access to all data and application features is the goal.
*   **AI Parsing:** The comprehensive local data store is intended to facilitate potential client-side AI parsing.

## Core Code Structure & UI Approach

### 1. Global App Structure (`App.js`, `App.scss`)
*   `.App` is the root flex container.
*   `.appHeader`: Unpadded top shell, hosts `<PageHeader />` (dynamic navigation, wizard steps).
*   `.appBody`: Unpadded middle shell (flex-grow), hosts the current routed Page Component. Does not scroll.
*   `.appFooter`: Unpadded bottom shell, hosts `<PageFooter />` (dynamic action buttons, inputs).
*   `<PageHeader />` and `<PageFooter />` (in `src/components/layout/`) manage their own internal content padding using theme variables.

### 2. Page Component Structure (e.g., `CharacterCreationWizard.js` and its SCSS module)
*   Page root `div` (e.g., `styles.pageContent` as specified by user) fills the `.appBody`.
*   Contains an `<h2>` with `styles.pageTitle` (for page's main title, uses theme padding/margins).
*   Contains a `div` with `styles.pageBody` (main content area for the page, uses theme padding, does not scroll itself).
*   Specific child elements *within* this page-level `styles.pageBody` (e.g., a details pane for race features, an alignment description box, a list of characters, the `ActiveStepComponent` area) are responsible for their own scrolling if their content is long, using `overflow-y: auto` and appropriate `height`/`max-height`.

### 3. Character Creation Wizard (`CharacterCreationWizard.js`)
*   A multi-step form managed by `CharacterWizardContext` for shared state (current step, total steps, error messages, navigation callbacks) with `PageHeader.js` and `PageFooter.js`.
*   **Current Active Step Work:** `Step2_RaceSelection.js` enhancements (subrace selection, trait display).
*   **Key UI Behaviors (Examples):**
    *   The alignment description box in `Step1_Identity.js` must scroll independently if its content is long, fitting within the step's layout without causing the main page content area (the page's `.pageBody`) or the `ActiveStepComponent` area to scroll.
    *   Similarly, the race details display in `Step2_RaceSelection.js` must manage its own scrolling if content is extensive.
    *   The overall wizard (`ActiveStepComponent` area) should fit within the screen between the page title and the app-level footer, with internal scrolling for long step content.

## Getting Started (Development Environment)
(Assumes Node.js, npm, PostgreSQL for backend/seeding source.)

1.  **Clone the Repository.**
2.  **Setup Backend & PostgreSQL Database (`00_database_setup/`, `backend/`):**
    *   Ensure PostgreSQL is running. Create DB (e.g., `fates_forge_db`). Configure `backend/.env`.
    *   Run SQL scripts against PostgreSQL:
        ```bash
        psql -U your_db_user -d fates_forge_db -f 00_database_setup/001_schema.sql
        psql -U your_db_user -d fates_forge_db -f 00_database_setup/002_initial_data.sql
        psql -U your_db_user -d fates_forge_db -f 00_database_setup/002_most_data.sql
        ```
    *   Start backend: `cd backend && npm install && npm start`
3.  **Frontend Setup (`frontend/app/`):**
    ```bash
    cd frontend/app
    npm install sass # SASS compiler
    npm install dexie # Dexie.js library
    # Create .env with REACT_APP_API_BASE_URL (if backend API is used for anything beyond initial manual JSON creation) and PORT
    # Ensure JSON data files are prepared in public/data/ based on your SQL data.
    npm start
    ```
    *   Upon first load, the PWA's `src/db.js` logic will attempt to seed data from `/public/data/*.json` into IndexedDB if the local data version is outdated or data is missing.