import { describe, expect, it, vi } from 'vitest';
import {
  addLivePreviewSession,
  createLivePreviewPublisher,
  createLivePreviewSubscriber,
  getLivePreviewSession,
  type LivePreviewChannelFactory
} from './livePreview';

const mockChannel = () => {
  let listener: ((event: MessageEvent<unknown>) => void) | undefined;
  const channel = {
    addEventListener: vi.fn((_type: string, nextListener: typeof listener) => {
      listener = nextListener;
    }),
    close: vi.fn(),
    postMessage: vi.fn(),
    removeEventListener: vi.fn()
  };
  return {
    channel: channel as unknown as BroadcastChannel,
    dispatch: (data: unknown) => listener?.(new MessageEvent('message', { data }))
  };
};

describe('live preview URL', () => {
  it('adds a session before the snapshot hash', () => {
    expect(addLivePreviewSession('/view#pako:snapshot', 'session-1')).toBe(
      '/view?live=session-1#pako:snapshot'
    );
  });

  it('reads valid sessions and rejects malformed ones', () => {
    expect(getLivePreviewSession('?live=session-1')).toBe('session-1');
    expect(getLivePreviewSession('?live=not%20valid')).toBeUndefined();
    expect(getLivePreviewSession('')).toBeUndefined();
  });
});

describe('live preview channel', () => {
  it('publishes changes and replies with the latest state', () => {
    const mock = mockChannel();
    const factory = vi.fn(() => mock.channel) as LivePreviewChannelFactory;
    const publisher = createLivePreviewPublisher('initial', factory, 'session-1');

    expect(factory).toHaveBeenCalledWith('mermaid-live-preview:session-1');
    publisher?.publish('updated');
    expect(mock.channel.postMessage).toHaveBeenLastCalledWith({
      serialized: 'updated',
      type: 'state'
    });

    mock.dispatch({ type: 'request-state' });
    expect(mock.channel.postMessage).toHaveBeenLastCalledWith({
      serialized: 'updated',
      type: 'state'
    });

    publisher?.close();
    expect(mock.channel.close).toHaveBeenCalledOnce();
  });

  it('requests state on subscription and forwards state messages', () => {
    const mock = mockChannel();
    const receive = vi.fn();
    const subscriber = createLivePreviewSubscriber('session-2', receive, () => mock.channel);

    expect(mock.channel.postMessage).toHaveBeenCalledWith({ type: 'request-state' });
    mock.dispatch({ serialized: 'latest', type: 'state' });
    expect(receive).toHaveBeenCalledWith('latest');

    mock.dispatch({ serialized: 42, type: 'state' });
    expect(receive).toHaveBeenCalledOnce();
    subscriber?.close();
    expect(mock.channel.close).toHaveBeenCalledOnce();
  });
});
