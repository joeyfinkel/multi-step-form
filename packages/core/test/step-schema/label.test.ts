import { describe, expect, it } from 'vitest';
import { MultiStepFormStepSchema } from '../../src';

describe('multi step form step schema: label', () => {
  it('should have label=false when specified', () => {
    const stepSchema = new MultiStepFormStepSchema({
      steps: {
        step1: {
          title: 'Step 1',
          nameTransformCasing: 'kebab',
          fields: [
            {
              name: 'firstName' as const,
              defaultValue: '',
              label: false,
            },
          ],
        },
      },
    });

    expect(stepSchema.get({ step: 1 }).data.fields.firstName.label).toBeFalsy();
  });

  it('should have a default label when no label is specified', () => {
    const stepSchema = new MultiStepFormStepSchema({
      steps: {
        step1: {
          title: 'Step 1',
          nameTransformCasing: 'kebab',
          fields: [
            {
              name: 'firstName' as const,
              defaultValue: '',
            },
          ],
        },
      },
    });

    expect(stepSchema.get({ step: 1 }).data.fields.firstName.label).toBe(
      'first-name'
    );
  });

  it('should have a custom label when specified', () => {
    const stepSchema = new MultiStepFormStepSchema({
      steps: {
        step1: {
          title: 'Step 1',
          nameTransformCasing: 'kebab',
          fields: [
            {
              name: 'firstName' as const,
              defaultValue: '',
              label: 'First Name',
            },
          ],
        },
      },
    });

    expect(stepSchema.get({ step: 1 }).data.fields.firstName.label).toBe(
      'First Name'
    );
  });
});
