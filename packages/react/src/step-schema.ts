import type { casing } from '@multi-step-form/casing';
import type { types } from '@multi-step-form/compile-time-utils';
import { MultiStepFormStepSchema as MultiStepFormStepSchemaBase } from '@multi-step-form/core';
import type {
  AnyResolvedStep,
  CreateHelperFunctionOptionsBase,
  DefaultCasing,
  HelperFnChosenSteps,
  HelperFnInputBase,
  InferStepOptions,
  MultiStepFormSchemaStepConfig,
  ResolvedStep,
  Step,
  StepNumbers,
} from '@multi-step-form/shared-utils';
import type { ReactNode } from 'react';

export type CreateComponentCallback<
  TResolvedStep extends AnyResolvedStep,
  TSteps extends StepNumbers<TResolvedStep>,
  TChosenSteps extends HelperFnChosenSteps<TResolvedStep, TSteps>,
  TProps
> = (
  input: HelperFnInputBase<TResolvedStep, TSteps, TChosenSteps>,
  props: TProps
) => ReactNode;
export type CreatedMultiStepFormComponent<TProps> = TProps extends undefined
  ? () => ReactNode
  : (props: TProps) => ReactNode;
export interface HelperFunctions<
  TStep extends Step<TCasing>,
  TResolvedStep extends ResolvedStep<TStep, InferStepOptions<TStep>, TCasing>,
  TSteps extends StepNumbers<TResolvedStep>,
  TCasing extends casing.CasingType
> {
  createComponent<
    chosenSteps extends HelperFnChosenSteps<TResolvedStep, TSteps>,
    props = undefined
  >(
    options: CreateHelperFunctionOptionsBase<
      TResolvedStep,
      TSteps,
      chosenSteps
    >,
    fn: CreateComponentCallback<TResolvedStep, TSteps, chosenSteps, props>
  ): CreatedMultiStepFormComponent<props>;
}

export class MultiStepFormStepSchema<
    step extends Step<casing>,
    resolvedStep extends ResolvedStep<step, InferStepOptions<step>, casing>,
    stepNumbers extends StepNumbers<resolvedStep>,
    casing extends casing.CasingType = DefaultCasing
  >
  extends MultiStepFormStepSchemaBase<step, resolvedStep, stepNumbers, casing>
  implements HelperFunctions<step, resolvedStep, stepNumbers, casing>
{
  constructor(
    config: MultiStepFormSchemaStepConfig<step, types.Constrain<casing, casing.CasingType>>
  ) {
    super(config);
  }

  createComponent<
    chosenSteps extends HelperFnChosenSteps<resolvedStep, stepNumbers>,
    props = undefined
  >(
    options: CreateHelperFunctionOptionsBase<
      resolvedStep,
      stepNumbers,
      chosenSteps
    >,
    fn: CreateComponentCallback<resolvedStep, stepNumbers, chosenSteps, props>
  ): CreatedMultiStepFormComponent<props> {
    const { stepData } = options;
    const ctx = this.stepHelper.createCtx(stepData);

    return ((props?: props) => fn({ ctx }, props as any)) as any;
  }
}
