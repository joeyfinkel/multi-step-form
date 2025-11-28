import { it, expect } from 'vitest';
import { createMultiStepFormSchema } from '../src';

it('should use the custom storage key', () => {
  const schema = createMultiStepFormSchema({
    steps: {
      step1: {
        title: 'First step',
        fields: {
          foo: {
            defaultValue: '',
          },
        },
      },
      step2: {
        title: 'Second step',
        fields: {
          bar: {
            defaultValue: 0,
          },
        },
      },
    },
    storage: {
      key: 'custom-key',
    },
  });

  expect(schema.storage.key).toBe('custom-key');
  expect(schema.stepSchema.__getStorage().key).toBe('custom-key');
});
