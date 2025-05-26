-- 002_initial_data.sql - Corrected for "inserted_location_kardos" error & robust ID lookups

-- Abilities
INSERT INTO dnd_abilities (name, abbreviation) VALUES
('Strength', 'STR'), ('Dexterity', 'DEX'), ('Constitution', 'CON'),
('Intelligence', 'INT'), ('Wisdom', 'WIS'), ('Charisma', 'CHA')
ON CONFLICT (name) DO NOTHING;

-- Sample Races
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features) VALUES
('Human', 30, 'Medium', '{"all": 1}', '{"languages": ["Common", "One extra language"]}')
ON CONFLICT (name) DO NOTHING;
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, parent_race_id) VALUES
('Variant Human', 30, 'Medium', '{"choose_two_different": 1}', '{"languages": ["Common", "One extra language"], "bonus_feat": true, "bonus_skill_proficiency": true}', (SELECT race_id from dnd_races WHERE name = 'Human'))
ON CONFLICT (name) DO NOTHING;

-- Sample Class
INSERT INTO dnd_classes (name, hit_die, saving_throw_proficiency_ability_ids, spellcasting_ability_id, class_features_by_level) VALUES
('Fighter', 10, 
  ARRAY[(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'STR'), (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CON')],
  NULL, 
  '{"1": [{"name": "Fighting Style", "description": "..."}, {"name": "Second Wind", "description": "..."}]}'
)
ON CONFLICT (name) DO NOTHING;

-- Sample Alignments
INSERT INTO dnd_alignments (name, abbreviation) VALUES 
('Lawful Good', 'LG'), ('Neutral Good', 'NG'), ('Chaotic Good', 'CG') 
ON CONFLICT (name) DO NOTHING;

-- Sample Background
INSERT INTO dnd_backgrounds (name, feature_name, feature_description) VALUES 
('Acolyte', 'Shelter of the Faithful', '...') 
ON CONFLICT (name) DO NOTHING;

-- Sample Skills
INSERT INTO dnd_skills (name, ability_id) VALUES
('Athletics', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'STR')),
('Acrobatics', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'DEX')),
('Stealth', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'DEX')),
('Sleight of Hand', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'DEX')),
('Arcana', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT')),
('History', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT')),
('Investigation', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT')),
('Nature', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT')),
('Religion', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT')),
('Animal Handling', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS')),
('Insight', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS')),
('Medicine', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS')),
('Perception', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS')),
('Survival', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS')),
('Deception', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA')),
('Intimidation', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA')),
('Performance', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA')),
('Persuasion', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA'))
ON CONFLICT (name) DO NOTHING;

-- Sample Items
INSERT INTO dnd_items (name, type, description, properties, weight, cost_gp, requires_attunement) VALUES
('Longsword', 'Weapon', 'A versatile martial weapon.', '{"damage": "1d8 slashing", "versatile": "1d10"}', 3, 15, FALSE),
('Shortbow', 'Weapon', 'A common ranged weapon.', '{"damage": "1d6 piercing", "range": "80/320", "ammunition": true, "two-handed": true}', 2, 25, FALSE),
('Leather Armor', 'Armor', 'Light armor made from cured hide.', '{"ac_base": 11, "ac_dex_bonus": true}', 10, 10, FALSE),
('Potion of Healing', 'Potion', 'A vial of magical red liquid that restores hit points.', '{"healing": "2d4+2"}', 0.5, 50, FALSE),
('Backpack', 'Adventuring Gear', 'A common backpack.', null, 5, 2, FALSE),
('Torch', 'Adventuring Gear', 'A wooden rod tipped with flammable material.', '{"light": "20ft bright, 20ft dim"}', 1, 0.01, FALSE),
('The Aevum Locus', 'Artifact', 'Crystalline geode, interior shifting lattice of obsidian-like shards, emits cool light and complex chimes.', '{"category": "Auralith/Shear Key", "powers_summary": "Amplifies perception of Regions/thin spots; resonance tuning for travel focus; potential Shear Key.", "quirks": "Can cause migraines/sensory overload; chimes affect un-Attuned''s dreams; adapts to wielder."}', 2, 0, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Sample Magic Schools
INSERT INTO dnd_magic_schools (name, description) VALUES
('Abjuration', 'Spells that protect, block, or banish.'),
('Conjuration', 'Spells that transport objects and creatures from one location to another.'),
('Divination', 'Spells that reveal information.'),
('Enchantment', 'Spells that affect the minds of others.'),
('Evocation', 'Spells that manipulate energy or create something from nothing.'),
('Illusion', 'Spells that deceive the senses or minds of others.'),
('Necromancy', 'Spells that manipulate life and death.'),
('Transmutation', 'Spells that change the properties of a creature, object, or environment.')
ON CONFLICT (name) DO NOTHING;

-- Sample Conditions
INSERT INTO dnd_conditions (name, description) VALUES
('Blinded', 'A blinded creature can''t see and automatically fails any ability check that requires sight. Attack rolls against the creature have advantage, and the creature''s attack rolls have disadvantage.'),
('Charmed', 'A charmed creature can''t attack the charmer or target the charmer with harmful abilities or magical effects. The charmer has advantage on any ability check to interact socially with the creature.'),
('Frightened', 'A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight. The creature can''t willingly move closer to the source of its fear.')
ON CONFLICT (name) DO NOTHING;

-- Sample Damage Types
INSERT INTO dnd_damage_types (name, description) VALUES
('Slashing', 'Damage from swords, axes, etc.'),
('Piercing', 'Damage from arrows, daggers, etc.'),
('Bludgeoning', 'Damage from blunt force, like a club or falling.')
ON CONFLICT (name) DO NOTHING;

-- Sample Spells
INSERT INTO dnd_spells (name, level, magic_school_id, casting_time, range_area, components, duration, description, ritual, concentration) VALUES
('Fire Bolt', 0, (SELECT magic_school_id FROM dnd_magic_schools WHERE name = 'Evocation'), '1 action', '120 feet', 'V, S', 'Instantaneous', 'You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage. A flammable object hit by this spell ignites if it isn''t being worn or carried.', FALSE, FALSE),
('Mage Armor', 1, (SELECT magic_school_id FROM dnd_magic_schools WHERE name = 'Abjuration'), '1 action', 'Touch', 'V, S, M (a piece of cured leather)', '8 hours', 'You touch a willing creature who isn''t wearing armor, and a protective magical force surrounds it until the spell ends. The target''s base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor or if you dismiss the spell as an action.', FALSE, FALSE)
ON CONFLICT (name) DO NOTHING;

-- ====================================================================
-- CORE APPLICATION INITIAL DATA 
-- ====================================================================

-- Stage 1: Insert Definitions (Worlds, Regions, Cultures, Factions, Locations, NPCs)

-- 1. Insert a Sample World
INSERT INTO worlds (name, core_concept, primary_themes, overall_tone, defining_features) VALUES
('Elyon - The Fractured World', 
 'A world fractured by a cataclysm (The Rupture) caused by misuse of primordial energy (The Axion Tide). Inhabitants of isolated Regions are unaware of the true nature of their reality due to a Cognitive Veil.',
 'Discovery, Consequences of Power, Nature of Reality, Unity vs. Diversity, Lost History',
 'Mystery, Epic Exploration, High Stakes Adventure, Wonder and Horror',
 '{
    "primordial_energy": { "name": "The Axion Tide", "nature": "A fundamental, sub-dimensional current dictating temporal mechanics." },
    "major_cataclysm": { "name": "The Rupture", "nature_and_cause": "Caused by catastrophic disruption of The Axion Tide, fragmenting the original timeline into coexisting Regions." },
    "reality_perception_modifier": { "name": "The Cognitive Veil", "details": "A pervasive cognitive and perceptual distortion field isolating Regions." },
    "inter_regional_space": { "name": "The Krell", "details": "The chaotic void or non-space between Regions, navigable by the Attuned." },
    "core_artifact_type_overview": { "name": "Artifacts", "nature": "Stabilized fragments/echoes of The Axion Tide, enabling perception beyond The Cognitive Veil and inter-regional travel." },
    "arrangement_of_regions": "Center: Elyon (Central), South: Vellumbra, North: Kaelis, East: Solum, West: Praxium"
  }'
) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name;

-- 2. Insert Sample Regions for "Elyon - The Fractured World"
INSERT INTO world_regions (world_id, name, description, geography_environment, key_locations_overview)
SELECT w.world_id, 
       'Solum', 
       'The Eastern Region, a land of sundered kingdoms and traditional D&D settings.',
       'Dominated by The Borodûn Fells (mountains), The Valdrun (river), and The Rhyllwold (ancient forest).',
       'Kingdom of Valdenmark (capital Kardos), Kingdom of Cor Elys (capital Cor Nemus), City-State of Conflux, The Aevum Rift.'
FROM worlds w WHERE w.name = 'Elyon - The Fractured World'
ON CONFLICT (world_id, name) DO UPDATE SET name = EXCLUDED.name;

-- 3. Insert Sample Cultures for "Solum" Region
INSERT INTO world_cultures (world_region_id, name, description, aesthetics_feel, naming_conventions, cultural_traditions, common_languages, art_visual_style)
SELECT wr.world_region_id, 
       'The Valden of Solum',
       'Primary inhabitants of Valdenmark, a feudal kingdom. Characterized by discipline, order, and pragmatism.',
       'Grounded, stern, hardy European medieval feel. Pragmatic architecture (Kardic Stoneform).',
       '{"notes": "Strong, clear consonants (V, D, K, R, M, L, N, S, T, G). Clear, short vowels. Names are structured and strong. Avoid common real-world historical names. Minimize romanticized chivalry sounds. Filter generic fantasy tropes.","male_given_examples": ["Drestan", "Vorik", "Kaelum"], "female_given_examples": ["Kressa", "Valna", "Jora"],"family_bynames_examples": ["Stonehand", "Kard-born", "Iron-Will"]}',
       'Deity: Ordina (order). Council: The Curia Valden. Knightly Order: The Iron Vigil. Festival: The Foundation Feast.',
       'Valdic',
       'Pragmatic stone architecture (Kardic Stoneform). Art is often martial or functional. Palette: earth tones, greys, with richer colors for nobility.'
FROM world_regions wr JOIN worlds w ON wr.world_id = w.world_id WHERE w.name = 'Elyon - The Fractured World' AND wr.name = 'Solum'
ON CONFLICT (world_region_id, name) DO UPDATE SET name = EXCLUDED.name;

-- 4. Insert Sample Factions for "Solum" Region
INSERT INTO world_factions (world_region_id, name, description, goals)
SELECT wr.world_region_id,
       'The Iron Vigil',
       'A disciplined knightly order in Valdenmark.',
       'Preserve order, defend Valdenmark.'
FROM world_regions wr JOIN worlds w ON wr.world_id = w.world_id WHERE w.name = 'Elyon - The Fractured World' AND wr.name = 'Solum'
ON CONFLICT (world_region_id, name) DO UPDATE SET name = EXCLUDED.name;

-- 5. Insert Sample Locations for "Solum" (Ensure Aevum's Crossing is inserted before its child)
INSERT INTO world_locations (world_region_id, name, description)
SELECT wr.world_region_id,
       'Aevum''s Crossing',
       'A small Valden village near The Aevum Rift.'
FROM world_regions wr JOIN worlds w ON wr.world_id = w.world_id WHERE w.name = 'Elyon - The Fractured World' AND wr.name = 'Solum'
ON CONFLICT (world_region_id, name) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO world_locations (world_region_id, name, description, parent_location_id)
SELECT wr.world_region_id,
       'Aevum Rift - Entrance',
       'A hidden game trail leading into the Aevum Rift...',
       (SELECT loc.location_id 
        FROM world_locations loc 
        JOIN world_regions wr_sub ON loc.world_region_id = wr_sub.world_region_id 
        JOIN worlds w_sub ON wr_sub.world_id = w_sub.world_id 
        WHERE w_sub.name = 'Elyon - The Fractured World' AND wr_sub.name = 'Solum' AND loc.name = 'Aevum''s Crossing')
FROM world_regions wr JOIN worlds w ON wr.world_id = w.world_id WHERE w.name = 'Elyon - The Fractured World' AND wr.name = 'Solum'
ON CONFLICT (world_region_id, name) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO world_locations (world_region_id, name, description, map_legend, interactable_objects)
SELECT wr.world_region_id, 
       'Kardos, Capital of Valdenmark', 
       'A heavily fortified city on the banks of The Valdrun river. Known for its disciplined citizenry, the Iron Vigil patrols, and the Kardic Exchange marketplace. Seat of King Dravus.',
       '{"W": "Wall", "G": "Gate", "C": "Citadel", "M": "Market", "T": "Temple", "I": "Inn"}',
       '[{"name": "King''s Citadel", "desc": "Seat of King Dravus."}, {"name": "The Iron Hearth (Inn)", "desc": "A well-known, sturdy inn."}]'
FROM world_regions wr JOIN worlds w ON wr.world_id = w.world_id WHERE w.name = 'Elyon - The Fractured World' AND wr.name = 'Solum'
ON CONFLICT (world_region_id, name) DO UPDATE SET name = EXCLUDED.name;

-- 6. Insert NPC Archetypes/Templates
INSERT INTO npcs (name, description, stat_block, default_disposition, is_unique) VALUES
('Rift Hound', 
 'A creature appearing as a shadowy, canine beast with a flickering form, often found in areas where The Cognitive Veil is thin.',
 '{
    "CR": "1/4", "armor_class": 12, "hit_points": {"dice": "2d8+2", "average": 11}, "speed": "40 ft.",
    "ability_scores": {"strength": 13, "dexterity": 14, "constitution": 12, "intelligence": 3, "wisdom": 12, "charisma": 6},
    "skills": {"perception": 3, "stealth": 4}, "senses": {"darkvision": "60 ft.", "passive_perception": 13},
    "traits": [{"name": "Pack Tactics", "description": "Advantage on attack if ally is within 5 ft."}, {"name": "Unsettling Presence", "description": "First attacker might have disadvantage."}],
    "actions": [{"name": "Bite", "type": "Melee Weapon Attack", "attack_bonus": 3, "reach": "5 ft.", "target": "one target", "damage": "1d6+1 piercing"},
                {"name": "Distorted Howl (1/Day)", "description": "DC 10 Wis save or Frightened for 1 min."}]
 }', 
 'hostile', FALSE
) ON CONFLICT (name, world_id) DO NOTHING; -- Generic NPC, world_id is implicitly NULL

INSERT INTO npcs (world_id, name, description, stat_block, default_disposition, is_unique)
SELECT w.world_id, 
       'Sarkon, Shriven of Solum', 
       'A leader among The Shriven in the Solum region, actively working to corrupt The Solum Keystone.',
       '{
          "CR": "4", "armor_class": 13, "hit_points": {"dice": "8d8+16", "average": 52}, "speed": "30 ft.",
          "ability_scores": {"strength": 10, "dexterity": 14, "constitution": 14, "intelligence": 13, "wisdom": 11, "charisma": 16},
          "saving_throws": {"constitution": 4, "charisma": 5}, "skills": {"deception": 5, "persuasion": 5, "arcana": 3},
          "senses": {"darkvision": "60 ft.", "passive_perception": 10}, "languages": "Valdic, Krell-dialect fragments",
          "traits": [{"name": "Krell-Favored", "description": "Advantage on saves vs spells altering form/mind."}],
          "spellcasting": {"level": 5, "ability": "Charisma", "save_dc": 13, "attack_bonus": 5, 
                         "cantrips": ["Chill Touch", "Minor Illusion", "Eldritch Blast (Krell energy)"],
                         "level1_slots": 4, "level1_spells": ["Cause Fear", "Hex", "Shield"],
                         "level2_slots": 3, "level2_spells": ["Darkness", "Misty Step", "Ray of Enfeeblement"],
                         "level3_slots": 2, "level3_spells": ["Counterspell", "Fear"]},
          "actions": [{"name": "Corrupted Scepter", "type": "Melee Weapon Attack", "attack_bonus": 2, "reach": "5 ft.", "damage": "1d6 bludgeoning + 2d6 necrotic"},
                      {"name": "Whispers of The Krell-Vor (1/Day)", "description": "Targets 3 creatures, DC 13 Wis save or short-term madness."}],
          "reactions": [{"name": "Krellish Rebuke (2/Day)", "description": "On melee hit, 1d10 necrotic to attacker."}]
        }',
       'hostile', TRUE
FROM worlds w WHERE w.name = 'Elyon - The Fractured World'
ON CONFLICT (name, world_id) DO NOTHING;

-- Stage 2: Insert Campaign, and then instance data related to that campaign

-- 7. Insert a Sample Campaign
INSERT INTO campaigns (world_id, campaign_name, suite_version_at_creation, campaign_scope, plot_arc_title, plot_overview) 
SELECT w.world_id, 
       'Timeworn Bonds - The Encroaching Krell-Vor', 
       '1.0.0',
       'Epic Multi-Arc',
       'The Encroaching Krell-Vor', 
       'PCs discover a threat from The Krell and must reactivate Axion Anchors.'
FROM worlds w WHERE w.name = 'Elyon - The Fractured World'
ON CONFLICT (campaign_name) DO NOTHING;

-- 8. Insert NPC Instances into the Sample Campaign and Locations
INSERT INTO campaign_npc_instances (campaign_id, npc_id, location_id, custom_name, current_hp, position_x, position_y, current_state)
SELECT 
    (SELECT c.campaign_id FROM campaigns c WHERE c.campaign_name = 'Timeworn Bonds - The Encroaching Krell-Vor'),
    (SELECT n.npc_id FROM npcs n WHERE n.name = 'Rift Hound' AND n.world_id IS NULL), -- Generic Rift Hound
    (SELECT loc.location_id FROM world_locations loc JOIN world_regions wr ON loc.world_region_id = wr.world_region_id JOIN worlds w ON wr.world_id = w.world_id WHERE w.name = 'Elyon - The Fractured World' AND wr.name = 'Solum' AND loc.name = 'Aevum Rift - Entrance'),
    'Rift Hound Alpha', 11, 3, 3, '{"current_activity": "guarding", "disposition_towards_party": "hostile"}'
ON CONFLICT DO NOTHING;

INSERT INTO campaign_npc_instances (campaign_id, npc_id, location_id, current_hp, position_x, position_y, current_state)
SELECT 
    (SELECT c.campaign_id FROM campaigns c WHERE c.campaign_name = 'Timeworn Bonds - The Encroaching Krell-Vor'),
    (SELECT n.npc_id FROM npcs n JOIN worlds w ON n.world_id = w.world_id WHERE w.name = 'Elyon - The Fractured World' AND n.name = 'Sarkon, Shriven of Solum'),
    (SELECT loc.location_id FROM world_locations loc JOIN world_regions wr ON loc.world_region_id = wr.world_region_id JOIN worlds w ON wr.world_id = w.world_id WHERE w.name = 'Elyon - The Fractured World' AND wr.name = 'Solum' AND loc.name = 'Kardos, Capital of Valdenmark'),
    52, 5, 5, '{"current_activity": "scheming", "disposition_towards_party": "hostile"}'
ON CONFLICT DO NOTHING;

-- 9. Insert an Item Instance into a Location for the Sample Campaign
INSERT INTO campaign_item_instances (campaign_id, item_id, location_id, quantity, instance_properties)
SELECT 
    (SELECT c.campaign_id FROM campaigns c WHERE c.campaign_name = 'Timeworn Bonds - The Encroaching Krell-Vor'),
    (SELECT i.item_id FROM dnd_items i WHERE i.name = 'The Aevum Locus'),
    (SELECT loc.location_id FROM world_locations loc JOIN world_regions wr ON loc.world_region_id = wr.world_region_id JOIN worlds w ON wr.world_id = w.world_id WHERE w.name = 'Elyon - The Fractured World' AND wr.name = 'Solum' AND loc.name = 'Aevum Rift - Entrance'),
    1, 
    '{"notes": "Found on the Aevum Monolith, humming faintly.", "is_quest_item": true}'
ON CONFLICT DO NOTHING;

SELECT 'Initial data population attempt finished.' AS status;