import { describe, expect, it } from 'vitest';
import { serializeState, deserializeState, type SerdeType } from './serde';
import { defaultState } from './state.svelte';
import type { State } from '$lib/types';

const verifySerde = (state: State, serde?: SerdeType): string => {
  const serialized = serializeState(state, serde);
  const deserialized = deserializeState(serialized);
  expect(deserialized).to.deep.equal(state);
  return serialized;
};

describe('Serde tests', () => {
  it('should serialize and deserialize with default serde', () => {
    expect(verifySerde(defaultState)).toMatchInlineSnapshot(
      `"pako:eNpVjLFuwkAQRH9ltVUi4R9wgQR2QoMEBVUcipW99p3gbk_rs1Bk-985A5GS6UbvzYxYS8OYY3uVW21II5zKbw8pm6owavvoqD9Dlq2nHUdw4vlngu3bTqA3EoL13fvT3y4SFON-0Riisf4yP1Hx2B88T1BWewpRwvkvOd1kgo_KHk26_0-Mclp9Vi3lLWU1KRSkDwVX2KltMI868Aodq6Ol4jgnFMh_ibhfqjJ0BtPFtU9tCA1FLi11Si9lvgMWKFYF"`
    );
  });

  it('should serialize and deserialize with base64 serde', () => {
    expect(verifySerde(defaultState, 'base64')).toMatchInlineSnapshot(
      `"base64:eyJjb2RlIjoiZmxvd2NoYXJ0IFREXG4gICAgQVtDaHJpc3RtYXNdIC0tPnxHZXQgbW9uZXl8IEIoR28gc2hvcHBpbmcpXG4gICAgQiAtLT4gQ3tMZXQgbWUgdGhpbmt9XG4gICAgQyAtLT58T25lfCBEW0xhcHRvcF1cbiAgICBDIC0tPnxUd298IEVbaVBob25lXVxuICAgIEMgLS0-fFRocmVlfCBGW2ZhOmZhLWNhciBDYXJdXG4gICIsImdyaWQiOnRydWUsIm1lcm1haWQiOiJ7fSIsInBhblpvb20iOnRydWUsInJvdWdoIjpmYWxzZSwidXBkYXRlRGlhZ3JhbSI6dHJ1ZX0"`
    );
  });

  it('should serialize and deserialize with pako serde', () => {
    expect(verifySerde(defaultState, 'pako')).toMatchInlineSnapshot(
      `"pako:eNpVjLFuwkAQRH9ltVUi4R9wgQR2QoMEBVUcipW99p3gbk_rs1Bk-985A5GS6UbvzYxYS8OYY3uVW21II5zKbw8pm6owavvoqD9Dlq2nHUdw4vlngu3bTqA3EoL13fvT3y4SFON-0Riisf4yP1Hx2B88T1BWewpRwvkvOd1kgo_KHk26_0-Mclp9Vi3lLWU1KRSkDwVX2KltMI868Aodq6Ol4jgnFMh_ibhfqjJ0BtPFtU9tCA1FLi11Si9lvgMWKFYF"`
    );
  });

  it('should throw error for unrecognized serde', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(() => serializeState(defaultState, 'unknown')).toThrowError(
      'Unknown serde type: unknown'
    );
    expect(() => deserializeState('unknown:hello')).toThrowError('Unknown serde type: unknown');
  });
});
