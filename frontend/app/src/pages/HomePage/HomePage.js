// frontend/app/src/pages/HomePage/HomePage.js
import React, { useState } from 'react';
import styles from './HomePage.module.css'; // Styles for HomePage layout
import Button from '../../components/common/Button/Button'; // Universal Button

function HomePage() {
  const [isStarted, setIsStarted] = useState(false);

  const handleStart = () => {
    setIsStarted(true);
  };

  return (
    <div className={`${styles.homePage} ${!isStarted ? styles.initialScreen : styles.mainMenuScreen}`}>
      <header className={styles.homeHeader}>
        <h1>Welcome to Fate's Forge!</h1>
        {!isStarted && (
          <p className={styles.homeIntro}>
            Your all-in-one interactive environment for D&D-style adventures.
          </p>
        )}
      </header>

      {!isStarted ? (
        <div className={styles.startContainer}>
          {/* This button now uses the default style from Button.module.css */}
          <Button onClick={handleStart}> 
            Enter the Forge
          </Button>
        </div>
      ) : (
        <nav className={styles.mainMenuNav}>
          {/* Menu buttons use default style + a layout class for width */}
          <Button to="/campaigns" className={styles.menuButtonLayout}>
            Campaigns
          </Button>
          <Button to="/create-campaign" className={styles.menuButtonLayout}>
            New Campaign
          </Button>
          <Button className={styles.menuButtonLayout} disabled={true}>
            Worlds (Soon)
          </Button>
          <Button className={styles.menuButtonLayout} disabled={true}>
            Characters (Soon)
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