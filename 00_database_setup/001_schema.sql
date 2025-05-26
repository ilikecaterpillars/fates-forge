-- 001_schema.sql - Refactor Stage 3: NPCs, Campaign NPC/Item Instances (Corrected NPC Constraint)

-- Drop tables in an order that respects foreign key constraints
DROP TABLE IF EXISTS character_conditions CASCADE;
DROP TABLE IF EXISTS character_inventory CASCADE;
DROP TABLE IF EXISTS character_prepared_spells CASCADE;
DROP TABLE IF EXISTS character_known_spells CASCADE;
DROP TABLE IF EXISTS character_proficiencies CASCADE;
DROP TABLE IF EXISTS player_characters CASCADE; 

DROP TABLE IF EXISTS live_sessions CASCADE;
DROP TABLE IF EXISTS campaign_item_instances CASCADE; 
DROP TABLE IF EXISTS campaign_npc_instances CASCADE;  
DROP TABLE IF EXISTS npcs CASCADE;                    
DROP TABLE IF EXISTS world_locations CASCADE; 
DROP TABLE IF EXISTS world_factions CASCADE;  
DROP TABLE IF EXISTS world_cultures CASCADE;  
DROP TABLE IF EXISTS world_regions CASCADE;   
DROP TABLE IF EXISTS world_campaigns CASCADE; 
DROP TABLE IF EXISTS campaigns CASCADE;       
DROP TABLE IF EXISTS projects CASCADE;        
DROP TABLE IF EXISTS worlds CASCADE;          

DROP TABLE IF EXISTS dnd_items CASCADE;
DROP TABLE IF EXISTS dnd_spells CASCADE;
DROP TABLE IF EXISTS dnd_magic_schools CASCADE;
DROP TABLE IF EXISTS dnd_conditions CASCADE;
DROP TABLE IF EXISTS dnd_damage_types CASCADE;
DROP TABLE IF EXISTS dnd_proficiencies CASCADE;
DROP TABLE IF EXISTS dnd_skills CASCADE; 
DROP TABLE IF EXISTS dnd_backgrounds CASCADE;
DROP TABLE IF EXISTS dnd_classes CASCADE;
DROP TABLE IF EXISTS dnd_races CASCADE;
DROP TABLE IF EXISTS dnd_alignments CASCADE;
DROP TABLE IF EXISTS dnd_abilities CASCADE;

DROP TABLE IF EXISTS character_templates CASCADE;
DROP TABLE IF EXISTS template_proficiencies CASCADE;
DROP TABLE IF EXISTS template_known_spells CASCADE;
DROP TABLE IF EXISTS template_prepared_spells CASCADE;
DROP TABLE IF EXISTS template_inventory CASCADE;
DROP TABLE IF EXISTS template_conditions CASCADE;


-- ====================================================================
-- D&D 5e CORE RULESET LOOKUP TABLES
-- ====================================================================

CREATE TABLE dnd_abilities (
    ability_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, 
    abbreviation VARCHAR(3) NOT NULL UNIQUE 
);
COMMENT ON TABLE dnd_abilities IS 'D&D abilities: Strength, Dexterity, etc.';

CREATE TABLE dnd_alignments (
    alignment_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    abbreviation VARCHAR(5) UNIQUE,
    description TEXT
);
COMMENT ON TABLE dnd_alignments IS 'D&D 5e alignment options.';

CREATE TABLE dnd_races (
    race_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    asi_bonus JSONB, 
    speed INT,
    size_category VARCHAR(50),
    parent_race_id INT NULL REFERENCES dnd_races(race_id),
    racial_features JSONB 
);
COMMENT ON TABLE dnd_races IS 'D&D 5e race and subrace information.';

CREATE TABLE dnd_classes (
    class_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    hit_die INT NOT NULL, 
    primary_ability_ids INT[], 
    saving_throw_proficiency_ability_ids INT[] NOT NULL,
    spellcasting_ability_id INT REFERENCES dnd_abilities(ability_id) ON DELETE SET NULL,
    class_features_by_level JSONB,
    can_prepare_spells BOOLEAN DEFAULT FALSE 
);
COMMENT ON TABLE dnd_classes IS 'D&D 5e class information.';

CREATE TABLE dnd_skills (
    skill_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    ability_id INT NOT NULL REFERENCES dnd_abilities(ability_id)
);
COMMENT ON TABLE dnd_skills IS 'D&D 5e skills and their governing abilities.';

CREATE TABLE dnd_proficiencies (
    proficiency_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, 
    related_skill_id INT NULL REFERENCES dnd_skills(skill_id), 
    related_ability_id INT NULL REFERENCES dnd_abilities(ability_id) 
);
COMMENT ON TABLE dnd_proficiencies IS 'Master list of proficiencies (armor, weapons, tools, skills, languages, saving throws).';

CREATE TABLE dnd_backgrounds (
    background_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    starting_proficiencies JSONB, 
    equipment_granted TEXT,
    feature_name VARCHAR(255),
    feature_description TEXT,
    suggested_characteristics JSONB
);
COMMENT ON TABLE dnd_backgrounds IS 'D&D 5e background information.';

CREATE TABLE dnd_conditions (
    condition_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);
COMMENT ON TABLE dnd_conditions IS 'D&D 5e conditions (e.g., Blinded, Charmed).';

CREATE TABLE dnd_damage_types (
    damage_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);
COMMENT ON TABLE dnd_damage_types IS 'D&D 5e damage types.';

CREATE TABLE dnd_magic_schools (
    magic_school_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);
COMMENT ON TABLE dnd_magic_schools IS 'D&D 5e schools of magic.';

CREATE TABLE dnd_spells (
    spell_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    level INT NOT NULL,
    magic_school_id INT REFERENCES dnd_magic_schools(magic_school_id),
    casting_time VARCHAR(100),
    range_area VARCHAR(100),
    components VARCHAR(255),
    duration VARCHAR(100),
    description TEXT,
    at_higher_levels TEXT,
    ritual BOOLEAN DEFAULT FALSE,
    concentration BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE dnd_spells IS 'Master list of D&D 5e spells.';

CREATE TABLE dnd_items (
    item_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL, 
    description TEXT,
    properties JSONB, 
    weight DECIMAL(10,2),
    cost_gp DECIMAL(10,2),
    requires_attunement BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE dnd_items IS 'Master list of D&D 5e items.';

-- ====================================================================
-- CORE APPLICATION DATA TABLES (Refactored)
-- ====================================================================

CREATE TABLE worlds (
    world_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    core_concept TEXT,
    primary_themes TEXT,
    overall_tone TEXT,
    defining_features JSONB, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE worlds IS 'Stores foundational lore, settings, and unique defining features for distinct, reusable worlds.';
COMMENT ON COLUMN worlds.name IS 'The unique name of the world/setting.';
COMMENT ON COLUMN worlds.description IS 'A general overview or summary of the world.';
COMMENT ON COLUMN worlds.core_concept IS 'The high-level idea or premise of the world.';
COMMENT ON COLUMN worlds.primary_themes IS 'Comma-separated list or JSON array of primary themes.';
COMMENT ON COLUMN worlds.overall_tone IS 'The general feel of the world (e.g., gritty, epic, whimsical).';
COMMENT ON COLUMN worlds.defining_features IS 'JSONB field for dynamic, world-specific key lore, physics, history, or unique concepts (e.g., The Axion Tide, The Rupture).';

CREATE TABLE campaigns (
    campaign_id SERIAL PRIMARY KEY, 
    world_id INT NOT NULL REFERENCES worlds(world_id) ON DELETE RESTRICT, 
    campaign_name VARCHAR(255) NOT NULL, 
    suite_version_at_creation VARCHAR(50), 
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_saved_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    campaign_scope TEXT, 
    generation_mode_preference TEXT, 
    plot_arc_title VARCHAR(255), 
    plot_overview TEXT,         
    main_questline JSONB,       
    side_quests JSONB,          
    antagonists_allies JSONB,   
    dm_intro TEXT,              
    dm_secrets TEXT,            
    CONSTRAINT uq_campaign_name UNIQUE (campaign_name) 
);
COMMENT ON TABLE campaigns IS 'Stores metadata, plot, and links for each specific adventure or campaign being run. Formerly "projects".';
COMMENT ON COLUMN campaigns.campaign_id IS 'Unique identifier for the campaign (formerly project_id).';
COMMENT ON COLUMN campaigns.world_id IS 'The world in which this campaign takes place.';
COMMENT ON COLUMN campaigns.campaign_name IS 'The unique name of the campaign (formerly project_name).';
COMMENT ON COLUMN campaigns.suite_version_at_creation IS 'Version of the Saga Sculptor suite when the campaign was created.';
COMMENT ON COLUMN campaigns.created_date IS 'Timestamp of when the campaign was first created.';
COMMENT ON COLUMN campaigns.last_saved_date IS 'Timestamp of when the campaign was last saved/updated.';
COMMENT ON COLUMN campaigns.campaign_scope IS 'e.g., "One-Shot", "Mini-Campaign", "Epic Multi-Arc".';
COMMENT ON COLUMN campaigns.generation_mode_preference IS 'User preference for AI generation involvement.';
COMMENT ON COLUMN campaigns.plot_arc_title IS 'Title for the main plot of this campaign.';
COMMENT ON COLUMN campaigns.plot_overview IS 'Overall summary of the campaign''s story.';
COMMENT ON COLUMN campaigns.main_questline IS 'Structured data (e.g., array of objects) for main quests of this campaign.';
COMMENT ON COLUMN campaigns.side_quests IS 'Structured data for side quests of this campaign.';
COMMENT ON COLUMN campaigns.antagonists_allies IS 'Information about key NPCs specific to this campaign''s plot.';
COMMENT ON COLUMN campaigns.dm_intro IS 'Introduction for the DM for this specific campaign.';
COMMENT ON COLUMN campaigns.dm_secrets IS 'Secrets or hidden information for the DM specific to this campaign''s plot.';

CREATE TABLE world_regions (
    world_region_id SERIAL PRIMARY KEY,
    world_id INT NOT NULL REFERENCES worlds(world_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT, 
    geography_environment TEXT, 
    key_locations_overview TEXT, 
    UNIQUE (world_id, name)
);
COMMENT ON TABLE world_regions IS 'Defines distinct geographical or political regions within a world.';
COMMENT ON COLUMN world_regions.world_id IS 'The world this region belongs to.';
COMMENT ON COLUMN world_regions.name IS 'Name of the region (e.g., Solum, Vellumbra).';
COMMENT ON COLUMN world_regions.geography_environment IS 'Description of the typical geography and environment.';
COMMENT ON COLUMN world_regions.key_locations_overview IS 'A brief overview of important landmarks or sub-areas within this region.';

CREATE TABLE world_cultures (
    world_culture_id SERIAL PRIMARY KEY,
    world_region_id INT NOT NULL REFERENCES world_regions(world_region_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, 
    description TEXT, 
    aesthetics_feel TEXT, 
    naming_conventions JSONB, 
    cultural_traditions TEXT, 
    common_languages TEXT, 
    art_visual_style TEXT,
    typical_alignments TEXT, 
    UNIQUE (world_region_id, name)
);
COMMENT ON TABLE world_cultures IS 'Details distinct cultural groups, their traits, and naming conventions, typically within a region.';
COMMENT ON COLUMN world_cultures.world_region_id IS 'The region this culture primarily belongs to.';
COMMENT ON COLUMN world_cultures.name IS 'Name of the culture (e.g., The Valden of Solum).';
COMMENT ON COLUMN world_cultures.naming_conventions IS 'JSONB: phonetic tendencies, structures, "anti-rules", example names for AI guidance.';

CREATE TABLE world_factions (
    world_faction_id SERIAL PRIMARY KEY,
    world_region_id INT NOT NULL REFERENCES world_regions(world_region_id) ON DELETE CASCADE, 
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goals TEXT,
    typical_members TEXT,
    leader_npc_details TEXT, 
    base_of_operations_info TEXT, 
    UNIQUE (world_region_id, name) 
);
COMMENT ON TABLE world_factions IS 'Details distinct factions or organizations within a world region.';
COMMENT ON COLUMN world_factions.world_region_id IS 'The primary region of operation for this faction.';

CREATE TABLE world_locations (
    location_id SERIAL PRIMARY KEY,
    world_region_id INT NOT NULL REFERENCES world_regions(world_region_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_location_id INT NULL REFERENCES world_locations(location_id),
    map_grid_representation TEXT, 
    map_dimensions JSONB, 
    map_legend JSONB, 
    interactable_objects JSONB, 
    UNIQUE (world_region_id, name) 
);
COMMENT ON TABLE world_locations IS 'Defines specific locations (cities, towns, dungeons) within a world region.';
COMMENT ON COLUMN world_locations.world_region_id IS 'The region this location belongs to.';
COMMENT ON COLUMN world_locations.parent_location_id IS 'For hierarchical locations (e.g., a room within a dungeon).';
COMMENT ON COLUMN world_locations.map_grid_representation IS 'For text-based grid, e.g., "#####\\n#P.E#\\n#####".';
COMMENT ON COLUMN world_locations.map_dimensions IS 'e.g., {"width": 5, "height": 3}.';
COMMENT ON COLUMN world_locations.map_legend IS 'e.g., {"#": "Wall", ".": "Floor", "P": "Player Start"}.';
COMMENT ON COLUMN world_locations.interactable_objects IS 'e.g., [{"name": "Chest", "description": "...", "grid_position": {"x":2, "y":1}, "state": "locked"}].';

-- NEW: NPC Templates Table (Corrected Constraints)
CREATE TABLE npcs (
    npc_id SERIAL PRIMARY KEY,
    world_id INT NULL REFERENCES worlds(world_id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    stat_block JSONB,
    default_disposition TEXT,
    dialogue_template_id INT NULL,
    default_inventory JSONB,
    is_unique BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_npc_name_in_world_or_generic UNIQUE (name, world_id) -- Ensures name is unique within a world, or globally if world_id is NULL
    -- If world_id is NULL, then 'name' must be globally unique for generic NPCs.
    -- If world_id is NOT NULL, then 'name' must be unique for that specific world.
    -- PostgreSQL handles NULLs in unique constraints such that multiple NULLs are allowed for world_id
    -- but if world_id is the same, name must be unique.
    -- And if world_id is NULL, name must be unique among other NULL world_id entries.
);
COMMENT ON TABLE npcs IS 'Stores NPC templates/archetypes and unique named NPCs with their baseline stats and behaviors.';
COMMENT ON COLUMN npcs.world_id IS 'World this NPC template is primarily associated with (NULL if generic).';
COMMENT ON COLUMN npcs.name IS 'Can be archetype name (e.g., "Goblin Sentry") or unique NPC name (e.g., "Reeve Marlis").';
COMMENT ON COLUMN npcs.stat_block IS 'D&D style stats: AC, HP, attacks, abilities, skills, senses, CR, traits, actions, reactions.';
COMMENT ON COLUMN npcs.default_inventory IS 'Default items carried by this NPC type. e.g., [{"item_id": X, "quantity": Y, "equipped": true/false}]';
COMMENT ON COLUMN npcs.is_unique IS 'True for specific named NPCs (e.g., Sarkon), false for generic archetypes (e.g., Town Guard).';
COMMENT ON CONSTRAINT uq_npc_name_in_world_or_generic ON npcs IS 'Ensures NPC name is unique within a specific world, or globally unique if not tied to a world.';


-- NEW: Campaign-Specific NPC Instances Table
CREATE TABLE campaign_npc_instances (
    campaign_npc_instance_id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    npc_id INT NOT NULL REFERENCES npcs(npc_id) ON DELETE CASCADE, 
    location_id INT NULL REFERENCES world_locations(location_id) ON DELETE SET NULL, 
    custom_name VARCHAR(255) NULL, 
    current_hp INT,
    position_x INT, 
    position_y INT, 
    current_state JSONB, 
    instance_inventory JSONB 
);
COMMENT ON TABLE campaign_npc_instances IS 'Tracks specific instances of NPCs within a campaign, their current status, location, and any deviations from their template.';
COMMENT ON COLUMN campaign_npc_instances.npc_id IS 'References the base NPC template from the npcs table.';
COMMENT ON COLUMN campaign_npc_instances.location_id IS 'Current location of this NPC instance within the campaign world.';
COMMENT ON COLUMN campaign_npc_instances.custom_name IS 'Specific name for this instance, if different from the NPC template name.';
COMMENT ON COLUMN campaign_npc_instances.current_state IS 'JSONB storing dynamic data like disposition towards party, knowledge, current activity, temporary conditions.';
COMMENT ON COLUMN campaign_npc_instances.instance_inventory IS 'JSONB for this specific NPC instance''s inventory, potentially overriding or adding to the template''s default_inventory.';


-- NEW: Campaign-Specific Item Instances Table (items in the world, not carried by PCs)
CREATE TABLE campaign_item_instances (
    campaign_item_instance_id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES dnd_items(item_id) ON DELETE CASCADE,
    location_id INT NOT NULL REFERENCES world_locations(location_id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    position_x INT NULL, 
    position_y INT NULL, 
    instance_properties JSONB 
);
COMMENT ON TABLE campaign_item_instances IS 'Tracks items found within specific locations in a campaign, not carried by PCs.';
COMMENT ON COLUMN campaign_item_instances.item_id IS 'References the base item from the dnd_items table.';
COMMENT ON COLUMN campaign_item_instances.location_id IS 'The location where this item instance can be found.';
COMMENT ON COLUMN campaign_item_instances.instance_properties IS 'JSONB for specific state of this item instance, like being hidden, trapped, or having unique descriptors.';


CREATE TABLE player_characters ( 
    player_character_id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE, 
    character_name VARCHAR(255) NOT NULL,
    level INT DEFAULT 1 NOT NULL,
    experience_points INT DEFAULT 0,
    race_id INT REFERENCES dnd_races(race_id),
    class_id INT REFERENCES dnd_classes(class_id),
    background_id INT REFERENCES dnd_backgrounds(background_id),
    alignment_id INT REFERENCES dnd_alignments(alignment_id),
    strength INT DEFAULT 10, dexterity INT DEFAULT 10, constitution INT DEFAULT 10,
    intelligence INT DEFAULT 10, wisdom INT DEFAULT 10, charisma INT DEFAULT 10,
    max_hp INT, current_hp INT, temporary_hp INT DEFAULT 0,
    armor_class INT, 
    speed VARCHAR(50), 
    hit_dice_max TEXT, 
    hit_dice_current INT, 
    death_saves_successes INT DEFAULT 0, death_saves_failures INT DEFAULT 0,
    spell_slots JSONB, 
    pact_magic_slots JSONB, 
    currency JSONB, 
    senses JSONB, 
    personality_traits TEXT, ideals TEXT, bonds TEXT, flaws TEXT,
    backstory TEXT, appearance TEXT,
    roleplaying_notes TEXT,
    inspiration BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_character_name_in_campaign UNIQUE (campaign_id, character_name) 
);
COMMENT ON TABLE player_characters IS 'Stores D&D 5e player character data for a specific campaign. To be renamed to campaign_characters.';
COMMENT ON COLUMN player_characters.campaign_id IS 'The campaign this character belongs to (formerly project_id).';

CREATE TABLE character_proficiencies (
    character_proficiency_id SERIAL PRIMARY KEY,
    player_character_id INT NOT NULL REFERENCES player_characters(player_character_id) ON DELETE CASCADE,
    proficiency_id INT NOT NULL REFERENCES dnd_proficiencies(proficiency_id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'proficient', 
    source_of_proficiency VARCHAR(100), 
    UNIQUE (player_character_id, proficiency_id)
);
COMMENT ON TABLE character_proficiencies IS 'Join table for character proficiencies.';

CREATE TABLE character_known_spells (
    character_known_spell_id SERIAL PRIMARY KEY,
    player_character_id INT NOT NULL REFERENCES player_characters(player_character_id) ON DELETE CASCADE,
    spell_id INT NOT NULL REFERENCES dnd_spells(spell_id) ON DELETE CASCADE,
    source_of_learning VARCHAR(100), 
    UNIQUE (player_character_id, spell_id)
);
COMMENT ON TABLE character_known_spells IS 'Spells a character knows.';

CREATE TABLE character_prepared_spells (
    character_prepared_spell_id SERIAL PRIMARY KEY,
    player_character_id INT NOT NULL REFERENCES player_characters(player_character_id) ON DELETE CASCADE,
    spell_id INT NOT NULL REFERENCES dnd_spells(spell_id) ON DELETE CASCADE,
    is_always_prepared BOOLEAN DEFAULT FALSE, 
    UNIQUE (player_character_id, spell_id)
);
COMMENT ON TABLE character_prepared_spells IS 'Spells a character has prepared.';

CREATE TABLE character_inventory (
    character_inventory_id SERIAL PRIMARY KEY,
    player_character_id INT NOT NULL REFERENCES player_characters(player_character_id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES dnd_items(item_id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    is_equipped BOOLEAN DEFAULT FALSE,
    is_attuned BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE character_inventory IS 'Join table for items in a character''s inventory.';

CREATE TABLE character_conditions (
    character_condition_id SERIAL PRIMARY KEY,
    player_character_id INT NOT NULL REFERENCES player_characters(player_character_id) ON DELETE CASCADE,
    condition_id INT NOT NULL REFERENCES dnd_conditions(condition_id) ON DELETE CASCADE,
    source TEXT, 
    duration_turns INT, 
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (player_character_id, condition_id, source) 
);
COMMENT ON TABLE character_conditions IS 'Tracks active conditions on a character.';

CREATE TABLE live_sessions (
    live_session_id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL UNIQUE REFERENCES campaigns(campaign_id) ON DELETE CASCADE, 
    current_location_id INT NULL REFERENCES world_locations(location_id), 
    current_location_narrative TEXT, 
    current_ingame_datetime TEXT, 
    active_player_character_ids INT[],
    object_positions_on_map JSONB, 
    character_states_session JSONB, 
    npc_states_session JSONB, 
    combat_state JSONB, 
    event_log TEXT[], 
    player_preferences JSONB, 
    narrative_focus TEXT,
    scene_objectives TEXT, 
    world_events_pending JSONB, 
    dm_session_notes TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, 
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE live_sessions IS 'Stores the dynamic state of an active game session for a campaign.';
COMMENT ON COLUMN live_sessions.campaign_id IS 'Link to the parent campaign; UNIQUE ensures one active live session state per campaign.';
COMMENT ON COLUMN live_sessions.current_location_id IS 'FK to world_locations, indicating the current map/area.';
COMMENT ON COLUMN live_sessions.current_ingame_datetime IS 'Current in-game date and time, can be abstract text or a timestamp.';
COMMENT ON COLUMN live_sessions.object_positions_on_map IS 'JSONB storing grid coordinates of PCs, NPCs, items on the current map.';
COMMENT ON COLUMN live_sessions.npc_states_session IS 'JSONB to store current states of NPCs relevant ONLY to this session (e.g. minor, unnamed NPCs). More permanent NPCs should be in campaign_npc_instances.';
COMMENT ON COLUMN live_sessions.combat_state IS 'JSONB to store details if combat is active.';
COMMENT ON COLUMN live_sessions.event_log IS 'An array of textual descriptions of key events that have occurred.';
COMMENT ON COLUMN live_sessions.player_preferences IS 'JSONB for storing player-specific preferences for the session.';
COMMENT ON COLUMN live_sessions.character_states_session IS 'JSONB for session-specific PC states (HP overrides, conditions, expended resources not on main PC sheet).';

-- ====================================================================
-- CHARACTER TEMPLATE TABLES (Worldless)
-- ====================================================================

CREATE TABLE character_templates (
    character_template_id SERIAL PRIMARY KEY,
    character_name VARCHAR(255) NOT NULL UNIQUE,
    level INT DEFAULT 1 NOT NULL,
    experience_points INT DEFAULT 0,
    race_id INT REFERENCES dnd_races(race_id),
    class_id INT REFERENCES dnd_classes(class_id),
    background_id INT REFERENCES dnd_backgrounds(background_id),
    alignment_id INT REFERENCES dnd_alignments(alignment_id),
    strength INT DEFAULT 10, dexterity INT DEFAULT 10, constitution INT DEFAULT 10,
    intelligence INT DEFAULT 10, wisdom INT DEFAULT 10, charisma INT DEFAULT 10,
    max_hp INT, current_hp INT, temporary_hp INT DEFAULT 0,
    armor_class INT,
    speed VARCHAR(50),
    hit_dice_max TEXT,
    hit_dice_current INT,
    death_saves_successes INT DEFAULT 0, death_saves_failures INT DEFAULT 0,
    spell_slots JSONB,
    pact_magic_slots JSONB,
    currency JSONB,
    senses JSONB,
    personality_traits TEXT, ideals TEXT, bonds TEXT, flaws TEXT,
    backstory TEXT, appearance TEXT,
    roleplaying_notes TEXT,
    inspiration BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE character_templates IS 'Stores D&D 5e worldless character templates/blueprints.';
COMMENT ON COLUMN character_templates.character_name IS 'The unique name of the character template.';

CREATE TABLE template_proficiencies (
    template_proficiency_id SERIAL PRIMARY KEY,
    character_template_id INT NOT NULL REFERENCES character_templates(character_template_id) ON DELETE CASCADE,
    proficiency_id INT NOT NULL REFERENCES dnd_proficiencies(proficiency_id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'proficient',
    source_of_proficiency VARCHAR(100),
    UNIQUE (character_template_id, proficiency_id)
);
COMMENT ON TABLE template_proficiencies IS 'Join table for character template proficiencies.';

CREATE TABLE template_known_spells (
    template_known_spell_id SERIAL PRIMARY KEY,
    character_template_id INT NOT NULL REFERENCES character_templates(character_template_id) ON DELETE CASCADE,
    spell_id INT NOT NULL REFERENCES dnd_spells(spell_id) ON DELETE CASCADE,
    source_of_learning VARCHAR(100),
    UNIQUE (character_template_id, spell_id)
);
COMMENT ON TABLE template_known_spells IS 'Spells a character template knows.';

CREATE TABLE template_prepared_spells (
    template_prepared_spell_id SERIAL PRIMARY KEY,
    character_template_id INT NOT NULL REFERENCES character_templates(character_template_id) ON DELETE CASCADE,
    spell_id INT NOT NULL REFERENCES dnd_spells(spell_id) ON DELETE CASCADE,
    is_always_prepared BOOLEAN DEFAULT FALSE,
    UNIQUE (character_template_id, spell_id)
);
COMMENT ON TABLE template_prepared_spells IS 'Spells a character template has prepared.';

CREATE TABLE template_inventory (
    template_inventory_id SERIAL PRIMARY KEY,
    character_template_id INT NOT NULL REFERENCES character_templates(character_template_id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES dnd_items(item_id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    is_equipped BOOLEAN DEFAULT FALSE,
    is_attuned BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE template_inventory IS 'Join table for items in a character template''s inventory.';

CREATE TABLE template_conditions (
    template_condition_id SERIAL PRIMARY KEY,
    character_template_id INT NOT NULL REFERENCES character_templates(character_template_id) ON DELETE CASCADE,
    condition_id INT NOT NULL REFERENCES dnd_conditions(condition_id) ON DELETE CASCADE,
    source TEXT,
    duration_turns INT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (character_template_id, condition_id, source)
);
COMMENT ON TABLE template_conditions IS 'Tracks active conditions on a character template (less common for templates, but included for structural consistency).';

-- ====================================================================
-- END OF SCHEMA SCRIPT
-- ====================================================================