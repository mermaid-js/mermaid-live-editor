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
      `"pako:eNpVjs1qw0AMhF9F6NRC_AI-FBq7zSXQQnPz5iBs2bvE-8NaSwi2373r-NLqJM18M2jG1neMJfajv7eaosClVg7yvDeVjmYSS9MViuJtObGA9Y4fCxxfTh4m7UMwbnjd-eMGQTWfN4xBtHG3dbeqZ_7L8QJ1c6YgPlz_Ope7X-CjMd861_93dOSc-mx6KnsqWopQUXwieEDL0ZLp8vvzpigUzZYVlnntuKc0ikLl1oxSEv_zcC2WEhMfMPo0aMyd45SvFDoSrg0NkeyOrL_WfFuF"`
    );
  });

  it('should serialize and deserialize with base64 serde', () => {
    expect(verifySerde(defaultState, 'base64')).toMatchInlineSnapshot(
      `"base64:eyJjb2RlIjoiZmxvd2NoYXJ0IFREXG4gICAgQVtDaHJpc3RtYXNdIC0tPnxHZXQgbW9uZXl8IEIoR28gc2hvcHBpbmcpXG4gICAgQiAtLT4gQ3tMZXQgbWUgdGhpbmt9XG4gICAgQyAtLT58T25lfCBEW0xhcHRvcF1cbiAgICBDIC0tPnxUd298IEVbaVBob25lXVxuICAgIEMgLS0-fFRocmVlfCBGW2ZhOmZhLWNhciBDYXJdXG4gICIsIm1lcm1haWQiOiJ7XG4gIFwidGhlbWVcIjogXCJkZWZhdWx0XCJcbn0iLCJhdXRvU3luYyI6dHJ1ZSwicm91Z2giOmZhbHNlLCJ1cGRhdGVEaWFncmFtIjp0cnVlfQ"`
    );
  });

  it('should serialize and deserialize with pako serde', () => {
    expect(verifySerde(defaultState, 'pako')).toMatchInlineSnapshot(
      `"pako:eNpVjs1qw0AMhF9F6NRC_AI-FBq7zSXQQnPz5iBs2bvE-8NaSwi2373r-NLqJM18M2jG1neMJfajv7eaosClVg7yvDeVjmYSS9MViuJtObGA9Y4fCxxfTh4m7UMwbnjd-eMGQTWfN4xBtHG3dbeqZ_7L8QJ1c6YgPlz_Ope7X-CjMd861_93dOSc-mx6KnsqWopQUXwieEDL0ZLp8vvzpigUzZYVlnntuKc0ikLl1oxSEv_zcC2WEhMfMPo0aMyd45SvFDoSrg0NkeyOrL_WfFuF"`
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
