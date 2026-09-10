import { injectHistoryIDs } from '$lib/components/History/historyState.svelte';
import { persisted } from '$lib/util/persist.svelte';
import { clearDefaultThemeConfig } from './state.svelte';
import { logEvent } from './stats';

interface MigrationState {
  version: number;
}

// Applied in insertion order and tracked by index, so only ever append here.
// Resolved lazily: the state module imports util.ts, which imports this file,
// so exports such as clearDefaultThemeConfig are not initialised yet while this
// module is being evaluated.
const getMigrations = (): Record<string, () => void> => ({
  injectHistoryIDs,
  clearDefaultThemeConfig
});

const migrationState = persisted<MigrationState>('migrations', { version: -1 });

export const applyMigrations = (): void => {
  const { version } = migrationState.value;
  const allMigrations = Object.entries(getMigrations());
  if (version === allMigrations.length - 1) {
    return;
  }
  console.log(`Current migration version: v${version}. Migrating to v${allMigrations.length - 1}.`);
  for (let i = version + 1; i < allMigrations.length; i++) {
    const [key, fn] = allMigrations[i];
    console.log(`Applying migration ${i}: ${key}.`);
    fn();
    logEvent('migration', { key });
    migrationState.value = { version: i };
  }
  logEvent('migration', { status: 'complete', from: version, to: allMigrations.length - 1 });
};
