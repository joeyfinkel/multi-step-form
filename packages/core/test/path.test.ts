import { describe, it, expect } from 'vitest';
import { path } from '../src/utils/path';

describe('path.equalsAtPaths', () => {
  it('returns ok for matching scalar value at a single path', () => {
    const def = {
      name: 'Alice',
      age: 30,
    };

    const result = path.equalsAtPaths(def, ['name'], 'Alice');

    expect(result.ok).toBe(true);
    expect(result.mismatches).toHaveLength(0);
  });

  it('treats arrays of the same element type as equal even when values differ', () => {
    const def = {
      tags: [1, 2, 3],
    };

    // Same element "type" (numbers), different concrete values
    const result = path.equalsAtPaths(def, ['tags'], [10, 20, 30]);

    expect(result.ok).toBe(true);
    expect(result.mismatches).toHaveLength(0);
  });

  it('reports type mismatches for array elements of different types', () => {
    const def = {
      tags: [1, 2, 3],
    };

    const result = path.equalsAtPaths(def, ['tags'], ['a', 'b', 'c'] as any);

    expect(result.ok).toBe(false);
    expect(result.mismatches.length).toBeGreaterThan(0);

    // All mismatches should be type mismatches under the "tags" array path
    for (const m of result.mismatches) {
      expect(m.reason).toBe('type-mismatch');
      expect(m.path.startsWith('tags[')).toBe(true);
    }
  });

  it('reports a type mismatch when expected is an array and actual is not', () => {
    const def = {
      tags: [1, 2, 3],
    };

    const result = path.equalsAtPaths(def, ['tags'], 'not-an-array' as any);

    expect(result.ok).toBe(false);
    expect(result.mismatches).toHaveLength(1);
    expect(result.mismatches[0]?.reason).toBe('type-mismatch');
    expect(result.mismatches[0]?.path).toBe('tags');
  });
});
