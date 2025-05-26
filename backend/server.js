// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
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
  res.send('Fate\'s Forge Backend is Running!');
});

// ====================================================================
// WORLD API Endpoints
// ====================================================================

// POST /api/worlds - Create a new world
app.post('/api/worlds', async (req, res) => {
  const {
    name,
    description,
    core_concept,
    primary_themes,
    overall_tone,
    defining_features, // JSONB
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'World name is required.' });
  }

  // Ensure JSONB fields are properly stringified if they are passed as objects
  const definingFeaturesJson = typeof defining_features === 'object' ? JSON.stringify(defining_features) : defining_features;

  const client = await pool.connect();
  try {
    const worldQuery = `
      INSERT INTO worlds (name, description, core_concept, primary_themes, overall_tone, defining_features, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING world_id, name, description, core_concept, primary_themes, overall_tone, defining_features, created_at, updated_at;
    `;
    const worldValues = [
      name,
      description,
      core_concept,
      primary_themes,
      overall_tone,
      definingFeaturesJson,
    ];
    const worldResult = await client.query(worldQuery, worldValues);
    const newWorld = worldResult.rows[0];

    console.log('World created successfully:', newWorld);
    res.status(201).json(newWorld);
  } catch (err) {
    console.error('Error creating world:', err);
    if (err.code === '23505' && err.constraint === 'worlds_name_key') { // Check schema for actual constraint name if different
      return res.status(409).json({ error: 'A world with this name already exists.' });
    }
    res.status(500).json({ error: 'Server Error while creating world' });
  } finally {
    client.release();
  }
});

// GET /api/worlds - Get all worlds
app.get('/api/worlds', async (req, res) => {
  try {
    const query = `
      SELECT world_id, name, core_concept, primary_themes, overall_tone, created_at, updated_at
      FROM worlds
      ORDER BY name;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching worlds:', err);
    res.status(500).json({ error: 'Server Error while fetching worlds' });
  }
});

// GET /api/worlds/:worldId - Get a specific world with its regions
app.get('/api/worlds/:worldId', async (req, res) => {
  const { worldId } = req.params;

  if (isNaN(parseInt(worldId))) {
    return res.status(400).json({ error: 'Invalid world ID format.' });
  }

  const client = await pool.connect();
  try {
    const worldQuery = 'SELECT * FROM worlds WHERE world_id = $1;';
    const worldResult = await client.query(worldQuery, [worldId]);

    if (worldResult.rows.length === 0) {
      return res.status(404).json({ error: 'World not found.' });
    }
    const worldData = worldResult.rows[0];

    // Fetch regions for this world
    const regionsQuery = 'SELECT * FROM world_regions WHERE world_id = $1 ORDER BY name;';
    const regionsResult = await client.query(regionsQuery, [worldId]);
    worldData.regions = regionsResult.rows;
    
    // Future: Could expand to fetch cultures, factions, locations within each region if needed via query params or separate calls

    res.json(worldData);
  } catch (err) {
    console.error(`Error fetching world ${worldId}:`, err);
    res.status(500).json({ error: `Server Error while fetching world ${worldId}` });
  } finally {
    client.release();
  }
});


// ====================================================================
// CAMPAIGN API Endpoints
// ====================================================================

// POST /api/campaigns - Create a new campaign
app.post('/api/campaigns', async (req, res) => {
  const { 
    campaign_name,
    world_id,
    suite_version_at_creation,
    campaign_scope,
    generation_mode_preference,
    plot_arc_title,
    plot_overview,
    main_questline,
    side_quests,
    antagonists_allies,
    dm_intro,
    dm_secrets
  } = req.body;

  if (!campaign_name || !campaign_name.trim()) {
    return res.status(400).json({ error: 'Campaign name is required.' });
  }
  if (world_id === undefined || world_id === null || isNaN(parseInt(world_id, 10))) {
    return res.status(400).json({ error: 'Valid world_id is required.' });
  }


  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const worldCheckQuery = 'SELECT world_id FROM worlds WHERE world_id = $1;';
    const worldCheckResult = await client.query(worldCheckQuery, [parseInt(world_id, 10)]);
    if (worldCheckResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: `World with ID ${world_id} not found.` });
    }

    const campaignQuery = `
      INSERT INTO campaigns (
        campaign_name, world_id, suite_version_at_creation, last_saved_date,
        campaign_scope, generation_mode_preference, plot_arc_title, plot_overview,
        main_questline, side_quests, antagonists_allies, dm_intro, dm_secrets
      )
      VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    
    const campaignValues = [
      campaign_name, parseInt(world_id, 10), suite_version_at_creation || '1.0.0',
      campaign_scope, generation_mode_preference, plot_arc_title, plot_overview,
      main_questline ? JSON.stringify(main_questline) : null, 
      side_quests ? JSON.stringify(side_quests) : null, 
      antagonists_allies ? JSON.stringify(antagonists_allies) : null, 
      dm_intro, dm_secrets
    ];
    
    const campaignResult = await client.query(campaignQuery, campaignValues);
    const newCampaign = campaignResult.rows[0];

    const liveSessionQuery = `
      INSERT INTO live_sessions (campaign_id, current_ingame_datetime, narrative_focus)
      VALUES ($1, $2, $3)
      RETURNING live_session_id;
    `;
    await client.query(liveSessionQuery, [newCampaign.campaign_id, 'Day 1, Morning', 'The adventure begins...']);

    await client.query('COMMIT');
    
    console.log('Campaign created successfully:', newCampaign);
    res.status(201).json(newCampaign);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating campaign:', err);
    if (err.code === '23505' && err.constraint === 'uq_campaign_name') {
      return res.status(409).json({ error: 'A campaign with this name already exists.' });
    }
    if (err.code === '23503' && err.constraint === 'campaigns_world_id_fkey') {
      return res.status(400).json({ error: `Invalid world_id: ${world_id}. World does not exist.` });
    }
    res.status(500).json({ error: 'Server Error while creating campaign' });
  } finally {
    client.release();
  }
});

// GET /api/campaigns - Get all campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.campaign_id, 
        c.campaign_name, 
        c.created_date, 
        c.last_saved_date, 
        c.suite_version_at_creation,
        c.world_id,
        w.name AS world_name 
      FROM campaigns c
      JOIN worlds w ON c.world_id = w.world_id
      ORDER BY c.last_saved_date DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).json({ error: 'Server Error while fetching campaigns' });
  }
});

// GET /api/campaigns/:campaignId - Get a specific campaign with all its data
app.get('/api/campaigns/:campaignId', async (req, res) => {
  const { campaignId } = req.params;

  if (isNaN(parseInt(campaignId))) {
    return res.status(400).json({ error: 'Invalid campaign ID format.' });
  }

  const client = await pool.connect();
  try {
    // Fetch core campaign data and join with world data
    const campaignQuery = `
        SELECT c.*, w.name as world_name, w.core_concept as world_core_concept 
        FROM campaigns c
        JOIN worlds w ON c.world_id = w.world_id
        WHERE c.campaign_id = $1;
    `;
    const campaignResult = await client.query(campaignQuery, [campaignId]);
    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }
    const campaignData = campaignResult.rows[0];

    // Fetch player_characters data
    const charactersResult = await client.query('SELECT * FROM player_characters WHERE campaign_id = $1 ORDER BY character_name', [campaignId]);
    campaignData.player_characters = charactersResult.rows;

    for (const character of campaignData.player_characters) {
        // This part remains complex and might be slow; consider optimizing or paginating if performance issues arise
        const proficienciesResult = await client.query(
            `SELECT p.name, p.type, cp.proficiency_level, cp.source_of_proficiency 
             FROM character_proficiencies cp
             JOIN dnd_proficiencies p ON cp.proficiency_id = p.proficiency_id
             WHERE cp.player_character_id = $1`,
            [character.player_character_id]
        );
        character.proficiencies = proficienciesResult.rows;

        const knownSpellsResult = await client.query(
            `SELECT ds.* FROM character_known_spells cks
             JOIN dnd_spells ds ON cks.spell_id = ds.spell_id
             WHERE cks.player_character_id = $1 ORDER BY ds.level, ds.name`,
            [character.player_character_id]
        );
        character.known_spells = knownSpellsResult.rows;
        
        const preparedSpellsResult = await client.query(
            `SELECT ds.*
             FROM character_prepared_spells cps
             JOIN dnd_spells ds ON cps.spell_id = ds.spell_id
             WHERE cps.player_character_id = $1 ORDER BY ds.level, ds.name`,
            [character.player_character_id]
        );
        character.prepared_spells = preparedSpellsResult.rows;

        const inventoryResult = await client.query(
            `SELECT di.*, ci.quantity, ci.is_equipped, ci.is_attuned 
             FROM character_inventory ci
             JOIN dnd_items di ON ci.item_id = di.item_id
             WHERE ci.player_character_id = $1 ORDER BY di.name`,
            [character.player_character_id]
        );
        character.inventory = inventoryResult.rows;

        const conditionsResult = await client.query(
            `SELECT dc.*, cc.source, cc.duration_turns, cc.applied_at
             FROM character_conditions cc
             JOIN dnd_conditions dc ON cc.condition_id = dc.condition_id
             WHERE cc.player_character_id = $1 ORDER BY dc.name`,
            [character.player_character_id]
        );
        character.active_conditions = conditionsResult.rows;
    }

    // Fetch live_session data
    const liveSessionResult = await client.query('SELECT * FROM live_sessions WHERE campaign_id = $1', [campaignId]);
    campaignData.live_session_state = liveSessionResult.rows[0] || {};

    // Fetch campaign_npc_instances
    const npcInstancesQuery = `
        SELECT cni.*, n.name as npc_template_name, n.stat_block as npc_template_stat_block,
               wl.name as location_name
        FROM campaign_npc_instances cni
        JOIN npcs n ON cni.npc_id = n.npc_id
        LEFT JOIN world_locations wl ON cni.location_id = wl.location_id
        WHERE cni.campaign_id = $1
        ORDER BY COALESCE(cni.custom_name, n.name);
    `;
    const npcInstancesResult = await client.query(npcInstancesQuery, [campaignId]);
    campaignData.campaign_npc_instances = npcInstancesResult.rows;

    // Fetch campaign_item_instances
    const itemInstancesQuery = `
        SELECT cii.*, i.name as item_template_name, i.type as item_type, i.description as item_description,
               wl.name as location_name
        FROM campaign_item_instances cii
        JOIN dnd_items i ON cii.item_id = i.item_id
        JOIN world_locations wl ON cii.location_id = wl.location_id
        WHERE cii.campaign_id = $1
        ORDER BY i.name;
    `;
    const itemInstancesResult = await client.query(itemInstancesQuery, [campaignId]);
    campaignData.campaign_item_instances = itemInstancesResult.rows;

    res.json(campaignData);

  } catch (err) {
    console.error(`Error fetching campaign ${campaignId}:`, err);
    res.status(500).json({ error: `Server Error while fetching campaign ${campaignId}` });
  } finally {
    client.release();
  }
});


// ====================================================================
// CHARACTER API Endpoints (within a Campaign)
// ====================================================================

// POST /api/campaigns/:campaignId/characters - Create a new character for a campaign
app.post('/api/campaigns/:campaignId/characters', async (req, res) => {
  const { campaignId } = req.params;
  const {
    character_name, level, race_id, class_id, background_id, alignment_id,
    strength, dexterity, constitution, intelligence, wisdom, charisma,
    max_hp,
  } = req.body;

  if (isNaN(parseInt(campaignId))) {
    return res.status(400).json({ error: 'Invalid campaign ID format.' });
  }
  if (!character_name || !character_name.trim()) {
    return res.status(400).json({ error: 'Character name is required.' });
  }
  // Add more validation for other required fields like race_id, class_id if necessary

  const client = await pool.connect();
  try {
    const campaignCheck = await client.query('SELECT 1 FROM campaigns WHERE campaign_id = $1', [campaignId]);
    if (campaignCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const characterQuery = `
      INSERT INTO player_characters (
        campaign_id, character_name, level, race_id, class_id, background_id, alignment_id,
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
      parseInt(campaignId, 10), character_name, level || 1, race_id, class_id, background_id, alignment_id,
      strength || 10, dexterity || 10, constitution || 10, intelligence || 10, wisdom || 10, charisma || 10,
      max_hp || 10 // Default max_hp if not provided
    ];
    
    const characterResult = await client.query(characterQuery, values);
    const newCharacter = characterResult.rows[0];

    console.log(`Character '${newCharacter.character_name}' created for campaign ${campaignId}:`, newCharacter);
    res.status(201).json(newCharacter);

  } catch (err) {
    console.error(`Error creating character for campaign ${campaignId}:`, err);
    if (err.code === '23505' && err.constraint === 'uq_character_name_in_campaign') { // Updated constraint name
      return res.status(409).json({ error: 'A character with this name already exists in this campaign.' });
    }
    if (err.code === '23503') { 
        if (err.constraint && err.constraint.includes('player_characters_race_id_fkey')) return res.status(400).json({ error: 'Invalid Race ID.' });
        if (err.constraint && err.constraint.includes('player_characters_class_id_fkey')) return res.status(400).json({ error: 'Invalid Class ID.' });
        // Add checks for other FKs like background_id, alignment_id if needed
    }
    res.status(500).json({ error: 'Server Error while creating character' });
  } finally {
    client.release();
  }
});

// ====================================================================
// NPC TEMPLATE API Endpoints
// ====================================================================

// POST /api/npcs - Create a new NPC template
app.post('/api/npcs', async (req, res) => {
  const {
    name, world_id, description, stat_block, default_disposition, default_inventory, is_unique
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'NPC name is required.' });
  }

  const statBlockJson = typeof stat_block === 'object' ? JSON.stringify(stat_block) : stat_block;
  const defaultInventoryJson = typeof default_inventory === 'object' ? JSON.stringify(default_inventory) : default_inventory;
  const finalWorldId = world_id === undefined || world_id === null || world_id === '' ? null : parseInt(world_id, 10);


  const client = await pool.connect();
  try {
    // If world_id is provided, ensure it exists
    if (finalWorldId !== null) {
      const worldCheck = await client.query('SELECT 1 FROM worlds WHERE world_id = $1', [finalWorldId]);
      if (worldCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({ error: `World with ID ${finalWorldId} not found.` });
      }
    }

    const query = `
      INSERT INTO npcs (name, world_id, description, stat_block, default_disposition, default_inventory, is_unique)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [name, finalWorldId, description, statBlockJson, default_disposition, defaultInventoryJson, is_unique || false];
    const result = await client.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating NPC template:', err);
    if (err.code === '23505' && err.constraint === 'uq_npc_name_in_world_or_generic') {
        const errorMessage = finalWorldId 
            ? `An NPC template with this name already exists in world ID ${finalWorldId}.`
            : 'A generic NPC template with this name already exists.';
        return res.status(409).json({ error: errorMessage });
    }
    if (err.code === '23503' && err.constraint === 'npcs_world_id_fkey') {
        return res.status(400).json({ error: `Invalid world_id: ${finalWorldId}. World does not exist.` });
    }
    res.status(500).json({ error: 'Server error while creating NPC template.' });
  } finally {
    client.release();
  }
});

// GET /api/npcs - Get all NPC templates (optionally filtered by world_id)
app.get('/api/npcs', async (req, res) => {
  const { world_id } = req.query;
  let query = 'SELECT * FROM npcs';
  const queryParams = [];

  if (world_id) {
    if (world_id.toLowerCase() === 'null' || world_id.toLowerCase() === 'generic') {
        query += ' WHERE world_id IS NULL';
    } else if (!isNaN(parseInt(world_id, 10))) {
        query += ' WHERE world_id = $1';
        queryParams.push(parseInt(world_id, 10));
    } else {
        return res.status(400).json({ error: 'Invalid world_id filter.' });
    }
  }
  query += ' ORDER BY name;';

  try {
    const { rows } = await pool.query(query, queryParams);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching NPC templates:', err);
    res.status(500).json({ error: 'Server error while fetching NPC templates.' });
  }
});

// GET /api/npcs/:npcId - Get a specific NPC template
app.get('/api/npcs/:npcId', async (req, res) => {
  const { npcId } = req.params;
  if (isNaN(parseInt(npcId))) {
    return res.status(400).json({ error: 'Invalid NPC ID format.' });
  }
  try {
    const result = await pool.query('SELECT * FROM npcs WHERE npc_id = $1', [npcId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NPC template not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error fetching NPC template ${npcId}:`, err);
    res.status(500).json({ error: 'Server error while fetching NPC template.' });
  }
});


// ====================================================================
// CAMPAIGN NPC INSTANCE API Endpoints
// ====================================================================

// POST /api/campaigns/:campaignId/npc-instances - Add an NPC instance to a campaign
app.post('/api/campaigns/:campaignId/npc-instances', async (req, res) => {
    const { campaignId } = req.params;
    const { npc_id, location_id, custom_name, current_hp, position_x, position_y, current_state, instance_inventory } = req.body;

    if (isNaN(parseInt(campaignId, 10))) {
        return res.status(400).json({ error: 'Invalid campaign ID format.' });
    }
    if (!npc_id || isNaN(parseInt(npc_id, 10))) {
        return res.status(400).json({ error: 'Valid npc_id is required.' });
    }
     if (location_id && isNaN(parseInt(location_id, 10))) { // location_id can be null
        return res.status(400).json({ error: 'Invalid location_id format.' });
    }

    const currentStateJson = current_state ? JSON.stringify(current_state) : null;
    const instanceInventoryJson = instance_inventory ? JSON.stringify(instance_inventory) : null;
    const finalLocationId = location_id ? parseInt(location_id, 10) : null;


    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if campaign exists
        const campaignCheck = await client.query('SELECT 1 FROM campaigns WHERE campaign_id = $1', [campaignId]);
        if (campaignCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ error: `Campaign with ID ${campaignId} not found.` });
        }

        // Check if NPC template exists
        const npcTemplateCheck = await client.query('SELECT 1 FROM npcs WHERE npc_id = $1', [npc_id]);
        if (npcTemplateCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ error: `NPC template with ID ${npc_id} not found.` });
        }
        
        // Check if location exists (if provided)
        if (finalLocationId !== null) {
            const locationCheck = await client.query('SELECT 1 FROM world_locations WHERE location_id = $1', [finalLocationId]);
            if (locationCheck.rows.length === 0) {
                 await client.query('ROLLBACK');
                 client.release();
                 return res.status(404).json({ error: `Location with ID ${finalLocationId} not found.` });
            }
        }

        const query = `
            INSERT INTO campaign_npc_instances 
                (campaign_id, npc_id, location_id, custom_name, current_hp, position_x, position_y, current_state, instance_inventory)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [
            parseInt(campaignId, 10), parseInt(npc_id, 10), finalLocationId, custom_name, 
            current_hp, position_x, position_y, currentStateJson, instance_inventory
        ];
        const result = await client.query(query, values);
        
        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating NPC instance:', err);
         if (err.code === '23503') { // Foreign key violation
            if (err.constraint && err.constraint.includes('campaign_npc_instances_campaign_id_fkey')) return res.status(404).json({ error: `Campaign with ID ${campaignId} not found.` });
            if (err.constraint && err.constraint.includes('campaign_npc_instances_npc_id_fkey')) return res.status(404).json({ error: `NPC template with ID ${npc_id} not found.` });
            if (err.constraint && err.constraint.includes('campaign_npc_instances_location_id_fkey')) return res.status(404).json({ error: `Location with ID ${finalLocationId} not found.` });
        }
        res.status(500).json({ error: 'Server error while creating NPC instance.' });
    } finally {
        client.release();
    }
});

// ====================================================================
// D&D LOOKUP API Endpoints (Unchanged from your provided server.js)
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


// --- Error Handling Middleware (Basic) ---
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  if (!res.headersSent) {
    res.status(500).send('Something broke!');
  }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Fate's Forge backend listening on http://localhost:${port}`);
  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      console.log('Successfully connected to the database at:', result.rows[0].now);
    }
  });
});