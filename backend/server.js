// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
// It's good practice to make the port configurable via .env as well
const port = process.env.BACKEND_PORT || 3002;

// --- Database Configuration ---
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
});

// --- Middleware ---
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// --- Basic Test Route ---
app.get('/api', (req, res) => {
  res.send('Saga Sculptor Suite Backend is Running!');
});

// ====================================================================
// PROJECT API Endpoints
// ====================================================================

// POST /api/projects - Create a new project
app.post('/api/projects', async (req, res) => {
  const { projectName, suiteVersion } = req.body; // suiteVersion based on "suite_version_at_creation"

  if (!projectName) {
    return res.status(400).json({ error: 'Project name is required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start a transaction

    // 1. Insert into projects table
    const projectQuery = `
      INSERT INTO projects (project_name, suite_version_at_creation, last_saved_date)
      VALUES ($1, $2, NOW())
      RETURNING project_id, project_name, created_date, last_saved_date, suite_version_at_creation;
    `;
    const projectResult = await client.query(projectQuery, [projectName, suiteVersion || '1.0.0']);
    const newProject = projectResult.rows[0];

    // 2. Create an initial world_campaigns entry
    // You can add default values for core_concept, themes, etc., or leave them null
    const worldCampaignQuery = `
      INSERT INTO world_campaigns (project_id, core_concept, themes, generation_mode)
      VALUES ($1, $2, $3, $4)
      RETURNING world_campaign_id;
    `;
    // Using placeholder values for now, these would ideally come from user input later or sensible defaults
    await client.query(worldCampaignQuery, [newProject.project_id, 'New Adventure Awaits!', 'Mystery, Exploration', 'Full']);

    // 3. Create an initial live_sessions entry
    const liveSessionQuery = `
      INSERT INTO live_sessions (project_id, current_ingame_datetime, narrative_focus)
      VALUES ($1, $2, $3)
      RETURNING live_session_id;
    `;
    // Using placeholder values
    await client.query(liveSessionQuery, [newProject.project_id, 'Day 1, Morning', 'The adventure begins...']);

    await client.query('COMMIT'); // Commit the transaction
    
    console.log('Project created successfully:', newProject);
    res.status(201).json(newProject);

  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on error
    console.error('Error creating project:', err);
    if (err.code === '23505' && err.constraint === 'uq_project_name') {
      return res.status(409).json({ error: 'A project with this name already exists.' });
    }
    res.status(500).json({ error: 'Server Error while creating project' });
  } finally {
    client.release();
  }
});

// ====================================================================
// PROJECT API Endpoints
// ====================================================================

// POST /api/projects - Create a new project
app.post('/api/projects', async (req, res) => {
  const { projectName, suiteVersion } = req.body;

  if (!projectName) {
    return res.status(400).json({ error: 'Project name is required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); 

    const projectQuery = `
      INSERT INTO projects (project_name, suite_version_at_creation, last_saved_date)
      VALUES ($1, $2, NOW())
      RETURNING project_id, project_name, created_date, last_saved_date, suite_version_at_creation;
    `;
    const projectResult = await client.query(projectQuery, [projectName, suiteVersion || '1.0.0']);
    const newProject = projectResult.rows[0];

    const worldCampaignQuery = `
      INSERT INTO world_campaigns (project_id, core_concept, themes, generation_mode)
      VALUES ($1, $2, $3, $4)
      RETURNING world_campaign_id;
    `;
    await client.query(worldCampaignQuery, [newProject.project_id, 'New Adventure Awaits!', 'Mystery, Exploration', 'Full']);

    const liveSessionQuery = `
      INSERT INTO live_sessions (project_id, current_ingame_datetime, narrative_focus)
      VALUES ($1, $2, $3)
      RETURNING live_session_id;
    `;
    await client.query(liveSessionQuery, [newProject.project_id, 'Day 1, Morning', 'The adventure begins...']);

    await client.query('COMMIT'); 
    
    console.log('Project created successfully:', newProject);
    res.status(201).json(newProject);

  } catch (err) {
    await client.query('ROLLBACK'); 
    console.error('Error creating project:', err);
    if (err.code === '23505' && err.constraint === 'uq_project_name') {
      return res.status(409).json({ error: 'A project with this name already exists.' });
    }
    res.status(500).json({ error: 'Server Error while creating project' });
  } finally {
    client.release();
  }
});

// GET /api/projects - Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const query = `
      SELECT project_id, project_name, created_date, last_saved_date, suite_version_at_creation 
      FROM projects 
      ORDER BY last_saved_date DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Server Error while fetching projects' });
  }
});

// GET /api/projects/:projectId - Get a specific project with all its data
app.get('/api/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;

  if (isNaN(parseInt(projectId))) {
    return res.status(400).json({ error: 'Invalid project ID format.' });
  }

  const client = await pool.connect();
  try {
    // Fetch core project data
    const projectResult = await client.query('SELECT * FROM projects WHERE project_id = $1', [projectId]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    const projectData = projectResult.rows[0];

    // Fetch world_campaign data
    const worldCampaignResult = await client.query('SELECT * FROM world_campaigns WHERE project_id = $1', [projectId]);
    projectData.world_campaign_data = worldCampaignResult.rows[0] || {}; // Assign to a sub-object

    // Fetch player_characters data
    const charactersResult = await client.query('SELECT * FROM player_characters WHERE project_id = $1 ORDER BY character_name', [projectId]);
    projectData.player_characters = charactersResult.rows; // Assign as an array

    // For each character, fetch their related data (proficiencies, spells, inventory, conditions)
    for (const character of projectData.player_characters) {
      const proficienciesResult = await client.query(
        `SELECT p.name, p.type, cp.proficiency_level, cp.source_of_proficiency 
         FROM character_proficiencies cp
         JOIN dnd_proficiencies p ON cp.proficiency_id = p.proficiency_id
         WHERE cp.player_character_id = $1`,
        [character.player_character_id]
      );
      character.proficiencies = proficienciesResult.rows;

      const knownSpellsResult = await client.query(
        `SELECT ds.name, ds.level, ds.description -- Add other spell fields as needed
         FROM character_known_spells cks
         JOIN dnd_spells ds ON cks.spell_id = ds.spell_id
         WHERE cks.player_character_id = $1`,
        [character.player_character_id]
      );
      character.known_spells = knownSpellsResult.rows;
      
      const preparedSpellsResult = await client.query(
        `SELECT ds.name, ds.level -- Add other spell fields as needed
         FROM character_prepared_spells cps
         JOIN dnd_spells ds ON cps.spell_id = ds.spell_id
         WHERE cps.player_character_id = $1`,
        [character.player_character_id]
      );
      character.prepared_spells = preparedSpellsResult.rows;

      const inventoryResult = await client.query(
        `SELECT di.name, di.type, ci.quantity, ci.is_equipped, ci.is_attuned -- Add other item fields as needed
         FROM character_inventory ci
         JOIN dnd_items di ON ci.item_id = di.item_id
         WHERE ci.player_character_id = $1`,
        [character.player_character_id]
      );
      character.inventory = inventoryResult.rows;

      const conditionsResult = await client.query(
        `SELECT dc.name, cc.source, cc.duration_turns, cc.applied_at
         FROM character_conditions cc
         JOIN dnd_conditions dc ON cc.condition_id = dc.condition_id
         WHERE cc.player_character_id = $1`,
        [character.player_character_id]
      );
      character.active_conditions = conditionsResult.rows;
    }

    // Fetch live_session data
    const liveSessionResult = await client.query('SELECT * FROM live_sessions WHERE project_id = $1', [projectId]);
    projectData.live_session_state = liveSessionResult.rows[0] || {}; // Assign to a sub-object

    res.json(projectData);

  } catch (err) {
    console.error(`Error fetching project ${projectId}:`, err);
    res.status(500).json({ error: `Server Error while fetching project ${projectId}` });
  } finally {
    client.release();
  }
});

// ====================================================================
// CHARACTER API Endpoints (within a Project)
// ====================================================================

// POST /api/projects/:projectId/characters - Create a new character for a project
app.post('/api/projects/:projectId/characters', async (req, res) => {
  const { projectId } = req.params;
  const {
    character_name,
    level,
    race_id,
    class_id,
    background_id,
    alignment_id,
    strength, dexterity, constitution, intelligence, wisdom, charisma, // Ability scores
    max_hp, // Max HP (can be calculated or input)
    // We'll add more fields like skills, spells, equipment later via separate updates or more complex logic
  } = req.body;

  if (isNaN(parseInt(projectId))) {
    return res.status(400).json({ error: 'Invalid project ID format.' });
  }
  if (!character_name) {
    return res.status(400).json({ error: 'Character name is required.' });
  }
  // Add more validation as needed (e.g., for race_id, class_id existing in lookup tables)

  const client = await pool.connect();
  try {
    // Optional: Check if project exists
    const projectCheck = await client.query('SELECT 1 FROM projects WHERE project_id = $1', [projectId]);
    if (projectCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Project not found.' });
    }

    const characterQuery = `
      INSERT INTO player_characters (
        project_id, character_name, level, race_id, class_id, background_id, alignment_id,
        strength, dexterity, constitution, intelligence, wisdom, charisma,
        max_hp, current_hp, -- Set current_hp to max_hp initially
        -- Initialize other fields as needed, e.g., hit_dice_max, currency, spell_slots
        hit_dice_max, -- This would be derived from class and level, e.g., level + 'd' + class.hit_die
        currency,
        spell_slots 
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14, 
              COALESCE($3, 1) || 'd' || (SELECT hit_die FROM dnd_classes WHERE class_id = $5 LIMIT 1), -- Example hit_dice_max
              '{"cp": 0, "sp": 0, "ep": 0, "gp": 0, "pp": 0}', -- Default currency
              '{}' -- Default empty spell_slots JSON
      ) 
      RETURNING *; 
    `;
    // Note: Calculating hit_dice_max like this is a simplification.
    // Real hit_dice_max string needs to consider the actual die type (e.g. '1d8', '2d10').
    // For spell_slots, this would be more complex based on class and level.

    const values = [
      projectId, character_name, level || 1, race_id, class_id, background_id, alignment_id,
      strength || 10, dexterity || 10, constitution || 10, intelligence || 10, wisdom || 10, charisma || 10,
      max_hp || 10 // Default max_hp if not provided
    ];
    
    const characterResult = await client.query(characterQuery, values);
    const newCharacter = characterResult.rows[0];

    // Here, you might also want to:
    // - Add default proficiencies based on class_id and race_id into `character_proficiencies`
    // - Add starting equipment based on class_id and background_id into `character_inventory`
    // This would involve more queries within this transaction. For now, we keep it simpler.

    console.log(`Character '${newCharacter.character_name}' created for project ${projectId}:`, newCharacter);
    res.status(201).json(newCharacter);

  } catch (err) {
    console.error(`Error creating character for project ${projectId}:`, err);
    if (err.code === '23505' && err.constraint === 'uq_character_name_in_project') {
      return res.status(409).json({ error: 'A character with this name already exists in this project.' });
    }
    if (err.code === '23503') { // Foreign key violation
        if (err.constraint && err.constraint.includes('fk_character_race')) return res.status(400).json({ error: 'Invalid Race ID.' });
        if (err.constraint && err.constraint.includes('fk_character_class')) return res.status(400).json({ error: 'Invalid Class ID.' });
        // Add checks for other FKs like background, alignment
    }
    res.status(500).json({ error: 'Server Error while creating character' });
  } finally {
    client.release();
  }
});


// --- Error Handling Middleware (Basic) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Saga Sculptor backend listening on http://localhost:${port}`);
  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      console.log('Successfully connected to the database at:', result.rows[0].now);
    }
  });
});