import { writable, get, type Writable } from 'svelte/store';
import { persist, localStorage } from '@macfja/svelte-persistent-store';
import { injectHistoryIDs } from '$lib/components/history/history';

interface MigrationState {
	version: number;
}

const migrations: { [key: string]: () => void } = {
	injectHistoryIDs
};

const migrationStore: Writable<MigrationState> = persist(
	writable({ version: -1 }),
	localStorage(),
	'migrations'
);

export const applyMigrations = (): void => {
	const { version }: MigrationState = get(migrationStore);
	const allMigrations = Object.entries(migrations);
	if (version === allMigrations.length - 1) {
		return;
	}
	console.log(`Current migration version: v${version}. Migrating to v${allMigrations.length - 1}.`);
	for (let i = version + 1; i < allMigrations.length; i++) {
		const [key, fn] = allMigrations[i];
		console.log(`Applying migration ${i}: ${key}.`);
		fn();
		migrationStore.set({ version: i });
	}
};
