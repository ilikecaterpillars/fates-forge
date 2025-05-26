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
    const worldCampaignQuery = `
      INSERT INTO world_campaigns (project_id, core_concept, themes, generation_mode)
      VALUES ($1, $2, $3, $4)
      RETURNING world_campaign_id;
    `;
    await client.query(worldCampaignQuery, [newProject.project_id, 'New Adventure Awaits!', 'Mystery, Exploration', 'Full']);

    // 3. Create an initial live_sessions entry
    const liveSessionQuery = `
      INSERT INTO live_sessions (project_id, current_ingame_datetime, narrative_focus)
      VALUES ($1, $2, $3)
      RETURNING live_session_id;
    `;
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
// D&D LOOKUP API Endpoints
// ====================================================================

// GET /api/dnd/races - Get all D&D races
app.get('/api/dnd/races', async (req, res) => {
  try {
    const query = `
      SELECT race_id, name, description, asi_bonus, speed, size_category, parent_race_id, racial_features 
      FROM dnd_races 
      ORDER BY name;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching D&D races:', err);
    res.status(500).json({ error: 'Server Error while fetching D&D races' });
  }
});

// GET /api/dnd/classes - Get all D&D classes
app.get('/api/dnd/classes', async (req, res) => {
  try {
    const query = `
      SELECT class_id, name, description, hit_die, primary_ability_ids, 
             saving_throw_proficiency_ability_ids, spellcasting_ability_id, 
             class_features_by_level, can_prepare_spells
      FROM dnd_classes 
      ORDER BY name;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching D&D classes:', err);
    res.status(500).json({ error: 'Server Error while fetching D&D classes' });
  }
});

// GET /api/dnd/alignments - Get all D&D alignments
app.get('/api/dnd/alignments', async (req, res) => {
  try {
    const query = `
      SELECT alignment_id, name, abbreviation, description 
      FROM dnd_alignments 
      ORDER BY name;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching D&D alignments:', err);
    res.status(500).json({ error: 'Server Error while fetching D&D alignments' });
  }
});

// GET /api/dnd/backgrounds - Get all D&D backgrounds
app.get('/api/dnd/backgrounds', async (req, res) => {
  try {
    const query = `
      SELECT background_id, name, description, starting_proficiencies, 
             equipment_granted, feature_name, feature_description, 
             suggested_characteristics 
      FROM dnd_backgrounds 
      ORDER BY name;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching D&D backgrounds:', err);
    res.status(500).json({ error: 'Server Error while fetching D&D backgrounds' });
  }
});

// GET /api/dnd/abilities - Get all D&D abilities
app.get('/api/dnd/abilities', async (req, res) => {
  try {
    const query = `
      SELECT ability_id, name, abbreviation 
      FROM dnd_abilities 
      ORDER BY ability_id;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching D&D abilities:', err);
    res.status(500).json({ error: 'Server Error while fetching D&D abilities' });
  }
});

// GET /api/dnd/skills - Get all D&D skills
app.get('/api/dnd/skills', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.skill_id, 
        s.name, 
        s.ability_id,
        a.name AS ability_name,
        a.abbreviation AS ability_abbreviation
      FROM dnd_skills s
      JOIN dnd_abilities a ON s.ability_id = a.ability_id
      ORDER BY s.name;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching D&D skills:', err);
    res.status(500).json({ error: 'Server Error while fetching D&D skills' });
  }
});

// GET /api/dnd/items - Get all D&D items
app.get('/api/dnd/items', async (req, res) => {
  try {
    const query = `
      SELECT item_id, name, type, description, properties, 
             weight, cost_gp, requires_attunement 
      FROM dnd_items 
      ORDER BY name;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching D&D items:', err);
    res.status(500).json({ error: 'Server Error while fetching D&D items' });
  }
});

// GET /api/dnd/magic-schools - Get all D&D magic schools
app.get('/api/dnd/magic-schools', async (req, res) => {
  try {
    const query = `
      SELECT magic_school_id, name, description 
      FROM dnd_magic_schools 
      ORDER BY name;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching D&D magic schools:', err);
    res.status(500).json({ error: 'Server Error while fetching D&D magic schools' });
  }
});

// GET /api/dnd/conditions - Get all D&D conditions
app.get('/api/dnd/conditions', async (req, res) => {
  try {
    const query = `
      SELECT condition_id, name, description 
      FROM dnd_conditions 
      ORDER BY name;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching D&D conditions:', err);
    res.status(500).json({ error: 'Server Error while fetching D&D conditions' });
  }
});

// GET /api/dnd/damage-types - Get all D&D damage types
app.get('/api/dnd/damage-types', async (req, res) => {
  try {
    const query = `
      SELECT damage_type_id, name, description 
      FROM dnd_damage_types 
      ORDER BY name;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching D&D damage types:', err);
    res.status(500).json({ error: 'Server Error while fetching D&D damage types' });
  }
});

// GET /api/dnd/spells - Get all D&D spells
app.get('/api/dnd/spells', async (req, res) => {
  try {
    const query = `
      SELECT 
        sp.spell_id, 
        sp.name, 
        sp.level, 
        ms.name AS magic_school_name, 
        sp.casting_time, 
        sp.range_area, 
        sp.components, 
        sp.duration, 
        sp.description, 
        sp.at_higher_levels, 
        sp.ritual, 
        sp.concentration
      FROM dnd_spells sp
      LEFT JOIN dnd_magic_schools ms ON sp.magic_school_id = ms.magic_school_id
      ORDER BY sp.level, sp.name;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching D&D spells:', err);
    res.status(500).json({ error: 'Server Error while fetching D&D spells' });
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
  } = req.body;

  if (isNaN(parseInt(projectId))) {
    return res.status(400).json({ error: 'Invalid project ID format.' });
  }
  if (!character_name) {
    return res.status(400).json({ error: 'Character name is required.' });
  }

  const client = await pool.connect();
  try {
    const projectCheck = await client.query('SELECT 1 FROM projects WHERE project_id = $1', [projectId]);
    if (projectCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Project not found.' });
    }

    const characterQuery = `
      INSERT INTO player_characters (
        project_id, character_name, level, race_id, class_id, background_id, alignment_id,
        strength, dexterity, constitution, intelligence, wisdom, charisma,
        max_hp, current_hp,
        hit_dice_max, 
        currency,
        spell_slots 
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14, 
              COALESCE($3, 1) || 'd' || (SELECT hit_die FROM dnd_classes WHERE class_id = $5 LIMIT 1),
              '{"cp": 0, "sp": 0, "ep": 0, "gp": 0, "pp": 0}',
              '{}'
      ) 
      RETURNING *; 
    `;
    
    const values = [
      projectId, character_name, level || 1, race_id, class_id, background_id, alignment_id,
      strength || 10, dexterity || 10, constitution || 10, intelligence || 10, wisdom || 10, charisma || 10,
      max_hp || 10
    ];
    
    const characterResult = await client.query(characterQuery, values);
    const newCharacter = characterResult.rows[0];

    console.log(`Character '${newCharacter.character_name}' created for project ${projectId}:`, newCharacter);
    res.status(201).json(newCharacter);

  } catch (err) {
    console.error(`Error creating character for project ${projectId}:`, err);
    if (err.code === '23505' && err.constraint === 'uq_character_name_in_project') {
      return res.status(409).json({ error: 'A character with this name already exists in this project.' });
    }
    if (err.code === '23503') { 
        if (err.constraint && err.constraint.includes('fk_character_race')) return res.status(400).json({ error: 'Invalid Race ID.' });
        if (err.constraint && err.constraint.includes('fk_character_class')) return res.status(400).json({ error: 'Invalid Class ID.' });
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