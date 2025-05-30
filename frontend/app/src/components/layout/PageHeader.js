import React from 'react';
import { useLocation } from 'react-router-dom';
import { useCharacterWizard } from '../../contexts/CharacterWizardContext';
import styles from './PageHeader.module.css'; 
import { isWizardRoute } from '../../utils/routeUtils';

function PageHeader() {
  const wizardContext = useCharacterWizard();
  const location = useLocation();

  const shouldDisplayWizardNav = wizardContext && wizardContext.isWizardActive && isWizardRoute(location.pathname);

  return (
    <div className={styles.contentBlock}>
      {shouldDisplayWizardNav && wizardContext.wizardSteps && wizardContext.wizardSteps.length > 0 ? (
        wizardContext.wizardSteps.map((step, index) => (
          <div
            key={step.id || step.name} 
            className={`${styles.navStep} ${wizardContext.currentWizardStep === index ? styles.active : ''} ${!wizardContext.visitedSteps?.[index] ? styles.disabled : ''}`}
            onClick={() => {
              if (wizardContext.visitedSteps?.[index] && typeof wizardContext.onWizardNavStepClick === 'function') {
                wizardContext.onWizardNavStepClick(index);
              }
            }}
            role="button"
            tabIndex={wizardContext.visitedSteps?.[index] ? 0 : -1}
            onKeyDown={(e) => { 
              if ((e.key === 'Enter' || e.key === ' ') && wizardContext.visitedSteps?.[index] && typeof wizardContext.onWizardNavStepClick === 'function') {
                e.preventDefault(); 
                wizardContext.onWizardNavStepClick(index);
              }
            }}
          >
            {step.name}
          </div>
        ))
      ) : (
        null 
      )}
    </div>
  );
}

export default PageHeader;