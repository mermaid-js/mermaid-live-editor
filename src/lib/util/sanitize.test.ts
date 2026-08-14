import type { MermaidConfig } from 'mermaid';
import { describe, expect, it } from 'vitest';
import { findUnsafeConfigPaths, silentlySanitizeConfig, stripConfigPaths } from './sanitize';

describe('findUnsafeConfigPaths', () => {
  it('should flag secure keys that differ from the mermaid default', () => {
    expect(findUnsafeConfigPaths({ securityLevel: 'loose' })).toEqual([['securityLevel']]);
  });

  it('should not flag secure keys equal to the mermaid default', () => {
    expect(findUnsafeConfigPaths({ securityLevel: 'strict' })).toEqual([]);
  });

  it('should flag prototype pollution keys', () => {
    const config = JSON.parse('{"__proto__": {"polluted": true}}') as MermaidConfig;
    expect(findUnsafeConfigPaths(config)).toEqual([['__proto__']]);
  });

  it('should flag nested string values containing XSS vectors', () => {
    const config = {
      themeVariables: { nodeBorder: '1px solid<script>alert(1)</script>' }
    } as MermaidConfig;
    expect(findUnsafeConfigPaths(config)).toEqual([['themeVariables', 'nodeBorder']]);
  });

  it('should return no paths for a harmless config', () => {
    expect(findUnsafeConfigPaths({ theme: 'forest' })).toEqual([]);
  });
});

describe('stripConfigPaths', () => {
  it('should delete the given paths in place', () => {
    const config = {
      securityLevel: 'loose',
      theme: 'dark',
      themeVariables: { nodeBorder: '<b>' }
    } as MermaidConfig;
    stripConfigPaths(config, [['securityLevel'], ['themeVariables', 'nodeBorder']]);
    expect(config).toEqual({ theme: 'dark', themeVariables: {} });
  });
});

describe('silentlySanitizeConfig', () => {
  it('should parse a JSON string and strip unsafe settings', () => {
    const result = silentlySanitizeConfig(
      JSON.stringify({ securityLevel: 'loose', theme: 'dark' })
    );
    expect(result).toEqual({ theme: 'dark' });
  });

  it('should accept a config object', () => {
    expect(silentlySanitizeConfig({ theme: 'forest' })).toEqual({ theme: 'forest' });
  });

  it('should return an empty config for invalid JSON', () => {
    expect(silentlySanitizeConfig('not json')).toEqual({});
  });

  it('should return an empty config for undefined', () => {
    expect(silentlySanitizeConfig(undefined)).toEqual({});
  });
});
