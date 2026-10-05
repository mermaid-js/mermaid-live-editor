import { C } from '$/constants';
import type { NormalizedViewport } from './panZoom';
import { validate as uuidValidate, v4 as uuidV4 } from 'uuid';

const channelPrefix = 'mermaid-live-preview:';
const requestState = 'request-state';
const state = 'state';

type LivePreviewMessage =
  | { type: typeof requestState }
  | {
      serialized: string;
      type: typeof state;
      viewport?: NormalizedViewport;
    };

export interface LivePreviewPublisher {
  close: () => void;
  publish: (serialized: string, viewport?: NormalizedViewport) => void;
  sessionId: string;
}

interface LivePreviewSubscriber {
  close: () => void;
}

const channelName = (sessionId: string): string => `${channelPrefix}${sessionId}`;

const isNormalizedViewport = (value: unknown): value is NormalizedViewport =>
  !!value &&
  typeof value === 'object' &&
  'center' in value &&
  !!value.center &&
  typeof value.center === 'object' &&
  'x' in value.center &&
  typeof value.center.x === 'number' &&
  Number.isFinite(value.center.x) &&
  'y' in value.center &&
  typeof value.center.y === 'number' &&
  Number.isFinite(value.center.y) &&
  'zoom' in value &&
  typeof value.zoom === 'number' &&
  Number.isFinite(value.zoom);

const isMessage = (value: unknown): value is LivePreviewMessage => {
  if (!value || typeof value !== 'object' || !('type' in value)) {
    return false;
  }
  if (value.type === requestState) {
    return true;
  }
  return (
    value.type === state &&
    'serialized' in value &&
    typeof value.serialized === 'string' &&
    (!('viewport' in value) || value.viewport === undefined || isNormalizedViewport(value.viewport))
  );
};

const getOrCreateSessionId = (): string => {
  try {
    const stored = window.sessionStorage.getItem(C.livePreviewSessionKey);
    if (stored && uuidValidate(stored)) {
      return stored;
    }
    const sessionId = uuidV4();
    window.sessionStorage.setItem(C.livePreviewSessionKey, sessionId);
    return sessionId;
  } catch {
    return uuidV4();
  }
};

const sameViewport = (
  first: NormalizedViewport | undefined,
  second: NormalizedViewport | undefined
): boolean =>
  first === second ||
  (first !== undefined &&
    second !== undefined &&
    first.zoom === second.zoom &&
    first.center.x === second.center.x &&
    first.center.y === second.center.y);

/** Add a private cross-tab session to an otherwise standalone snapshot URL. */
export const addLivePreviewSession = (href: string, sessionId: string): string => {
  const url = new URL(href, window.location.origin);
  url.searchParams.set(C.livePreviewParam, sessionId);
  return `${url.pathname}${url.search}${url.hash}`;
};

export const getLivePreviewSession = (search: string): string | undefined => {
  const sessionId = new URLSearchParams(search).get(C.livePreviewParam);
  return sessionId && uuidValidate(sessionId) ? sessionId : undefined;
};

/** Publish editor state to every preview opened for this editor tab. */
export const createLivePreviewPublisher = (): LivePreviewPublisher | undefined => {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }

  const sessionId = getOrCreateSessionId();
  const channel = new BroadcastChannel(channelName(sessionId));
  let latest: Extract<LivePreviewMessage, { type: typeof state }> | undefined;
  let animationFrame: number | undefined;

  const sendState = () => {
    animationFrame = undefined;
    if (latest) {
      channel.postMessage(latest);
    }
  };
  const flushState = () => {
    if (animationFrame !== undefined) {
      cancelAnimationFrame(animationFrame);
    }
    sendState();
  };
  const onMessage = (event: MessageEvent<unknown>) => {
    if (isMessage(event.data) && event.data.type === requestState) {
      flushState();
    }
  };
  channel.addEventListener('message', onMessage);

  return {
    close: () => {
      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
      }
      channel.removeEventListener('message', onMessage);
      channel.close();
    },
    publish: (serialized, viewport) => {
      if (latest?.serialized === serialized && sameViewport(latest.viewport, viewport)) {
        return;
      }
      latest = { serialized, type: state, viewport };
      animationFrame ??= requestAnimationFrame(sendState);
    },
    sessionId
  };
};

/** Subscribe a view tab and request the editor's latest state after connecting. */
export const createLivePreviewSubscriber = (
  sessionId: string,
  receive: (serialized: string, viewport?: NormalizedViewport) => void
): LivePreviewSubscriber | undefined => {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }

  const channel = new BroadcastChannel(channelName(sessionId));
  const onMessage = (event: MessageEvent<unknown>) => {
    if (isMessage(event.data) && event.data.type === state) {
      receive(event.data.serialized, event.data.viewport);
    }
  };
  channel.addEventListener('message', onMessage);
  channel.postMessage({ type: requestState } satisfies LivePreviewMessage);

  return {
    close: () => {
      channel.removeEventListener('message', onMessage);
      channel.close();
    }
  };
};
