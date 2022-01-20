import { deflate, inflate } from 'pako';
import { toUint8Array, fromUint8Array, toBase64, fromBase64 } from 'js-base64';
import type { State } from '$lib/types';

interface Serde {
	serialize: (state: string) => string;
	deserialize: (state: string) => string;
}

enum SerdeType {
	Base64 = 'base64',
	Pako = 'pako'
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
const serdes: Record<SerdeType, Serde> = {
	[SerdeType.Base64]: base64Serde,
	[SerdeType.Pako]: pakoSerde
};

export const serializeState = (state: State): string => {
	const json = JSON.stringify(state);
	const defaultSerde = SerdeType.Pako;
	const serialized = serdes[defaultSerde].serialize(json);
	return `${defaultSerde}:${serialized}`;
};

export const deserializeState = (state: string): State => {
	let type: string, serialized: string;
	if (state.includes(':')) {
		[type, serialized] = state.split(':');
	} else {
		type = SerdeType.Base64;
		serialized = state;
	}
	const json = serdes[type].deserialize(serialized);
	return JSON.parse(json);
};
