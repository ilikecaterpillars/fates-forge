-- 00_database_setup/002_initial_data.sql

-- Abilities
INSERT INTO dnd_abilities (name, abbreviation) VALUES
('Strength', 'STR'), ('Dexterity', 'DEX'), ('Constitution', 'CON'),
('Intelligence', 'INT'), ('Wisdom', 'WIS'), ('Charisma', 'CHA')
ON CONFLICT (name) DO NOTHING;

-- Sample Race
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
  NULL, -- No spellcasting ability by default for Fighter base
  '{"1": [{"name": "Fighting Style", "description": "..."}, {"name": "Second Wind", "description": "..."}]}'
)
ON CONFLICT (name) DO NOTHING;

-- Add other essential lookups as needed for testing (alignments, backgrounds, skills, etc.)
INSERT INTO dnd_alignments (name, abbreviation) VALUES ('Lawful Good', 'LG'), ('Neutral Good', 'NG'), ('Chaotic Good', 'CG') ON CONFLICT (name) DO NOTHING;
INSERT INTO dnd_backgrounds (name, feature_name, feature_description) VALUES ('Acolyte', 'Shelter of the Faithful', '...') ON CONFLICT (name) DO NOTHING;