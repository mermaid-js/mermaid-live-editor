import { logEvent } from '$/util/stats';

// Constants for the domain migration
const mermaidLiveDomain = 'mermaid.live';
const mermaidAiDomain = 'mermaid.ai';
const bypassCookieName = 'mermaid-stay';
const welcomeBannerStorageKey = 'mermaid-welcome-banner-dismissed';
const welcomeBannerVisitCountKey = 'mermaid-welcome-banner-visits';
const redirectReferrerKey = 'mermaid-redirect-from';

/**
 * Check if the current URL has pako data (diagram content).
 * Pako data is in the hash fragment as #pako:... or as a legacy format.
 */
const hasPakoData = (): boolean => {
  const hash = window.location.hash;
  return (
    hash.includes('pako:') || hash.includes('base64:') || (hash.length > 10 && hash.startsWith('#'))
  );
};

/**
 * Get the current domain
 */
const getCurrentDomain = (): string => {
  return window.location.hostname;
};

/**
 * Check if we're on mermaid.live
 */
const isOnMermaidLive = (): boolean => {
  return (
    getCurrentDomain() === mermaidLiveDomain || getCurrentDomain().endsWith(`.${mermaidLiveDomain}`)
  );
};

/**
 * Check if we're on mermaid.ai
 */
export const isOnMermaidAI = (): boolean => {
  const domain = getCurrentDomain();
  return domain === mermaidAiDomain || domain.endsWith(`.${mermaidAiDomain}`);
};

/**
 * Get a cookie value by name
 */
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

/**
 * Set a cookie
 */
const setCookie = (name: string, value: string, days: number): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

/**
 * Check if the bypass cookie is set (user opted to stay on mermaid.live)
 */
const hasBypassCookie = (): boolean => {
  return getCookie(bypassCookieName) === '1';
};

/**
 * Set the bypass cookie (user opted to stay on mermaid.live)
 * Cookie is permanent (100 years) so user doesn't have to opt out repeatedly
 */
const setBypassCookie = (): void => {
  setCookie(bypassCookieName, '1', 36500); // ~100 years
};

/**
 * Redirect to mermaid.live with ?stay=1 to trigger bypass cookie on that domain.
 * Used by escape hatch buttons in WelcomeBanner and WhyWeMovedModal.
 */
export const redirectToMermaidLive = (): void => {
  logEvent('bannerEscapeClicked');
  window.location.href = `https://${mermaidLiveDomain}/edit?stay=1`;
};

/**
 * Check if the URL has the ?stay=1 parameter (used for escape hatch)
 */
const hasStayParam = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  return params.has('stay');
};

/**
 * Handle the ?stay=1 parameter: set bypass cookie and redirect to clean URL
 */
export const handleStayParam = (): boolean => {
  if (hasStayParam()) {
    logEvent('stayOnMermaidLive');
    setBypassCookie();
    // Remove the ?stay=1 param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('stay');
    window.history.replaceState({}, '', url.pathname + url.hash);
    return true;
  }
  return false;
};

/**
 * Get welcome banner visit count from localStorage
 */
const getWelcomeBannerVisitCount = (): number => {
  const count = window.localStorage.getItem(welcomeBannerVisitCountKey);
  return count ? parseInt(count, 10) : 0;
};

/**
 * Increment welcome banner visit count
 */
export const incrementWelcomeBannerVisitCount = (): number => {
  const count = getWelcomeBannerVisitCount() + 1;
  window.localStorage.setItem(welcomeBannerVisitCountKey, count.toString());
  return count;
};

/**
 * Check if welcome banner should be shown (shown for first 3 visits, then auto-hide)
 */
export const shouldShowWelcomeBanner = (): boolean => {
  // Only show on mermaid.ai
  if (!isOnMermaidAI()) return false;
  // Check if banner was manually dismissed permanently
  if (window.localStorage.getItem(welcomeBannerStorageKey) === 'true') return false;
  // Check if redirect referrer was from mermaid.live
  if (window.sessionStorage.getItem(redirectReferrerKey) !== 'mermaid.live') return false;
  // Show for first 3 visits
  return getWelcomeBannerVisitCount() < 3;
};

/**
 * Mark redirect origin (call this when redirecting from mermaid.live)
 */
const setRedirectReferrer = (): void => {
  window.sessionStorage.setItem(redirectReferrerKey, 'mermaid.live');
};

/**
 * Dismiss the welcome banner permanently
 */
export const dismissWelcomeBanner = (): void => {
  window.localStorage.setItem(welcomeBannerStorageKey, 'true');
};

// localStorage keys used by the app for user data
const userDataStorageKeys = [
  'codeStore', // Current diagram code/state
  'manualHistoryStore', // Manual history entries
  'autoHistoryStore' // Auto history entries
];

/**
 * Check if user has any stored data in localStorage.
 * This includes saved diagrams, history entries, etc.
 */
const hasStoredUserData = (): boolean => {
  for (const key of userDataStorageKeys) {
    const value = window.localStorage.getItem(key);
    if (value && value !== '[]' && value !== 'null' && value !== '{}') {
      return true;
    }
  }
  return false;
};

/**
 * Check and perform domain migration redirect if needed.
 * This should be called early in the app lifecycle.
 *
 * Redirect logic:
 * - If on mermaid.live with no pako data in URL, no bypass cookie, and no stored data → redirect to mermaid.ai/live
 * - If URL has pako data → stay (user followed a shared link)
 * - If bypass cookie is set → stay (user opted out of redirect)
 * - If user has stored data in localStorage → stay (user has history/diagrams saved locally)
 *
 * @returns true if a redirect was triggered, false otherwise
 */
export const checkAndRedirectIfNeeded = (): boolean => {
  // Only redirect from mermaid.live
  if (!isOnMermaidLive()) return false;

  // Don't redirect if user has bypass cookie
  if (hasBypassCookie()) return false;

  // Don't redirect if URL has pako data (shared link)
  if (hasPakoData()) return false;

  // Don't redirect if user has stored data in localStorage (history, saved diagrams, etc.)
  if (hasStoredUserData()) return false;

  // Perform the redirect to mermaid.ai/live
  // Set a sessionStorage flag so we know this user came from mermaid.live
  // (sessionStorage doesn't transfer cross-domain, so we'll use a query param instead)
  const currentPath = window.location.pathname;
  const targetPath = currentPath.replace(/^\/?/, '/live/');
  const redirectUrl = `https://${mermaidAiDomain}${targetPath}?from=mermaid.live`;

  window.location.href = redirectUrl;
  return true;
};

/**
 * Handle incoming redirect from mermaid.live to mermaid.ai.
 * Checks for the ?from=mermaid.live param and sets session storage.
 */
export const handleIncomingRedirect = (): void => {
  // Only on mermaid.ai
  if (!isOnMermaidAI()) return;

  const params = new URLSearchParams(window.location.search);
  if (params.get('from') === 'mermaid.live') {
    // Mark that this session originated from a redirect
    setRedirectReferrer();

    // Clean up the URL
    params.delete('from');
    const cleanSearch = params.toString();
    const newUrl =
      window.location.pathname + (cleanSearch ? `?${cleanSearch}` : '') + window.location.hash;
    window.history.replaceState({}, '', newUrl);
  }
};
