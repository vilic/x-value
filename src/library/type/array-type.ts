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

export class ArrayType<TElementType extends TypeInMediumsPartial> extends Type<
  ArrayInMediums<TElementType>
> {
  [__type_kind]!: 'array';

  constructor(ElementType: TElementType);
  constructor(readonly ElementType: Type) {
    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    if (!Array.isArray(unpacked)) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting unpacked value to be an array, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    let ElementType = this.ElementType;

    let {context, nestedExact} = this.getExactContext(exact, false);

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, unpackedElement] of unpacked.entries()) {
      let [element, entryIssues] = ElementType._decode(
        medium,
        unpackedElement,
        [...path, index],
        nestedExact,
      );

      value.push(element);
      issues.push(...entryIssues);
    }

    context?.addKeys(Array.from(unpacked.keys(), key => key.toString()));

    return [hasNonDeferrableTypeIssue(issues) ? undefined : value, issues];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    if (diagnose && !Array.isArray(value)) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting value to be an array, getting ${toString.call(
              value,
            )}.`,
          },
        ],
      ];
    }

    let ElementType = this.ElementType;

    let {context, nestedExact} = diagnose
      ? this.getExactContext(exact, false)
      : DISABLED_EXACT_CONTEXT_RESULT;

    let unpacked: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, valueElement] of (value as unknown[]).entries()) {
      let [unpackedElement, entryIssues] = ElementType._encode(
        medium,
        valueElement,
        [...path, index],
        nestedExact,
        diagnose,
      );

      unpacked.push(unpackedElement);
      issues.push(...entryIssues);
    }

    context?.addKeys(
      Array.from((value as unknown[]).keys(), key => key.toString()),
    );

    return [hasNonDeferrableTypeIssue(issues) ? undefined : unpacked, issues];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    if (!Array.isArray(unpacked)) {
      return [
        undefined,
        [
          {
            path,
            message: `Expecting unpacked value to be an array, getting ${toString.call(
              unpacked,
            )}.`,
          },
        ],
      ];
    }

    let ElementType = this.ElementType;

    let {context, nestedExact} = this.getExactContext(exact, false);

    let value: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let [index, unpackedElement] of unpacked.entries()) {
      let [element, entryIssues] = ElementType._transform(
        from,
        to,
        unpackedElement,
        [...path, index],
        nestedExact,
      );

      value.push(element);
      issues.push(...entryIssues);
    }

    context?.addKeys(Array.from(unpacked.keys(), key => key.toString()));

    return [hasNonDeferrableTypeIssue(issues) ? undefined : value, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    if (!Array.isArray(value)) {
      return [
        {
          path,
          message: `Expecting an array, getting ${toString.call(value)}.`,
        },
      ];
    }

    let ElementType = this.ElementType;

    let {context, nestedExact} = this.getExactContext(exact, false);

    let issues = value.flatMap((element, index) =>
      ElementType._diagnose(element, [...path, index], nestedExact),
    );

    context?.addKeys(Array.from(value.keys(), key => key.toString()));

    return issues;
  }
}

export function array<TElementType extends TypeInMediumsPartial>(
  ElementType: TElementType,
): ArrayType<TElementType> {
  return new ArrayType(ElementType);
}

type ArrayInMediums<TElementType extends TypeInMediumsPartial> = {
  [TKey in XValue.UsingName]: TElementType[__type_in_mediums][TKey][];
};
