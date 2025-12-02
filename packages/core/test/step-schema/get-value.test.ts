import { MultiStepFormStepSchema } from '../../src';
import { describe, it, expect } from 'vitest';

describe('MultiStepFormStepSchema#getValue()', () => {
  describe('nested path resolution', () => {
    const stepSchema = new MultiStepFormStepSchema({
      steps: {
        step1: {
          fields: {
            field: {
              defaultValue: {
                nested: {
                  deep: {
                    value: 'found',
                  },
                },
              },
            },
          },
          title: 'Step 1',
        },
      },
    });

    it('should get value at parent path', () => {
      expect(stepSchema.getValue('step1', 'field')).toStrictEqual({
        nested: {
          deep: {
            value: 'found',
          },
        },
      });
    });

    it('should get value at intermediate nested path', () => {
      expect(stepSchema.getValue('step1', 'field.nested')).toStrictEqual({
        deep: {
          value: 'found',
        },
      });
    });

    it('should get value at deepest nested path', () => {
      expect(stepSchema.getValue('step1', 'field.nested.deep.value')).toBe(
        'found'
      );
    });
  });

  describe('different data types', () => {
    it('should handle primitive types', () => {
      const stepSchema = new MultiStepFormStepSchema({
        steps: {
          step1: {
            fields: {
              string: { defaultValue: 'text' },
              number: { defaultValue: 42 },
              boolean: { defaultValue: true },
              zero: { defaultValue: 0 },
              falseValue: { defaultValue: false },
              emptyString: { defaultValue: '' },
            },
            title: 'Step 1',
          },
        },
      });

      expect(stepSchema.getValue('step1', 'string')).toBe('text');
      expect(stepSchema.getValue('step1', 'number')).toBe(42);
      expect(stepSchema.getValue('step1', 'boolean')).toBe(true);
      expect(stepSchema.getValue('step1', 'zero')).toBe(0);
      expect(stepSchema.getValue('step1', 'falseValue')).toBe(false);
      expect(stepSchema.getValue('step1', 'emptyString')).toBe('');
    });

    it('should handle null and undefined', () => {
      const stepSchema = new MultiStepFormStepSchema({
        steps: {
          step1: {
            fields: {
              nullValue: { defaultValue: null },
              undefinedValue: { defaultValue: undefined },
            },
            title: 'Step 1',
          },
        },
      });

      // @ts-expect-error - TypeScript can't infer types for null/undefined defaultValues
      expect(stepSchema.getValue('step1', 'nullValue')).toBeNull();
      // @ts-expect-error - TypeScript can't infer types for null/undefined defaultValues
      expect(stepSchema.getValue('step1', 'undefinedValue')).toBeUndefined();
    });

    it('should handle arrays', () => {
      const stepSchema = new MultiStepFormStepSchema({
        steps: {
          step1: {
            fields: {
              array: { defaultValue: [1, 2, 3] },
              emptyArray: { defaultValue: [] },
            },
            title: 'Step 1',
          },
        },
      });

      expect(stepSchema.getValue('step1', 'array')).toStrictEqual([1, 2, 3]);
      expect(stepSchema.getValue('step1', 'emptyArray')).toStrictEqual([]);
    });

    it('should handle objects', () => {
      const stepSchema = new MultiStepFormStepSchema({
        steps: {
          step1: {
            fields: {
              object: { defaultValue: { key: 'value' } },
            },
            title: 'Step 1',
          },
        },
      });

      expect(stepSchema.getValue('step1', 'object')).toStrictEqual({
        key: 'value',
      });
    });

    it('should handle empty objects', () => {
      const stepSchema = new MultiStepFormStepSchema({
        steps: {
          step1: {
            fields: {
              emptyObject: { defaultValue: {} },
            },
            title: 'Step 1',
          },
        },
      });

      // @ts-expect-error - TypeScript can't infer types for empty object defaultValues
      expect(stepSchema.getValue('step1', 'emptyObject')).toStrictEqual({});
    });
  });

  describe('nested structures with arrays', () => {
    const stepSchema = new MultiStepFormStepSchema({
      steps: {
        step1: {
          fields: {
            data: {
              defaultValue: {
                items: [1, 2, 3],
                metadata: {
                  count: 3,
                },
                users: [
                  { id: 1, name: 'Alice' },
                  { id: 2, name: 'Bob' },
                ],
              },
            },
          },
          title: 'Step 1',
        },
      },
    });

    it('should get nested array values', () => {
      expect(stepSchema.getValue('step1', 'data.items')).toStrictEqual([
        1, 2, 3,
      ]);
      expect(stepSchema.getValue('step1', 'data.users')).toStrictEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
    });

    it('should get nested object values', () => {
      expect(stepSchema.getValue('step1', 'data.metadata')).toStrictEqual({
        count: 3,
      });
      expect(stepSchema.getValue('step1', 'data.metadata.count')).toBe(3);
    });
  });

  describe('multiple steps', () => {
    const stepSchema = new MultiStepFormStepSchema({
      steps: {
        step1: {
          fields: {
            value: { defaultValue: 'step1' },
            nested: {
              defaultValue: {
                deep: { value: 'deep1' },
              },
            },
          },
          title: 'Step 1',
        },
        step2: {
          fields: {
            value: { defaultValue: 'step2' },
          },
          title: 'Step 2',
        },
      },
    });

    it('should get values from different steps', () => {
      expect(stepSchema.getValue('step1', 'value')).toBe('step1');
      expect(stepSchema.getValue('step2', 'value')).toBe('step2');
      expect(stepSchema.getValue('step1', 'nested.deep.value')).toBe('deep1');
    });
  });

  describe('multiple fields at same level', () => {
    const stepSchema = new MultiStepFormStepSchema({
      steps: {
        step1: {
          fields: {
            user: {
              defaultValue: {
                name: 'John',
                age: 30,
              },
            },
            address: {
              defaultValue: {
                city: 'New York',
              },
            },
          },
          title: 'Step 1',
        },
      },
    });

    it('should get values from different sibling fields', () => {
      expect(stepSchema.getValue('step1', 'user.name')).toBe('John');
      expect(stepSchema.getValue('step1', 'address.city')).toBe('New York');
      expect(stepSchema.getValue('step1', 'user')).toStrictEqual({
        name: 'John',
        age: 30,
      });
    });
  });

  describe('very deep nesting', () => {
    const stepSchema = new MultiStepFormStepSchema({
      steps: {
        step1: {
          fields: {
            a: {
              defaultValue: {
                b: {
                  c: {
                    d: {
                      e: {
                        f: {
                          g: { value: 'deep' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          title: 'Step 1',
        },
      },
    });

    it('should get value from very deep nested path', () => {
      expect(
        stepSchema.getValue('step1', 'a.b.c.d.e.f.g.value')
      ).toBe('deep');
    });
  });
});
