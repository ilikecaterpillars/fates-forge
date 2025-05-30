import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCharacterWizard } from '../../contexts/CharacterWizardContext';
import Button from '../common/Button/Button';
import styles from './PageFooter.module.css';
import { isWizardRoute } from '../../utils/routeUtils';

function PageFooter() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams(); 
  const wizardContext = useCharacterWizard();

  let contentBlockChildren = null;

  if (isWizardRoute(location.pathname) && wizardContext && wizardContext.isWizardActive) {
    const { 
      currentWizardStep, 
      totalWizardSteps, 
      isWizardSubmitting, 
      wizardError, 
      onWizardBack, 
      onWizardNext 
    } = wizardContext;

    contentBlockChildren = (
      <>
        {wizardError && !isWizardSubmitting && <p className={styles.errorMessageInline}>{wizardError}</p>}
        <div className={styles.buttonGroup}>
          {currentWizardStep > 0 && onWizardBack && (
            <Button
              onClick={onWizardBack}
              disabled={isWizardSubmitting}
              className={styles.actionSecondary}
            >
              Back
            </Button>
          )}
          {onWizardNext && (
            <Button
              onClick={onWizardNext}
              disabled={isWizardSubmitting}
              className={styles.actionPrimary}
            >
              {isWizardSubmitting ? 'Saving...' : (currentWizardStep < totalWizardSteps - 1 ? 'Next' : 'Finish & Create Character')}
            </Button>
          )}
        </div>
      </>
    );
  } else if (location.pathname === '/player-characters') {
    contentBlockChildren = (
      <div className={styles.buttonGroup}>
        <Button to="/create-player-character" className={styles.actionPrimary}>
          CREATE NEW CHARACTER
        </Button>
      </div>
    );
  } else if (location.pathname.startsWith('/campaigns/') && 
             params.campaignId && 
             !location.pathname.endsWith('/create-character') &&
             location.pathname !== '/campaigns' && 
             location.pathname !== '/create-campaign') {
    contentBlockChildren = (
      <textarea 
        placeholder="DM / AI Input will go here... (Future Feature)" 
        className={styles.footerTextarea}
      />
    );
  }

  if (!contentBlockChildren) {
    return null; 
  }

  return (
    <div className={styles.contentBlock}>
      {contentBlockChildren}
    </div>
  );
}

export default PageFooter;