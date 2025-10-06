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
import { MultiStepFormStorage } from './storage.js';
import { Subscribable } from './subscribable.js';
import type { Constrain } from './utils.js';
export type MultiStepFormSchemaDefaults<
  TCasing extends CasingType,
  TStorageKey extends string
> = {
  /**
   * The default casing transformation to use.
   * @default 'title'
   */
  nameTransformCasing?: TCasing;
  /**
   * The default key that the form data will be stored under.
   * @default 'MultiStepForm'
   */
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
  /**
   * Default configurations that can be set.
   */
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

const DEFAULT_STORAGE_KEY = 'MultiStepForm';

export class MultiStepFormSchema<
  step extends Step<casing>,
  resolvedStep extends ResolvedStep<step, InferStepOptions<step>, casing>,
  stepNumbers extends StepNumbers<resolvedStep>,
  casing extends CasingType,
  storageKey extends string
> extends Subscribable<MultiStepFormSchemaListener<step, casing, storageKey>> {
  readonly storageKey: storageKey;
  readonly defaultNameTransformationCasing: casing;
  readonly stepSchema: MultiStepFormStepSchema<
    step,
    resolvedStep,
    stepNumbers,
    casing
  >;
  storage: MultiStepFormStorage<storageKey, resolvedStep>;

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
    this.storage = new MultiStepFormStorage({
      key: (defaults?.storageKey ?? DEFAULT_STORAGE_KEY) as storageKey,
      data: this.stepSchema.value,
    });
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

export function createMultiStepFormSchema<
  step extends Step<casing>,
  resolvedStep extends ResolvedStep<step, InferStepOptions<step>, casing>,
  stepNumbers extends StepNumbers<resolvedStep>,
  casing extends CasingType = DefaultCasing,
  storageKey extends string = typeof DEFAULT_STORAGE_KEY
>(
  options: MultiStepFormSchemaOptions<
    step,
    // Allows full autocomplete
    Constrain<casing, CasingType>,
    storageKey
  >
) {
  return new MultiStepFormSchema<
    step,
    resolvedStep,
    stepNumbers,
    casing,
    storageKey
  >(options);
}
