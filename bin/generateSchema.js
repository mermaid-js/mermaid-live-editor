#!/usr/bin/env node

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SCHEMA_URL = 'https://mermaid.js.org/schemas/config.schema.json';
const OUTPUT_FOLDER = join(process.cwd(), 'static', 'schemas');

/**
 * @typedef {Object} Schema
 * @property {Record<string, any>} properties - Schema properties
 * @property {string} $id - Schema ID
 */

/**
 * Fetches the Mermaid config schema and extends it with liveEditor properties
 * @returns {Promise<void>}
 */
async function fetchAndExtendSchema() {
  try {
    console.log('Fetching Mermaid config schema...');
    const response = await fetch(SCHEMA_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}`);
    }

    /** @type {Schema} */
    const schema = await response.json();

    // Update the schema ID for mermaid.live
    schema.$id = 'https://mermaid.live/schemas/config.schema.json';

    // Add the liveEditor property to extend the schema
    schema.properties.liveEditor = {
      type: 'object',
      description: 'Live editor specific configuration options',
      properties: {
        icons: {
          type: 'object',
          description:
            'Icon pack configuration where key is the iconify compatible package name and value is the package name or URL',
          additionalProperties: {
            type: 'string',
            description: 'Package name (for npm packages) or full URL to iconify format icons.json'
          }
        }
      },
      additionalProperties: false
    };

    // Write the extended schema to static directory
    console.log(`Writing extended schema to ${OUTPUT_FOLDER}...`);
    mkdirSync(OUTPUT_FOLDER, { recursive: true });
    writeFileSync(join(OUTPUT_FOLDER, 'config.schema.json'), JSON.stringify(schema, null, 2));

    console.log('Schema generated successfully!');
  } catch (error) {
    console.error('Error generating schema:', error);
    process.exit(1);
  }
}

fetchAndExtendSchema();
