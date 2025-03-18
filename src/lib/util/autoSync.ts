import debounce from 'lodash-es/debounce';

let shouldSync = true;
let updater: () => void;
let renderPromise: Promise<void> | undefined;
let resolveRenderPromise: (() => void) | undefined;
const renderDelay = 1000;
const slowRenderThreshold = 150;

const debouncedRender = debounce(() => {
  shouldSync = true;
  updater();
}, renderDelay);

export const recordRenderTime = (renderTimeMs: number, updaterFunction: () => void): void => {
  resolveRenderPromise?.();
  updater = updaterFunction;
  const isSlow = renderTimeMs > slowRenderThreshold;
  if (!shouldSync) {
    debouncedRender();
  }
  shouldSync = !isSlow;
};

export const shouldRefreshView = (): boolean => {
  if (!renderPromise) {
    renderPromise = new Promise((resolve) => {
      resolveRenderPromise = () => {
        renderPromise = undefined;
        resolve();
      };
    });
  }

  if (!shouldSync) {
    debouncedRender();
  }
  return shouldSync;
};

export const waitForRender = (): Promise<void> => {
  return renderPromise ?? Promise.resolve();
};
