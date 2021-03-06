import {hasNonDeferrableTypeIssue, toString} from '../@internal';
import type {Medium} from '../medium';

import type {
  Exact,
  TypeInMediumsPartial,
  TypeIssue,
  TypePath,
  __type_in_mediums,
} from './type';
import {DISABLED_EXACT_CONTEXT_RESULT, Type, __type_kind} from './type';

export class RecordType<
  TKeyType extends TypeInMediumsPartial,
  TValueType extends TypeInMediumsPartial,
> extends Type<RecordInMediums<TKeyType, TValueType>> {
  [__type_kind]!: 'record';

  constructor(Key: TKeyType, Value: TValueType);
  constructor(readonly Key: Type, readonly Value: Type) {
    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    if (typeof unpacked !== 'object' || unpacked === null) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting unpacked value to be a non-null object, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    let Key = this.Key;
    let Value = this.Value;

    let {context, nestedExact} = this.getExactContext(exact, false);

    context?.neutralize();

    let entries: [string | number, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, unpackedValue] of getRecordEntries(unpacked)) {
      let [value, valueIssues] = Value._decode(
        medium,
        unpackedValue,
        [...path, key],
        nestedExact,
      );

      entries.push([key, value]);
      issues.push(
        ...Key._diagnose(key, [...path, {key}], nestedExact),
        ...valueIssues,
      );
    }

    return [
      hasNonDeferrableTypeIssue(issues)
        ? undefined
        : buildRecord(entries, unpacked),
      issues,
    ];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    if (diagnose && (typeof value !== 'object' || value === null)) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting value to be a non-null object, getting ${toString.call(
              value,
            )}.`,
          },
        ],
      ];
    }

    let Key = this.Key;
    let Value = this.Value;

    let {context, nestedExact} = diagnose
      ? this.getExactContext(exact, false)
      : DISABLED_EXACT_CONTEXT_RESULT;

    context?.neutralize();

    let entries: [string | number, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, nestedValue] of getRecordEntries(value as object)) {
      let [unpacked, valueIssues] = Value._encode(
        medium,
        nestedValue,
        [...path, key],
        nestedExact,
        diagnose,
      );

      entries.push([key, unpacked]);
      issues.push(
        ...Key._diagnose(key, [...path, {key}], nestedExact),
        ...valueIssues,
      );
    }

    return [
      hasNonDeferrableTypeIssue(issues)
        ? undefined
        : buildRecord(entries, value as object),
      issues,
    ];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    if (typeof unpacked !== 'object' || unpacked === null) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting unpacked value to be a non-null object, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    let Key = this.Key;
    let Value = this.Value;

    let {context, nestedExact} = this.getExactContext(exact, false);

    context?.neutralize();

    let entries: [string | number, unknown][] = [];
    let issues: TypeIssue[] = [];

    for (let [key, unpackedValue] of getRecordEntries(unpacked)) {
      let [transformedUnpacked, valueIssues] = Value._transform(
        from,
        to,
        unpackedValue,
        [...path, key],
        nestedExact,
      );

      entries.push([key, transformedUnpacked]);
      issues.push(
        ...Key._diagnose(key, [...path, {key}], nestedExact),
        ...valueIssues,
      );
    }

    return [
      hasNonDeferrableTypeIssue(issues)
        ? undefined
        : buildRecord(entries, unpacked),
      issues,
    ];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    if (typeof value !== 'object' || value === null) {
      return [
        {
          path,
          message: `Expecting a non-null object, getting ${toString.call(
            value,
          )}.`,
        },
      ];
    }

    let Key = this.Key;
    let Value = this.Value;

    let {context, nestedExact} = this.getExactContext(exact, false);

    context?.neutralize();

    return getRecordEntries(value).flatMap(([key, nestedValue]) => [
      ...Key._diagnose(key, [...path, {key}], nestedExact),
      ...Value._diagnose(nestedValue, [...path, key], nestedExact),
    ]);
  }
}

export function record<
  TKeyType extends TypeInMediumsPartial,
  TValueType extends TypeInMediumsPartial,
>(Key: TKeyType, Value: TValueType): RecordType<TKeyType, TValueType> {
  return new RecordType(Key, Value);
}

type RecordInMediums<
  TKeyType extends TypeInMediumsPartial,
  TValueType extends TypeInMediumsPartial,
> = {
  [TMediumName in XValue.UsingName]: Record<
    Extract<TKeyType[__type_in_mediums][TMediumName], string | symbol>,
    TValueType[__type_in_mediums][TMediumName]
  >;
};

function getRecordEntries(value: object): [string | number, unknown][] {
  if (Array.isArray(value)) {
    return [...value.entries()];
  } else {
    return Object.entries(value);
  }
}

function buildRecord(
  entries: [string | number, unknown][],
  source: object,
): Record<string, unknown> | unknown[] {
  if (Array.isArray(source)) {
    let array: unknown[] = [];

    for (let [index, value] of entries) {
      array[index as number] = value;
    }

    return array;
  } else {
    return Object.fromEntries(entries);
  }
}
