import { describe, it, expect } from 'vitest';
import { MultiStepFormStepSchema } from '../../src';

describe('multi step form step schema: reusable functions', () => {
  it('should create a reusable function without any input', () => {
    const stepSchema = new MultiStepFormStepSchema({
      step1: {
        fields: [
          {
            name: 'firstName' as const,
            defaultValue: '',
            nameTransformCasing: 'camel',
          },
        ],
        title: 'Step 1',
      },
      step2: {
        fields: [
          {
            name: 'lastName' as const,
            defaultValue: '',
          },
        ],
        title: 'Step 2',
      },
      step3: {
        title: 'Step 3',
        fields: [
          {
            name: 'age' as const,
            defaultValue: 25,
          },
        ],
      },
    });
    const getStep1Title = stepSchema.createHelperFunction(
      { stepData: [1] },
      ({ ctx }) => {
        return ctx.step1.title;
      }
    );

    expect(getStep1Title()).toBe('Step 1');
  });
});
