import { deflate, inflate } from 'pako';
import { toUint8Array, fromUint8Array, toBase64, fromBase64 } from 'js-base64';
import type { State } from '$lib/types';

interface Serde {
	serialize: (state: string) => string;
	deserialize: (state: string) => string;
}

const base64Serde: Serde = {
	serialize: (state: string): string => {
		return toBase64(state, true);
	},
	deserialize: (state: string): string => {
		return fromBase64(state);
	}
};

export const pakoSerde: Serde = {
	serialize: (state: string): string => {
		const data = new TextEncoder().encode(state);
		const compressed = deflate(data, { level: 9 });
		return fromUint8Array(compressed, true);
	},
	deserialize: (state: string): string => {
		const data = toUint8Array(state);
		return inflate(data, { to: 'string' });
	}
};

const serdes: { [key: string]: Serde } = {
	base64: base64Serde,
	pako: pakoSerde
};

type SerdeType = keyof typeof serdes;

export const serializeState = (state: State): string => {
	const json = JSON.stringify(state);
	const defaultSerde: SerdeType = 'pako';
	const serialized = serdes[defaultSerde].serialize(json);
	return `${defaultSerde}:${serialized}`;
};

export const deserializeState = (state: string): State => {
	let type: SerdeType, serialized: string;
	if (state.includes(':')) {
		let tempType: string;
		[tempType, serialized] = state.split(':');
		if (tempType in serdes) {
			type = tempType;
		} else {
			throw new Error(`Unknown serde type: ${tempType}`);
		}
	} else {
		type = 'base64';
		serialized = state;
	}
	const json = serdes[type].deserialize(serialized);
	return JSON.parse(json) as State;
};
