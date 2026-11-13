import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addLivePreviewSession,
  createLivePreviewPublisher,
  createLivePreviewSubscriber,
  getLivePreviewSession
} from './livePreview';

const sessionId = '123e4567-e89b-42d3-a456-426614174000';

class MockBroadcastChannel extends EventTarget {
  static instances: MockBroadcastChannel[] = [];

  close = vi.fn();
  postMessage = vi.fn();

  constructor(readonly name: string) {
    super();
    MockBroadcastChannel.instances.push(this);
  }

  dispatch(data: unknown) {
    this.dispatchEvent(new MessageEvent('message', { data }));
  }
}

const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(resolve));

beforeEach(() => {
  MockBroadcastChannel.instances = [];
  window.sessionStorage.clear();
  vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
});

afterEach(() => vi.unstubAllGlobals());

describe('live preview URL', () => {
  it('adds a session before the snapshot hash', () => {
    expect(addLivePreviewSession('/view#pako:snapshot', sessionId)).toBe(
      `/view?live=${sessionId}#pako:snapshot`
    );
  });

  it('uses URL semantics when the snapshot URL already has a query', () => {
    expect(addLivePreviewSession('/view?theme=dark#pako:snapshot', sessionId)).toBe(
      `/view?theme=dark&live=${sessionId}#pako:snapshot`
    );
  });

  it('reads UUID sessions and rejects malformed ones', () => {
    expect(getLivePreviewSession(`?live=${sessionId}`)).toBe(sessionId);
    expect(getLivePreviewSession('?live=session-1')).toBeUndefined();
    expect(getLivePreviewSession('')).toBeUndefined();
  });
});

describe('live preview channel', () => {
  it('coalesces synchronous changes and replies with the latest state', async () => {
    const publisher = createLivePreviewPublisher();
    const channel = MockBroadcastChannel.instances[0];

    expect(channel.name).toMatch(/^mermaid-live-preview:[\da-f-]{36}$/);
    publisher?.publish('initial');
    publisher?.publish('updated');
    expect(channel.postMessage).not.toHaveBeenCalled();

    await flushMicrotasks();
    expect(channel.postMessage).toHaveBeenCalledOnce();
    expect(channel.postMessage).toHaveBeenLastCalledWith({
      serialized: 'updated',
      type: 'state',
      viewport: undefined
    });

    publisher?.publish('updated');
    await flushMicrotasks();
    expect(channel.postMessage).toHaveBeenCalledOnce();

    channel.dispatch({ type: 'request-state' });
    expect(channel.postMessage).toHaveBeenCalledTimes(2);
    expect(channel.postMessage).toHaveBeenLastCalledWith({
      serialized: 'updated',
      type: 'state',
      viewport: undefined
    });

    publisher?.close();
    expect(channel.close).toHaveBeenCalledOnce();
  });

  it('publishes a changed normalized viewport with otherwise unchanged state', async () => {
    const publisher = createLivePreviewPublisher();
    const channel = MockBroadcastChannel.instances[0];
    publisher?.publish('same', { center: { x: 10, y: 20 }, zoom: 2 });
    await flushMicrotasks();

    publisher?.publish('same', { center: { x: 15, y: 20 }, zoom: 2 });
    await flushMicrotasks();

    expect(channel.postMessage).toHaveBeenCalledTimes(2);
    expect(channel.postMessage).toHaveBeenLastCalledWith({
      serialized: 'same',
      type: 'state',
      viewport: { center: { x: 15, y: 20 }, zoom: 2 }
    });
  });

  it('drops a queued send when closed first', async () => {
    const publisher = createLivePreviewPublisher();
    const channel = MockBroadcastChannel.instances[0];
    publisher?.publish('pending');
    publisher?.close();
    await flushMicrotasks();

    expect(channel.postMessage).not.toHaveBeenCalled();
  });

  it('keeps the session across publisher recreation in the same tab', () => {
    const first = createLivePreviewPublisher();
    first?.close();
    const second = createLivePreviewPublisher();

    expect(second?.sessionId).toBe(first?.sessionId);
  });

  it('requests state on subscription and forwards valid state messages', () => {
    const receive = vi.fn();
    const subscriber = createLivePreviewSubscriber(sessionId, receive);
    const channel = MockBroadcastChannel.instances[0];

    expect(channel.name).toBe(`mermaid-live-preview:${sessionId}`);
    expect(channel.postMessage).toHaveBeenCalledWith({ type: 'request-state' });
    channel.dispatch({
      serialized: 'latest',
      type: 'state',
      viewport: { center: { x: 5, y: 6 }, zoom: 1.5 }
    });
    expect(receive).toHaveBeenCalledWith('latest', {
      center: { x: 5, y: 6 },
      zoom: 1.5
    });

    channel.dispatch({ serialized: 42, type: 'state' });
    expect(receive).toHaveBeenCalledOnce();
    subscriber?.close();
    expect(channel.close).toHaveBeenCalledOnce();
  });
});
