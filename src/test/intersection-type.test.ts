import type {AssertTrue, IsEqual} from 'tslang';

import * as x from '../library';
import type {TypeOf} from '../library';
import {TypeConstraintError} from '../library';

test('intersection type results in never should work with json medium', () => {
  const Type = x.intersection(x.string, x.number);

  type Type = TypeOf<typeof Type>;

  type _ = AssertTrue<IsEqual<Type, never>>;

  let value1 = 'abc';
  let value2 = 123;

  expect(() => Type.decode(x.json, JSON.stringify(value1)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Expected number, getting [object String]."
  `);
  expect(() => Type.decode(x.json, JSON.stringify(value2))).toThrow(
    TypeConstraintError,
  );

  expect(() => Type.encode(x.json, value1 as never))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Expected number, getting [object String]."
  `);
  expect(() => Type.encode(x.json, value2 as never)).toThrow(
    TypeConstraintError,
  );

  expect(Type.is(value1)).toBe(false);
  expect(Type.is(value2)).toBe(false);
});

test('intersection type should work with json value medium', () => {
  const Type = x.intersection(
    x.object({
      foo: x.string,
    }),
    x.object({
      bar: x.number,
    }),
  );

  type Type = TypeOf<typeof Type>;

  type _ = AssertTrue<
    IsEqual<
      Type,
      {
        foo: string;
        bar: number;
      }
    >
  >;

  let value1: Type = {
    foo: 'abc',
    bar: 123,
  };
  let value2 = {
    foo: 'abc',
  };
  let value3 = {
    foo: 'abc',
    bar: 'def',
  };

  expect(Type.decode(x.jsonValue, value1)).toEqual(value1);
  expect(() => Type.decode(x.jsonValue, value2 as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [\\"bar\\"] Expected number, getting [object Undefined]."
  `);
  expect(() => Type.decode(x.jsonValue, value3 as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      [\\"bar\\"] Expected number, getting [object String]."
  `);

  expect(Type.encode(x.jsonValue, value1)).toEqual(value1);
  expect(() => Type.encode(x.jsonValue, value2 as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [\\"bar\\"] Expected number, getting [object Undefined]."
  `);
  expect(() => Type.encode(x.jsonValue, value3 as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      [\\"bar\\"] Expected number, getting [object String]."
  `);

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(false);
  expect(Type.is(value3)).toBe(false);
});

test('intersection type should work with json medium', () => {
  const Type = x.intersection(
    x.object({
      foo: x.string,
    }),
    x.object({
      bar: x.number,
    }),
  );

  let value1: TypeOf<typeof Type> = {
    foo: 'abc',
    bar: 123,
  };
  let value2 = {
    foo: 'abc',
  };
  let value3 = {
    foo: 'abc',
    bar: 'def',
  };

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(() => Type.decode(x.json, JSON.stringify(value2))).toThrow(
    TypeConstraintError,
  );
  expect(() => Type.decode(x.json, JSON.stringify(value3))).toThrow(
    TypeConstraintError,
  );

  expect(JSON.parse(Type.encode(x.json, value1))).toEqual(value1);
  expect(() => Type.encode(x.json, value2 as any)).toThrow(TypeConstraintError);
  expect(() => Type.encode(x.json, value3 as any)).toThrow(TypeConstraintError);

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(false);
  expect(Type.is(value3)).toBe(false);
});
