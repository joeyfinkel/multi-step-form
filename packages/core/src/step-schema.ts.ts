import { type } from 'arktype';
import { changeCasing, type CasingType } from './casing';
import { invariant, type Constrain, type Expand, type Updater } from './utils';
import {
  runStandardValidation,
  type AnyValidator,
  type DefaultValidator,
  type StandardSchemaValidator,
} from './validators';

type CreateDefaultString<T extends string, Default extends T> = Default;

export type StringFieldType = 'phone' | 'email' | 'time';
export type NumberFieldType = 'counter';
export type BooleanFieldType = 'switch';
export type FieldType =
  | 'string'
  | `string.${StringFieldType}`
  | 'number'
  | `number.${NumberFieldType}`
  | 'date'
  | 'dateTime'
  | `boolean.${BooleanFieldType}`;

export type DefaultCasing = CreateDefaultString<CasingType, 'title'>;
export type DefaultFieldType = CreateDefaultString<FieldType, 'string'>;
export type StepField<
  in out Name extends string,
  in out Type extends FieldType,
  in out Casing extends CasingType,
  in out DefaultValue
> = {
  /**
   * The name of the field.
   */
  name: Name;
  defaultValue: DefaultValue;
  /**
   * The type of the field.
   *
   * @default 'string'
   */
  type?: Type;
  // TODO add support for confirmation modal
  // /**
  //  * How the field should be displayed when on the confirmation modal.
  //  *
  //  * By default it will be the same as regular field config.
  //  */
  // onConfirmationConfig?: Omit<
  //   StepField<Name, FieldType, unknown>,
  //   'name' | 'onConfirmationConfig'
  // >;
  /**
   * The text for the label.
   *
   * If omitted, it will default to the specified casing.
   *
   * If `false`, `label` will be `undefined`, meaning there won't
   * be a label for this field.
   */
  label?: string | false;
  /**
   * How the `name` should be transformed for the `label`.
   *
   * If omitted, the default will be whatever is set during {@linkcode MultiStepFormSchema} initialization.
   */
  nameTransformCasing?: Casing;
};
export type StepOptions<
  in out Casing extends CasingType = CasingType,
  in out Field extends StepField<
    string,
    FieldType,
    CasingType,
    unknown
  > = StepField<string, FieldType, CasingType, unknown>,
  in out FieldValidator = unknown
> = {
  title: string;
  description?: string;
  fields: Array<Field>;
  nameTransformCasing?: Casing;
  /**
   * Validator for the fields.
   */
  validateFields?: Constrain<FieldValidator, AnyValidator, DefaultValidator>;
  /**
   * Helper functions for the current step.
   */
  functions?: Function;
};
export type Step<
  step extends number = number,
  options extends StepOptions<
    CasingType,
    StepField<string, FieldType, CasingType, unknown>,
    unknown
  > = StepOptions<
    CasingType,
    StepField<string, FieldType, CasingType, unknown>,
    unknown
  >
> = Record<ValidStepKey<step>, options>;

export type MultiStepFormSchemaStore<in out Key extends string> = {
  key?: Key;
  store?: Storage;
};
type SetDefault<T, Defaults> = {
  // All the keys from T
  [K in keyof T]-?: K extends keyof Defaults
    ? undefined extends T[K]
      ? Exclude<T[K], undefined> | Defaults[K] // optional -> upgraded with default
      : T[K] // already required, don't touch
    : T[K];
} & {
  // Any defaults not in T get added
  [K in Exclude<keyof Defaults, keyof T>]-?: Defaults[K];
};
type GetFieldsForStep<
  Steps extends InferStepOptions<any>,
  Key extends keyof Steps
> = Steps[Key] extends {
  fields: infer fields extends Array<
    StepField<string, FieldType, CasingType, unknown>
  >;
}
  ? fields[number]
  : never;
type GetFieldNames<
  InferredSteps extends InferStepOptions<any>,
  Key extends keyof InferredSteps
> = GetFieldsForStep<InferredSteps, Key>['name'];
type GetDefaultCasingTransformation<
  Step extends InferStepOptions<any>,
  Key extends keyof Step
> = Step[Key] extends { nameTransformCasing: infer casing extends CasingType }
  ? casing
  : DefaultCasing;
export type ResolvedStep<
  T extends Step,
  InferredSteps extends InferStepOptions<T> = InferStepOptions<T>
> = Expand<{
  [stepKey in keyof InferredSteps]: Expand<
    SetDefault<
      Omit<InferredSteps[stepKey], 'fields' | 'validateFields'>,
      {
        type: DefaultFieldType;
        nameTransformCasing: GetDefaultCasingTransformation<
          InferredSteps,
          stepKey
        >;
      }
    > & {
      fields: {
        [name in GetFieldNames<InferredSteps, stepKey>]: Expand<
          // current field information for the `name`
          SetDefault<
            Omit<
              Extract<GetFieldsForStep<InferredSteps, stepKey>, { name: name }>,
              'name'
            >,
            {
              type: DefaultFieldType;
              nameTransformCasing: GetDefaultCasingTransformation<
                InferredSteps,
                stepKey
              >;
              label: string;
            }
          >
        >;
      };
    }
  >;
}>;

type ErrorMessage<Message extends string = string> = Message;
type InvalidKeys<T, Pattern extends string> = {
  [K in keyof T]: K extends Pattern ? never : K;
}[keyof T];
type UnionToIntersection<U> = (
  U extends any ? (k: (x: U) => void) => void : never
) extends (k: infer I) => void
  ? I
  : never;

// Extract the "last" type from a union
type LastOf<U> = UnionToIntersection<
  U extends any ? (x: U) => void : never
> extends (x: infer P) => void
  ? P
  : never;

// Push union into a tuple (preserving order)
type Push<U, T extends any[]> = [...T, U];
type TuplifyUnion<U, T extends any[] = []> = [U] extends [never]
  ? T
  : TuplifyUnion<Exclude<U, LastOf<U>>, Push<LastOf<U>, T>>;

// Join a tuple of strings with a delimiter
type Join<T extends string[], D extends string> = T extends [
  infer F extends string,
  ...infer R extends string[]
]
  ? R['length'] extends 0
    ? F
    : `${F}${D}${Join<R, D>}`
  : '';

// Put it all together: Join a union of strings
type JoinUnion<U extends string, D extends string> = Join<
  Constrain<TuplifyUnion<U>, string[]>,
  D
>;

type ValidStepKey<N extends number = number> = `step${N}`;
type ExtractStepFromKey<T extends string> = T extends ValidStepKey<infer N>
  ? N
  : never;
export type InferStepOptions<T> = T extends {
  [K in keyof T extends ValidStepKey ? keyof T : never]: StepOptions<
    infer _casing extends CasingType,
    infer _stepField extends StepField<string, FieldType, CasingType, unknown>,
    infer _fieldValidator
  >;
}
  ? T
  : Exclude<keyof T, ValidStepKey>;
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K;
}[keyof T];
type RequiredProps<T> = Pick<T, RequiredKeys<T>>;
// type InferStepOptions<T> = [T] extends [object]
//   ? Exclude<keyof T, ValidStepKey> extends never
//     ? {
//         [key in keyof T]: T[key] extends StepOptions<
//           infer _casing extends CasingType,
//           infer _stepField extends StepField<
//             string,
//             FieldType,
//             CasingType,
//             unknown
//           >,
//           infer _fieldValidator
//         >
//           ? Exclude<keyof T[key], keyof StepOptions> extends never
//             ? T[key]
//             : ErrorMessage<`The following keys are invalid: [${Join<
//                 UnionToTuple<Exclude<keyof T[key], keyof StepOptions>>,
//                 ', '
//               >}]`>
//           : ErrorMessage<`Must be an object of type StepOptions`>;
//       }
//     : ErrorMessage<`Step config keys must follow the pattern: "step{number}". Invalid keys include: [${Join<
//         UnionToTuple<Exclude<keyof T, ValidStepKey>>,
//         ', '
//       >}]`>
//   : ErrorMessage<'Step config must be an object with valid keys (step{number})'>;
type Range = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type ClampTo0to10<N extends number> = N extends Range
  ? N
  : // if higher than 10 → 10, if lower than 0 → 0
  number extends N
  ? never // catches the `number` type, not a literal
  : `${N}` extends `-${string}`
  ? 0
  : 10;
type Tuple<N extends number, R extends any[] = []> = R['length'] extends N
  ? R
  : Tuple<N, [...R, any]>;

type GreaterThan<A extends Range, B extends Range> = Tuple<A> extends [
  ...Tuple<B>,
  ...infer _
]
  ? Tuple<B> extends [...Tuple<A>, ...infer _]
    ? false
    : true
  : false;
type Max<T extends number[]> = T extends [
  infer A extends number,
  ...infer Rest extends number[]
]
  ? Rest['length'] extends 0
    ? ClampTo0to10<A>
    : Max<Rest> extends infer M extends Range
    ? GreaterThan<ClampTo0to10<A>, M> extends true
      ? ClampTo0to10<A>
      : M
    : never
  : never;

type Min<T extends number[]> = T extends [
  infer A extends number,
  ...infer Rest extends number[]
]
  ? Rest['length'] extends 0
    ? ClampTo0to10<A>
    : Min<Rest> extends infer M extends Range
    ? GreaterThan<ClampTo0to10<A>, M> extends true
      ? M
      : ClampTo0to10<A>
    : never
  : never;
type UnionToTuple<T> = (
  (T extends any ? (t: T) => T : never) extends infer U
    ? (U extends any ? (u: U) => any : never) extends (v: infer V) => any
      ? V
      : never
    : never
) extends (_: any) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : [];
export type LastStep<T extends ResolvedStep<any>> = keyof T extends ValidStepKey
  ? Max<
      Constrain<
        UnionToTuple<ExtractStepFromKey<Constrain<keyof T, string>>>,
        number[]
      >
    >
  : never;
export type FirstStep<T extends ResolvedStep<any>> =
  keyof T extends ValidStepKey
    ? Min<
        Constrain<
          UnionToTuple<ExtractStepFromKey<Constrain<keyof T, string>>>,
          number[]
        >
      >
    : never;
type GetCurrentStep<
  T extends ResolvedStep<any>,
  S extends ExtractStepFromKey<Constrain<keyof T, string>>
> = ValidStepKey<S> extends Constrain<keyof T, string>
  ? T[ValidStepKey<S>]
  : never;
type StepData<
  T extends ResolvedStep<any>,
  Step extends ExtractStepFromKey<Constrain<keyof T, string>>
> = {
  /**
   * The step number.
   */
  step: Step;
  /**
   * The step data.
   */
  data: GetCurrentStep<T, Step>;
};

const DEFAULT_CASING: CasingType = 'title';
const DEFAULT_FIELD_TYPE: FieldType = 'string';

function createFieldLabel(
  label: string | false | undefined,
  fieldName: string,
  casingType: CasingType
) {
  return label ?? changeCasing(fieldName, casingType);
}

export class MultiStepFormStepSchema<T extends Step> {
  /**
   * The original config before any validation or transformations have been applied.
   */
  readonly original: InferStepOptions<T>;
  readonly value: ResolvedStep<T>;
  readonly lastStep: StepData<ResolvedStep<T>, LastStep<ResolvedStep<T>>>;
  readonly validStepRegex = /^step\d+$/i;
  private readonly stepNumbers: Array<number>;

  constructor(config: InferStepOptions<T>) {
    this.original = config;
    this.value = this.createStep(this.original);
    this.stepNumbers = Object.keys(this.value).map((key) =>
      parseInt(key.replace('step', ''))
    );
    this.lastStep = this.last();
  }

  private createStepFields(options: {
    fields: StepField<string, FieldType, CasingType, unknown>[];
    validateFields:
      | Constrain<unknown, AnyValidator, DefaultValidator>
      | undefined;
    defaultCasing: CasingType;
  }) {
    const resolvedFields: Record<string, unknown> = {};
    const { fields, defaultCasing, validateFields } = options;

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];

      invariant(field, `Missing field config at index ${i} of "fields"`);
      invariant(
        typeof field === 'object',
        `Field config at index ${i} must be an object, was (${typeof field})`
      );

      const {
        defaultValue,
        name,
        label,
        nameTransformCasing,
        type = DEFAULT_FIELD_TYPE,
      } = field;

      if (validateFields) {
        resolvedFields[name] = defaultValue;
      } else {
        const casing = nameTransformCasing ?? defaultCasing;

        resolvedFields[name] = {
          ...(resolvedFields[name] as Record<string, unknown>),
          nameTransformCasing: casing,
          type,
          defaultValue,
          label: createFieldLabel(label, name, casing),

          // TODO add more fields here
        };
      }
    }

    if (validateFields) {
      const validatedFields = runStandardValidation(
        validateFields as StandardSchemaValidator,
        resolvedFields
      );

      invariant(
        typeof validatedFields === 'object',
        `The result of the validated fields must be an object, was (${typeof validatedFields}). This is probably an internal error, so open up an issue about it`
      );
      invariant(
        !!validatedFields,
        'The result of the validated fields must be defined. This is probably an internal error, so open up an issue about it'
      );

      for (const [name, defaultValue] of Object.entries(validatedFields)) {
        const currentField = fields.find((field) => field.name === name);

        invariant(
          currentField,
          `No field found in the fields config for "${name}"`
        );

        const {
          label,
          type = DEFAULT_FIELD_TYPE,
          nameTransformCasing,
        } = currentField;
        const casing = nameTransformCasing ?? defaultCasing;

        resolvedFields[name] = {
          ...(resolvedFields[name] as Record<string, unknown>),
          nameTransformCasing: casing,
          type,
          defaultValue,
          label: createFieldLabel(label, name, casing),
        };
      }
    }

    return resolvedFields;
  }

  createStep(stepsConfig: InferStepOptions<T>) {
    const resolvedSteps = {} as ResolvedStep<T>;

    invariant(!!stepsConfig, 'The steps config must be defined', TypeError);
    invariant(
      typeof stepsConfig === 'object',
      `The steps config must be an object, was (${typeof stepsConfig})`,
      TypeError
    );

    for (const [stepKey, stepValue] of Object.entries(stepsConfig)) {
      invariant(
        typeof stepKey === 'string',
        `Each key for the step config must be a string. Key "${stepKey}" was ${typeof stepKey} `,
        TypeError
      );
      invariant(
        this.validStepRegex.test(stepKey),
        `The key "${stepKey}" isn't formatted properly. Each key in the step config must be the following format: "step{number}"`
      );

      const validStepKey = stepKey as keyof ResolvedStep<T>;
      const {
        fields,
        title,
        nameTransformCasing: defaultCasing = DEFAULT_CASING,
        description,
        validateFields,
      } = stepValue;

      const currentStep = validStepKey.toString().replace('step', '');

      invariant(
        fields,
        `Missing fields for step ${currentStep} (${String(validStepKey)})`,
        TypeError
      );
      invariant(Array.isArray(fields), 'Fields must be an array', TypeError);
      invariant(
        fields.length > 0,
        `The fields config for step ${currentStep} (${String(
          validStepKey
        )}) is empty. Please add a field`
      );

      const resolvedFields = this.createStepFields({
        defaultCasing,
        fields,
        validateFields,
      });

      resolvedSteps[validStepKey] = {
        ...resolvedSteps[validStepKey],
        title,
        nameTransformCasing: defaultCasing,
        // Only add the description if it's defined
        ...(typeof description === 'string' ? { description } : {}),
        fields: resolvedFields,
      };
    }

    return resolvedSteps;
  }

  /**
   * Gets the step data associated with the target step number.
   * @returns The step data for the target step number.
   */
  get<
    Step extends ExtractStepFromKey<Constrain<keyof ResolvedStep<T>, string>>
  >(options: { step: Step }) {
    const { step } = options;
    const stepKey = `step${step}` as const;

    const data = this.value[stepKey as keyof ResolvedStep<T>] as GetCurrentStep<
      ResolvedStep<T>,
      Step
    >;

    return { step, data };
  }

  /**
   * Gets the data for the first step.
   * @returns The data for the first step.
   */
  first() {
    const firstStep = Math.min(...this.stepNumbers) as FirstStep<
      ResolvedStep<T>
    >;

    return this.get({ step: firstStep });
  }

  /**
   * Gets the data for the last step.
   * @returns The data for the last step.
   */
  last() {
    const lastStep = Math.max(...this.stepNumbers);

    return this.get<LastStep<ResolvedStep<T>>>({ step: lastStep as never });
  }

  /**
   * Update the data for a specified step.
   * @param step The step to update.
   * @param updater The updated data for the step.
   */
  update<
    Step extends ExtractStepFromKey<Constrain<keyof ResolvedStep<T>, string>>
  >(step: Step, updater: Updater<GetCurrentStep<ResolvedStep<T>, Step>>): void;
  /**
   * Update a specific field's data for the specified step.
   * @param step The step to update.
   * @param field The field to update.
   * @param updater The updated data for field.
   */
  update<
    Step extends ExtractStepFromKey<Constrain<keyof ResolvedStep<T>, string>>,
    Field extends keyof GetCurrentStep<ResolvedStep<T>, Step>
  >(
    step: Step,
    field: Field,
    updater: Updater<GetCurrentStep<ResolvedStep<T>, Step>[Field]>
  ): void;
  update<
    Step extends ExtractStepFromKey<Constrain<keyof ResolvedStep<T>, string>>,
    Field extends keyof GetCurrentStep<ResolvedStep<T>, Step>
  >(
    step: Step,
    fieldOrUpdated: Field | object | Function,
    updater?: object | Function
  ) {
    const steps = Object.keys(this.value).map((key) =>
      parseInt(key.replace('step', ''))
    );
    invariant(
      typeof step === 'number',
      `Type of step must be a number, was ${typeof step}`,
      TypeError
    );
    invariant(
      steps.includes(step),
      `The target step ${step} is not valid. Valid steps include "${steps.join(
        ', '
      )}"`
    );

    const stepKey = `step${step}` as keyof ResolvedStep<T>;

    if (typeof fieldOrUpdated === 'string') {
      invariant(
        typeof updater === 'function' || typeof updater === 'object',
        `The updater must be a function or object, was ${typeof updater}`,
        TypeError
      );
      invariant(this.value[stepKey], `No data found for step ${step}`);
      invariant(
        typeof this.value[stepKey] === 'object',
        `The values for step ${step} is not an object, was ${typeof this.value[
          stepKey
        ]}`
      );
      invariant(
        fieldOrUpdated in this.value[stepKey],
        `The field ${fieldOrUpdated} is not a valid field. Valid fields include ${Object.keys(
          this.value[stepKey]
        ).join(', ')}`
      );

      this.value[stepKey] = {
        ...this.value[stepKey],
        [fieldOrUpdated]:
          typeof updater === 'function'
            ? updater(
                this.value[stepKey][
                  fieldOrUpdated as keyof (keyof ResolvedStep<T>)
                ]
              )
            : updater,
      };
    } else if (
      typeof fieldOrUpdated === 'object' ||
      typeof fieldOrUpdated === 'function'
    ) {
      const updatedData =
        typeof updater === 'function' ? updater(this.value[stepKey]) : updater;

      invariant(
        typeof updatedData === 'object',
        `The updated data must be an object, was ${typeof updatedData}`
      );

      this.value[stepKey] = {
        ...this.value[stepKey],
        ...updatedData,
      };
    } else {
      throw new TypeError(
        `The second parameter must be one of the following: a specific field to update (string), an object with the updated data, or a function that returns the updated data. It was ${typeof fieldOrUpdated}`,
        { cause: fieldOrUpdated }
      );
    }
  }
}
