import ReactGA from 'react-ga4';

// Get Measurement ID from environment variable or fallback to hardcoded value
// (Hardcoded value matches index.html for consistency)
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-1Z3KG290SG';

let isInitialized = false;

export function initializeGA4(): void {
  // Check if gtag is already loaded (from index.html)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // gtag.js already loaded from index.html, just verify ReactGA can use it
    if (!GA4_MEASUREMENT_ID || GA4_MEASUREMENT_ID.trim() === '') {
      console.warn('[GA4] Measurement ID not provided. Google Analytics will not be enabled.');
      return;
    }

    try {
      // ReactGA.initialize will use existing gtag if available
      ReactGA.initialize(GA4_MEASUREMENT_ID, {
        testMode: import.meta.env.DEV, // Disable in development
      });
      isInitialized = true;
      console.log('[GA4] ✅ Google Analytics initialized successfully (using gtag from index.html)');
    } catch (error) {
      console.error('[GA4] ❌ Failed to initialize Google Analytics:', error);
    }
  } else {
    // Fallback: gtag not loaded, try to initialize anyway (may not work in production)
    if (!GA4_MEASUREMENT_ID || GA4_MEASUREMENT_ID.trim() === '') {
      console.warn('[GA4] Measurement ID not provided. Google Analytics will not be enabled.');
      return;
    }

    console.warn('[GA4] ⚠️ gtag.js not found. Make sure GA script is loaded in index.html');
    
    try {
      ReactGA.initialize(GA4_MEASUREMENT_ID, {
        testMode: import.meta.env.DEV,
      });
      isInitialized = true;
      console.log('[GA4] ✅ Google Analytics initialized (may not work without gtag.js)');
    } catch (error) {
      console.error('[GA4] ❌ Failed to initialize Google Analytics:', error);
    }
  }
}

export function trackPageView(path: string): void {
  if (!isInitialized) return;
  
  try {
    ReactGA.send({ hitType: 'pageview', page: path });
  } catch (error) {
    console.error('[GA4] Error tracking page view:', error);
  }
}

export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  if (!isInitialized) return;
  
  try {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  } catch (error) {
    console.error('[GA4] Error tracking event:', error);
  }
}

export function trackLogin(method: string = 'MindX ID'): void {
  trackEvent('login', 'Authentication', method);
}

export function trackLogout(): void {
  trackEvent('logout', 'Authentication');
}

export function trackTodoCreated(todoId: string): void {
  trackEvent('todo_created', 'Todo', todoId);
}

export function trackTodoUpdated(todoId: string, completed: boolean): void {
  trackEvent('todo_updated', 'Todo', todoId, completed ? 1 : 0);
}

export function trackTodoDeleted(todoId: string): void {
  trackEvent('todo_deleted', 'Todo', todoId);
}

export { ReactGA };

