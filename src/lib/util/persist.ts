/* eslint-disable @typescript-eslint/no-explicit-any */
// Copied from https://github.com/MacFJA/svelte-persistent-store
// # The MIT License (MIT)

// Copyright (c) 2021 [MacFJA](https://github.com/MacFJA)

// > Permission is hereby granted, free of charge, to any person obtaining a copy
// > of this software and associated documentation files (the "Software"), to deal
// > in the Software without restriction, including without limitation the rights
// > to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// > copies of the Software, and to permit persons to whom the Software is
// > furnished to do so, subject to the following conditions:
// >
// > The above copyright notice and this permission notice shall be included in
// > all copies or substantial portions of the Software.
// >
// > THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// > IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// > FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// > AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// > LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// > OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// > THE SOFTWARE.

import ESSerializer from 'esserializer';
import type { Writable } from 'svelte/store';

/**
 * Disabled warnings about missing/unavailable storages
 */
export function disableWarnings(): void {
	noWarnings = true;
}
/**
 * If set to true, no warning will be emitted if the requested Storage is not found.
 * This option can be useful when the lib is used on a server.
 */
let noWarnings = false;
/**
 * List of storages where the warning have already been displayed.
 */
const alreadyWarnFor: Array<string> = [];

/**
 * Add a log to indicate that the requested Storage have not been found.
 * @param {string} storageName
 */
const warnStorageNotFound = (storageName) => {
	const isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';

	if (!noWarnings && alreadyWarnFor.indexOf(storageName) === -1 && !isProduction) {
		let message = `Unable to find the ${storageName}. No data will be persisted.`;
		if (typeof window === 'undefined') {
			message +=
				'\n' +
				'Are you running on a server? Most of storages are not available while running on a server.';
		}
		console.warn(message);
		alreadyWarnFor.push(storageName);
	}
};

const allowedClasses = [];
/**
 * Add a class to the allowed list of classes to be serialized
 * @param classDef The class to add to the list
 */
export const addSerializableClass = (classDef: () => unknown): void => {
	allowedClasses.push(classDef);
};

const serialize = (value: unknown): string => ESSerializer.serialize(value);
const deserialize = (value: string): unknown => {
	// @TODO: to remove in the next major
	if (value === 'undefined') {
		return undefined;
	}

	if (value !== null && value !== undefined) {
		try {
			return ESSerializer.deserialize(value, allowedClasses);
		} catch (e) {
			// Do nothing
			// use the value "as is"
		}
		try {
			return JSON.parse(value);
		} catch (e) {
			// Do nothing
			// use the value "as is"
		}
	}
	return value;
};

/**
 * A store that keep it's value in time.
 */
export interface PersistentStore<T> extends Writable<T> {
	/**
	 * Delete the store value from the persistent storage
	 */
	delete(): void;
}

/**
 * Storage interface
 */
export interface StorageInterface<T> {
	/**
	 * Get a value from the storage.
	 *
	 * If the value doesn't exists in the storage, `null` should be returned.
	 * This method MUST be synchronous.
	 * @param key The key/name of the value to retrieve
	 */
	getValue(key: string): T | null;

	/**
	 * Save a value in the storage.
	 * @param key The key/name of the value to save
	 * @param value The value to save
	 */
	setValue(key: string, value: T): void;

	/**
	 * Remove a value from the storage
	 * @param key The key/name of the value to remove
	 */
	deleteValue(key: string): void;
}

export interface SelfUpdateStorageInterface<T> extends StorageInterface<T> {
	/**
	 * Add a listener to the storage values changes
	 * @param {string} key The key to listen
	 * @param {(newValue: T) => void} listener The listener callback function
	 */
	addListener(key: string, listener: (newValue: T) => void): void;
	/**
	 * Remove a listener from the storage values changes
	 * @param {string} key The key that was listened
	 * @param {(newValue: T) => void} listener The listener callback function to remove
	 */
	removeListener(key: string, listener: (newValue: T) => void): void;
}

/**
 * Make a store persistent
 * @param {Writable<*>} store The store to enhance
 * @param {StorageInterface} storage The storage to use
 * @param {string} key The name of the data key
 */
export function persist<T>(
	store: Writable<T>,
	storage: StorageInterface<T>,
	key: string
): PersistentStore<T> {
	const initialValue = storage.getValue(key);

	if (null !== initialValue) {
		store.set(initialValue);
	}

	if ((storage as SelfUpdateStorageInterface<T>).addListener) {
		(storage as SelfUpdateStorageInterface<T>).addListener(key, (newValue) => {
			store.set(newValue);
		});
	}

	store.subscribe((value) => {
		storage.setValue(key, value);
	});

	return {
		...store,
		delete() {
			storage.deleteValue(key);
		}
	};
}

function getBrowserStorage(
	browserStorage: Storage,
	listenExternalChanges = false
): SelfUpdateStorageInterface<any> {
	const listeners: Array<{ key: string; listener: (newValue: any) => void }> = [];
	const listenerFunction = (event: StorageEvent) => {
		const eventKey = event.key;
		if (event.storageArea === browserStorage) {
			listeners
				.filter(({ key }) => key === eventKey)
				.forEach(({ listener }) => {
					listener(deserialize(event.newValue));
				});
		}
	};
	const connect = () => {
		if (listenExternalChanges && typeof window !== 'undefined' && window?.addEventListener) {
			window.addEventListener('storage', listenerFunction);
		}
	};
	const disconnect = () => {
		if (listenExternalChanges && typeof window !== 'undefined' && window?.removeEventListener) {
			window.removeEventListener('storage', listenerFunction);
		}
	};

	return {
		addListener(key: string, listener: (newValue: any) => void) {
			listeners.push({ key, listener });
			if (listeners.length === 1) {
				connect();
			}
		},
		removeListener(key: string, listener: (newValue: any) => void) {
			const index = listeners.indexOf({ key, listener });
			if (index !== -1) {
				listeners.splice(index, 1);
			}
			if (listeners.length === 0) {
				disconnect();
			}
		},
		getValue(key: string): any | null {
			const value = browserStorage.getItem(key);
			return deserialize(value);
		},
		deleteValue(key: string) {
			browserStorage.removeItem(key);
		},
		setValue(key: string, value: any) {
			browserStorage.setItem(key, serialize(value));
		}
	};
}

/**
 * Storage implementation that use the browser local storage
 * @param {boolean} listenExternalChanges - Update the store if the localStorage is updated from another page
 */
export function localStorage<T>(listenExternalChanges = false): StorageInterface<T> {
	if (typeof window !== 'undefined' && window?.localStorage) {
		return getBrowserStorage(window.localStorage, listenExternalChanges);
	}
	warnStorageNotFound('window.localStorage');
	return noopStorage();
}

/**
 * Storage implementation that do nothing
 */
export function noopStorage(): StorageInterface<any> {
	return {
		getValue(): null {
			return null;
		},
		deleteValue() {
			// Do nothing
		},
		setValue() {
			// Do nothing
		}
	};
}
