import { describe, expect, it } from 'vitest';
import { validatePackageVersion } from './mermaid';

describe('validatePackageVersion', () => {
  const validPackages = [
    'package@1',
    'package@1.2.3',
    '@scope/package@1',
    '@scope/package@1.2.3',
    'package@1.0.0-alpha.1',
    'package@1.0.0+build.1',
    '@iconify-json/my-icons-package@2.1.0',
    '@scope@weird/package@1.0.0' // edge case: multiple @ symbols
  ];

  const invalidPackages = [
    'package', // no @
    '@scope/package', // scoped without version
    'package@', // empty version
    '@scope/package@', // scoped empty version
    'package@   ', // whitespace version
    '', // empty string
    '@', // just @
    '@scope@weird/package@' // multiple @ with empty version
  ];

  it.each(validPackages)('should accept "%s"', (packageName) => {
    expect(() => validatePackageVersion(packageName)).not.toThrow();
  });

  it.each(invalidPackages)('should reject "%s"', (packageName) => {
    expect(() => validatePackageVersion(packageName)).toThrow(
      /must include at least a major version/
    );
  });
});
