import { describe, expect, it } from 'vitest';
import { MultiStepFormStepSchema } from '../../src';

describe('multi step form step schema: name transform casing', () => {
  it('should assign a default name transform casing to the step', () => {
    const stepSchema = new MultiStepFormStepSchema({
      steps: {
        step1: {
          title: 'Step 1',
          fields: {
            firstName: {
              defaultValue: '',
            },
          },
        },
      },
    });
    const { nameTransformCasing, fields } = stepSchema.value.step1;

    expect(nameTransformCasing).toBe('title');
    expect(fields.firstName.nameTransformCasing).toBe('title');
    expect(fields.firstName.label).toBe('First Name');
  });

  it('should override the default name transform casing for the step', () => {
    const stepSchema = new MultiStepFormStepSchema({
      steps: {
        step1: {
          title: 'Step 1',
          nameTransformCasing: 'kebab',
          fields: {
            firstName: {
              defaultValue: '',
            },
          },
        },
      },
    });
    const { nameTransformCasing, fields } = stepSchema.value.step1;

    expect(nameTransformCasing).toBe('kebab');
    expect(fields.firstName.nameTransformCasing).toBe('kebab');
    expect(fields.firstName.label).toBe('first-name');
  });

  it('should override the default name transform casing for a field', () => {
    const stepSchema = new MultiStepFormStepSchema({
      steps: {
        step1: {
          fields: {
            firstName: {
              defaultValue: '',
              nameTransformCasing: 'camel',
            },
          },
          title: 'Step 1',
        },
        step2: {
          fields: {
            lastName: {
              defaultValue: '',
            },
          },
          title: 'Step 2',
        },
      },
    });

    expect(stepSchema.value.step1.fields.firstName.nameTransformCasing).toBe(
      'camel'
    );
    expect(stepSchema.value.step1.fields.firstName.label).toBe('firstName');
    expect(stepSchema.value.step2.fields.lastName.nameTransformCasing).toBe(
      'title'
    );
  });
});
