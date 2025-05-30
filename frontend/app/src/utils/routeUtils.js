export const WIZARD_ROUTE_PATTERNS = [
  '/create-player-character', 
  '/campaigns/:campaignId/create-character'
];

export const isWizardRoute = (pathname) => {
  return WIZARD_ROUTE_PATTERNS.some(pattern => {
    if (pattern.includes('/:campaignId')) {
      const base = pattern.split('/:campaignId')[0];
      const regex = new RegExp(`^${base}/[^/]+/create-character$`);
      return regex.test(pathname);
    }
    return pathname === pattern;
  });
};