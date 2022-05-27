import type {RefinedMediumType} from '../@internal';
import {buildTypeIssue} from '../@internal';
import type {Medium} from '../medium';

import type {
  Exact,
  TypeConstraint,
  TypeInMediumsPartial,
  TypeIssue,
  TypePath,
  TypesInMediums,
  __type_in_mediums,
} from './type';
import {Type, __type_kind} from './type';

export class RefinedType<
  TType extends TypeInMediumsPartial,
  TNominalKey extends string | symbol,
  TRefinement,
> extends Type<RefinedInMediums<TType, TNominalKey, TRefinement>> {
  [__type_kind]!: 'refined';

  constructor(Type: TType, constraints: TypeConstraint[]);
  constructor(readonly Type: Type, readonly constraints: TypeConstraint[]) {
    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    let [exactContext, nestedExact, inherited] = this.getExactContext(
      exact,
      true,
    );

    let [value, issues] = this.Type._decode(
      medium,
      unpacked,
      path,
      nestedExact,
    );

    if (issues.length === 0) {
      issues = this.diagnoseConstraints(value, path);
    }

    if (exactContext && !inherited) {
      issues.push(...exactContext.getIssues(unpacked, path));
    }

    return [issues.length === 0 ? value : undefined, issues];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    exact: Exact,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    let [exactContext, nestedExact, inherited] = diagnose
      ? this.getExactContext(exact, true)
      : [undefined, false, false];

    let [unpacked, issues] = this.Type._encode(
      medium,
      value,
      path,
      nestedExact,
      diagnose,
    );

    if (issues.length > 0) {
      return [undefined, issues];
    }

    if (diagnose) {
      issues = this.diagnoseConstraints(value, path);

      if (exactContext && !inherited) {
        issues.push(...exactContext.getIssues(value, path));
      }
    }

    return [issues.length === 0 ? unpacked : undefined, issues];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
    exact: Exact,
  ): [unknown, TypeIssue[]] {
    let [value, issues] = this._decode(from, unpacked, path, exact);

    if (issues.length > 0) {
      return [undefined, issues];
    }

    return this._encode(to, value, path, false, false);
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath, exact: Exact): TypeIssue[] {
    let [exactContext, nestedExact, inherited] = this.getExactContext(
      exact,
      true,
    );

    let issues = this.Type._diagnose(value, path, nestedExact);

    if (issues.length > 0) {
      return issues;
    }

    issues = this.diagnoseConstraints(value, path);

    if (exactContext && !inherited) {
      issues.push(...exactContext.getIssues(value, path));
    }

    return issues;
  }

  private diagnoseConstraints(value: unknown, path: TypePath): TypeIssue[] {
    let issues: TypeIssue[] = [];

    for (let constraint of this.constraints) {
      let result: boolean | string;

      try {
        result = constraint(value) ?? true;
      } catch (error) {
        issues.push(buildTypeIssue(error, path));
        continue;
      }

      if (result === true) {
        continue;
      }

      issues.push({
        path,
        message: typeof result === 'string' ? result : 'Unexpected value.',
      });
    }

    return issues;
  }
}

/**
 * DECLARATION ONLY.
 *
 * Exported to avoid TS4023 error:
 * https://github.com/Microsoft/TypeScript/issues/5711
 */
export declare const __nominal: unique symbol;

export type __nominal = typeof __nominal;

/**
 * DECLARATION ONLY.
 *
 * Exported to avoid TS4023 error:
 * https://github.com/Microsoft/TypeScript/issues/5711
 */
export declare const __type: unique symbol;

export type __type = typeof __type;

export type Nominal<TNominalKey extends string | symbol, T = unknown> = T &
  (unknown extends T ? unknown : Record<__type, T>) &
  Record<__nominal, {[TKey in TNominalKey]: true}>;

export type Denominalize<T> = T extends {[__type]: infer TDenominalized}
  ? TDenominalized
  : T;

type RefinedInMediums<
  TType extends TypeInMediumsPartial,
  TNominalKey extends string | symbol,
  TRefinement,
> = __RefinedInMediums<TType[__type_in_mediums], TNominalKey, TRefinement>;

type __RefinedInMediums<
  TInMediums extends TypesInMediums,
  TNominalKey extends string | symbol,
  TRefinement,
> = {
  [TMediumName in XValue.UsingName]: RefinedMediumType<
    TInMediums[TMediumName],
    TNominalKey,
    TRefinement
  >;
};
