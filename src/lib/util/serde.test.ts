import { describe, expect, it } from 'vitest';
import { serializeState, deserializeState, type SerdeType } from './serde';
import { defaultState } from './state.svelte';
import type { State } from '#lib/types.js';

const verifySerde = (state: State, serde?: SerdeType): string => {
  const serialized = serializeState(state, serde);
  const deserialized = deserializeState(serialized);
  expect(deserialized).to.deep.equal(state);
  return serialized;
};

describe('Serde tests', () => {
  it('should serialize and deserialize with default serde', () => {
    expect(verifySerde(defaultState)).toMatchInlineSnapshot(
      `"pako:eNpVy8FqwkAQxvFXGeZUIXmBHAqatF6EevBk9DAkk-yiu7NMNohk8-4StdAeP_6_b8JGWsYCu6vcGkMa4VCdPADAui6N2iE6Gs6Q559pyxGceL4n2HxsBQYjIVjfr15-syAop93CGKKx_jK_Uvn8_3hOUNU7ClHC-W853CTBV233Rjz_L0aZE3zXHRUd5Q0plKRPghn2alssoo6coWN1tEycZswwkD-KuN-qMvYGi46uA2c4hpYiV5Z6pTeZHxYoVgU"`
    );
  });

  it('should serialize and deserialize with base64 serde', () => {
    expect(verifySerde(defaultState, 'base64')).toMatchInlineSnapshot(
      `"base64:eyJjb2RlIjoiZmxvd2NoYXJ0IFREXG4gICAgQVtDaHJpc3RtYXNdIC0tPnxHZXQgbW9uZXl8IEIoR28gc2hvcHBpbmcpXG4gICAgQiAtLT4gQ3tMZXQgbWUgdGhpbmt9XG4gICAgQyAtLT58T25lfCBEW0xhcHRvcF1cbiAgICBDIC0tPnxUd298IEVbaVBob25lXVxuICAgIEMgLS0-fFRocmVlfCBGW2ZhOmZhLWNhciBDYXJdXG4gICIsImdyaWQiOnRydWUsIm1lcm1haWQiOiJ7fSIsInBhblpvb20iOnRydWUsInJvdWdoIjpmYWxzZSwidXBkYXRlRGlhZ3JhbSI6dHJ1ZX0"`
    );
  });

  it('should serialize and deserialize with pako serde', () => {
    expect(verifySerde(defaultState, 'pako')).toMatchInlineSnapshot(
      `"pako:eNpVy8FqwkAQxvFXGeZUIXmBHAqatF6EevBk9DAkk-yiu7NMNohk8-4StdAeP_6_b8JGWsYCu6vcGkMa4VCdPADAui6N2iE6Gs6Q559pyxGceL4n2HxsBQYjIVjfr15-syAop93CGKKx_jK_Uvn8_3hOUNU7ClHC-W853CTBV233Rjz_L0aZE3zXHRUd5Q0plKRPghn2alssoo6coWN1tEycZswwkD-KuN-qMvYGi46uA2c4hpYiV5Z6pTeZHxYoVgU"`
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
