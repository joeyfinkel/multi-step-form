import { path } from '@/internals';
import type { DeepKeys, Join, Split } from '@/utils';
import type { AnyResolvedStep, GetFieldsForStep } from './types';

export namespace fields {
  type GetDeepFields<TFields> = [keyof TFields] extends [never]
    ? never
    : {
        [_ in keyof TFields]: TFields[_] extends Record<
          'defaultValue',
          infer value
        >
          ? keyof value extends never
            ? TFields
            : DeepKeys<{ [field in _]: TFields[_]['defaultValue'] }>
          : never;
      }[keyof TFields];
  export type get<
    TResolvedStep extends AnyResolvedStep,
    TStep extends keyof TResolvedStep,
    TFields extends GetFieldsForStep<TResolvedStep, TStep> = GetFieldsForStep<
      TResolvedStep,
      TStep
    >
  > = TFields;
  export type removeParentPath<T extends string> = Split<T, '.'> extends [
    infer _,
    ...infer rest
  ]
    ? rest extends string[]
      ? Join<rest, '.'>
      : never
    : never;
  export type getDeep<
    TResolvedStep extends AnyResolvedStep,
    TStep extends keyof TResolvedStep
  > = GetDeepFields<
    get<TResolvedStep, TStep>
  > extends infer value extends string
    ? value
    : never;
  export type parentOf<T extends string> = Split<T, '.'>[0];
  export type resolveDeepPath<
    TResolvedStep extends AnyResolvedStep,
    TTargetStep extends keyof TResolvedStep,
    TField extends getDeep<TResolvedStep, TTargetStep>,
    TParent extends parentOf<TField> = parentOf<TField>,
    TDefaultValue = get<TResolvedStep, TTargetStep>[TParent]['defaultValue']
  > = removeParentPath<TField> extends never
    ? TDefaultValue
    : path.pickBy<TDefaultValue, removeParentPath<TField>>;

  // TODO add field validation
  export function resolvedDeepPath<
    resolvedStep extends AnyResolvedStep,
    targetStep extends keyof resolvedStep,
    fields extends get<resolvedStep, targetStep>,
    fieldPath extends getDeep<resolvedStep, targetStep>
  >(fieldPath: fieldPath, fields: fields, filler = 'defaultValue') {
    const [parent, ...children] = fieldPath.split('.');
    const shared = `${parent}.${filler}`;
    const fullPath = (
      children.length === 0 ? shared : `${shared}.${children.join('.')}`
    ) as DeepKeys<fields>;

    const resolvedValue = path.pickBy(fields, fullPath) as resolveDeepPath<
      resolvedStep,
      targetStep,
      fieldPath
    >;

    return resolvedValue;
  }
}
