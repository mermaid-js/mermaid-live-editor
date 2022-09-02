import { describe, expect, it } from 'vitest';
import { serializeState, deserializeState, type SerdeType } from './serde';
import { defaultState } from './state';
import type { State } from '$lib/types';

describe('Serde tests', () => {
	const verifySerde = (state: State, serde?: SerdeType): string => {
		const serialized = serializeState(state, serde);
		const deserialized = deserializeState(serialized);
		expect(deserialized).to.deep.equal(state);
		return serialized;
	};

	it('should serialize and deserialize with default serde', () => {
		expect(verifySerde(defaultState)).toMatchInlineSnapshot(
			'"pako:eNpVj81qw0AMhF9F6NRC_AI-BGK7zSXQQHLz5iBsObuk-8Naphjb7551fEl1EjPfiNGEjW8Zc7xHChqulXKQ5lCXOppeLPU3yLL9fGQB6x2PMxQfRw-99iEYd__c-GKFoJxOK8Yg2rjHslnlK__jeIaqPlEQH27vzvXPz_BVm7NO5_87OnJKfdcd5R1lDUUoKb4Q3KHlaMm0qfq0KgpFs2WFeVpb7mj4FYXKLQmlQfxldA3mEgfe4RBaEq4MpaftJi5PNtJU8w"'
		);
	});

	it('should serialize and deserialize with base64 serde', () => {
		expect(verifySerde(defaultState, 'base64')).toMatchInlineSnapshot(
			'"base64:eyJjb2RlIjoiZ3JhcGggVERcbiAgICBBW0NocmlzdG1hc10gLS0-fEdldCBtb25leXwgQihHbyBzaG9wcGluZylcbiAgICBCIC0tPiBDe0xldCBtZSB0aGlua31cbiAgICBDIC0tPnxPbmV8IERbTGFwdG9wXVxuICAgIEMgLS0-fFR3b3wgRVtpUGhvbmVdXG4gICAgQyAtLT58VGhyZWV8IEZbZmE6ZmEtY2FyIENhcl1cbiAgIiwibWVybWFpZCI6IntcbiAgXCJ0aGVtZVwiOiBcImRlZmF1bHRcIlxufSIsImF1dG9TeW5jIjp0cnVlLCJ1cGRhdGVEaWFncmFtIjp0cnVlfQ"'
		);
	});

	it('should serialize and deserialize with pako serde', () => {
		expect(verifySerde(defaultState, 'pako')).toMatchInlineSnapshot(
			'"pako:eNpVj81qw0AMhF9F6NRC_AI-BGK7zSXQQHLz5iBsObuk-8Naphjb7551fEl1EjPfiNGEjW8Zc7xHChqulXKQ5lCXOppeLPU3yLL9fGQB6x2PMxQfRw-99iEYd__c-GKFoJxOK8Yg2rjHslnlK__jeIaqPlEQH27vzvXPz_BVm7NO5_87OnJKfdcd5R1lDUUoKb4Q3KHlaMm0qfq0KgpFs2WFeVpb7mj4FYXKLQmlQfxldA3mEgfe4RBaEq4MpaftJi5PNtJU8w"'
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
