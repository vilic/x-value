import type {TupleInMedium} from '../@internal';
import {merge} from '../@internal';
import type {Medium} from '../medium';

import type {TypeInMediumsPartial, TypeIssue, TypePath} from './type';
import {Type, __type_kind} from './type';

export class IntersectionType<
  TTypeTuple extends [
    TypeInMediumsPartial,
    TypeInMediumsPartial,
    ...TypeInMediumsPartial[],
  ],
> extends Type<IntersectionInMediums<TTypeTuple>> {
  [__type_kind]!: 'intersection';

  constructor(TypeTuple: TTypeTuple);
  constructor(readonly TypeTuple: Type[]) {
    if (TypeTuple.length < 2) {
      throw new TypeError('Expecting at least 2 types for intersection type');
    }

    super();
  }

  /** @internal */
  _decode(
    medium: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.TypeTuple) {
      let [partial, partialIssues] = Type._decode(medium, unpacked, path);

      partials.push(partial);
      issues.push(...partialIssues);
    }

    return [issues.length === 0 ? merge(partials) : undefined, issues];
  }

  /** @internal */
  _encode(
    medium: Medium,
    value: unknown,
    path: TypePath,
    diagnose: boolean,
  ): [unknown, TypeIssue[]] {
    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.TypeTuple) {
      let [partial, partialIssues] = Type._encode(
        medium,
        value,
        path,
        diagnose,
      );

      partials.push(partial);
      issues.push(...partialIssues);
    }

    return [issues.length === 0 ? merge(partials) : undefined, issues];
  }

  /** @internal */
  _transform(
    from: Medium,
    to: Medium,
    unpacked: unknown,
    path: TypePath,
  ): [unknown, TypeIssue[]] {
    let partials: unknown[] = [];
    let issues: TypeIssue[] = [];

    for (let Type of this.TypeTuple) {
      let [partial, partialIssues] = Type._transform(from, to, unpacked, path);

      partials.push(partial);
      issues.push(...partialIssues);
    }

    return [issues.length === 0 ? merge(partials) : undefined, issues];
  }

  /** @internal */
  _diagnose(value: unknown, path: TypePath): TypeIssue[] {
    return this.TypeTuple.flatMap(Type => Type._diagnose(value, path));
  }
}

export function intersection<
  TTypeTuple extends [
    TypeInMediumsPartial,
    TypeInMediumsPartial,
    ...TypeInMediumsPartial[],
  ],
>(...Types: TTypeTuple): IntersectionType<TTypeTuple> {
  return new IntersectionType(Types);
}

export type IntersectionInMediums<TTypeTuple extends TypeInMediumsPartial[]> = {
  [TMediumName in XValue.UsingName]: __Intersection<
    TupleInMedium<TTypeTuple, TMediumName>
  >;
};

type __Intersection<TTuple extends unknown[]> = TTuple extends [
  infer T,
  ...infer TRestTuple,
]
  ? T & __Intersection<TRestTuple>
  : unknown;
