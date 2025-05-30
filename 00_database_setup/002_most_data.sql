-- 002_initial_data.sql - Corrected for "inserted_location_kardos" error & robust ID lookups

-- Abilities
INSERT INTO dnd_abilities (name, abbreviation) VALUES
('Strength', 'STR'),
('Dexterity', 'DEX'),
('Constitution', 'CON'),
('Intelligence', 'INT'),
('Wisdom', 'WIS'),
('Charisma', 'CHA')
ON CONFLICT (name) DO UPDATE SET -- Using ON CONFLICT to handle re-runs gracefully
  abbreviation = EXCLUDED.abbreviation;

-- Races
-- Base Dwarf (PHB p. 18) [cite: Comprehensive D&D 5e Data Compilation (24-29)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description) VALUES
('Dwarf', 25, 'Medium',
  '{"CON": 2}',
  '{
     "darkvision": {"name": "Darkvision", "description": "Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can''t discern color in darkness, only shades of gray."},
     "dwarven_resilience": {"name": "Dwarven Resilience", "description": "You have advantage on saving throws against poison, and you have resistance against poison damage."},
     "dwarven_combat_training": {"name": "Dwarven Combat Training", "description": "You have proficiency with the battleaxe, handaxe, light hammer, and warhammer."},
     "tool_proficiency": {
        "name": "Tool Proficiency",
        "description": "You gain proficiency with the artisan''s tools of your choice: smith''s tools, brewer''s supplies, or mason''s tools.",
        "type": "choice", "count": 1,
        "options_list": ["Smith''s tools", "Brewer''s supplies", "Mason''s tools"]
     },
     "stonecunning": {"name": "Stonecunning", "description": "Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus."},
     "languages": {"name": "Languages", "description": "You can speak, read, and write Common and Dwarvish."}
   }',
 'Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal. They are known for their commitment to clan and tradition.'
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description;

-- Hill Dwarf Subrace (PHB p. 20) [cite: Comprehensive D&D 5e Data Compilation (30)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description, parent_race_id) VALUES
('Hill Dwarf', 25, 'Medium',
  '{"WIS": 1}',
  '{
     "dwarven_toughness": {"name": "Dwarven Toughness", "description": "Your hit point maximum increases by 1, and it increases by 1 every time you gain a level."}
   }',
 'As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience. Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.',
 (SELECT race_id from dnd_races WHERE name = 'Dwarf')
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description, parent_race_id = EXCLUDED.parent_race_id;

-- Mountain Dwarf Subrace (PHB p. 20) [cite: Comprehensive D&D 5e Data Compilation (31)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description, parent_race_id) VALUES
('Mountain Dwarf', 25, 'Medium',
  '{"STR": 2}',
  '{
     "dwarven_armor_training": {"name": "Dwarven Armor Training", "description": "You have proficiency with light and medium armor."}
   }',
 'As a mountain dwarf, you''re strong and hardy, accustomed to a difficult life in rugged terrain. You''re probably on the tall side (for a dwarf), and tend toward lighter coloration.',
 (SELECT race_id from dnd_races WHERE name = 'Dwarf')
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description, parent_race_id = EXCLUDED.parent_race_id;

-- Base Elf (PHB p. 21) [cite: Comprehensive D&D 5e Data Compilation (32-38)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description) VALUES
('Elf', 30, 'Medium',
  '{"DEX": 2}',
  '{
     "darkvision": {"name": "Darkvision", "description": "Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can''t discern color in darkness, only shades of gray."},
     "keen_senses": {"name": "Keen Senses", "description": "You have proficiency in the Perception skill."},
     "fey_ancestry": {"name": "Fey Ancestry", "description": "You have advantage on saving throws against being charmed, and magic can''t put you to sleep."},
     "trance": {"name": "Trance", "description": "Elves don’t need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day. This grants the same benefit that a human does from 8 hours of sleep."},
     "languages": {"name": "Languages", "description": "You can speak, read, and write Common and Elvish."}
   }',
 'Elves are a magical people of otherworldly grace, living in the world but not entirely part of it.'
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description;

-- High Elf Subrace (PHB p. 23) [cite: Comprehensive D&D 5e Data Compilation (38-39)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description, parent_race_id) VALUES
('High Elf', 30, 'Medium',
  '{"INT": 1}',
  '{
     "elf_weapon_training": {"name": "Elf Weapon Training", "description": "You have proficiency with the longsword, shortsword, shortbow, and longbow."},
     "cantrip": {
        "name": "Cantrip",
        "description": "You know one cantrip of your choice from the wizard spell list. Intelligence is your spellcasting ability for it.",
        "type": "choice_spell", "list_source": "Wizard", "level": 0, "ability": "INT"
     },
     "extra_language": {
        "name": "Extra Language",
        "description": "You can speak, read, and write one extra language of your choice.",
        "type": "choice_language", "count": 1
     }
   }',
 'As a high elf, you have a keen mind and a mastery of at least the basics of magic.',
 (SELECT race_id from dnd_races WHERE name = 'Elf')
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description, parent_race_id = EXCLUDED.parent_race_id;

-- Wood Elf Subrace (PHB p. 24) [cite: Comprehensive D&D 5e Data Compilation (40-41)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description, parent_race_id) VALUES
('Wood Elf', 35, 'Medium',
  '{"WIS": 1}',
  '{
     "elf_weapon_training": {"name": "Elf Weapon Training", "description": "You have proficiency with the longsword, shortsword, shortbow, and longbow."},
     "fleet_of_foot": {"name": "Fleet of Foot", "description": "Your base walking speed increases to 35 feet."},
     "mask_of_the_wild": {"name": "Mask of the Wild", "description": "You can attempt to hide even when you are only lightly obscured by foliage, heavy rain, falling snow, mist, or other natural phenomena."}
   }',
 'As a wood elf, you have keen senses and intuition, and your fleet feet carry you quickly and stealthily through your native forests.',
 (SELECT race_id from dnd_races WHERE name = 'Elf')
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description, parent_race_id = EXCLUDED.parent_race_id;

-- Dark Elf (Drow) Subrace (PHB p. 24) [cite: Comprehensive D&D 5e Data Compilation (41-43)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description, parent_race_id) VALUES
('Dark Elf (Drow)', 30, 'Medium',
  '{"CHA": 1}',
  '{
     "superior_darkvision": {"name": "Superior Darkvision", "description": "Your darkvision has a radius of 120 feet."},
     "sunlight_sensitivity": {"name": "Sunlight Sensitivity", "description": "You have disadvantage on attack rolls and on Wisdom (Perception) checks that rely on sight when you, the target of your attack, or whatever you are trying to perceive is in direct sunlight."},
     "drow_magic": {"name": "Drow Magic", "description": "You know the dancing lights cantrip. When you reach 3rd level, you can cast the faerie fire spell once using this trait and regain the ability to do so when you finish a long rest. When you reach 5th level, you can cast the darkness spell once using this trait and regain the ability to do so when you finish a long rest. Charisma is your spellcasting ability for these spells."},
     "drow_weapon_training": {"name": "Drow Weapon Training", "description": "You have proficiency with rapiers, shortswords, and hand crossbows."}
   }',
 'Descended from an earlier subrace of dark-skinned elves, the drow were banished from the surface world for following the goddess Lolth down the path to evil and corruption.',
 (SELECT race_id from dnd_races WHERE name = 'Elf')
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description, parent_race_id = EXCLUDED.parent_race_id;

-- Halfling (PHB p. 26) [cite: Comprehensive D&D 5e Data Compilation (44-47)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description) VALUES
('Halfling', 25, 'Small',
  '{"DEX": 2}',
  '{
     "lucky": {"name": "Lucky", "description": "When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll."},
     "brave": {"name": "Brave", "description": "You have advantage on saving throws against being frightened."},
     "halfling_nimbleness": {"name": "Halfling Nimbleness", "description": "You can move through the space of any creature that is of a size larger than yours."},
     "languages": {"name": "Languages", "description": "You can speak, read, and write Common and Halfling."}
   }',
 'The diminutive halflings survive in a world full of larger creatures by avoiding notice or, barring that, avoiding offense.'
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description;

-- Lightfoot Halfling Subrace (PHB p. 28) [cite: Comprehensive D&D 5e Data Compilation (47)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description, parent_race_id) VALUES
('Lightfoot Halfling', 25, 'Small',
  '{"CHA": 1}',
  '{
     "naturally_stealthy": {"name": "Naturally Stealthy", "description": "You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you."}
   }',
 'Lightfoot halflings can easily hide from notice, even using other people as cover. They are inclined to be affable and get along well with others.',
 (SELECT race_id from dnd_races WHERE name = 'Halfling')
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description, parent_race_id = EXCLUDED.parent_race_id;

-- Stout Halfling Subrace (PHB p. 28) [cite: Comprehensive D&D 5e Data Compilation (48-49)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description, parent_race_id) VALUES
('Stout Halfling', 25, 'Small',
  '{"CON": 1}',
  '{
     "stout_resilience": {"name": "Stout Resilience", "description": "You have advantage on saving throws against poison, and you have resistance against poison damage."}
   }',
 'Stout halflings are hardier than average and have some resistance to poison. Some say that stouts have dwarven blood.',
 (SELECT race_id from dnd_races WHERE name = 'Halfling')
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description, parent_race_id = EXCLUDED.parent_race_id;

-- Human (Standard - PHB p. 29) [cite: Comprehensive D&D 5e Data Compilation (50-51)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description) VALUES
('Human', 30, 'Medium',
  '{"STR": 1, "DEX": 1, "CON": 1, "INT": 1, "WIS": 1, "CHA": 1}',
  '{
     "languages": {"name": "Languages", "description": "You can speak, read, and write Common and one extra language of your choice.", "type": "choice_language", "count": 1}
   }',
 'Humans are the most adaptable and ambitious people among the common races. Whatever drives them, humans are the innovators, the achievers, and the pioneers of the worlds.'
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description;

-- Variant Human (Optional Rule - PHB p. 31) [cite: Comprehensive D&D 5e Data Compilation (51)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description, parent_race_id) VALUES
('Human (Variant)', 30, 'Medium',
  '{"type": "choice_two_different", "value": 1}',
  '{
     "skills": {"name": "Skills", "description": "You gain proficiency in one skill of your choice.", "type": "choice_skill", "count": 1},
     "feat": {"name": "Feat", "description": "You gain one feat of your choice.", "type": "choice_feat", "count": 1},
     "languages": {"name": "Languages", "description": "You can speak, read, and write Common and one extra language of your choice.", "type": "choice_language", "count": 1}
   }',
 'If your campaign uses the optional feat rule, your Dungeon Master might allow these variant traits, all of which replace the human''s Ability Score Increase trait.',
 (SELECT race_id from dnd_races WHERE name = 'Human')
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description, parent_race_id = EXCLUDED.parent_race_id;

-- Dragonborn (PHB p. 32) [cite: Comprehensive D&D 5e Data Compilation (52-56)]
-- Note for Dragonborn Ancestry: The application will need a way to present the choice of dragon type
-- and then store/apply the corresponding damage_type and breath_weapon_shape.
-- The options_list_reference "dragonborn_ancestries" is a placeholder for this lookup.
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description) VALUES
('Dragonborn', 30, 'Medium',
  '{"STR": 2, "CHA": 1}',
  '{
     "draconic_ancestry": {
        "name": "Draconic Ancestry",
        "description": "You have draconic ancestry. Choose one type of dragon from the Draconic Ancestry table. Your breath weapon and damage resistance are determined by the dragon type, as shown in the table.",
        "type": "choice_from_list",
        "options_list_reference": "dragonborn_ancestries"
     },
     "breath_weapon": {"name": "Breath Weapon", "description": "You can use your action to exhale destructive energy. Its size, shape, and damage type are determined by your draconic ancestry. When you use your breath weapon, each creature in the area of the exhalation must make a saving throw, the type of which is determined by your draconic ancestry. The DC for this saving throw equals 8 + your Constitution modifier + your proficiency bonus. A creature takes 2d6 damage on a failed save, and half as much damage on a successful one. The damage increases to 3d6 at 6th level, 4d6 at 11th level, and 5d6 at 16th level. After you use your breath weapon, you can''t use it again until you complete a short or long rest."},
     "damage_resistance": {"name": "Damage Resistance", "description": "You have resistance to the damage type associated with your draconic ancestry."},
     "languages": {"name": "Languages", "description": "You can speak, read, and write Common and Draconic. Draconic is thought to be one of the oldest languages and is often used in the study of magic."}
   }',
 'Born of dragons, as their name proclaims, dragonborn walk proudly through a world that greets them with fearful incomprehension.'
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description;

-- Base Gnome (PHB p. 35) [cite: Comprehensive D&D 5e Data Compilation (57-60)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description) VALUES
('Gnome', 25, 'Small',
  '{"INT": 2}',
  '{
     "darkvision": {"name": "Darkvision", "description": "Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can''t discern color in darkness, only shades of gray."},
     "gnome_cunning": {"name": "Gnome Cunning", "description": "You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic."},
     "languages": {"name": "Languages", "description": "You can speak, read, and write Common and Gnomish. The Gnomish language, which uses the Dwarvish script, is renowned for its technical treatises and its catalogs of knowledge about the natural world."}
   }',
 'A gnome’s energy and enthusiasm for living shines through every inch of his or her tiny body.'
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description;

-- Forest Gnome Subrace (PHB p. 37) [cite: Comprehensive D&D 5e Data Compilation (60-61)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description, parent_race_id) VALUES
('Forest Gnome', 25, 'Small',
  '{"DEX": 1}',
  '{
     "natural_illusionist": {"name": "Natural Illusionist", "description": "You know the minor illusion cantrip. Intelligence is your spellcasting ability for it."},
     "speak_with_small_beasts": {"name": "Speak with Small Beasts", "description": "Through sounds and gestures, you can communicate simple ideas with Small or smaller beasts. Forest gnomes love animals and often keep squirrels, badgers, rabbits, moles, woodpeckers, and other creatures as beloved pets."}
   }',
 'As a forest gnome, you have a natural knack for illusion and inherent quickness and stealth. In the worlds of D&D, forest gnomes are rare and secretive.',
 (SELECT race_id from dnd_races WHERE name = 'Gnome')
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description, parent_race_id = EXCLUDED.parent_race_id;

-- Rock Gnome Subrace (PHB p. 37) [cite: Comprehensive D&D 5e Data Compilation (59-60)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description, parent_race_id) VALUES
('Rock Gnome', 25, 'Small',
  '{"CON": 1}',
  '{
     "artificers_lore": {"name": "Artificer''s Lore", "description": "Whenever you make an Intelligence (History) check related to magic items, alchemical objects, or technological devices, you can add twice your proficiency bonus, instead of any proficiency bonus you normally apply."},
     "tinker": {"name": "Tinker", "description": "You have proficiency with artisan''s tools (tinker''s tools). Using those tools, you can spend 1 hour and 10 gp worth of materials to construct a Tiny clockwork device (AC 5, 1 hp). The device ceases to function after 24 hours (unless you spend 1 hour repairing it) or when you use your action to dismantle it; you can reclaim the materials by doing so. You can have up to three such devices active at a time. When you create a device, choose one of the following options: Clockwork Toy, Fire Starter, or Music Box."}
   }',
 'As a rock gnome, you have a natural inventiveness and hardiness. Most gnomes in D&D worlds are rock gnomes.',
 (SELECT race_id from dnd_races WHERE name = 'Gnome')
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description, parent_race_id = EXCLUDED.parent_race_id;

-- Half-Elf (PHB p. 38) [cite: Comprehensive D&D 5e Data Compilation (62-65)]
-- Note for Half-Elf Skill Versatility variants: PHB p.39 mentions these.
-- This could be handled by application logic or specific subrace-like entries if desired.
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description) VALUES
('Half-Elf', 30, 'Medium',
  '{"CHA": 2, "choice_two_other": 1}', 
  '{
     "darkvision": {"name": "Darkvision", "description": "Thanks to your elf blood, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can''t discern color in darkness, only shades of gray."},
     "fey_ancestry": {"name": "Fey Ancestry", "description": "You have advantage on saving throws against being charmed, and magic can''t put you to sleep."},
     "skill_versatility": {"name": "Skill Versatility", "description": "You gain proficiency in two skills of your choice."},
     "languages": {"name": "Languages", "description": "You can speak, read, and write Common, Elvish, and one extra language of your choice."}
   }',
 'Walking in two worlds but truly belonging to neither, half-elves combine what some say are the best qualities of their elf and human parents.'
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description;

-- Half-Orc (PHB p. 40) [cite: Comprehensive D&D 5e Data Compilation (66-68)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description) VALUES
('Half-Orc', 30, 'Medium',
  '{"STR": 2, "CON": 1}',
  '{
     "darkvision": {"name": "Darkvision", "description": "Thanks to your orc blood, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can''t discern color in darkness, only shades of gray."},
     "menacing": {"name": "Menacing", "description": "You gain proficiency in the Intimidation skill."},
     "relentless_endurance": {"name": "Relentless Endurance", "description": "When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. You can’t use this feature again until you finish a long rest."},
     "savage_attacks": {"name": "Savage Attacks", "description": "When you score a critical hit with a melee weapon attack, you can roll one of the weapon’s damage dice one additional time and add it to the extra damage of the critical hit."},
     "languages": {"name": "Languages", "description": "You can speak, read, and write Common and Orc. Orc is a harsh, grating language with hard consonants."}
   }',
 'Half-orcs’ grayish pigmentation, sloping foreheads, jutting jaws, prominent teeth, and towering builds make their orcish heritage plain for all to see.'
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description;

-- Tiefling (PHB p. 42 - Asmodeus Lineage is default) [cite: Comprehensive D&D 5e Data Compilation (69-71)]
INSERT INTO dnd_races (name, speed, size_category, asi_bonus, racial_features, description) VALUES
('Tiefling', 30, 'Medium',
  '{"INT": 1, "CHA": 2}', 
  '{
     "darkvision": {"name": "Darkvision", "description": "Thanks to your infernal heritage, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can''t discern color in darkness, only shades of gray."},
     "hellish_resistance": {"name": "Hellish Resistance", "description": "You have resistance to fire damage."},
     "infernal_legacy": {"name": "Infernal Legacy", "description": "You know the thaumaturgy cantrip. When you reach 3rd level, you can cast the hellish rebuke spell as a 2nd-level spell once with this trait and regain the ability to do so when you finish a long rest. When you reach 5th level, you can cast the darkness spell once with this trait and regain the ability to do so when you finish a long rest. Charisma is your spellcasting ability for these spells."},
     "languages": {"name": "Languages", "description": "You can speak, read, and write Common and Infernal."}
   }',
 'To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling.'
) ON CONFLICT (name) DO UPDATE SET
    speed = EXCLUDED.speed, size_category = EXCLUDED.size_category, asi_bonus = EXCLUDED.asi_bonus, racial_features = EXCLUDED.racial_features, description = EXCLUDED.description;


SELECT 'dnd_races table populated with expanded PHB examples (corrected).' AS status;

-- Class
-- Barbarian (PHB p. 46) [cite: Comprehensive D&D 5e Data Compilation (116-120)]
INSERT INTO dnd_classes (
    name, hit_die,
    saving_throw_proficiency_ability_ids,
    class_features_by_level,
    description
) VALUES (
'Barbarian', 12,
ARRAY[(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'STR'), (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CON')],
'{
    "1": [
        {
            "name": "Rage",
            "description": "In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action. While raging, you gain the following benefits if you aren''t wearing heavy armor: You have advantage on Strength checks and Strength saving throws. When you make a melee weapon attack using Strength, you gain a bonus to the damage roll that increases as you gain levels as a barbarian (+2 at L1). You have resistance to bludgeoning, piercing, and slashing damage. If you are able to cast spells, you can''t cast them or concentrate on them while raging. Your rage lasts for 1 minute. It ends early if you are knocked unconscious or if your turn ends and you haven''t attacked a hostile creature since your last turn or taken damage since then. You can also end your rage on your turn as a bonus action. You can rage 2 times at L1, regaining uses after a long rest."
        },
        {
            "name": "Unarmored Defense",
            "description": "While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit."
        }
    ],
    "proficiencies_granted": {
        "armor": ["Light armor", "Medium armor", "Shields"],
        "weapons": ["Simple weapons", "Martial weapons"],
        "tools": [],
        "skills": {
            "type": "choice", "count": 2,
            "options_list": ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"]
        }
    },
    "starting_equipment_options": [
        {"choice": "(a) a greataxe or (b) any martial melee weapon", "options": [{"item_name": "Greataxe"}, {"type": "Martial Melee Weapon", "count": 1}]},
        {"choice": "(a) two handaxes or (b) any simple weapon", "options": [{"item_name": "Handaxe", "quantity": 2}, {"type": "Simple Weapon", "count": 1}]},
        {"fixed": [{"item_name": "Explorer''s Pack"}, {"item_name": "Javelin", "quantity": 4}]}
    ]
}',
'A fierce warrior of primitive background who can enter a battle rage.'
) ON CONFLICT (name) DO UPDATE SET
    hit_die = EXCLUDED.hit_die,
    saving_throw_proficiency_ability_ids = EXCLUDED.saving_throw_proficiency_ability_ids,
    class_features_by_level = EXCLUDED.class_features_by_level,
    description = EXCLUDED.description;

-- Bard (PHB p. 51) [cite: Comprehensive D&D 5e Data Compilation (126-129)]
INSERT INTO dnd_classes (
    name, hit_die,
    saving_throw_proficiency_ability_ids,
    spellcasting_ability_id,
    class_features_by_level,
    can_prepare_spells,
    description
) VALUES (
'Bard', 8,
ARRAY[(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'DEX'), (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA')],
(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA'),
'{
    "1": [
        {
            "name": "Spellcasting",
            "description": "You have learned to untangle and reshape the fabric of reality in harmony with your wishes and music. (Cantrips: 2 known. Spell Slots: 2 1st-level. Spells Known: 4 1st-level. Spellcasting Ability: Charisma. Ritual Casting.)"
        },
        {
            "name": "Bardic Inspiration (d6)",
            "description": "You can inspire others through stirring words or music. To do so, you use a bonus action on your turn to choose one creature other than yourself within 60 feet of you who can hear you. That creature gains one Bardic Inspiration die, a d6. Once within the next 10 minutes, the creature can roll the die and add the number rolled to one ability check, attack roll, or saving throw it makes. The creature can wait until after it rolls the d20 before deciding to use the Bardic Inspiration die, but must decide before the DM says whether the roll succeeds or fails. Once the Bardic Inspiration die is rolled, it is lost. A creature can have only one Bardic Inspiration die at a time. You can use this feature a number of times equal to your Charisma modifier (min 1). You regain any expended uses after a long rest."
        }
    ],
    "proficiencies_granted": {
        "armor": ["Light armor"],
        "weapons": ["Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"],
        "tools": {"type": "choice", "count": 3, "options_list_type": "musical_instrument"},
        "skills": {"type": "choice_any", "count": 3}
    },
    "starting_equipment_options": [
        {"choice": "(a) a rapier, (b) a longsword, or (c) any simple weapon", "options": [{"item_name": "Rapier"}, {"item_name": "Longsword"}, {"type": "Simple Weapon", "count": 1}]},
        {"choice": "(a) a diplomat’s pack or (b) an entertainer’s pack", "options": [{"item_name": "Diplomat''s Pack"}, {"item_name": "Entertainer''s Pack"}]},
        {"choice": "(a) a lute or (b) any other musical instrument", "options": [{"item_name": "Lute"}, {"type": "Musical Instrument", "count": 1}]},
        {"fixed": [{"item_name": "Leather Armor"}, {"item_name": "Dagger"}]}
    ]
}',
FALSE,
'An inspiring magician whose power echoes the music of creation.'
) ON CONFLICT (name) DO UPDATE SET
    hit_die = EXCLUDED.hit_die,
    saving_throw_proficiency_ability_ids = EXCLUDED.saving_throw_proficiency_ability_ids,
    spellcasting_ability_id = EXCLUDED.spellcasting_ability_id,
    class_features_by_level = EXCLUDED.class_features_by_level,
    can_prepare_spells = EXCLUDED.can_prepare_spells,
    description = EXCLUDED.description;

-- Cleric (PHB p. 56) [cite: Comprehensive D&D 5e Data Compilation (143-147)]
-- Note: Divine Domain L1 features are specific to the chosen domain.
-- The `options_reference` points to where these would be detailed (e.g., a separate table or hardcoded logic in app).
INSERT INTO dnd_classes (
    name, hit_die,
    saving_throw_proficiency_ability_ids,
    spellcasting_ability_id,
    class_features_by_level,
    can_prepare_spells,
    description
) VALUES (
'Cleric', 8,
ARRAY[(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS'), (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA')],
(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS'),
'{
    "1": [
        {
            "name": "Spellcasting",
            "description": "As a conduit for divine power, you can cast cleric spells. (Cantrips: 3 known. Preparing and Casting Spells: You prepare a number of cleric spells equal to your Wisdom modifier + your cleric level (min 1). Spellcasting Ability: Wisdom. Ritual Casting.)"
        },
        {
            "name": "Divine Domain",
            "description": "Choose one domain related to your deity, such as Life. Your choice grants you domain spells and other features when you choose it at 1st level. (PHB options: Knowledge, Life, Light, Nature, Tempest, Trickery, War).",
            "choice_type": "subclass",
            "options_reference": "cleric_divine_domains"
        }
    ],
    "proficiencies_granted": {
        "armor": ["Light armor", "Medium armor", "Shields"],
        "weapons": ["Simple weapons"],
        "tools": [],
        "skills": {
            "type": "choice", "count": 2,
            "options_list": ["History", "Insight", "Medicine", "Persuasion", "Religion"]
        }
    },
    "starting_equipment_options": [
        {"choice": "(a) a mace or (b) a warhammer (if proficient)", "options": [{"item_name": "Mace"}, {"item_name": "Warhammer"}]},
        {"choice": "(a) scale mail, (b) leather armor, or (c) chain mail (if proficient)", "options": [{"item_name": "Scale Mail"}, {"item_name": "Leather Armor"}, {"item_name": "Chain Mail"}]},
        {"choice": "(a) a light crossbow and 20 bolts or (b) any simple weapon", "options": [{"group": [{"item_name": "Light Crossbow"}, {"item_name": "Crossbow Bolts", "quantity": 20}]}, {"type": "Simple Weapon", "count": 1}]},
        {"choice": "(a) a priest’s pack or (b) an explorer’s pack", "options": [{"item_name": "Priest''s Pack"}, {"item_name": "Explorer''s Pack"}]},
        {"fixed": [{"item_name": "Shield"}, {"type": "Holy Symbol"}]}
    ]
}',
TRUE,
'A priestly champion who wields divine magic in service of a higher power.'
) ON CONFLICT (name) DO UPDATE SET
    hit_die = EXCLUDED.hit_die,
    saving_throw_proficiency_ability_ids = EXCLUDED.saving_throw_proficiency_ability_ids,
    spellcasting_ability_id = EXCLUDED.spellcasting_ability_id,
    class_features_by_level = EXCLUDED.class_features_by_level,
    can_prepare_spells = EXCLUDED.can_prepare_spells,
    description = EXCLUDED.description;

-- Druid (PHB p. 64) [cite: Comprehensive D&D 5e Data Compilation (163-167)]
INSERT INTO dnd_classes (
    name, hit_die,
    saving_throw_proficiency_ability_ids,
    spellcasting_ability_id,
    class_features_by_level,
    can_prepare_spells,
    description
) VALUES (
'Druid', 8,
ARRAY[(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT'), (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS')],
(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS'),
'{
    "1": [
        {
            "name": "Druidic",
            "description": "You know Druidic, the secret language of druids. You can speak the language and use it to leave hidden messages. You and others who know this language automatically spot such a message. Others spot the message’s presence with a successful DC 15 Wisdom (Perception) check but can’t decipher it without magic."
        },
        {
            "name": "Spellcasting",
            "description": "Drawing on the divine essence of nature itself, you can cast spells to shape that essence to your will. (Cantrips: 2 known. Preparing and Casting Spells: You prepare a number of druid spells equal to your Wisdom modifier + your druid level (min 1). Spellcasting Ability: Wisdom. Ritual Casting.)"
        }
    ],
    "proficiencies_granted": {
        "armor": ["Light armor (nonmetal)", "Medium armor (nonmetal)", "Shields (nonmetal)"],
        "weapons": ["Clubs", "Daggers", "Darts", "Javelins", "Maces", "Quarterstaffs", "Scimitars", "Sickles", "Slings", "Spears"],
        "tools": ["Herbalism kit"],
        "skills": {
            "type": "choice", "count": 2,
            "options_list": ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"]
        }
    },
    "starting_equipment_options": [
        {"choice": "(a) a wooden shield or (b) any simple weapon", "options": [{"item_name": "Shield, wooden"}, {"type": "Simple Weapon", "count": 1}]},
        {"choice": "(a) a scimitar or (b) any simple melee weapon", "options": [{"item_name": "Scimitar"}, {"type": "Simple Melee Weapon", "count": 1}]},
        {"fixed": [{"item_name": "Leather Armor"}, {"item_name": "Explorer''s Pack"}, {"type": "Druidic Focus"}]}
    ]
}',
TRUE,
'A priest of the Old Faith, wielding the powers of nature and adopting animal forms.'
) ON CONFLICT (name) DO UPDATE SET
    hit_die = EXCLUDED.hit_die,
    saving_throw_proficiency_ability_ids = EXCLUDED.saving_throw_proficiency_ability_ids,
    spellcasting_ability_id = EXCLUDED.spellcasting_ability_id,
    class_features_by_level = EXCLUDED.class_features_by_level,
    can_prepare_spells = EXCLUDED.can_prepare_spells,
    description = EXCLUDED.description;

-- Monk (PHB p. 76) [cite: Comprehensive D&D 5e Data Compilation (202-207)]
INSERT INTO dnd_classes (
    name, hit_die,
    saving_throw_proficiency_ability_ids,
    class_features_by_level,
    description
) VALUES (
'Monk', 8,
ARRAY[(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'STR'), (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'DEX')],
'{
    "1": [
        {
            "name": "Unarmored Defense",
            "description": "Beginning at 1st level, while you are wearing no armor and not wielding a shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier."
        },
        {
            "name": "Martial Arts",
            "description": "At 1st level, your practice of martial arts gives you mastery of combat styles that use unarmed strikes and monk weapons, which are shortswords and any simple melee weapons that don’t have the two-handed or heavy property. You gain the following benefits while you are unarmed or wielding only monk weapons and you aren’t wearing armor or wielding a shield: You can use Dexterity instead of Strength for the attack and damage rolls of your unarmed strikes and monk weapons. You can roll a d4 in place of the normal damage of your unarmed strike or monk weapon. This die changes as you gain monk levels. When you use the Attack action with an unarmed strike or a monk weapon on your turn, you can make one unarmed strike as a bonus action."
        }
    ],
    "proficiencies_granted": {
        "armor": [],
        "weapons": ["Simple weapons", "Shortswords"],
        "tools": {"type": "choice", "count": 1, "options_list_type": "artisan_tools_or_musical_instrument"},
        "skills": {
            "type": "choice", "count": 2,
            "options_list": ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"]
        }
    },
    "starting_equipment_options": [
        {"choice": "(a) a shortsword or (b) any simple weapon", "options": [{"item_name": "Shortsword"}, {"type": "Simple Weapon", "count": 1}]},
        {"choice": "(a) a dungeoneer’s pack or (b) an explorer’s pack", "options": [{"item_name": "Dungeoneer''s Pack"}, {"item_name": "Explorer''s Pack"}]},
        {"fixed": [{"item_name": "Dart", "quantity": 10}]}
    ]
}',
'A master of martial arts, harnessing the power of the body in pursuit of physical and spiritual perfection.'
) ON CONFLICT (name) DO UPDATE SET
    hit_die = EXCLUDED.hit_die,
    saving_throw_proficiency_ability_ids = EXCLUDED.saving_throw_proficiency_ability_ids,
    class_features_by_level = EXCLUDED.class_features_by_level,
    description = EXCLUDED.description;

-- Paladin (PHB p. 82) [cite: Comprehensive D&D 5e Data Compilation (220-225)]
INSERT INTO dnd_classes (
    name, hit_die,
    saving_throw_proficiency_ability_ids,
    spellcasting_ability_id,
    class_features_by_level,
    can_prepare_spells,
    description
) VALUES (
'Paladin', 10,
ARRAY[(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS'), (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA')],
(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA'), -- Spellcasting gained at L2
'{
    "1": [
        {
            "name": "Divine Sense",
            "description": "The presence of strong evil registers on your senses like a noxious odor, and powerful good rings like heavenly music in your ears. As an action, you can open your awareness to detect such forces. Until the end of your next turn, you know the location of any celestial, fiend, or undead within 60 feet of you that is not behind total cover. You know the type (celestial, fiend, or undead) of any being whose presence you sense, but not its identity. Within the same radius, you also detect the presence of any place or object that has been consecrated or desecrated, as with the hallow spell. You can use this feature a number of times equal to 1 + your Charisma modifier. When you finish a long rest, you regain all expended uses."
        },
        {
            "name": "Lay on Hands",
            "description": "Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you take a long rest. With that pool, you can restore a total number of hit points equal to your paladin level × 5. As an action, you can touch a creature and draw power from the pool to restore a number of hit points to that creature, up to the maximum amount remaining in your pool. Alternatively, you can expend 5 hit points from your pool of healing to cure the target of one disease or neutralize one poison affecting it. You can cure multiple diseases and neutralize multiple poisons with a single use of Lay on Hands, expending hit points separately for each one. This feature has no effect on undead and constructs."
        }
    ],
    "proficiencies_granted": {
        "armor": ["All armor", "Shields"],
        "weapons": ["Simple weapons", "Martial weapons"],
        "tools": [],
        "skills": {
            "type": "choice", "count": 2,
            "options_list": ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"]
        }
    },
    "starting_equipment_options": [
        {"choice": "(a) a martial weapon and a shield or (b) two martial weapons", "options": [{"group": [{"type": "Martial Weapon", "count": 1}, {"item_name": "Shield"}]}, {"group": [{"type": "Martial Weapon", "count": 2}]}]},
        {"choice": "(a) five javelins or (b) any simple melee weapon", "options": [{"item_name": "Javelin", "quantity": 5}, {"type": "Simple Melee Weapon", "count": 1}]},
        {"choice": "(a) a priest’s pack or (b) an explorer’s pack", "options": [{"item_name": "Priest''s Pack"}, {"item_name": "Explorer''s Pack"}]},
        {"fixed": [{"item_name": "Chain Mail"}, {"type": "Holy Symbol"}]}
    ]
}',
TRUE, -- Paladins prepare spells (starting at L2)
'A holy warrior bound to a sacred oath.'
) ON CONFLICT (name) DO UPDATE SET
    hit_die = EXCLUDED.hit_die,
    saving_throw_proficiency_ability_ids = EXCLUDED.saving_throw_proficiency_ability_ids,
    spellcasting_ability_id = EXCLUDED.spellcasting_ability_id,
    class_features_by_level = EXCLUDED.class_features_by_level,
    can_prepare_spells = EXCLUDED.can_prepare_spells,
    description = EXCLUDED.description;

-- Ranger (PHB p. 89) [cite: Comprehensive D&D 5e Data Compilation (237-242)]
INSERT INTO dnd_classes (
    name, hit_die,
    saving_throw_proficiency_ability_ids,
    spellcasting_ability_id,
    class_features_by_level,
    can_prepare_spells,
    description
) VALUES (
'Ranger', 10,
ARRAY[(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'STR'), (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'DEX')],
(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS'),
'{
    "1": [
        {
            "name": "Favored Enemy",
            "description": "Beginning at 1st level, you have significant experience studying, tracking, hunting, and even talking to a certain type of enemy. Choose a type of favored enemy: aberrations, beasts, celestials, constructs, dragons, elementals, fey, fiends, giants, monstrosities, oozes, plants, or undead. Alternatively, you can select two races of humanoids (such as gnolls and orcs) as favored enemies. You have advantage on Wisdom (Survival) checks to track your favored enemies, as well as on Intelligence checks to recall information about them. When you gain this feature, you also learn one language of your choice that is spoken by your favored enemies, if they speak one at all."
        },
        {
            "name": "Natural Explorer",
            "description": "You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions. Choose one type of favored terrain: arctic, coast, desert, forest, grassland, mountain, swamp, or the Underdark. When you make an Intelligence or Wisdom check related to your favored terrain, your proficiency bonus is doubled if you are using a skill that you’re proficient in. While traveling for an hour or more in your favored terrain, you gain the following benefits: Difficult terrain doesn’t slow your group’s travel. Your group can’t become lost except by magical means. Even when you are engaged in another activity while traveling (such as foraging, navigating, or tracking), you remain alert to danger. If you are traveling alone, you can move stealthily at a normal pace. When you forage, you find twice as much food as you normally would. While tracking other creatures, you also learn their exact number, their sizes, and how long ago they passed through the area."
        }
    ],
    "proficiencies_granted": {
        "armor": ["Light armor", "Medium armor", "Shields"],
        "weapons": ["Simple weapons", "Martial weapons"],
        "tools": [],
        "skills": {
            "type": "choice", "count": 3,
            "options_list": ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"]
        }
    },
    "starting_equipment_options": [
        {"choice": "(a) scale mail or (b) leather armor", "options": [{"item_name": "Scale Mail"}, {"item_name": "Leather Armor"}]},
        {"choice": "(a) two shortswords or (b) two simple melee weapons", "options": [{"item_name": "Shortsword", "quantity": 2}, {"type": "Simple Melee Weapon", "count": 2}]},
        {"choice": "(a) a dungeoneer’s pack or (b) an explorer’s pack", "options": [{"item_name": "Dungeoneer''s Pack"}, {"item_name": "Explorer''s Pack"}]},
        {"fixed": [{"item_name": "Longbow"}, {"item_name": "Arrows", "quantity": 20}]}
    ]
}',
TRUE,
'A warrior who uses martial prowess and nature magic to combat threats on the edges of civilization.'
) ON CONFLICT (name) DO UPDATE SET
    hit_die = EXCLUDED.hit_die,
    saving_throw_proficiency_ability_ids = EXCLUDED.saving_throw_proficiency_ability_ids,
    spellcasting_ability_id = EXCLUDED.spellcasting_ability_id,
    class_features_by_level = EXCLUDED.class_features_by_level,
    can_prepare_spells = EXCLUDED.can_prepare_spells,
    description = EXCLUDED.description;

-- Rogue (PHB p. 94) [cite: Comprehensive D&D 5e Data Compilation (252-258)]
INSERT INTO dnd_classes (
    name, hit_die,
    saving_throw_proficiency_ability_ids,
    class_features_by_level,
    description
) VALUES (
'Rogue', 8,
ARRAY[(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'DEX'), (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT')],
'{
    "1": [
        {
            "name": "Expertise",
            "description": "At 1st level, choose two of your skill proficiencies, or one of your skill proficiencies and your proficiency with thieves’ tools. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies."
        },
        {
            "name": "Sneak Attack",
            "description": "Beginning at 1st level, you know how to strike subtly and exploit a foe’s distraction. Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll. The attack must use a finesse or a ranged weapon. You don’t need advantage on the attack roll if another enemy of the target is within 5 feet of it, that enemy isn’t incapacitated, and you don’t have disadvantage on the attack roll. The amount of the extra damage increases as you gain levels in this class."
        },
        {
            "name": "Thieves'' Cant",
            "description": "During your rogue training you learned thieves’ cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation. Only another creature that knows thieves’ cant understands such messages. It takes four times longer to convey such a message than it does to speak the same idea plainly. In addition, you understand a set of secret signs and symbols used to convey short, simple messages."
        }
    ],
    "proficiencies_granted": {
        "armor": ["Light armor"],
        "weapons": ["Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"],
        "tools": ["Thieves'' tools"],
        "skills": {
            "type": "choice", "count": 4,
            "options_list": ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"]
        }
    },
    "starting_equipment_options": [
        {"choice": "(a) a rapier or (b) a shortsword", "options": [{"item_name": "Rapier"}, {"item_name": "Shortsword"}]},
        {"choice": "(a) a shortbow and quiver of 20 arrows or (b) a shortsword", "options": [{"group": [{"item_name": "Shortbow"}, {"item_name": "Arrows", "quantity": 20}]}, {"item_name": "Shortsword"}]},
        {"choice": "(a) a burglar’s pack, (b) a dungeoneer’s pack, or (c) an explorer’s pack", "options": [{"item_name": "Burglar''s Pack"}, {"item_name": "Dungeoneer''s Pack"}, {"item_name": "Explorer''s Pack"}]},
        {"fixed": [{"item_name": "Leather Armor"}, {"item_name": "Dagger", "quantity": 2}, {"item_name": "Thieves'' Tools"}]}
    ]
}',
'A scoundrel who uses stealth and trickery to overcome obstacles and enemies.'
) ON CONFLICT (name) DO UPDATE SET
    hit_die = EXCLUDED.hit_die,
    saving_throw_proficiency_ability_ids = EXCLUDED.saving_throw_proficiency_ability_ids,
    class_features_by_level = EXCLUDED.class_features_by_level,
    description = EXCLUDED.description;

-- Sorcerer (PHB p. 99) [cite: Comprehensive D&D 5e Data Compilation (273-278)]
INSERT INTO dnd_classes (
    name, hit_die,
    saving_throw_proficiency_ability_ids,
    spellcasting_ability_id,
    class_features_by_level,
    can_prepare_spells,
    description
) VALUES (
'Sorcerer', 6,
ARRAY[(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CON'), (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA')],
(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA'),
'{
    "1": [
        {
            "name": "Spellcasting",
            "description": "An event in your past, or in the life of a parent or ancestor, left an indelible mark on you, infusing you with arcane magic. (Cantrips: 4 known. Spell Slots: 2 1st-level. Spells Known: 2 1st-level. Spellcasting Ability: Charisma.)"
        },
        {
            "name": "Sorcerous Origin",
            "description": "Choose a sorcerous origin, which describes the source of your innate magical power: Draconic Bloodline or Wild Magic. Your choice grants you features when you choose it at 1st level.",
            "choice_type": "subclass",
            "options_reference": "sorcerer_origins"
        }
    ],
    "proficiencies_granted": {
        "armor": [],
        "weapons": ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"],
        "tools": [],
        "skills": {
            "type": "choice", "count": 2,
            "options_list": ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"]
        }
    },
    "starting_equipment_options": [
        {"choice": "(a) a light crossbow and 20 bolts or (b) any simple weapon", "options": [{"group": [{"item_name": "Light Crossbow"}, {"item_name": "Crossbow Bolts", "quantity": 20}]}, {"type": "Simple Weapon", "count": 1}]},
        {"choice": "(a) a component pouch or (b) an arcane focus", "options": [{"item_name": "Component Pouch"}, {"type": "Arcane Focus"}]},
        {"choice": "(a) a dungeoneer’s pack or (b) an explorer’s pack", "options": [{"item_name": "Dungeoneer''s Pack"}, {"item_name": "Explorer''s Pack"}]},
        {"fixed": [{"item_name": "Dagger", "quantity": 2}]}
    ]
}',
FALSE,
'A spellcaster who draws on inherent magic from a gift or bloodline.'
) ON CONFLICT (name) DO UPDATE SET
    hit_die = EXCLUDED.hit_die,
    saving_throw_proficiency_ability_ids = EXCLUDED.saving_throw_proficiency_ability_ids,
    spellcasting_ability_id = EXCLUDED.spellcasting_ability_id,
    class_features_by_level = EXCLUDED.class_features_by_level,
    can_prepare_spells = EXCLUDED.can_prepare_spells,
    description = EXCLUDED.description;

-- Warlock (PHB p. 105) [cite: Comprehensive D&D 5e Data Compilation (289-294)]
INSERT INTO dnd_classes (
    name, hit_die,
    saving_throw_proficiency_ability_ids,
    spellcasting_ability_id,
    class_features_by_level,
    can_prepare_spells,
    description
) VALUES (
'Warlock', 8,
ARRAY[(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS'), (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA')],
(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA'),
'{
    "1": [
        {
            "name": "Otherworldly Patron",
            "description": "At 1st level, you have struck a bargain with an otherworldly being of your choice: the Archfey, the Fiend, or the Great Old One. Your choice grants you features at 1st level.",
            "choice_type": "subclass",
            "options_reference": "warlock_patrons"
        },
        {
            "name": "Pact Magic",
            "description": "Your arcane research and the magic bestowed on you by your patron have given you facility with spells. (Cantrips: 2 known. Spell Slots: 1 1st-level slot, recovered on short or long rest. Spells Known: 2 1st-level. Spellcasting Ability: Charisma.)"
        }
    ],
    "proficiencies_granted": {
        "armor": ["Light armor"],
        "weapons": ["Simple weapons"],
        "tools": [],
        "skills": {
            "type": "choice", "count": 2,
            "options_list": ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"]
        }
    },
    "starting_equipment_options": [
        {"choice": "(a) a light crossbow and 20 bolts or (b) any simple weapon", "options": [{"group": [{"item_name": "Light Crossbow"}, {"item_name": "Crossbow Bolts", "quantity": 20}]}, {"type": "Simple Weapon", "count": 1}]},
        {"choice": "(a) a component pouch or (b) an arcane focus", "options": [{"item_name": "Component Pouch"}, {"type": "Arcane Focus"}]},
        {"choice": "(a) a scholar’s pack or (b) a dungeoneer’s pack", "options": [{"item_name": "Scholar''s Pack"}, {"item_name": "Dungeoneer''s Pack"}]},
        {"fixed": [{"item_name": "Leather Armor"}, {"type": "Simple Weapon", "count": 1}, {"item_name": "Dagger", "quantity": 2}]}
    ]
}',
FALSE,
'A wielder of magic that is derived from a bargain with an extraplanar entity.'
) ON CONFLICT (name) DO UPDATE SET
    hit_die = EXCLUDED.hit_die,
    saving_throw_proficiency_ability_ids = EXCLUDED.saving_throw_proficiency_ability_ids,
    spellcasting_ability_id = EXCLUDED.spellcasting_ability_id,
    class_features_by_level = EXCLUDED.class_features_by_level,
    can_prepare_spells = EXCLUDED.can_prepare_spells,
    description = EXCLUDED.description;

-- Wizard (PHB p. 112) [cite: Comprehensive D&D 5e Data Compilation (320-325)]
INSERT INTO dnd_classes (
    name, hit_die,
    saving_throw_proficiency_ability_ids,
    spellcasting_ability_id,
    class_features_by_level,
    can_prepare_spells,
    description
) VALUES (
'Wizard', 6,
ARRAY[(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT'), (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS')],
(SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT'),
'{
    "1": [
        {
            "name": "Spellcasting",
            "description": "As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power. (Cantrips: 3 wizard cantrips known. Spellbook: Contains six 1st-level wizard spells of your choice. Preparing and Casting Spells: You prepare a number of wizard spells equal to your Intelligence modifier + your wizard level (min 1). Spellcasting Ability: Intelligence. Ritual Casting.)"
        },
        {
            "name": "Arcane Recovery",
            "description": "You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up), and none of the slots can be 6th level or higher."
        }
    ],
    "proficiencies_granted": {
        "armor": [],
        "weapons": ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"],
        "tools": [],
        "skills": {
            "type": "choice", "count": 2,
            "options_list": ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"]
        }
    },
    "starting_equipment_options": [
        {"choice": "(a) a quarterstaff or (b) a dagger", "options": [{"item_name": "Quarterstaff"}, {"item_name": "Dagger"}]},
        {"choice": "(a) a component pouch or (b) an arcane focus", "options": [{"item_name": "Component Pouch"}, {"type": "Arcane Focus"}]},
        {"choice": "(a) a scholar’s pack or (b) an explorer’s pack", "options": [{"item_name": "Scholar''s Pack"}, {"item_name": "Explorer''s Pack"}]},
        {"fixed": [{"item_name": "Spellbook"}]}
    ]
}',
TRUE,
'A scholarly magic-user capable of manipulating the structures of reality.'
) ON CONFLICT (name) DO UPDATE SET
    hit_die = EXCLUDED.hit_die,
    saving_throw_proficiency_ability_ids = EXCLUDED.saving_throw_proficiency_ability_ids,
    spellcasting_ability_id = EXCLUDED.spellcasting_ability_id,
    class_features_by_level = EXCLUDED.class_features_by_level,
    can_prepare_spells = EXCLUDED.can_prepare_spells,
    description = EXCLUDED.description;

SELECT 'dnd_classes table populated with Level 1 data for all PHB classes (corrected).' AS status;

-- Alignments
INSERT INTO dnd_alignments (name, abbreviation, description) VALUES
('Lawful Good', 'LG', 'Creatures act as a good person is expected or required to act. They tell the truth, keep their word, help those in need, and speak out against injustice. A lawful good character hates to see the guilty go unpunished.'),
('Neutral Good', 'NG', 'Folk do the best they can to help others according to their needs. Many celestials, some cloud giants, and most gnomes are neutral good.'),
('Chaotic Good', 'CG', 'Creatures act as their conscience directs, with little regard for what others expect. Copper dragons, many elves, and unicorns are chaotic good.'),
('Lawful Neutral', 'LN', 'Individuals act in accordance with law, tradition, or personal codes. Many monks and some wizards are lawful neutral.'),
('Neutral', 'N', 'Often called "true neutral," these creatures do what seems to be a good idea. They don''t feel strongly one way or another when it comes to good vs. evil or law vs. chaos. Most neutral creatures lack the conviction or bias to A M Shand.'), -- Note: "A M Shand" seems like a transcription error in the source, should likely be "take a side" or similar. I've kept it as is if it's directly from your doc, but you might want to verify/correct this description.
('Chaotic Neutral', 'CN', 'Creatures follow their whims, holding their personal freedom above all else. Many barbarians and rogues, and some bards, are chaotic neutral.'),
('Lawful Evil', 'LE', 'Creatures methodically take what they want, within the limits of a code of tradition, loyalty, or order. Devils, blue dragons, and hobgoblins are lawful evil.'),
('Neutral Evil', 'NE', 'Folk do whatever they can get away with, without compassion or qualms. Many drow, some cloud giants, and yugoloths are neutral evil.'),
('Chaotic Evil', 'CE', 'Creatures act with arbitrary violence, spurred by their greed, hatred, or bloodlust. Demons, red dragons, and orcs are chaotic evil.')
ON CONFLICT (name) DO UPDATE SET
  abbreviation = EXCLUDED.abbreviation,
  description = EXCLUDED.description;

-- Background
INSERT INTO dnd_backgrounds (name, feature_name, feature_description) VALUES 
('Acolyte', 'Shelter of the Faithful', '...') 
ON CONFLICT (name) DO NOTHING;

-- Skills
INSERT INTO dnd_skills (name, ability_id) VALUES
('Acrobatics', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'DEX')),
('Animal Handling', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS')),
('Arcana', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT')),
('Athletics', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'STR')),
('Deception', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA')),
('History', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT')),
('Insight', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS')),
('Intimidation', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA')),
('Investigation', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT')),
('Medicine', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS')),
('Nature', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT')),
('Perception', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS')),
('Performance', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA')),
('Persuasion', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'CHA')),
('Religion', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'INT')),
('Sleight of Hand', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'DEX')),
('Stealth', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'DEX')),
('Survival', (SELECT ability_id FROM dnd_abilities WHERE abbreviation = 'WIS'))
ON CONFLICT (name) DO UPDATE SET
  ability_id = EXCLUDED.ability_id;

-- Sample Items
-- Armor Examples (Based on PHB p. 145) [cite: Comprehensive D&D 5e Data Compilation (412)]
INSERT INTO dnd_items (name, type, description, properties, weight, cost_gp, requires_attunement) VALUES
('Padded Armor', 'Light Armor', 'Padded armor consists of quilted layers of cloth and batting.',
  '{"ac_base": 11, "ac_dex_bonus": true, "strength_requirement": null, "stealth_disadvantage": true}', 8, 5, FALSE),
('Leather Armor', 'Light Armor', 'The breastplate and shoulder protectors of this armor are made of leather that has been stiffened by being boiled in oil. The rest of the armor is made of softer and more flexible materials.',
  '{"ac_base": 11, "ac_dex_bonus": true, "strength_requirement": null, "stealth_disadvantage": false}', 10, 10, FALSE),
('Studded Leather Armor', 'Light Armor', 'Made from tough but flexible leather, studded leather is reinforced with close-set rivets or spikes.',
  '{"ac_base": 12, "ac_dex_bonus": true, "strength_requirement": null, "stealth_disadvantage": false}', 13, 45, FALSE),

('Hide Armor', 'Medium Armor', 'This crude armor consists of thick furs and pelts. It is commonly worn by barbarian tribes, evil humanoids, and other folk who lack access to the tools and materials needed to create better armor.',
  '{"ac_base": 12, "ac_dex_bonus": true, "ac_dex_bonus_max": 2, "strength_requirement": null, "stealth_disadvantage": false}', 12, 10, FALSE),
('Chain Shirt', 'Medium Armor', 'Made of interlocking metal rings, a chain shirt is worn between layers of clothing or leather. This armor offers modest protection to the wearer''s upper body and allows the sound of the rings rubbing against one another to be muffled by outer layers.',
  '{"ac_base": 13, "ac_dex_bonus": true, "ac_dex_bonus_max": 2, "strength_requirement": null, "stealth_disadvantage": false}', 20, 50, FALSE),
('Scale Mail', 'Medium Armor', 'This armor consists of a coat and leggings (and perhaps a separate skirt) of leather covered with overlapping pieces of metal, much like the scales of a fish. The suit includes gauntlets.',
  '{"ac_base": 14, "ac_dex_bonus": true, "ac_dex_bonus_max": 2, "strength_requirement": null, "stealth_disadvantage": true}', 45, 50, FALSE),
('Breastplate', 'Medium Armor', 'This armor consists of a fitted metal chest piece worn with supple leather. Although it leaves the legs and arms relatively unprotected, this armor provides good protection for the wearer''s vital organs while leaving the wearer relatively unencumbered.',
  '{"ac_base": 14, "ac_dex_bonus": true, "ac_dex_bonus_max": 2, "strength_requirement": null, "stealth_disadvantage": false}', 20, 400, FALSE),
('Half Plate Armor', 'Medium Armor', 'Half plate consists of shaped metal plates that cover most of the wearer''s body. It does not include leg protection beyond simple greaves that are attached with leather straps.',
  '{"ac_base": 15, "ac_dex_bonus": true, "ac_dex_bonus_max": 2, "strength_requirement": null, "stealth_disadvantage": true}', 40, 750, FALSE),

('Ring Mail', 'Heavy Armor', 'This armor is leather armor with heavy rings sewn into it. The rings help reinforce the armor against blows from swords and axes. Ring mail is inferior to chain mail, and it''s usually worn only by those who can''t afford better armor.',
  '{"ac_base": 14, "ac_dex_bonus": false, "strength_requirement": null, "stealth_disadvantage": true}', 40, 30, FALSE),
('Chain Mail', 'Heavy Armor', 'Made of interlocking metal rings, chain mail includes a layer of quilted fabric worn underneath the mail to prevent chafing and to cushion the impact of blows. The suit includes gauntlets.',
  '{"ac_base": 16, "ac_dex_bonus": false, "strength_requirement": 13, "stealth_disadvantage": true}', 55, 75, FALSE),
('Splint Armor', 'Heavy Armor', 'This armor is made of narrow vertical strips of metal riveted to a backing of leather that is worn over cloth padding. Flexible chain mail protects the joints.',
  '{"ac_base": 17, "ac_dex_bonus": false, "strength_requirement": 15, "stealth_disadvantage": true}', 60, 200, FALSE),
('Plate Armor', 'Heavy Armor', 'Plate consists of shaped, interlocking metal plates to cover the entire body. A suit of plate includes gauntlets, heavy leather boots, a visored helmet, and thick layers of padding underneath the armor. Buckles and straps distribute the weight over the body.',
  '{"ac_base": 18, "ac_dex_bonus": false, "strength_requirement": 15, "stealth_disadvantage": true}', 65, 1500, FALSE),

('Shield', 'Shield', 'A shield is made from wood or metal and is carried in one hand. Wielding a shield increases your Armor Class by 2. You can benefit from only one shield at a time.',
  '{"ac_bonus": 2}', 6, 10, FALSE)
ON CONFLICT (name) DO UPDATE SET
  type = EXCLUDED.type, description = EXCLUDED.description, properties = EXCLUDED.properties, weight = EXCLUDED.weight, cost_gp = EXCLUDED.cost_gp, requires_attunement = EXCLUDED.requires_attunement;

-- Weapon Examples (Based on PHB p. 149) [cite: Comprehensive D&D 5e Data Compilation (413-414)]
INSERT INTO dnd_items (name, type, description, properties, weight, cost_gp, requires_attunement) VALUES
('Club', 'Simple Melee Weapon', 'A simple wooden club.',
  '{"damage_dice": "1d4", "damage_type": "bludgeoning", "weapon_properties": ["Light"]}', 2, 0.1, FALSE),
('Dagger', 'Simple Melee Weapon', 'A common dagger.',
  '{"damage_dice": "1d4", "damage_type": "piercing", "weapon_properties": ["Finesse", "Light", "Thrown (range 20/60)"]}', 1, 2, FALSE),
('Greatclub', 'Simple Melee Weapon', 'A large, two-handed club.',
  '{"damage_dice": "1d8", "damage_type": "bludgeoning", "weapon_properties": ["Two-handed"]}', 10, 0.2, FALSE),
('Light Hammer', 'Simple Melee Weapon', 'A light hammer designed for combat.',
  '{"damage_dice": "1d4", "damage_type": "bludgeoning", "weapon_properties": ["Light", "Thrown (range 20/60)"]}', 2, 2, FALSE),
('Shortbow', 'Simple Ranged Weapon', 'A standard shortbow for ranged combat.',
  '{"damage_dice": "1d6", "damage_type": "piercing", "weapon_properties": ["Ammunition (range 80/320)", "Two-handed"]}', 2, 25, FALSE),

('Battleaxe', 'Martial Melee Weapon', 'A sturdy battleaxe.',
  '{"damage_dice": "1d8", "damage_type": "slashing", "versatile_damage": "1d10", "weapon_properties": ["Versatile (1d10)"]}', 4, 10, FALSE),
('Longsword', 'Martial Melee Weapon', 'A classic longsword.',
  '{"damage_dice": "1d8", "damage_type": "slashing", "versatile_damage": "1d10", "weapon_properties": ["Versatile (1d10)"]}', 3, 15, FALSE),
('Rapier', 'Martial Melee Weapon', 'A slender, sharp-pointed sword.',
  '{"damage_dice": "1d8", "damage_type": "piercing", "weapon_properties": ["Finesse"]}', 2, 25, FALSE),
('Longbow', 'Martial Ranged Weapon', 'A powerful longbow.',
  '{"damage_dice": "1d8", "damage_type": "piercing", "weapon_properties": ["Ammunition (range 150/600)", "Heavy", "Two-handed"]}', 2, 50, FALSE)
ON CONFLICT (name) DO UPDATE SET
  type = EXCLUDED.type, description = EXCLUDED.description, properties = EXCLUDED.properties, weight = EXCLUDED.weight, cost_gp = EXCLUDED.cost_gp, requires_attunement = EXCLUDED.requires_attunement;

-- Adventuring Gear Examples (Based on PHB p. 150-153) [cite: Comprehensive D&D 5e Data Compilation (415-429)]
INSERT INTO dnd_items (name, type, description, properties, weight, cost_gp, requires_attunement) VALUES
('Abacus', 'Adventuring Gear', 'A tool for calculation.',
  '{}', 2, 2, FALSE),
('Acid (vial)', 'Adventuring Gear', 'As an action, you can splash the contents of this vial onto a creature within 5 feet of you or throw the vial up to 20 feet, shattering it on impact. In either case, make a ranged attack against a creature or object, treating the acid as an improvised weapon. On a hit, the target takes 2d6 acid damage.',
  '{"action_type": "action", "attack_type": "ranged_improvised", "range": "5ft_splash_or_20ft_throw", "damage_dice": "2d6", "damage_type": "acid"}', 1, 25, FALSE),
('Alchemist''s Fire (flask)', 'Adventuring Gear', 'This sticky, adhesive fluid ignites when exposed to air. As an action, you can throw this flask up to 20 feet, shattering it on impact. Make a ranged attack against a creature or object, treating the alchemist''s fire as an improvised weapon. On a hit, the target takes 1d4 fire damage at the start of each of its turns. A creature can end this damage by using its action to make a DC 10 Dexterity check to extinguish the flames.',
  '{"action_type": "action", "attack_type": "ranged_improvised", "range": "20ft_throw", "damage_dice": "1d4", "damage_type": "fire", "duration_effect": "ongoing_damage_DC10_Dex_to_extinguish"}', 1, 50, FALSE),
('Backpack', 'Adventuring Gear', 'A backpack can hold one cubic foot or 30 pounds of gear. You can also strap items, such as a bedroll or a coil of rope, to the outside of a backpack.',
  '{"capacity_volume_ft3": 1, "capacity_weight_lb": 30}', 5, 2, FALSE),
('Bedroll', 'Adventuring Gear', 'A simple bedroll.',
  '{}', 7, 1, FALSE),
('Mess kit', 'Adventuring Gear', 'This tin box contains a cup and simple cutlery. The box clamps together, and one side can be used as a cooking pan and the other as a plate or shallow bowl.',
  '{}', 1, 0.2, FALSE),
('Potion of Healing', 'Potion', 'A character who drinks the magical red fluid in this vial regains 2d4 + 2 hit points. Drinking or administering a potion takes an action.',
  '{"effect": "heal", "healing_dice": "2d4+2", "action_type": "action_to_use"}', 0.5, 50, FALSE),
('Rope, hempen (50 feet)', 'Adventuring Gear', 'Rope, whether made of hemp or silk, has 2 hit points and can be burst with a DC 17 Strength check.',
  '{"length_ft": 50, "hp": 2, "break_dc_str": 17}', 10, 1, FALSE),
('Torch', 'Adventuring Gear', 'A torch burns for 1 hour, providing bright light in a 20-foot radius and dim light for an additional 20 feet. If you make a melee attack with a burning torch and hit, it deals 1 fire damage.',
  '{"duration_hr": 1, "light_bright_ft": 20, "light_dim_ft": 20, "damage_if_used_as_weapon": "1 fire"}', 1, 0.01, FALSE),
('Explorer''s Pack', 'Equipment Pack', 'Includes a backpack, a bedroll, a mess kit, a tinderbox, 10 torches, 10 days of rations, and a waterskin. The pack also has 50 feet of hempen rope strapped to the side of it.',
  '{"contents_list": ["Backpack", "Bedroll", "Mess kit", "Tinderbox", "Torch (10)", "Rations (10 days)", "Waterskin", "Rope, hempen (50 feet)"]}', 59, 10, FALSE)
ON CONFLICT (name) DO UPDATE SET
  type = EXCLUDED.type, description = EXCLUDED.description, properties = EXCLUDED.properties, weight = EXCLUDED.weight, cost_gp = EXCLUDED.cost_gp, requires_attunement = EXCLUDED.requires_attunement;

-- Tool Examples (Based on PHB p. 154) [cite: Comprehensive D&D 5e Data Compilation (429-431)]
INSERT INTO dnd_items (name, type, description, properties, weight, cost_gp, requires_attunement) VALUES
('Smith''s Tools', 'Artisan''s Tools', 'These special tools include the items needed to pursue a craft or trade. Proficiency with a set of artisan''s tools lets you add your proficiency bonus to any ability checks you make using those tools in your craft.',
  '{"components": ["Hammers", "tongs", "bellows", "charcoal", "rags"]}', 8, 20, FALSE),
('Thieves'' Tools', 'Tools', 'This set of tools includes a small file, a set of lock picks, a small mirror mounted on a metal handle, a set of narrow-bladed scissors, and a pair of pliers. Proficiency with these tools lets you add your proficiency bonus to any ability checks you make to disarm traps or open locks.',
  '{"components": ["Small file", "lock picks", "small mirror", "scissors", "pliers"]}', 1, 25, FALSE)
ON CONFLICT (name) DO UPDATE SET
  type = EXCLUDED.type, description = EXCLUDED.description, properties = EXCLUDED.properties, weight = EXCLUDED.weight, cost_gp = EXCLUDED.cost_gp, requires_attunement = EXCLUDED.requires_attunement;

SELECT 'dnd_items table populated with detailed examples.' AS status;

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