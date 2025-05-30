# Fate's Forge

Fate's Forge is a web application designed to be an all-in-one interactive design and play environment for D&D-style text-based roleplaying games. It enables users to generate richly detailed fantasy worlds, develop intricate campaigns, create D&D 5e compliant player characters (as reusable blueprints and as campaign participants), and will in the future facilitate immersive text-based game sessions.

This project is currently under development and is being built as a **Progressive Web Application (PWA)** with a strong focus on mobile-first usability and offline capabilities.

## Project Goal

To provide a comprehensive, integrated tool for:

*   **World Design & Management:** Crafting reusable, detailed fantasy worlds.
*   **Campaign Creation & Management:** Developing specific adventure narratives within a chosen World.
*   **Character Creation & Management:**
    *   Creating reusable character blueprints/templates (worldless).
    *   Creating specific characters for participation in campaigns (can be based on templates).
*   **Adventure Direction:** (Future) Running live game sessions.

## Current Development Focus (As of this session)

*   **Global UI Layout & Styling Overhaul:**
    *   Implemented a consistent three-region app layout in `App.js` and `App.css`:
        *   `.appHeader`: Unpadded shell for the top navigation/context bar.
        *   `.appBody`: Unpadded, non-scrolling shell that hosts page components.
        *   `.appFooter`: Unpadded shell for the bottom action bar.
    *   Created `PageHeader.js` (formerly `DynamicAppTopBar`) to render content within `.appHeader`, managing its own internal padding and max-width content block using theme variables.
    *   Created `PageFooter.js` (based on `DynamicAppBottomBar` concept) to render context-sensitive actions within `.appFooter`, managing its own internal padding and max-width content block using theme variables.
    *   Refactored `HomePage.js` and `PlayerCharacterListPage.js` (and their CSS modules) to:
        *   Use a root class (e.g., `.pageContent`) that fills the `.appBody`.
        *   Structure internal content with page-specific `.pageTitle` and `.pageBody` elements.
        *   Apply padding and max-width constraints to these page-level elements using variables from `theme.css` for uniform content alignment.
        *   Ensure specific elements within the page's `.pageBody` (like lists) handle their own scrolling.
*   **Character Creation Wizard - Race Selection Step (`Step2_RaceSelection.js`):**
    *   UI enhanced for side-by-side race/subrace dropdowns.
    *   Displays racial traits and ASIs. (Further refinement for interactive choices pending).

## Next Immediate Steps (To be continued with AI Assistance)

1.  **Refactor `CharacterWizardContext.js`:**
    *   Update the context to accurately provide all necessary state (`currentWizardStep`, `totalWizardSteps`, `isWizardSubmitting`, `wizardError`, `wizardSteps`, `visitedSteps`, `isWizardActive`) and callback functions (`onWizardBack`, `onWizardNext`, `onWizardNavStepClick`) required by the global `PageHeader.js` and `PageFooter.js`.
2.  **Refactor `CharacterCreationWizard.js` and its CSS module:**
    *   Remove its local rendering of titles (if distinct from step prompts) and footer navigation buttons. These will be handled by `PageHeader.js` (for step prompt/title display, using wizard context) and `PageFooter.js` (for buttons, using wizard context).
    *   Ensure `CharacterCreationWizard.js` uses `useEffect` and `updateWizardSharedState` (from context) to continuously provide its internal state and handler functions to `CharacterWizardContext`.
    *   Update `CharacterCreationWizard.module.css` to use the consistent page structure (root class filling `.appBody`, containing `.pageTitle` and `.pageBody` for the active step area), applying padding and max-width from `theme.css`. Specific elements *within* the active step component will handle their own scrolling.
3.  **Finalize `Step2_RaceSelection.js` Enhancements (after wizard refactor):**
    *   Implement UI and logic for handling **interactive racial choices** (e.g., selecting bonus languages, skills, or tools granted by racial traits).
    *   Ensure ASIs selected/granted here are correctly passed back to and applied in the "Ability Scores" step.
4.  **Reorder Character Creation Wizard Steps (after wizard refactor):**
    *   Update `WIZARD_STEPS_CONFIG` in `CharacterCreationWizard.js` to the desired order: Identity -> Race -> Class -> Background -> Abilities.
    *   Simplify `Step3_BackgroundAlignment.js` to only handle Background selection.
5.  **PWA Local Data Storage (Phase 1 - Setup):**
    *   Design and implement client-side data storage using IndexedDB via Dexie.js for all application data.

## Architecture

*   **Frontend (`frontend/app`):** React application (Create React App).
    *   **PWA Focus:** Mobile-first, offline capabilities.
    *   **Layout:** App-level unpadded shells (`.appHeader`, `.appBody`, `.appFooter`). Page components provide their own padded content structure (e.g., `.pageTitle`, `.pageBody`) within `.appBody`, constrained by `var(--page-content-max-width)`.
    *   Key Components: `PageHeader.js` (app navigation), `PageFooter.js` (app actions), `CharacterWizardContext.js`.
    *   Uses `axios`, `react-router-dom`.
    *   Styling: CSS Modules, global `App.css` (for shells), `theme.css` (for variables).
*   **Backend (`backend`):** Node.js with Express.js, `pg` library for PostgreSQL.
*   **Database (`00_database_setup`):** PostgreSQL. Schema in `001_schema.sql`, data in `002_*.sql`.

## PWA & Offline Strategy

*   **Goal:** All application data (D&D rules/lookups, user-created content) client-side.
*   **Technology:** IndexedDB via Dexie.js.
*   **Data Management:** Local replica, initial server sync for lookups, future sync for user data.

## Core Features & Structure (Overview)

### 1. Database (`00_database_setup/`)

*   `001_schema.sql`, `002_initial_data.sql`, `002_most_data.sql`.

### 2. Backend (`backend/server.js`)

*   RESTful APIs for worlds, campaigns, characters, D&D lookups.

### 3. Frontend (`frontend/app/src/`)

*   **`App.js`**: Defines `.appHeader`, `.appBody`, `.appFooter`. Hosts `PageHeader.js`, `PageFooter.js`, and routes to page components. Uses `CharacterWizardProvider`.
*   **Layout Components (`components/layout/`):**
    *   `PageHeader.js`: Renders content for `.appHeader` (e.g., wizard steps). Manages its own internal content padding and max-width block.
    *   `PageFooter.js`: Renders content for `.appFooter` (e.g., wizard navigation, list page actions). Manages its own internal content padding and max-width block.
*   **Pages (`pages/`)**:
    *   `HomePage/HomePage.js`
    *   `PlayerCharacterListPage/PlayerCharacterListPage.js`
    *   `CharacterCreationPage/CharacterCreationWizard.js`
    *   (Page structure: root div like `.pageContent` fills `.appBody`, contains `.pageTitle` and `.pageBody` for main content, styled with theme variables for padding and max-width.)
*   **Character Creation Wizard (`CharacterCreationWizard.js`)**: Multi-step process. To be refactored to integrate with global `PageHeader.js` and `PageFooter.js` via `CharacterWizardContext`.
    *   `Step1_Identity.js`: Character Name, Level, Alignment.
    *   `Step2_RaceSelection.js`: Race/Subrace selection, traits, ASIs.
    *   `Step1_ClassSelection.js`: Class selection.
    *   `Step3_BackgroundAlignment.js`: Background selection (alignment part to be removed).
    *   `Step4_AbilityScores.js`: Ability Score input.
*   **Common Components (`components/common/`)**: `Button`, `PillTextInput`, `PillDropdown`.
*   **Styling**: `theme.css` (variables including padding and max-width), `App.css` (app shells), component-specific CSS Modules.

## Key UI/UX Behaviors & Constraints:

*   **Global Layout:** Application uses a fixed header (`.appHeader`), a main content area (`.appBody`), and a fixed footer (`.appFooter`). These app-level shells are unpadded.
*   **Page Layout:** Content within `PageHeader.js`, `PageFooter.js`, and individual page components (title, body) is constrained by `var(--page-content-max-width)` and centered, using specific padding variables from `theme.css` for consistent internal spacing.
*   **Scrolling:** The `.appBody` itself does not scroll. Specific elements *within* a page's own `.pageBody` (e.g., lists, detail panes) are designated as scrollable (`overflow-y: auto`) if their content exceeds available space.

## Getting Started (Development Environment)

(This section assumes Node.js, npm, and PostgreSQL are installed.)

1.  **Clone the Repository.**
2.  **Setup Database (`00_database_setup/`):**
    *   Ensure PostgreSQL is running.
    *   Create a database (e.g., `fates_forge_db`).
    *   Configure `backend/.env` using `backend/.env.example` as a template.
    *   Run database scripts:
        ```bash
        psql -U your_db_user -d fates_forge_db -f 00_database_setup/001_schema.sql
        psql -U your_db_user -d fates_forge_db -f 00_database_setup/002_initial_data.sql
        psql -U your_db_user -d fates_forge_db -f 00_database_setup/002_most_data.sql
        ```
3.  **Backend Setup (`backend/`):**
    ```bash
    cd backend
    npm install
    npm start
    ```
4.  **Frontend Setup (`frontend/app/`):**
    ```bash
    cd frontend/app
    npm install
    # Create a .env file with REACT_APP_API_BASE_URL and PORT
    npm start
    ```

## Key Recent UI Decisions for Character Creation

*   **Identity Step (`Step1_Identity.js`):** Descriptive page prompt. "Player Name" field removed. Character Name/Level side-by-side. Alignment pill dropdown with description below (scrollable).
*   **Race Step (`Step2_RaceSelection.js`):** Race and Subrace dropdowns placed side-by-side. Detailed display of selected race/subrace traits and ASIs. (Further refinement in progress).
*   **Universal Styling:** `PillTextInput` and `PillDropdown` to be used consistently for inputs. Content blocks across the header, footer, and page content areas adhere to `var(--page-content-max-width)`.