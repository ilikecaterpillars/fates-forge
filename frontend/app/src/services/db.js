import Dexie from 'dexie';

export const db = new Dexie('FateForgeDB');

const DB_DATA_VERSION_KEY = 'fateForgeDbDataVersion';
const CURRENT_APP_DATA_VERSION = 1; 

db.version(1).stores({
  // D&D Lookup Tables - Using original IDs as primary keys
  dnd_abilities: 'ability_id, name, abbreviation',
  dnd_alignments: 'alignment_id, name, abbreviation',
  dnd_races: 'race_id, name, parent_race_id, size_category',
  dnd_classes: 'class_id, name, hit_die, spellcasting_ability_id', // Removed '&' from spellcasting_ability_id as it can be null
  dnd_skills: 'skill_id, name, ability_id', // Removed '&' from ability_id
  dnd_proficiencies: 'proficiency_id, name, type, related_skill_id, related_ability_id', // Removed '&'
  dnd_backgrounds: 'background_id, name',
  dnd_conditions: 'condition_id, name',
  dnd_damage_types: 'damage_type_id, name',
  dnd_magic_schools: 'magic_school_id, name',
  dnd_spells: 'spell_id, name, level, magic_school_id, ritual, concentration', // Removed '&'
  dnd_items: 'item_id, name, type, requires_attunement',

  // User Content - Worlds, Campaigns, and related world-building entities
  worlds: '++local_world_id, &name, server_world_id, created_at, updated_at', // Use local ID, unique name
  world_regions: '++local_region_id, world_local_id, name', // world_local_id FK to worlds.local_world_id
  world_cultures: '++local_culture_id, region_local_id, name',
  world_factions: '++local_faction_id, region_local_id, name',
  world_locations: '++local_location_id, region_local_id, name, parent_local_location_id',
  
  campaigns: '++local_campaign_id, world_local_id, &campaign_name, server_campaign_id, created_date, last_saved_date',

  // User Content - NPCs
  npcs: '++local_npc_id, name, world_local_id, is_unique, server_npc_id', 
  campaign_npc_instances: '++local_campaign_npc_id, campaign_local_id, npc_local_id, location_local_id, custom_name',

  // User Content - Campaign Item Instances
  campaign_item_instances: '++local_campaign_item_id, campaign_local_id, item_id, location_local_id', // item_id FK to dnd_items.item_id

  // User Content - Character Templates
  character_templates: '++local_template_id, &character_name, server_template_id, created_at, updated_at',
  template_proficiencies: '++id, &[local_template_id+proficiency_id]',
  template_known_spells: '++id, &[local_template_id+spell_id]',
  template_prepared_spells: '++id, &[local_template_id+spell_id]',
  template_inventory: '++id, local_template_id, item_id', // item_id FK to dnd_items.item_id
  template_conditions: '++id, &[local_template_id+condition_id+source]',

  // User Content - Player Characters (Campaign-Specific)
  player_characters: '++local_pc_id, campaign_local_id, &character_name, server_pc_id, created_at, updated_at', // Unique char name per campaign needs compound index if campaign_local_id isn't part of PK: '&[campaign_local_id+character_name]'
  character_proficiencies: '++id, &[local_pc_id+proficiency_id]',
  character_known_spells: '++id, &[local_pc_id+spell_id]',
  character_prepared_spells: '++id, &[local_pc_id+spell_id]',
  character_inventory: '++id, local_pc_id, item_id', // item_id FK to dnd_items.item_id
  character_conditions: '++id, &[local_pc_id+condition_id+source]',
  
  // User Content - Live Sessions
  live_sessions: '++local_session_id, &campaign_local_id, current_local_location_id, server_session_id, last_updated_at',

  // Meta table
  app_meta: 'key',
});

// --- Database Seeding and Initialization Logic (Functions are the same as before) ---
async function needsDataUpdate() {
  const storedMeta = await db.app_meta.get(DB_DATA_VERSION_KEY);
  return !storedMeta || storedMeta.value < CURRENT_APP_DATA_VERSION;
}
async function markDataAsUpdated() {
  await db.app_meta.put({ key: DB_DATA_VERSION_KEY, value: CURRENT_APP_DATA_VERSION });
}
async function seedTableFromJson(tableName, jsonFilePath) {
  try {
    const response = await fetch(jsonFilePath);
    if (!response.ok) throw new Error(`Failed to fetch ${jsonFilePath}: ${response.statusText}`);
    const data = await response.json();
    if (data && Array.isArray(data)) {
      // For dnd_* tables, ensure your JSON has the ID field (e.g. race_id) if not using '++' in schema
      await db[tableName].bulkPut(data);
      console.log(`Table ${tableName} seeded from ${jsonFilePath} with ${data.length} records.`);
    } else {
      console.warn(`No data or invalid format in ${jsonFilePath} for table ${tableName}.`);
    }
  } catch (error) {
    console.error(`Error seeding table ${tableName} from ${jsonFilePath}:`, error);
  }
}
export async function initializeAndSeedDatabase() {
  if (await needsDataUpdate()) {
    console.log('DB seeding/update. App data version:', CURRENT_APP_DATA_VERSION);
    const dndDataFiles = [
      { table: 'dnd_abilities', path: '/data/dnd_abilities.json' },
      { table: 'dnd_alignments', path: '/data/dnd_alignments.json' },
      { table: 'dnd_races', path: '/data/dnd_races.json' },
      { table: 'dnd_classes', path: '/data/dnd_classes.json' },
      { table: 'dnd_skills', path: '/data/dnd_skills.json' },
      { table: 'dnd_proficiencies', path: '/data/dnd_proficiencies.json' },
      { table: 'dnd_backgrounds', path: '/data/dnd_backgrounds.json' },
      { table: 'dnd_items', path: '/data/dnd_items.json' },
      { table: 'dnd_spells', path: '/data/dnd_spells.json' },
      { table: 'dnd_magic_schools', path: '/data/dnd_magic_schools.json' },
      { table: 'dnd_conditions', path: '/data/dnd_conditions.json' },
      { table: 'dnd_damage_types', path: '/data/dnd_damage_types.json' },
    ];
    for (const fileInfo of dndDataFiles) await seedTableFromJson(fileInfo.table, fileInfo.path);
    // Add example user content seeding here if needed
    await markDataAsUpdated();
    console.log('DB seeding/update complete.');
  } else {
    console.log('DB up to date. App data version:', CURRENT_APP_DATA_VERSION);
  }
}
db.open().then(() => {
  console.log("FateForgeDB connection opened.");
  return initializeAndSeedDatabase(); 
}).catch ('DexieError', err => console.error("Dexie specific error:", err.name, err.message, err.stack))
  .catch(err => console.error("Generic DB open error:", err.stack || err));

// --- D&D Lookup Functions (Same as before) ---
export const getAllAbilities = () => db.dnd_abilities.toArray();
export const getAllAlignments = () => db.dnd_alignments.toArray();
export const getAllRaces = () => db.dnd_races.orderBy('name').toArray();
export const getAllClasses = () => db.dnd_classes.orderBy('name').toArray();
export const getAllBackgrounds = () => db.dnd_backgrounds.orderBy('name').toArray();
export const getAllSkills = () => db.dnd_skills.orderBy('name').toArray();
export const getAllItems = () => db.dnd_items.orderBy('name').toArray();
export const getAllSpells = () => db.dnd_spells.orderBy('name').toArray();


// === WORLDS ===
export async function saveWorld(worldData) {
  // worldData includes: name, description, core_concept, etc.
  // If worldData.local_world_id exists, it's an update, otherwise it's a new world.
  try {
    if (worldData.local_world_id) {
      await db.worlds.put(worldData); // put handles update
      return worldData.local_world_id;
    } else {
      const newId = await db.worlds.add({ // add for new record
        ...worldData, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      });
      return newId;
    }
  } catch (error) {
    console.error("Error saving world:", error);
    if (error.name === 'ConstraintError') throw new Error('A world with this name already exists.');
    throw error;
  }
}
export const getAllWorlds = () => db.worlds.orderBy('name').toArray();
export async function getWorldWithDetails(localWorldId) {
  const id = parseInt(localWorldId);
  if (isNaN(id)) return null;
  const world = await db.worlds.get(id);
  if (!world) return null;
  // Example: Fetch related regions if needed for a "details" view
  // world.regions = await db.world_regions.where({ world_local_id: id }).toArray();
  return world;
}
export async function deleteWorld(localWorldId) {
    const id = parseInt(localWorldId);
    if (isNaN(id)) return;
    // NOTE: Dexie doesn't have cascading deletes. You must handle related data deletion manually.
    return db.transaction('rw', db.worlds, db.campaigns, db.world_regions /* add other related tables */, async () => {
        // Example: Delete campaigns associated with this world
        const campaignsToDelete = await db.campaigns.where({ world_local_id: id }).toArray();
        for (const camp of campaignsToDelete) {
            await deleteCampaign(camp.local_campaign_id); // Recursive call to handle campaign's children
        }
        await db.world_regions.where({ world_local_id: id }).delete();
        // ... delete other related entities: world_cultures, world_factions, world_locations, npcs (world-specific)
        await db.worlds.delete(id);
        console.log(`World ${id} and related data deleted.`);
    }).catch(error => {
        console.error(`Error deleting world ${id}:`, error);
        throw error;
    });
}

// === CAMPAIGNS ===
export async function saveCampaign(campaignData) {
  // campaignData includes: world_local_id, campaign_name, etc.
  try {
    if (campaignData.local_campaign_id) {
      await db.campaigns.put(campaignData);
      return campaignData.local_campaign_id;
    } else {
      const newId = await db.campaigns.add({ 
        ...campaignData, 
        created_date: new Date().toISOString(), 
        last_saved_date: new Date().toISOString() 
      });
      return newId;
    }
  } catch (error) {
    console.error("Error saving campaign:", error);
    if (error.name === 'ConstraintError') throw new Error('A campaign with this name already exists.');
    throw error;
  }
}
export const getAllCampaigns = () => db.campaigns.orderBy('campaign_name').toArray();
export const getCampaignsByWorld = (worldLocalId) => db.campaigns.where({ world_local_id: parseInt(worldLocalId) }).toArray();
export async function getCampaignWithDetails(localCampaignId) {
  const id = parseInt(localCampaignId);
  if (isNaN(id)) return null;
  const campaign = await db.campaigns.get(id);
  if (!campaign) return null;
  campaign.player_characters = await db.player_characters.where({ campaign_local_id: id }).toArray();
  // campaign.npc_instances = await db.campaign_npc_instances.where({ campaign_local_id: id }).toArray();
  // campaign.item_instances = await db.campaign_item_instances.where({ campaign_local_id: id }).toArray();
  // campaign.live_session = await db.live_sessions.get({ campaign_local_id: id });
  return campaign;
}
export async function deleteCampaign(localCampaignId) {
    const id = parseInt(localCampaignId);
    if (isNaN(id)) return;
    return db.transaction('rw', db.campaigns, db.player_characters /*, db.campaign_npc_instances, db.live_sessions etc */, async () => {
        // Delete related player characters
        const pcsToDelete = await db.player_characters.where({campaign_local_id: id}).toArray();
        for(const pc of pcsToDelete) {
            await deletePlayerCharacter(pc.local_pc_id);
        }
        // ... delete other campaign-specific data like NPC instances, item instances, live session ...
        // await db.campaign_npc_instances.where({ campaign_local_id: id }).delete();
        // await db.live_sessions.where({ campaign_local_id: id }).delete();
        await db.campaigns.delete(id);
        console.log(`Campaign ${id} and related data deleted.`);
    }).catch(error => {
        console.error(`Error deleting campaign ${id}:`, error);
        throw error;
    });
}

// === CHARACTER TEMPLATES (Functions from your previous version, adapted for local IDs) ===
export async function saveCharacterTemplate(templateData) {
  const { proficiencies, known_spells, prepared_spells, inventory, conditions, ...mainTemplateData } = templateData;
  let templateId = mainTemplateData.local_template_id;

  return db.transaction('rw', 
    db.character_templates, db.template_proficiencies, db.template_known_spells, 
    db.template_prepared_spells, db.template_inventory, db.template_conditions, 
    async () => {
      if (templateId) {
        await db.character_templates.put({ ...mainTemplateData, updated_at: new Date().toISOString() });
      } else {
        templateId = await db.character_templates.add({ ...mainTemplateData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      }
      const commonOps = async (table, items) => {
        await table.where({ local_template_id: templateId }).delete();
        if (items && items.length > 0) await table.bulkPut(items.map(item => ({ ...item, local_template_id: templateId })));
      };
      await commonOps(db.template_proficiencies, proficiencies);
      await commonOps(db.template_known_spells, known_spells);
      await commonOps(db.template_prepared_spells, prepared_spells);
      await commonOps(db.template_inventory, inventory);
      await commonOps(db.template_conditions, conditions);
      return templateId; 
  }).catch(error => { console.error("Error saving char template:", error); throw error; });
}
export async function getCharacterTemplateWithDetails(localTemplateId) {
  const id = parseInt(localTemplateId);
  if (isNaN(id)) return null;
  const template = await db.character_templates.get(id);
  if (!template) return null;
  template.proficiencies = await db.template_proficiencies.where({ local_template_id: id }).toArray();
  template.known_spells = await db.template_known_spells.where({ local_template_id: id }).toArray();
  template.prepared_spells = await db.template_prepared_spells.where({ local_template_id: id }).toArray();
  template.inventory = await db.template_inventory.where({ local_template_id: id }).toArray();
  template.conditions = await db.template_conditions.where({ local_template_id: id }).toArray();
  return template;
}
export const getAllCharacterTemplatesSummary = async () => {
    const templates = await db.character_templates.orderBy('character_name').toArray();
    return templates.map(t => ({
        id: t.local_template_id, name: t.character_name, level: t.level,
        race_id: t.race_id, class_id: t.class_id 
    }));
};
export async function deleteCharacterTemplate(localTemplateId) {
    const id = parseInt(localTemplateId);
    if (isNaN(id)) return;
    return db.transaction('rw', db.character_templates, db.template_proficiencies, db.template_known_spells, db.template_prepared_spells, db.template_inventory, db.template_conditions, async () => {
        await db.template_proficiencies.where({ local_template_id: id }).delete();
        await db.template_known_spells.where({ local_template_id: id }).delete();
        await db.template_prepared_spells.where({ local_template_id: id }).delete();
        await db.template_inventory.where({ local_template_id: id }).delete();
        await db.template_conditions.where({ local_template_id: id }).delete();
        await db.character_templates.delete(id);
    }).catch(error => { console.error(`Error deleting template ${id}:`, error); throw error; });
}

// === PLAYER CHARACTERS (Campaign-Specific) ===
export async function savePlayerCharacter(pcData) {
  const { proficiencies, known_spells, prepared_spells, inventory, conditions, ...mainPcData } = pcData;
  let pcId = mainPcData.local_pc_id;

  return db.transaction('rw', 
    db.player_characters, db.character_proficiencies, db.character_known_spells, 
    db.character_prepared_spells, db.character_inventory, db.character_conditions, 
    async () => {
      if (pcId) { // Update
        await db.player_characters.put({ ...mainPcData, updated_at: new Date().toISOString() });
      } else { // Create
        pcId = await db.player_characters.add({ ...mainPcData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      }
      const commonOps = async (table, items) => {
        await table.where({ local_pc_id: pcId }).delete();
        if (items && items.length > 0) await table.bulkPut(items.map(item => ({ ...item, local_pc_id: pcId })));
      };
      await commonOps(db.character_proficiencies, proficiencies);
      await commonOps(db.character_known_spells, known_spells);
      await commonOps(db.character_prepared_spells, prepared_spells);
      await commonOps(db.character_inventory, inventory);
      await commonOps(db.character_conditions, conditions);
      return pcId;
  }).catch(error => { console.error("Error saving player character:", error); throw error; });
}
export async function getPlayerCharacterWithDetails(localPcId) {
  const id = parseInt(localPcId);
  if (isNaN(id)) return null;
  const pc = await db.player_characters.get(id);
  if (!pc) return null;
  pc.proficiencies = await db.character_proficiencies.where({ local_pc_id: id }).toArray();
  pc.known_spells = await db.character_known_spells.where({ local_pc_id: id }).toArray();
  pc.prepared_spells = await db.character_prepared_spells.where({ local_pc_id: id }).toArray();
  pc.inventory = await db.character_inventory.where({ local_pc_id: id }).toArray();
  pc.conditions = await db.character_conditions.where({ local_pc_id: id }).toArray();
  return pc;
}
export const getPlayerCharactersForCampaignSummary = (campaignLocalId) => {
    return db.player_characters
        .where({ campaign_local_id: parseInt(campaignLocalId) })
        .orderBy('character_name')
        .project({ local_pc_id: 1, character_name: 1, level: 1, race_id: 1, class_id: 1 })
        .toArray();
};
export async function deletePlayerCharacter(localPcId) {
    const id = parseInt(localPcId);
    if (isNaN(id)) return;
    return db.transaction('rw', db.player_characters, db.character_proficiencies, db.character_known_spells, db.character_prepared_spells, db.character_inventory, db.character_conditions, async () => {
        await db.character_proficiencies.where({ local_pc_id: id }).delete();
        await db.character_known_spells.where({ local_pc_id: id }).delete();
        await db.character_prepared_spells.where({ local_pc_id: id }).delete();
        await db.character_inventory.where({ local_pc_id: id }).delete();
        await db.character_conditions.where({ local_pc_id: id }).delete();
        await db.player_characters.delete(id);
    }).catch(error => { console.error(`Error deleting PC ${id}:`, error); throw error; });
}

// Note: CRUD for NPCs, Locations, and their campaign instances would follow similar patterns.
// For example, saving an NPC would involve putting to 'npcs' table.
// Saving a Campaign NPC Instance would involve putting to 'campaign_npc_instances' with relevant local IDs.