import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './PlayerCharacterListPage.module.css';
import Button from '../../components/common/Button/Button';

const mockCharacterTemplates = [
  {
    id: '1',
    name: 'Bandrak Holderhek',
    level: 18,
    race: 'Mountain Dwarf',
    classDisplay: 'Druid',
    subclass: 'Circle of the Land (Arctic)',
  },
  {
    id: '2',
    name: 'Flurry',
    level: 6,
    race: 'Air Genasi',
    classDisplay: 'Barbarian',
    subclass: 'Path of the Wild Soul (archived)',
  },
  {
    id: '3',
    name: 'Heloysia',
    level: 12,
    race: 'Goliath',
    classDisplay: 'Paladin',
    subclass: 'Oath of Devotion',
  },
  {
    id: '4',
    name: 'Kararim',
    level: 1,
    race: 'Half-Orc',
    classDisplay: 'Barbarian',
    subclass: '',
  },
  {
    id: '5',
    name: 'Lyonel Soutmight',
    level: 20,
    race: 'Human',
    classDisplay: 'Bard',
    subclass: 'College of Lore',
  },
  {
    id: '6',
    name: 'Test Character Scroll 1',
    level: 5,
    race: 'Elf',
    classDisplay: 'Rogue',
    subclass: 'Assassin',
  },
  {
    id: '7',
    name: 'Test Character Scroll 2',
    level: 3,
    race: 'Halfling',
    classDisplay: 'Fighter',
    subclass: 'Champion',
  },
  {
    id: '8',
    name: 'Test Character Scroll 3',
    level: 10,
    race: 'Dragonborn',
    classDisplay: 'Sorcerer',
    subclass: 'Draconic Bloodline',
  },
  {
    id: '9',
    name: 'Test Character Scroll 4',
    level: 12,
    race: 'Tiefling',
    classDisplay: 'Warlock',
    subclass: 'The Fiend',
  },
  {
    id: '10',
    name: 'Test Character Scroll 5',
    level: 8,
    race: 'Gnome',
    classDisplay: 'Wizard',
    subclass: 'School of Illusion',
  }
];


function PlayerCharacterListPage() {
  const [characterTemplates, setCharacterTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCharacterTemplates(mockCharacterTemplates);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className={styles.pageContent}>
        <p>Loading characters...</p>
      </div>
    );
  }
  
  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeaderSection}>
        <h2 className={styles.pageTitle}>CREATE & MANAGE CHARACTERS</h2>
        <div className={styles.backButtonContainer}>
          <Button 
            onClick={() => navigate('/#menu')} 
            className={styles.backButton}
            title="Back to Main Menu"
          >
            Back
          </Button>
        </div>
      </div>

      {error && (
        <div className={styles.errorContainer}> 
          <p className={`${styles.pageErrorGlobal} error-message`}>{error}</p>
        </div>
      )}

      <div className={styles.pageBody}>
        {characterTemplates.map((char) => (
          <Link to={`/player-characters/${char.id}`} key={char.id} className={styles.characterCardLink}>
            <div className={styles.characterCard}>
              <div className={styles.avatarPlaceholder}>
                {char.name ? char.name.substring(0, 1).toUpperCase() : '?'}
              </div>
              <div className={styles.characterInfo}>
                <h3 className={styles.characterName}>{char.name}</h3>
                <p className={styles.characterDetailLine}>
                  Level {char.level} {char.race}
                </p>
                <p className={styles.characterDetailLine}>
                  {char.classDisplay}
                  {char.subclass ? ` • ${char.subclass}` : ''}
                </p>
              </div>
              <div className={styles.arrow}>&gt;</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PlayerCharacterListPage;