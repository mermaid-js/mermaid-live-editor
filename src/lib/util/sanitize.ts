import { get as lodashGet } from 'lodash-es';
import type { MermaidConfig } from 'mermaid';
import { defaultMermaidConfig } from './mermaid';

/**
 * Gets a list of paths that contain unsafe keys which might pose security risks.
 *
 * @param object - The object to check for unsafe keys.
 * @param unsafeKeys - List of unsafe keys.
 * @param path - The current path being checked (used for recursion).
 * @returns List of unsafe paths.
 */
function getUnsafePaths(object: object, unsafeKeys: string[], path: string[] = []) {
  const unsafePaths = new Array<string[]>();
  for (const key of unsafeKeys) {
    // Copied from mermaid's sanitize function in case there's non-enumerable keys
    if (Object.hasOwn(object, key)) {
      unsafePaths.push([...path, key]);
      continue;
    }
  }
  Object.keys(object).forEach((key) => {
    const value = (object as Record<string, unknown>)[key];
    const currentPath = [...path, key];
    // Prototype pollution check.
    if (key.startsWith('__')) {
      unsafePaths.push(currentPath);
      return;
    }
    if (typeof value === 'object' && value !== null) {
      unsafePaths.push(...getUnsafePaths(value as object, unsafeKeys, currentPath));
    } else if (
      typeof value === 'string' &&
      // XSS prevention checks -- See mermaid `sanitize` function for reference.
      (value.includes('<') || value.includes('>') || value.includes('url(data:'))
    ) {
      unsafePaths.push(currentPath);
    }
  });
  return unsafePaths;
}

/**
 * Finds unsafe paths in the config that differ from mermaid's own defaults.
 *
 * @param config - The Mermaid configuration to check.
 * @returns List of unsafe paths.
 */
export const findUnsafeConfigPaths = (config: MermaidConfig): string[][] => {
  const secureKeys = defaultMermaidConfig.secure ?? [];
  return getUnsafePaths(config, secureKeys).filter((path) => {
    return lodashGet(config, path) !== lodashGet(defaultMermaidConfig, path);
  });
};

/**
 * Deletes the given paths from the config, mutating it in place.
 *
 * @param config - The Mermaid configuration to strip.
 * @param paths - Paths to delete, as returned by {@link findUnsafeConfigPaths}.
 */
export const stripConfigPaths = (config: MermaidConfig, paths: string[][]): void => {
  for (const unsafePath of paths) {
    const pathToObject = [...unsafePath];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We know this exists since it was found in `findUnsafeConfigPaths`
    const lastKey = pathToObject.pop()!;
    const lastObject = pathToObject.length === 0 ? config : lodashGet(config, pathToObject);
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- Copied from mermaid code
    delete lastObject[lastKey];
  }
};

/**
 * Non-interactive variant of `sanitizeConfig`: always strips unsafe settings
 * without asking the user. Used where a blocking confirm dialog is not an
 * option, such as the public /embed widget.
 *
 * @param config - The Mermaid configuration (JSON string or object).
 * @returns The sanitized Mermaid configuration object.
 */
export const silentlySanitizeConfig = (
  config: string | MermaidConfig | undefined
): MermaidConfig => {
  let parsed: MermaidConfig = {};
  if (typeof config === 'string') {
    try {
      parsed = JSON.parse(config) as MermaidConfig;
    } catch {
      parsed = {};
    }
  } else if (config) {
    parsed = config;
  }
  stripConfigPaths(parsed, findUnsafeConfigPaths(parsed));
  return parsed;
};
