import debounce from 'lodash-es/debounce';
import { get } from 'svelte/store';
import { stateStore } from './state';

let shouldSync = true;
let updater: () => void;
const renderDelay = 1000;
const slowRenderThreshold = 250;

const debouncedRender = debounce(() => {
  shouldSync = true;
  updater();
}, renderDelay);

export const recordRenderTime = (renderTimeMs: number, updaterFunction: () => void): void => {
  const { autoSync } = get(stateStore);
  if (!autoSync) {
    return;
  }
  updater = updaterFunction;
  const isSlow = renderTimeMs > slowRenderThreshold;
  if (!shouldSync) {
    debouncedRender();
  }
  shouldSync = !isSlow;
};

export const shouldRefreshView = (): boolean => {
  if (!shouldSync) {
    debouncedRender();
  }
  return shouldSync;
};
