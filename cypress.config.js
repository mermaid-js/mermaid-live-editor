import { defineConfig } from 'cypress';
import fs from 'fs';

export default defineConfig({
	projectId: '2ckppp',
	viewportWidth: 1440,
	viewportHeight: 768,
	snapshotFileName: './cypress/snapshots.js',
	defaultCommandTimeout: 16000,
	requestTimeout: 16000,
	e2e: {
		setupNodeEvents(on, config) {
			on('task', {
				readFileMaybe(filename) {
					if (fs.existsSync(filename)) {
						return fs.readFileSync(filename, 'utf8');
					}

					return null;
				}
			});
		},
		baseUrl: 'http://localhost:3000',
		specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}'
	}
});
