import { describe, expect, it } from 'vitest';
import { MultiStepFormStepSchema } from '../src/step-schema.ts';

describe('step schema', () => {
  it('should create a valid step schema', () => {
    const stepSchema = new MultiStepFormStepSchema({
      step1: {
        fields: [
          {
            name: 'firstName' as const,
            defaultValue: '',
          },
        ],
        title: 'Step 1',
      },
    });

    expect(stepSchema.value).toStrictEqual({
      step1: {
        title: 'Step 1',
        nameTransformCasing: 'title',
        fields: {
          firstName: {
            defaultValue: '',
            nameTransformCasing: 'title',
            type: 'string',
            label: 'First Name',
          },
        },
      },
    });
  });

  it('should assign a default nameTransformCasing to the step', () => {
    const stepSchema = new MultiStepFormStepSchema({
      step1: {
        title: 'Step 1',
        fields: [
          {
            name: 'firstName' as const,
            defaultValue: '',
          },
        ],
      },
    });
    const { nameTransformCasing, fields } = stepSchema.value.step1;

    expect(nameTransformCasing).toBe('title');
    expect(fields.firstName.nameTransformCasing).toBe('title');
    expect(fields.firstName.label).toBe('First Name');
  });

  it('should override the default nameTransformCasing for the step', () => {
    const stepSchema = new MultiStepFormStepSchema({
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
    });
    const { nameTransformCasing, fields } = stepSchema.value.step1;

    expect(nameTransformCasing).toBe('kebab');
    expect(fields.firstName.nameTransformCasing).toBe('kebab');
    expect(fields.firstName.label).toBe('first-name');
  });

  it('should override the default casing for a field', () => {
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
    });

    expect(stepSchema.value.step1.fields.firstName.nameTransformCasing).toBe(
      'camel'
    );
    expect(stepSchema.value.step1.fields.firstName.label).toBe('firstName');
    expect(stepSchema.value.step2.fields.lastName.nameTransformCasing).toBe(
      'title'
    );
  });

  it('should return the data for the first step', () => {
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
    });
    const step1 = stepSchema.get({ step: 1 });

    expect(step1).toStrictEqual({
      step: 1,
      data: {
        title: 'Step 1',
        nameTransformCasing: 'title',
        fields: {
          firstName: {
            nameTransformCasing: 'camel',
            defaultValue: '',
            type: 'string',
            label: 'firstName',
          },
        },
      },
    });
  });
});
