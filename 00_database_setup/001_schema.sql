-- 00_database_setup/001_schema.sql

-- Drop tables in an order that respects foreign key constraints
DROP TABLE IF EXISTS character_conditions CASCADE;
DROP TABLE IF EXISTS character_inventory CASCADE;
DROP TABLE IF EXISTS character_prepared_spells CASCADE;
DROP TABLE IF EXISTS character_known_spells CASCADE;
DROP TABLE IF EXISTS character_proficiencies CASCADE;
DROP TABLE IF EXISTS player_characters CASCADE;

DROP TABLE IF EXISTS live_sessions CASCADE;
DROP TABLE IF EXISTS world_locations CASCADE; -- Added for map/location definitions
DROP TABLE IF EXISTS world_campaigns CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

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
-- CORE PROJECT AND GAME DATA TABLES
-- ====================================================================

CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_saved_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    suite_version_at_creation VARCHAR(50), 
    CONSTRAINT uq_project_name UNIQUE (project_name)
);
COMMENT ON TABLE projects IS 'Stores metadata for each Saga Sculptor project.';

CREATE TABLE world_campaigns (
    world_campaign_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL UNIQUE REFERENCES projects(project_id) ON DELETE CASCADE,
    core_concept TEXT,
    themes TEXT,
    generation_mode VARCHAR(50),
    global_name_avoid_list TEXT[],
    cosmology TEXT,
    history TEXT,
    geography_notes TEXT, -- General overview
    societies_factions JSONB, 
    magic_system TEXT,
    calendar_details TEXT,
    languages_overview TEXT,
    main_questline JSONB, 
    side_quests JSONB,
    antagonists_allies JSONB,
    dm_intro TEXT,
    dm_secrets TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE world_campaigns IS 'Stores the detailed world and campaign design data for a project.';

CREATE TABLE world_locations (
    location_id SERIAL PRIMARY KEY,
    world_campaign_id INT NOT NULL REFERENCES world_campaigns(world_campaign_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_location_id INT NULL REFERENCES world_locations(location_id), -- For hierarchical locations (e.g., a room within a dungeon)
    map_grid_representation TEXT, -- For text-based grid, e.g., "#####\n#P.E#\n#####"
    map_dimensions JSONB, -- e.g., {"width": 5, "height": 3}
    map_legend JSONB, -- e.g., {"#": "Wall", ".": "Floor", "P": "Player Start"}
    interactable_objects JSONB, -- e.g., [{"name": "Chest", "description": "A wooden chest", "grid_position": {"x":2, "y":1}, "state": "locked"}]
    UNIQUE (world_campaign_id, name) -- Location names should be unique within a campaign
);
COMMENT ON TABLE world_locations IS 'Defines specific locations or map areas within a world/campaign.';

CREATE TABLE player_characters (
    player_character_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
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
    
    CONSTRAINT uq_character_name_in_project UNIQUE (project_id, character_name)
);
COMMENT ON TABLE player_characters IS 'Stores detailed D&D 5e compliant player character data.';

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
    project_id INT NOT NULL UNIQUE REFERENCES projects(project_id) ON DELETE CASCADE,
    
    current_location_id INT NULL REFERENCES world_locations(location_id), -- Link to a defined location/map
    current_location_narrative TEXT, -- Overriding or supplementary narrative for the location
    current_ingame_datetime TEXT, 
    
    active_player_character_ids INT[],
    -- Stores positions of various entities on the current_map_id
    -- e.g., {"pc_1": {"x":1, "y":2, "token":"P"}, "npc_goblin_a": {"x":5, "y":3, "token":"g"}}
    object_positions_on_map JSONB, 
    
    character_states_session JSONB, 
    npc_states_session JSONB, -- Session-specific states for NPCs not in world_npcs
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

COMMENT ON TABLE live_sessions IS 'Stores the dynamic state of an active game session for a project.';
COMMENT ON COLUMN live_sessions.project_id IS 'Link to the parent project; UNIQUE ensures one active live session state per project.';
COMMENT ON COLUMN live_sessions.current_location_id IS 'FK to world_locations, indicating the current map/area.';
COMMENT ON COLUMN live_sessions.current_ingame_datetime IS 'Current in-game date and time, can be abstract text or a timestamp.';
COMMENT ON COLUMN live_sessions.object_positions_on_map IS 'JSONB storing grid coordinates of PCs, NPCs, items on the current map.';
COMMENT ON COLUMN live_sessions.npc_states_session IS 'JSONB to store current states of NPCs relevant ONLY to this session (e.g. minor, unnamed NPCs). More permanent NPCs should be in a world_npcs table.';
COMMENT ON COLUMN live_sessions.combat_state IS 'JSONB to store details if combat is active.';
COMMENT ON COLUMN live_sessions.event_log IS 'An array of textual descriptions of key events that have occurred.';
COMMENT ON COLUMN live_sessions.player_preferences IS 'JSONB for storing player-specific preferences for the session.';
COMMENT ON COLUMN live_sessions.character_states_session IS 'JSONB for session-specific PC states (HP overrides, conditions, expended resources not on main PC sheet).';

-- ====================================================================
-- END OF SCHEMA SCRIPT
-- ====================================================================