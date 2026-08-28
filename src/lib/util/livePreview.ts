import { LIVE_PREVIEW_QUERY_PARAMETER } from '$/constants';
import { v4 as uuidV4 } from 'uuid';

const CHANNEL_PREFIX = 'mermaid-live-preview:';
const REQUEST_STATE = 'request-state';
const STATE = 'state';

type LivePreviewMessage =
  { type: typeof REQUEST_STATE } | { serialized: string; type: typeof STATE };

export type LivePreviewChannelFactory = (name: string) => BroadcastChannel | undefined;

export interface LivePreviewPublisher {
  close: () => void;
  publish: (serialized: string) => void;
  sessionId: string;
}

export interface LivePreviewSubscriber {
  close: () => void;
}

const createChannel: LivePreviewChannelFactory = (name) =>
  typeof BroadcastChannel === 'undefined' ? undefined : new BroadcastChannel(name);

const channelName = (sessionId: string): string => `${CHANNEL_PREFIX}${sessionId}`;

const isMessage = (value: unknown): value is LivePreviewMessage => {
  if (!value || typeof value !== 'object' || !('type' in value)) {
    return false;
  }
  if (value.type === REQUEST_STATE) {
    return true;
  }
  return value.type === STATE && 'serialized' in value && typeof value.serialized === 'string';
};

/** Add a private cross-tab session to an otherwise standalone snapshot URL. */
export const addLivePreviewSession = (href: string, sessionId: string): string => {
  const hashIndex = href.indexOf('#');
  const beforeHash = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : href.slice(hashIndex);
  const separator = beforeHash.includes('?') ? '&' : '?';
  return `${beforeHash}${separator}${LIVE_PREVIEW_QUERY_PARAMETER}=${encodeURIComponent(sessionId)}${hash}`;
};

export const getLivePreviewSession = (search: string): string | undefined => {
  const sessionId = new URLSearchParams(search).get(LIVE_PREVIEW_QUERY_PARAMETER);
  return sessionId && /^[\w-]{1,100}$/.test(sessionId) ? sessionId : undefined;
};

/** Publish editor state to every preview opened for this editor tab. */
export const createLivePreviewPublisher = (
  initialSerialized: string,
  channelFactory: LivePreviewChannelFactory = createChannel,
  sessionId = uuidV4()
): LivePreviewPublisher | undefined => {
  const channel = channelFactory(channelName(sessionId));
  if (!channel) {
    return undefined;
  }

  let serialized = initialSerialized;
  const sendState = () =>
    channel.postMessage({ serialized, type: STATE } satisfies LivePreviewMessage);
  const onMessage = (event: MessageEvent<unknown>) => {
    if (isMessage(event.data) && event.data.type === REQUEST_STATE) {
      sendState();
    }
  };
  channel.addEventListener('message', onMessage);

  return {
    close: () => {
      channel.removeEventListener('message', onMessage);
      channel.close();
    },
    publish: (nextSerialized) => {
      serialized = nextSerialized;
      sendState();
    },
    sessionId
  };
};

/** Subscribe a view tab and request the editor's latest state after connecting. */
export const createLivePreviewSubscriber = (
  sessionId: string,
  receive: (serialized: string) => void,
  channelFactory: LivePreviewChannelFactory = createChannel
): LivePreviewSubscriber | undefined => {
  const channel = channelFactory(channelName(sessionId));
  if (!channel) {
    return undefined;
  }

  const onMessage = (event: MessageEvent<unknown>) => {
    if (isMessage(event.data) && event.data.type === STATE) {
      receive(event.data.serialized);
    }
  };
  channel.addEventListener('message', onMessage);
  channel.postMessage({ type: REQUEST_STATE } satisfies LivePreviewMessage);

  return {
    close: () => {
      channel.removeEventListener('message', onMessage);
      channel.close();
    }
  };
};
