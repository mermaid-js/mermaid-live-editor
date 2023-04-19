import { writable, get, type Writable } from 'svelte/store';
import { persist, localStorage } from '$lib/util/persist';
import { injectHistoryIDs } from '$lib/components/History/history';
import { logEvent } from './stats';

interface MigrationState {
  version: number;
}

const migrations: Record<string, () => void> = {
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
    logEvent('migration', { key });
    migrationStore.set({ version: i });
  }
  logEvent('migration', { status: 'complete', from: version, to: allMigrations.length - 1 });
};
