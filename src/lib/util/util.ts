import { setLoaderEntries } from '$/components/History/historyState.svelte';
import { C } from '$/constants';
import type { State } from '$/types';
import { MCBaseURL } from './env';
import { ingestHash, ingestLocation, type IngestAdapters } from './fileLoaders/ingest';
import { initLoading } from './loading.svelte';
import { isOnMermaidAI } from './migration/domainMigration';
import { applyMigrations } from './migrations.svelte';
import { initURLSubscription, updateCodeStore, verifyState } from './state.svelte';
import { getAnalyticsSafeUrl, initAnalytics, plausible } from './stats';

export const getDomain = (url?: string): string => {
  if (!url) return '';
  const domain = new URL(url).hostname;
  return domain;
};

export const browserIngestAdapters: IngestAdapters = {
  confirm: (message) => window.confirm(message),
  // Wrapped: fetchText is declared further down this module.
  fetchText: (url) => fetchText(url)
};

const applyIncoming = (state: Partial<State> | undefined): void => {
  updateCodeStore({ ...state, updateDiagram: true });
};

/** Loads the diagram in the URL hash, e.g. after the user edits or pastes a new link. */
export const loadHashChange = (): void => {
  const state = ingestHash(window.location.hash.slice(1), browserIngestAdapters);
  if (state) {
    applyIncoming(state);
  }
};

export const initHandler = async (): Promise<void> => {
  applyMigrations();
  const { state, revisions } = await initLoading(
    'Loading Gist...',
    ingestLocation(window.location, browserIngestAdapters)
  );
  setLoaderEntries(revisions);
  applyIncoming(state);
  initURLSubscription();
  await initAnalytics();
  plausible?.trackPageview({
    url: getAnalyticsSafeUrl()
  });
  verifyState();
};

export const isMac = navigator.platform.toUpperCase().includes('MAC');
export const cmdKey = isMac ? 'Cmd' : 'Ctrl';
export { MCBaseURL };

const buildUtmParams = ({
  utmCampaign,
  utmMedium
}: {
  utmCampaign: string;
  utmMedium: string;
}): URLSearchParams =>
  new URLSearchParams({
    utm_campaign: utmCampaign,
    utm_medium: utmMedium,
    utm_source: getUTMSource()
  });

export const getCheckoutUrl = (utm: { utmCampaign: string; utmMedium: string }): string => {
  const params = buildUtmParams(utm);
  params.set('coupon', 'arDfyFT8');
  params.set('tier', 'plus');
  return `${MCBaseURL}/app/user/billing/checkout?${params.toString()}`;
};

export const getMermaidAiLiveUrl = (utm: { utmCampaign: string; utmMedium: string }): string => {
  return `${MCBaseURL}/live?${buildUtmParams(utm).toString()}`;
};

export const getContactSalesUrl = (): string => {
  const params = new URLSearchParams({
    contactSubject: 'contactSales',
    utm_campaign: 'contact_sales',
    utm_medium: 'button',
    utm_source: getUTMSource()
  });
  return `${MCBaseURL}/contact-us?${params.toString()}`;
};

let count = 0;
export const errorDebug = (limit = 1000) => {
  count += 1;
  if (count > limit) {
    console.log(count, limit);
    // eslint-disable-next-line no-debugger
    debugger;
  }
};

export const formatJSON = (data: unknown): string => JSON.stringify(data, undefined, 2);
export const fetchJSON = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  return res.json() as T;
};
export const fetchText = async (url: string): Promise<string> => {
  const res = await fetch(url);
  return res.text();
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    fallbackCopyToClipboard(text);
  }
};

function fallbackCopyToClipboard(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  // Make the textarea out of viewport
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.append(textArea);

  textArea.focus();
  textArea.select();

  try {
    // The deprecated but widely supported method
    document.execCommand('copy');
  } catch (error) {
    console.error('Failed to copy:', error);
    throw error;
  } finally {
    textArea.remove();
  }
}

export const getUTMSource = (): string => {
  if (typeof window !== 'undefined' && isOnMermaidAI()) {
    return C.aiLiveEditor;
  }
  return C.utmSource;
};
