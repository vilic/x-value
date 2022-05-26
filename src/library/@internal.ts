import type {
  Denominalize,
  Nominal,
  TypeInMediumsPartial,
  TypeIssue,
  TypePath,
  __nominal,
  __type,
} from './type';

export const hasOwnProperty = Object.prototype.hasOwnProperty;

export const toString = Object.prototype.toString;

export type RefinedMediumType<
  TInMedium,
  TNominalKey extends string | symbol,
  TRefinement,
> = [TNominalKey] extends [never]
  ? TInMedium & TRefinement
  : __RefinedNominalType<TInMedium & TRefinement, Nominal<TNominalKey>>;

type __RefinedNominalType<T, TNominal extends NominalPartial> = T &
  (TNominal & Record<__type, Denominalize<T>>);

export type TupleInMedium<
  TTypeTuple extends TypeInMediumsPartial[],
  TMediumName extends XValue.UsingName,
> = {
  [TIndex in keyof TTypeTuple]: TTypeTuple[TIndex] extends TypeInMediumsPartial<
    infer TElementInMediums
  >
    ? TElementInMediums[TMediumName]
    : never;
};

export type MediumTypesPackedType<
  TMediumTypes,
  TFallback = never,
> = TMediumTypes extends {
  packed: infer TPacked;
}
  ? TPacked
  : TFallback;

export type ElementOrArray<T> = T | T[];

export type NominalPartial = Record<__nominal, unknown>;

export function merge(partials: unknown[]): unknown {
  let pendingMergeKeyToValues: Map<string | number, unknown[]> | undefined;

  let merged = partials.reduce((merged, partial) => {
    if (merged === partial) {
      return merged;
    }

    if (typeof merged === 'object') {
      if (merged === null) {
        // merged !== partial
        throw new TypeError();
      }

      if (typeof partial !== 'object' || partial === null) {
        throw new TypeError();
      }

      for (let [key, value] of Object.entries(partial)) {
        let pendingMergeValues: unknown[] | undefined;

        if (pendingMergeKeyToValues) {
          pendingMergeValues = pendingMergeKeyToValues.get(key);
        } else {
          pendingMergeKeyToValues = new Map();
        }

        if (pendingMergeValues) {
          pendingMergeValues.push(value);
        } else if (hasOwnProperty.call(merged, key)) {
          pendingMergeKeyToValues.set(key, [(merged as any)[key], value]);
        } else {
          (merged as any)[key] = value;
        }
      }

      return merged;
    }

    return partial;
  });

  if (pendingMergeKeyToValues) {
    for (let [key, values] of pendingMergeKeyToValues) {
      (merged as any)[key] = merge(values);
    }
  }

  return merged;
}

export function buildTypeIssue(error: unknown, path: TypePath): TypeIssue;
export function buildTypeIssue(
  error: string | Error,
  path: TypePath,
): TypeIssue {
  return {
    path,
    message: typeof error === 'string' ? error : error.message,
  };
}
