import elkLayouts from '@mermaid-js/layout-elk';
import zenuml from '@mermaid-js/mermaid-zenuml';
import type { RenderResult } from 'mermaid';
import mermaid from 'mermaid';
import type { MermaidConfig } from 'mermaid';
import type { IconLoader } from 'mermaid/dist/rendering-util/icons.js';
import { logEvent } from './stats';

export interface ExtendedMermaidConfig extends MermaidConfig {
  liveEditor?: {
    icons?: {
      [key: string]: string;
    };
  };
}

mermaid.registerLayoutLoaders(elkLayouts);
const init = mermaid.registerExternalDiagrams([zenuml]);

/**
 * Validates that a package name includes at least a major version specification.
 * @param packageName - The package name to validate (e.g., 'package@1' or '@scope/package@1.0.0')
 * @throws Error if the package name doesn't include a valid version
 */
export function validatePackageVersion(packageName: string): void {
  // Accepts: package@1, @scope/package@1, package@1.2.3, @scope/package@1.2.3
  // Rejects: package, @scope/package, package@, @scope/package@
  const match = packageName.match(/^(?:@[^/]+\/)?[^@]+@\d/);
  if (!match) {
    throw new Error(
      `Package name '${packageName}' must include at least a major version (e.g., 'package@1' or '@scope/package@1.0.0')`
    );
  }
}

/**
 * Fetches JSON data from a URL with proper error handling
 * @param url - The URL to fetch from
 * @returns Promise that resolves to the parsed JSON data
 * @throws Error with descriptive message for various failure cases
 */
async function fetchIconsJson(url: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch icons from ${url}: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`Expected JSON response from ${url}, got: ${contentType || 'unknown'}`);
    }

    // Track adoption and discuss integrating directly into mermaid
    logEvent('fetchIcons');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new TypeError(`Network error while fetching icons from ${url}: ${error.message}`);
    } else if (error instanceof SyntaxError) {
      throw new SyntaxError(`Invalid JSON response from ${url}: ${error.message}`);
    }
    throw error;
  }
}

function getIconLoader(name: string, packageNameOrUrl: string): IconLoader {
  const isUrl = packageNameOrUrl.startsWith('https');

  if (!isUrl) {
    validatePackageVersion(packageNameOrUrl);
  }

  const url = isUrl
    ? packageNameOrUrl
    : `https://cdn.jsdelivr.net/npm/${packageNameOrUrl}/icons.json`;
  return {
    name: name,
    loader: () => fetchIconsJson(url)
  };
}

function mermaidRegisterProcess(config: ExtendedMermaidConfig) {
  const iconPacks: IconLoader[] = [];
  for (const [name, packageName] of Object.entries(config.liveEditor?.icons ?? {})) {
    const iconPack = getIconLoader(name, packageName);
    iconPacks.push(iconPack);
  }
  if (iconPacks.length > 0) {
    mermaid.registerIconPacks(iconPacks);
  }
}

export const render = async (
  id: string,
  code: string,
  config: ExtendedMermaidConfig
): Promise<RenderResult> => {
  await init;

  // Should be able to call this multiple times without any issues.
  mermaid.initialize(config);
  mermaidRegisterProcess(config);
  return await mermaid.render(id, code);
};

export const parse = async (code: string, config: ExtendedMermaidConfig) => {
  await init;

  mermaid.initialize(config);
  mermaidRegisterProcess(config);
  return await mermaid.parse(code);
};

export const standardizeDiagramType = (diagramType: string) => {
  switch (diagramType) {
    case 'class':
    case 'classDiagram': {
      return 'classDiagram';
    }
    case 'graph':
    case 'flowchart':
    case 'flowchart-elk':
    case 'flowchart-v2': {
      return 'flowchart';
    }
    default: {
      return diagramType;
    }
  }
};
