import { defineConfig } from 'cypress';
import fs from 'fs';
import { isFileExist, findFiles } from 'cy-verify-downloads';
export default defineConfig({
  projectId: '2ckppp',
  viewportWidth: 1440,
  viewportHeight: 768,
  snapshotFileName: './cypress/snapshots.js',
  defaultCommandTimeout: 16000,
  requestTimeout: 16000,
  retries: {
    runMode: 4,
    openMode: 0
  },
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        isFileExist,
        findFiles,
        deleteFile(path) {
          fs.rmSync(path);
          return null;
        },
        readFileMaybe(filename) {
          if (fs.existsSync(filename)) {
            return fs.readFileSync(filename, 'utf8');
          }
          return null;
        }
      });
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.spec.ts'
  }
});
