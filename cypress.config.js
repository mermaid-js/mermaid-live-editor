import { defineConfig } from 'cypress';
import fs from 'fs';
import path from 'path';
export default defineConfig({
  projectId: '2ckppp',
  viewportWidth: 1440,
  viewportHeight: 768,
  snapshotFileName: './cypress/snapshots.js',
  defaultCommandTimeout: 5000,
  requestTimeout: 5000,
  retries: {
    runMode: 2,
    openMode: 0
  },
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        readAndDeleteFile({ fileNamePattern, folder, mode }) {
          const fileNameRegex = new RegExp(fileNamePattern);
          const files = fs.readdirSync(folder);
          const filename = files.find((file) => file.match(fileNameRegex));
          const filePath = path.join(folder, filename);
          try {
            if (mode === 'size') {
              return fs.statSync(filePath).size;
            }
            return fs.readFileSync(filePath, 'utf8');
          } finally {
            fs.rmSync(filePath);
          }
        }
      });
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.spec.ts'
  }
});
