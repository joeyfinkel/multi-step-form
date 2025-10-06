import { type } from 'arktype';
import { setCasingType, type CasingType } from './casing.js';
import {
  DEFAULT_CASING,
  MultiStepFormStepSchema,
  type DefaultCasing,
  type InferStepOptions,
  type MultiStepFormSchemaStepConfig,
  type ResolvedStep,
  type Step,
  type StepNumbers,
} from './step-schema.ts';
import { Subscribable } from './subscribable.js';
import type { Constrain } from './utils.js';

export type MultiStepFormSchemaDefaults<
  TCasing extends CasingType,
  TStorageKey extends string
> = {
  nameTransformCasing?: TCasing;
  storageKey?: TStorageKey;
};
export type MultiStepFormSchemaOptions<
  TStep extends Step<TCasing>,
  TCasing extends CasingType,
  TStorageKey extends string
> = Omit<
  MultiStepFormSchemaStepConfig<TStep, TCasing>,
  'nameTransformCasing'
> & {
  defaults?: MultiStepFormSchemaDefaults<TCasing, TStorageKey>;
};
export type MultiStepFormSchemaListener<
  TStep extends Step<TCasing>,
  TCasing extends CasingType,
  TStorageKey extends string
> = (data: {
  steps: InferStepOptions<TStep>;
  defaults: MultiStepFormSchemaDefaults<TCasing, TStorageKey>;
}) => void;

export class MultiStepFormSchema<
  step extends Step<casing>,
  resolvedStep extends ResolvedStep<step, InferStepOptions<step>, casing>,
  stepNumbers extends StepNumbers<resolvedStep>,
  casing extends CasingType = DefaultCasing,
  storageKey extends string = never
> extends Subscribable<MultiStepFormSchemaListener<step, casing, storageKey>> {
  readonly storageKey: storageKey;
  readonly defaultNameTransformationCasing: casing;
  readonly stepSchema: MultiStepFormStepSchema<
    step,
    resolvedStep,
    stepNumbers,
    casing
  >;
  constructor(
    options: MultiStepFormSchemaOptions<
      step,
      // Allows full autocomplete
      Constrain<casing, CasingType>,
      storageKey
    >
  ) {
    super();

    const { steps, defaults } = options;

    this.defaultNameTransformationCasing = setCasingType(
      defaults?.nameTransformCasing,
      DEFAULT_CASING
    ) as casing;
    this.stepSchema = new MultiStepFormStepSchema({
      steps,
      nameTransformCasing: this.defaultNameTransformationCasing,
    });
    // Cast to make TS happy. We want `storageKey` to show as `never`
    // if there is none provided
    this.storageKey = defaults?.storageKey as storageKey;
  }

  getSnapshot() {
    return this;
  }

  protected notify() {
    this.listeners.forEach((listener) => {
      listener({
        defaults: {
          nameTransformCasing: this.defaultNameTransformationCasing,
          storageKey: this.storageKey,
        },
        steps: this.stepSchema.original,
      });
    });
  }
}

const t = new MultiStepFormSchema({
  defaults: {
    nameTransformCasing: 'flat',
    storageKey: 'testData',
  },
  steps: {
    step1: {
      nameTransformCasing: 'kebab',
      // fields: [
      //   {
      //     defaultValue: '',
      //     name: 'first' as const,
      //     nameTransformCasing: 'camel',
      //   },
      // ],
      title: 'test',
      fields: {
        firstName: {
          defaultValue: '',
          nameTransformCasing: 'camel',
          // type: 'date'
        },
      },
    },
  },
});
const u = t.storageKey;

t.stepSchema.createHelperFn(
  {
    stepData: ['step1'],
  },
  ({ ctx }) => {}
);
//                          ^?
