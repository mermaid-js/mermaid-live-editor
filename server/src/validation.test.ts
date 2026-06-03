import { describe, expect, it } from 'vitest';
import { HttpError, parse } from './http';
import {
  diagramCreateSchema,
  diagramUpdateSchema,
  folderCreateSchema,
  folderUpdateSchema
} from './validation';

describe('folder schemas', () => {
  it('accepts a valid create payload', () => {
    expect(parse(folderCreateSchema, { name: 'Designs' })).toEqual({ name: 'Designs' });
  });

  it('accepts a nested folder', () => {
    const result = parse(folderCreateSchema, { name: 'Sub', parentId: 'abc' });
    expect(result).toMatchObject({ name: 'Sub', parentId: 'abc' });
  });

  it('rejects an empty name', () => {
    expect(() => parse(folderCreateSchema, { name: '' })).toThrow(HttpError);
  });

  it('rejects an update with no fields', () => {
    expect(() => parse(folderUpdateSchema, {})).toThrow(HttpError);
  });
});

describe('diagram schemas', () => {
  it('requires a payload on create', () => {
    expect(() => parse(diagramCreateSchema, { name: 'D' })).toThrow(HttpError);
  });

  it('accepts a valid create payload', () => {
    const result = parse(diagramCreateSchema, { name: 'D', payload: 'pako:abc' });
    expect(result).toMatchObject({ name: 'D', payload: 'pako:abc' });
  });

  it('allows a partial update (rename only)', () => {
    expect(parse(diagramUpdateSchema, { name: 'Renamed' })).toEqual({ name: 'Renamed' });
  });

  it('rejects an empty update', () => {
    expect(() => parse(diagramUpdateSchema, {})).toThrow(HttpError);
  });
});

describe('parse()', () => {
  it('attaches a 400 status and details on failure', () => {
    try {
      parse(folderCreateSchema, { name: 123 });
      throw new Error('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).status).toBe(400);
      expect((error as HttpError).details).toBeDefined();
    }
  });
});
