import { describe, expect, it } from 'vitest';
import { serializeState, deserializeState, type SerdeType } from './serde';
import { defaultState } from './state';
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
      `"pako:eNpVjEFug0AMRa9iedVI4QIsKiXQZhOpXWRVyMICw4zKjEdmUFQBd--QtFLrlb_e-3_GRlrGHLtBbo0hjXApaw_pDlVh1I7R0XiFLHteThzBieevBY5PJ4HRSAjW97uHf9wkKObzpjFEY_3n-kDFvf_meYGyOlOIEq5_yeUmC7xU9t2k-f_EKKfWa9VR3lHWkEJBeldwj73aFvOoE-_RsTraIs4brTEadlxjnt6WO5qGWGPt11QL5D9E3G9TZeoNpvlhTGkKLUUuLfVKP8r6DdATXyM"`
    );
  });

  it('should serialize and deserialize with base64 serde', () => {
    expect(verifySerde(defaultState, 'base64')).toMatchInlineSnapshot(
      `"base64:eyJjb2RlIjoiZmxvd2NoYXJ0IFREXG4gICAgQVtDaHJpc3RtYXNdIC0tPnxHZXQgbW9uZXl8IEIoR28gc2hvcHBpbmcpXG4gICAgQiAtLT4gQ3tMZXQgbWUgdGhpbmt9XG4gICAgQyAtLT58T25lfCBEW0xhcHRvcF1cbiAgICBDIC0tPnxUd298IEVbaVBob25lXVxuICAgIEMgLS0-fFRocmVlfCBGW2ZhOmZhLWNhciBDYXJdXG4gICIsImdyaWQiOnRydWUsIm1lcm1haWQiOiJ7XG4gIFwidGhlbWVcIjogXCJkZWZhdWx0XCJcbn0iLCJwYW5ab29tIjp0cnVlLCJyb3VnaCI6ZmFsc2UsInVwZGF0ZURpYWdyYW0iOnRydWV9"`
    );
  });

  it('should serialize and deserialize with pako serde', () => {
    expect(verifySerde(defaultState, 'pako')).toMatchInlineSnapshot(
      `"pako:eNpVjEFug0AMRa9iedVI4QIsKiXQZhOpXWRVyMICw4zKjEdmUFQBd--QtFLrlb_e-3_GRlrGHLtBbo0hjXApaw_pDlVh1I7R0XiFLHteThzBieevBY5PJ4HRSAjW97uHf9wkKObzpjFEY_3n-kDFvf_meYGyOlOIEq5_yeUmC7xU9t2k-f_EKKfWa9VR3lHWkEJBeldwj73aFvOoE-_RsTraIs4brTEadlxjnt6WO5qGWGPt11QL5D9E3G9TZeoNpvlhTGkKLUUuLfVKP8r6DdATXyM"`
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
