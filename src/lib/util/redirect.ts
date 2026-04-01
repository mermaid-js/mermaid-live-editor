import { resolve } from '$app/paths';

/**
 * Build the redirect URL for legacy root-path links.
 * Extracts the route and fragment from the old hash-based URL format,
 * and ensures search params (e.g. UTM) come before the hash fragment.
 */
export const buildRedirectUrl = (location: Location): string => {
  const parts = location.hash.split('/');
  let path = 'edit';
  let fragment = '';
  if (parts.length > 2) {
    path = parts[1];
    fragment = `#${parts[2]}`;
  }
  return `${resolve(`/${path}`, {})}${location.search}${fragment}`;
};
