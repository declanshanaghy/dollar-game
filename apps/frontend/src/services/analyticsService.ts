import ReactGA from 'react-ga4';

// Analytics categories
export enum AnalyticsCategory {
  PAGE_VIEW = 'page_view',
  GAME_ACTION = 'game_action',
  EXTERNAL_LINK = 'external_link',
  THEME = 'theme',
}

// Initialize Google Analytics with the tracking ID
export const initializeGA = (trackingId: string = 'G-Y815G3KT82'): void => {
  ReactGA.initialize(trackingId);
  console.log('Google Analytics initialized with ID:', trackingId);
};

// Track page views
export const trackPageView = (path: string): void => {
  ReactGA.send({ hitType: 'pageview', page: path });
  console.log('Page view tracked:', path);
};

// Track events
export const trackEvent = (
  category: AnalyticsCategory,
  action: string,
  label?: string,
  value?: number
): void => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
  console.log('Event tracked:', { category, action, label, value });
};

// Track vertex actions
export const trackVertexAction = (vertexId: number, actionType: string): void => {
  trackEvent(
    AnalyticsCategory.GAME_ACTION,
    'vertex_action',
    `${actionType}_vertex_${vertexId}`
  );
};

// Track game reset
export const trackGameReset = (numVertices: number, edgeDensity: number, totalMoney: number): void => {
  trackEvent(
    AnalyticsCategory.GAME_ACTION,
    'game_reset',
    `vertices_${numVertices}_density_${edgeDensity}_money_${totalMoney}`
  );
};

// Track undo move
export const trackUndoMove = (): void => {
  trackEvent(
    AnalyticsCategory.GAME_ACTION,
    'undo_move'
  );
};

// Track game win
export const trackGameWin = (moves: number): void => {
  trackEvent(
    AnalyticsCategory.GAME_ACTION,
    'game_win',
    `moves_${moves}`,
    moves
  );
};

// Track external link clicks
export const trackExternalLinkClick = (url: string): void => {
  trackEvent(
    AnalyticsCategory.EXTERNAL_LINK,
    'click',
    url
  );
};

// Track theme toggle
export const trackThemeToggle = (theme: string): void => {
  trackEvent(
    AnalyticsCategory.THEME,
    'toggle',
    theme
  );
};