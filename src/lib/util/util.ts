import { initURLSubscription, loadState, updateCodeStore } from './state';
import { plausible, initAnalytics } from './stats';
import { loadDataFromUrl } from './fileLoaders/loader';
import { initLoading } from './loading';
import { applyMigrations } from './migrations';

export const loadStateFromURL = (): void => {
  loadState(window.location.hash.slice(1));
};

export const syncDiagram = (): void => {
  updateCodeStore({
    updateDiagram: true
  });
};

export const initHandler = async (): Promise<void> => {
  applyMigrations();
  loadStateFromURL();
  await initLoading('Loading Gist...', loadDataFromUrl().catch(console.error));
  syncDiagram();
  initURLSubscription();
  await initAnalytics();
  plausible?.trackPageview({ url: window.location.origin + window.location.pathname });
};

export const isMac = navigator.platform.toUpperCase().includes('MAC');
export const cmdKey = isMac ? 'Cmd' : 'Ctrl';

let count = 0;
export const errorDebug = (limit = 100) => {
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
