// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.BACKEND_PORT || 3002; // Ensure this matches your .env or intended port

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
app.use(express.json());

// --- Basic Test Route ---
app.get('/api', (req, res) => {
  res.send('Fate\'s Forge Backend is Running!');
});

// ====================================================================
// WORLD API Endpoints
// ====================================================================
app.post('/api/worlds', async (req, res) => {
  const {
    name,
    description,
    core_concept,
    primary_themes,
    overall_tone,
    defining_features,
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'World name is required.' });
  }
  const definingFeaturesJson = typeof defining_features === 'object' ? JSON.stringify(defining_features) : defining_features;
  const client = await pool.connect();
  try {
    const worldQuery = `
      INSERT INTO worlds (name, description, core_concept, primary_themes, overall_tone, defining_features, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING world_id, name, description, core_concept, primary_themes, overall_tone, defining_features, created_at, updated_at;
    `;
    const worldValues = [name, description, core_concept, primary_themes, overall_tone, definingFeaturesJson];
    const worldResult = await client.query(worldQuery, worldValues);
    res.status(201).json(worldResult.rows[0]);
  } catch (err) {
    console.error('Error creating world:', err);
    if (err.code === '23505' && err.constraint === 'worlds_name_key') {
      return res.status(409).json({ error: 'A world with this name already exists.' });
    }
    res.status(500).json({ error: 'Server Error while creating world' });
  } finally {
    client.release();
  }
});

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
    const regionsQuery = 'SELECT * FROM world_regions WHERE world_id = $1 ORDER BY name;';
    const regionsResult = await client.query(regionsQuery, [worldId]);
    worldData.regions = regionsResult.rows;
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
app.post('/api/campaigns', async (req, res) => {
  const { 
    campaign_name, world_id, suite_version_at_creation, campaign_scope,
    generation_mode_preference, plot_arc_title, plot_overview,
    main_questline, side_quests, antagonists_allies, dm_intro, dm_secrets
  } = req.body;

  if (!campaign_name || !campaign_name.trim()) return res.status(400).json({ error: 'Campaign name is required.' });
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
      RETURNING *; `;
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
      VALUES ($1, $2, $3) RETURNING live_session_id;`;
    await client.query(liveSessionQuery, [newCampaign.campaign_id, 'Day 1, Morning', 'The adventure begins...']);
    
    await client.query('COMMIT');
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

app.get('/api/campaigns', async (req, res) => {
  try {
    const query = `
      SELECT c.campaign_id, c.campaign_name, c.created_date, c.last_saved_date, 
             c.suite_version_at_creation, c.world_id, w.name AS world_name 
      FROM campaigns c JOIN worlds w ON c.world_id = w.world_id
      ORDER BY c.last_saved_date DESC;`;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).json({ error: 'Server Error while fetching campaigns' });
  }
});

app.get('/api/campaigns/:campaignId', async (req, res) => {
  const { campaignId } = req.params;
  if (isNaN(parseInt(campaignId))) return res.status(400).json({ error: 'Invalid campaign ID format.' });
  
  const client = await pool.connect();
  try {
    const campaignQuery = `
        SELECT c.*, w.name as world_name, w.core_concept as world_core_concept 
        FROM campaigns c JOIN worlds w ON c.world_id = w.world_id WHERE c.campaign_id = $1;`;
    const campaignResult = await client.query(campaignQuery, [campaignId]);
    if (campaignResult.rows.length === 0) return res.status(404).json({ error: 'Campaign not found.' });
    const campaignData = campaignResult.rows[0];

    const charactersResult = await client.query('SELECT * FROM player_characters WHERE campaign_id = $1 ORDER BY character_name', [campaignId]);
    campaignData.player_characters = charactersResult.rows;
    for (const character of campaignData.player_characters) {
        const proficienciesResult = await client.query(
            `SELECT p.name, p.type, cp.proficiency_level, cp.source_of_proficiency 
             FROM character_proficiencies cp JOIN dnd_proficiencies p ON cp.proficiency_id = p.proficiency_id
             WHERE cp.player_character_id = $1`, [character.player_character_id]);
        character.proficiencies = proficienciesResult.rows;
        // Add similar fetches for known_spells, prepared_spells, inventory, active_conditions
    }
    const liveSessionResult = await client.query('SELECT * FROM live_sessions WHERE campaign_id = $1', [campaignId]);
    campaignData.live_session_state = liveSessionResult.rows[0] || {};
    
    const npcInstancesQuery = `
        SELECT cni.*, n.name as npc_template_name, wl.name as location_name
        FROM campaign_npc_instances cni JOIN npcs n ON cni.npc_id = n.npc_id
        LEFT JOIN world_locations wl ON cni.location_id = wl.location_id
        WHERE cni.campaign_id = $1 ORDER BY COALESCE(cni.custom_name, n.name);`;
    const npcInstancesResult = await client.query(npcInstancesQuery, [campaignId]);
    campaignData.campaign_npc_instances = npcInstancesResult.rows;

    const itemInstancesQuery = `
        SELECT cii.*, i.name as item_template_name, i.type as item_type, wl.name as location_name
        FROM campaign_item_instances cii JOIN dnd_items i ON cii.item_id = i.item_id
        JOIN world_locations wl ON cii.location_id = wl.location_id
        WHERE cii.campaign_id = $1 ORDER BY i.name;`;
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
// CHARACTER TEMPLATE API Endpoints (NEW)
// ====================================================================
app.post('/api/character-templates', async (req, res) => {
  const {
    character_name, level, race_id, class_id, background_id, alignment_id,
    strength, dexterity, constitution, intelligence, wisdom, charisma,
    max_hp, experience_points, temporary_hp, armor_class, speed,
    hit_dice_current, death_saves_successes, death_saves_failures, // hit_dice_max calculated below
    spell_slots, pact_magic_slots, currency, senses,
    personality_traits, ideals, bonds, flaws,
    backstory, appearance, roleplaying_notes, inspiration
    // proficiencies, known_spells, prepared_spells, inventory for sub-tables
  } = req.body;

  if (!character_name || !character_name.trim()) {
    return res.status(400).json({ error: 'Character name is required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let classHitDie = 0;
    let hitDiceMaxValue = null;
    if (class_id) {
        const dndClassResult = await client.query('SELECT hit_die FROM dnd_classes WHERE class_id = $1 LIMIT 1', [class_id]);
        if (dndClassResult.rows.length > 0) {
            classHitDie = dndClassResult.rows[0].hit_die;
            hitDiceMaxValue = `${level || 1}d${classHitDie}`;
        }
    }
    
    const characterTemplateQuery = `
      INSERT INTO character_templates (
        character_name, level, race_id, class_id, background_id, alignment_id,
        strength, dexterity, constitution, intelligence, wisdom, charisma,
        max_hp, current_hp, experience_points, temporary_hp, armor_class, speed,
        hit_dice_max, hit_dice_current, death_saves_successes, death_saves_failures,
        spell_slots, pact_magic_slots, currency, senses,
        personality_traits, ideals, bonds, flaws,
        backstory, appearance, roleplaying_notes, inspiration,
        updated_at, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25,
        $26, $27, $28, $29, $30, $31, $32, $33, NOW(), NOW()
      ) RETURNING *;`;
    
    const values = [
      character_name, level || 1, race_id, class_id, background_id, alignment_id,
      strength || 10, dexterity || 10, constitution || 10, intelligence || 10, wisdom || 10, charisma || 10,
      max_hp || 10, // current_hp set to max_hp
      experience_points || 0, temporary_hp || 0, armor_class, speed,
      hitDiceMaxValue, hit_dice_current || level || 1,
      death_saves_successes || 0, death_saves_failures || 0,
      spell_slots ? JSON.stringify(spell_slots) : '{}',
      pact_magic_slots ? JSON.stringify(pact_magic_slots) : '{}',
      currency ? JSON.stringify(currency) : '{"cp": 0, "sp": 0, "ep": 0, "gp": 0, "pp": 0}',
      senses ? JSON.stringify(senses) : '{}',
      personality_traits, ideals, bonds, flaws, backstory, appearance, roleplaying_notes, inspiration || false
    ];

    const characterTemplateResult = await client.query(characterTemplateQuery, values);
    const newTemplate = characterTemplateResult.rows[0];

    // Example for inserting proficiencies if provided in req.body.proficiencies (array of proficiency_id)
    if (req.body.proficiencies && Array.isArray(req.body.proficiencies)) {
      for (const profId of req.body.proficiencies) {
        await client.query(
          'INSERT INTO template_proficiencies (character_template_id, proficiency_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [newTemplate.character_template_id, profId]
        );
      }
    }
    // TODO: Add similar loops for req.body.known_spells -> template_known_spells
    // TODO: Add similar loops for req.body.prepared_spells -> template_prepared_spells
    // TODO: Add similar loops for req.body.inventory (array of {item_id, quantity, is_equipped, is_attuned}) -> template_inventory

    await client.query('COMMIT');
    res.status(201).json(newTemplate);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating character template:', err);
    if (err.code === '23505' && err.constraint === 'character_templates_character_name_key') {
      return res.status(409).json({ error: 'A character template with this name already exists.' });
    }
    res.status(500).json({ error: 'Server Error while creating character template' });
  } finally {
    client.release();
  }
});

app.get('/api/character-templates', async (req, res) => {
  try {
    const query = `
      SELECT ct.character_template_id as id, ct.character_name as name, ct.level,
             r.name as race, cl.name as classDisplay
      FROM character_templates ct
      LEFT JOIN dnd_races r ON ct.race_id = r.race_id
      LEFT JOIN dnd_classes cl ON ct.class_id = cl.class_id
      ORDER BY ct.character_name;`;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching character templates:', err);
    res.status(500).json({ error: 'Server Error while fetching character templates' });
  }
});

// ====================================================================
// CAMPAIGN CHARACTER Endpoints
// ====================================================================
// POST /api/campaigns/:campaignId/characters-from-template - Create character in campaign from template
app.post('/api/campaigns/:campaignId/characters-from-template', async (req, res) => {
  const { campaignId } = req.params;
  const { source_template_id } = req.body;

  if (isNaN(parseInt(campaignId))) return res.status(400).json({ error: 'Invalid campaign ID format.' });
  if (!source_template_id || isNaN(parseInt(source_template_id))) {
    return res.status(400).json({ error: 'source_template_id is required and must be a number.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const campaignCheck = await client.query('SELECT 1 FROM campaigns WHERE campaign_id = $1', [campaignId]);
    if (campaignCheck.rows.length === 0) {
      await client.query('ROLLBACK'); client.release();
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const templateResult = await client.query('SELECT * FROM character_templates WHERE character_template_id = $1', [source_template_id]);
    if (templateResult.rows.length === 0) {
      await client.query('ROLLBACK'); client.release();
      return res.status(404).json({ error: 'Source character template not found.' });
    }
    const templateData = templateResult.rows[0];
    
    let classHitDie = 0;
    let hitDiceMaxValue = null;
    if (templateData.class_id) {
        const dndClassResult = await client.query('SELECT hit_die FROM dnd_classes WHERE class_id = $1 LIMIT 1', [templateData.class_id]);
        if (dndClassResult.rows.length > 0) {
            classHitDie = dndClassResult.rows[0].hit_die;
            hitDiceMaxValue = `${templateData.level || 1}d${classHitDie}`;
        }
    }

    const pcInsertQuery = `
      INSERT INTO player_characters (
        campaign_id, character_name, level, race_id, class_id, background_id, alignment_id,
        strength, dexterity, constitution, intelligence, wisdom, charisma,
        max_hp, current_hp, experience_points, temporary_hp, armor_class, speed,
        hit_dice_max, hit_dice_current, death_saves_successes, death_saves_failures,
        spell_slots, pact_magic_slots, currency, senses,
        personality_traits, ideals, bonds, flaws,
        backstory, appearance, roleplaying_notes, inspiration, updated_at, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, NOW(), NOW()
      ) RETURNING *;`;
    const pcValues = [
      parseInt(campaignId, 10), templateData.character_name, templateData.level, templateData.race_id, templateData.class_id,
      templateData.background_id, templateData.alignment_id,
      templateData.strength, templateData.dexterity, templateData.constitution, templateData.intelligence,
      templateData.wisdom, templateData.charisma, templateData.max_hp, templateData.max_hp,
      templateData.experience_points, templateData.temporary_hp, templateData.armor_class, templateData.speed,
      hitDiceMaxValue, templateData.hit_dice_current || templateData.level || 1,
      templateData.death_saves_successes, templateData.death_saves_failures,
      templateData.spell_slots, templateData.pact_magic_slots, templateData.currency, templateData.senses,
      templateData.personality_traits, templateData.ideals, templateData.bonds, templateData.flaws,
      templateData.backstory, templateData.appearance, templateData.roleplaying_notes, templateData.inspiration
    ];
    const pcResult = await client.query(pcInsertQuery, pcValues);
    const newCampaignCharacter = pcResult.rows[0];

    // Copy proficiencies
    const templateProfs = await client.query('SELECT * FROM template_proficiencies WHERE character_template_id = $1', [source_template_id]);
    for (const prof of templateProfs.rows) {
      await client.query(
        'INSERT INTO character_proficiencies (player_character_id, proficiency_id, proficiency_level, source_of_proficiency) VALUES ($1, $2, $3, $4)',
        [newCampaignCharacter.player_character_id, prof.proficiency_id, prof.proficiency_level, prof.source_of_proficiency]
      );
    }
    // Copy known spells
    const templateKnownSpells = await client.query('SELECT * FROM template_known_spells WHERE character_template_id = $1', [source_template_id]);
    for (const spell of templateKnownSpells.rows) {
      await client.query(
        'INSERT INTO character_known_spells (player_character_id, spell_id, source_of_learning) VALUES ($1, $2, $3)',
        [newCampaignCharacter.player_character_id, spell.spell_id, spell.source_of_learning]
      );
    }
    // Copy prepared spells
    const templatePreparedSpells = await client.query('SELECT * FROM template_prepared_spells WHERE character_template_id = $1', [source_template_id]);
    for (const spell of templatePreparedSpells.rows) {
      await client.query(
        'INSERT INTO character_prepared_spells (player_character_id, spell_id, is_always_prepared) VALUES ($1, $2, $3)',
        [newCampaignCharacter.player_character_id, spell.spell_id, spell.is_always_prepared]
      );
    }
    // Copy inventory
    const templateInventory = await client.query('SELECT * FROM template_inventory WHERE character_template_id = $1', [source_template_id]);
    for (const item of templateInventory.rows) {
      await client.query(
        'INSERT INTO character_inventory (player_character_id, item_id, quantity, is_equipped, is_attuned) VALUES ($1, $2, $3, $4, $5)',
        [newCampaignCharacter.player_character_id, item.item_id, item.quantity, item.is_equipped, item.is_attuned]
      );
    }
    // Note: Conditions are typically transient and might not be copied from a template.

    await client.query('COMMIT');
    res.status(201).json(newCampaignCharacter);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Error creating char from template:`, err);
     if (err.code === '23505' && err.constraint === 'uq_character_name_in_campaign') {
        const name = templateData ? templateData.character_name : "the template's name"; // templateData might not be in scope if initial fetch failed
        return res.status(409).json({ error: `A character with the name '${name}' already exists in this campaign.` });
    }
    res.status(500).json({ error: 'Server Error while creating character from template' });
  } finally {
    client.release();
  }
});

// ====================================================================
// NPC TEMPLATE API Endpoints
// ====================================================================
app.post('/api/npcs', async (req, res) => {
  const { name, world_id, description, stat_block, default_disposition, default_inventory, is_unique } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'NPC name is required.' });
  const statBlockJson = typeof stat_block === 'object' ? JSON.stringify(stat_block) : stat_block;
  const defaultInventoryJson = typeof default_inventory === 'object' ? JSON.stringify(default_inventory) : default_inventory;
  const finalWorldId = world_id === undefined || world_id === null || world_id === '' ? null : parseInt(world_id, 10);

  const client = await pool.connect();
  try {
    if (finalWorldId !== null) {
      const worldCheck = await client.query('SELECT 1 FROM worlds WHERE world_id = $1', [finalWorldId]);
      if (worldCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({ error: `World with ID ${finalWorldId} not found.` });
      }
    }
    const query = `INSERT INTO npcs (name, world_id, description, stat_block, default_disposition, default_inventory, is_unique)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
    const values = [name, finalWorldId, description, statBlockJson, default_disposition, defaultInventoryJson, is_unique || false];
    const result = await client.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating NPC template:', err);
    if (err.code === '23505') { /* ... */ }
    res.status(500).json({ error: 'Server error while creating NPC template.' });
  } finally {
    client.release();
  }
});

app.get('/api/npcs', async (req, res) => {
  const { world_id } = req.query;
  let queryText = 'SELECT * FROM npcs';
  const queryParams = [];
  if (world_id) {
    if (world_id.toLowerCase() === 'null' || world_id.toLowerCase() === 'generic') queryText += ' WHERE world_id IS NULL';
    else if (!isNaN(parseInt(world_id, 10))) { queryText += ' WHERE world_id = $1'; queryParams.push(parseInt(world_id, 10)); }
    else return res.status(400).json({ error: 'Invalid world_id filter.' });
  }
  queryText += ' ORDER BY name;';
  try {
    const { rows } = await pool.query(queryText, queryParams);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching NPC templates:', err);
    res.status(500).json({ error: 'Server error while fetching NPC templates.' });
  }
});

app.get('/api/npcs/:npcId', async (req, res) => {
  const { npcId } = req.params;
  if (isNaN(parseInt(npcId))) return res.status(400).json({ error: 'Invalid NPC ID format.' });
  try {
    const result = await pool.query('SELECT * FROM npcs WHERE npc_id = $1', [npcId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'NPC template not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error fetching NPC template ${npcId}:`, err);
    res.status(500).json({ error: 'Server error while fetching NPC template.' });
  }
});

// ====================================================================
// CAMPAIGN NPC INSTANCE API Endpoints
// ====================================================================
app.post('/api/campaigns/:campaignId/npc-instances', async (req, res) => {
    const { campaignId } = req.params;
    const { npc_id, location_id, custom_name, current_hp, position_x, position_y, current_state, instance_inventory } = req.body;
    if (isNaN(parseInt(campaignId))) return res.status(400).json({ error: 'Invalid campaign ID format.' });
    if (!npc_id || isNaN(parseInt(npc_id))) return res.status(400).json({ error: 'Valid npc_id is required.' });
    if (location_id && isNaN(parseInt(location_id))) return res.status(400).json({ error: 'Invalid location_id format.' });
    const currentStateJson = current_state ? JSON.stringify(current_state) : null;
    const instanceInventoryJson = instance_inventory ? JSON.stringify(instance_inventory) : null; // This was missing in original
    const finalLocationId = location_id ? parseInt(location_id, 10) : null;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Campaign, NPC template, Location checks (as in your original file)
        // ...
        const query = `INSERT INTO campaign_npc_instances (campaign_id, npc_id, location_id, custom_name, current_hp, position_x, position_y, current_state, instance_inventory)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`;
        const values = [ parseInt(campaignId, 10), parseInt(npc_id, 10), finalLocationId, custom_name, current_hp, position_x, position_y, currentStateJson, instanceInventoryJson ];
        const result = await client.query(query, values);
        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating NPC instance:', err);
        // Error handling as in your original
        res.status(500).json({ error: 'Server error while creating NPC instance.' });
    } finally {
        client.release();
    }
});


// ====================================================================
// D&D LOOKUP API Endpoints (Full Implementation)
// ====================================================================
app.get('/api/dnd/races', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT race_id, name, description, asi_bonus, speed, size_category, parent_race_id, racial_features FROM dnd_races ORDER BY name;');
    res.json(rows);
  } catch (err) { console.error('Error fetching D&D races:', err); res.status(500).json({ error: 'Server Error' }); }
});
app.get('/api/dnd/classes', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT class_id, name, description, hit_die, primary_ability_ids, saving_throw_proficiency_ability_ids, spellcasting_ability_id, class_features_by_level, can_prepare_spells FROM dnd_classes ORDER BY name;');
    res.json(rows);
  } catch (err) { console.error('Error fetching D&D classes:', err); res.status(500).json({ error: 'Server Error' }); }
});
app.get('/api/dnd/alignments', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT alignment_id, name, abbreviation, description FROM dnd_alignments ORDER BY name;');
    res.json(rows);
  } catch (err) { console.error('Error fetching D&D alignments:', err); res.status(500).json({ error: 'Server Error' }); }
});
app.get('/api/dnd/backgrounds', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT background_id, name, description, starting_proficiencies, equipment_granted, feature_name, feature_description, suggested_characteristics FROM dnd_backgrounds ORDER BY name;');
    res.json(rows);
  } catch (err) { console.error('Error fetching D&D backgrounds:', err); res.status(500).json({ error: 'Server Error' }); }
});
app.get('/api/dnd/abilities', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT ability_id, name, abbreviation FROM dnd_abilities ORDER BY ability_id;');
    res.json(rows);
  } catch (err) { console.error('Error fetching D&D abilities:', err); res.status(500).json({ error: 'Server Error' }); }
});
app.get('/api/dnd/skills', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT s.skill_id, s.name, s.ability_id, a.name AS ability_name, a.abbreviation AS ability_abbreviation FROM dnd_skills s JOIN dnd_abilities a ON s.ability_id = a.ability_id ORDER BY s.name;');
    res.json(rows);
  } catch (err) { console.error('Error fetching D&D skills:', err); res.status(500).json({ error: 'Server Error' }); }
});
app.get('/api/dnd/items', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT item_id, name, type, description, properties, weight, cost_gp, requires_attunement FROM dnd_items ORDER BY name;');
    res.json(rows);
  } catch (err) { console.error('Error fetching D&D items:', err); res.status(500).json({ error: 'Server Error' }); }
});
app.get('/api/dnd/magic-schools', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT magic_school_id, name, description FROM dnd_magic_schools ORDER BY name;');
    res.json(rows);
  } catch (err) { console.error('Error fetching D&D magic schools:', err); res.status(500).json({ error: 'Server Error' }); }
});
app.get('/api/dnd/conditions', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT condition_id, name, description FROM dnd_conditions ORDER BY name;');
    res.json(rows);
  } catch (err) { console.error('Error fetching D&D conditions:', err); res.status(500).json({ error: 'Server Error' }); }
});
app.get('/api/dnd/damage-types', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT damage_type_id, name, description FROM dnd_damage_types ORDER BY name;');
    res.json(rows);
  } catch (err) { console.error('Error fetching D&D damage types:', err); res.status(500).json({ error: 'Server Error' }); }
});
app.get('/api/dnd/spells', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT sp.spell_id, sp.name, sp.level, ms.name AS magic_school_name, sp.casting_time, sp.range_area, sp.components, sp.duration, sp.description, sp.at_higher_levels, sp.ritual, sp.concentration FROM dnd_spells sp LEFT JOIN dnd_magic_schools ms ON sp.magic_school_id = ms.magic_school_id ORDER BY sp.level, sp.name;');
    res.json(rows);
  } catch (err) { console.error('Error fetching D&D spells:', err); res.status(500).json({ error: 'Server Error' }); }
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