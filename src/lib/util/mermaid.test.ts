import { describe, expect, it } from 'vitest';
import { validatePackageVersion } from './mermaid';

describe('validatePackageVersion', () => {
  describe('should accept valid package names', () => {
    const validPackages = [
      ['simple package with major version', 'package@1'],
      ['simple package with semver', 'package@1.2.3'],
      ['scoped package with major version', '@scope/package@1'],
      ['scoped package with semver', '@scope/package@1.2.3'],
      ['package with prerelease version', 'package@1.0.0-alpha.1'],
      ['package with build metadata', 'package@1.0.0+build.1'],
      ['package with complex version', 'package@1.0.0-beta.2+exp.sha.5114f85'],
      ['scoped package with complex name', '@company/my-icons-package@2.1.0']
    ];

    it.each(validPackages)('should accept %s', (_, packageName) => {
      expect(() => validatePackageVersion(packageName)).not.toThrow();
    });
  });

  describe('should reject invalid package names', () => {
    const invalidPackages = [
      [
        'package without @',
        'package',
        "Package name 'package' must include at least a major version (e.g., 'package@1' or '@scope/package@1.0.0')"
      ],
      [
        'scoped package without version',
        '@scope/package',
        "Package name '@scope/package' must include at least a major version (e.g., 'package@1' or '@scope/package@1.0.0')"
      ],
      [
        'package with empty version',
        'package@',
        "Package name 'package@' must include a valid version after '@'"
      ],
      [
        'scoped package with empty version',
        '@scope/package@',
        "Package name '@scope/package@' must include a valid version after '@'"
      ],
      [
        'package with whitespace-only version',
        'package@   ',
        "Package name 'package@   ' must include a valid version after '@'"
      ],
      [
        'empty string',
        '',
        "Package name '' must include at least a major version (e.g., 'package@1' or '@scope/package@1.0.0')"
      ],
      [
        'string with only @',
        '@',
        "Package name '@' must include at least a major version (e.g., 'package@1' or '@scope/package@1.0.0')"
      ]
    ];

    it.each(invalidPackages)('should reject %s', (_, packageName, expectedError) => {
      expect(() => validatePackageVersion(packageName)).toThrow(expectedError);
    });
  });

  describe('should handle edge cases', () => {
    const validEdgeCases = [
      ['package name with multiple @ symbols', '@scope@weird/package@1.0.0'],
      ['package with @ in scope and version', '@my@scope/package@1.0.0']
    ];

    it.each(validEdgeCases)('should handle %s correctly', (_, packageName) => {
      expect(() => validatePackageVersion(packageName)).not.toThrow();
    });

    const invalidEdgeCases = [
      [
        'package with multiple @ but empty version',
        '@scope@weird/package@',
        "Package name '@scope@weird/package@' must include a valid version after '@'"
      ]
    ];

    it.each(invalidEdgeCases)('should reject %s', (_, packageName, expectedError) => {
      expect(() => validatePackageVersion(packageName)).toThrow(expectedError);
    });
  });
});
