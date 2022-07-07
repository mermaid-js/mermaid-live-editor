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
			'"pako:eNpVkM1qw0AMhF9F6JRC_AI-FBo7ySXQQnPz5iC8cnZp9oe1TAm2373rmEKik5j5ZhAasQ2ascRromjgXCsPeT6ayiTbi6P-AkXxPh1ZwAXP9wl2m2OA3oQYrb--rfxugaAaTwvGIMb6n3m1qkf-0_MEdXOiKCFenp3zb5hg39gvk-tfHZM4pw5NR2VHRUsJKkoPBLfoODmyOp8-LopCMexYYZlXzR0NN1Go_JzRIWoS3msrIWGuuvW8RRokfN99i6Wkgf-h2lL-hFvF-Q9-YFyS"'
		);
	});

	it('should serialize and deserialize with base64 serde', () => {
		expect(verifySerde(defaultState, 'base64')).toMatchInlineSnapshot(
			'"base64:eyJjb2RlIjoiZ3JhcGggVERcbiAgICBBW0NocmlzdG1hc10gLS0-fEdldCBtb25leXwgQihHbyBzaG9wcGluZylcbiAgICBCIC0tPiBDe0xldCBtZSB0aGlua31cbiAgICBDIC0tPnxPbmV8IERbTGFwdG9wXVxuICAgIEMgLS0-fFR3b3wgRVtpUGhvbmVdXG4gICAgQyAtLT58VGhyZWV8IEZbZmE6ZmEtY2FyIENhcl1cbiAgIiwibWVybWFpZCI6IntcbiAgXCJ0aGVtZVwiOiBcImRlZmF1bHRcIlxufSIsInVwZGF0ZUVkaXRvciI6ZmFsc2UsImF1dG9TeW5jIjp0cnVlLCJ1cGRhdGVEaWFncmFtIjp0cnVlfQ"'
		);
	});

	it('should serialize and deserialize with pako serde', () => {
		expect(verifySerde(defaultState, 'pako')).toMatchInlineSnapshot(
			'"pako:eNpVkM1qw0AMhF9F6JRC_AI-FBo7ySXQQnPz5iC8cnZp9oe1TAm2373rmEKik5j5ZhAasQ2ascRromjgXCsPeT6ayiTbi6P-AkXxPh1ZwAXP9wl2m2OA3oQYrb--rfxugaAaTwvGIMb6n3m1qkf-0_MEdXOiKCFenp3zb5hg39gvk-tfHZM4pw5NR2VHRUsJKkoPBLfoODmyOp8-LopCMexYYZlXzR0NN1Go_JzRIWoS3msrIWGuuvW8RRokfN99i6Wkgf-h2lL-hFvF-Q9-YFyS"'
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
