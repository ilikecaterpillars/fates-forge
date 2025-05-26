// frontend/app/src/pages/HomePage/HomePage.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './HomePage.module.css';
import Button from '../../components/common/Button/Button';

function HomePage() {
  const [isStarted, setIsStarted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#menu') {
      setIsStarted(true);
    }
  }, [location.hash]);
  
  const handleStart = () => {
    setIsStarted(true);
  };

  return (
    <div className={`${styles.homePage} ${!isStarted ? styles.initialScreen : styles.mainMenuScreen}`}>
      <header className={styles.homeHeader}>
        <h1>
          {!isStarted ? "Welcome to Fate's Forge!" : "Fate's Forge"}
        </h1>
        {!isStarted && (
          <p className={styles.homeIntro}>
            Your all-in-one interactive environment for D&D-style adventures.
          </p>
        )}
      </header>

      {!isStarted ? (
        <div className={styles.startContainer}>
          <Button onClick={handleStart}> 
            Enter the Forge
          </Button>
        </div>
      ) : (
        <nav className={styles.mainMenuNav}>
          <Button to="/campaigns" className={styles.menuButtonLayout}>
            Campaigns
          </Button>
          <Button to="/create-campaign" className={styles.menuButtonLayout}>
            New Campaign
          </Button>
          <Button to="/player-characters" className={styles.menuButtonLayout}>
            Characters
          </Button>
          <Button className={styles.menuButtonLayout} disabled={true}>
            Worlds (Soon)
          </Button>
          <Button className={styles.menuButtonLayout} disabled={true}>
            Settings (Soon)
          </Button>
        </nav>
      )}
    </div>
  );
}

export default HomePage;