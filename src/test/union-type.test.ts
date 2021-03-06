import * as x from '../library';
import type {TypeOf} from '../library';
import {TypeConstraintError} from '../library';

test('union type of atomic types should work with json medium', () => {
  const Type = x.union(x.string, x.number);

  let value1: TypeOf<typeof Type> = 'abc';
  let value2: TypeOf<typeof Type> = 123;

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.json, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.json, JSON.stringify(true)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      The unpacked value satisfies none of the type in the union type.
      Expected string, getting [object Boolean]."
  `);

  expect(JSON.parse(Type.encode(x.json, value1))).toEqual(value1);
  expect(JSON.parse(Type.encode(x.json, value2))).toEqual(value2);
  expect(() => Type.encode(x.json, true as any))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      The value satisfies none of the type in the union type.
      Expected string, getting [object Boolean]."
  `);

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(true);
  expect(Type.is(true)).toBe(false);
});

test('union type of mixed types should work with json medium', () => {
  const Type = x.union(
    x.object({
      type: x.literal('text'),
      value: x.string,
    }),
    x.number,
  );

  let value1: TypeOf<typeof Type> = {
    type: 'text',
    value: '123',
  };
  let value2: TypeOf<typeof Type> = 123;
  let value3: any = true;
  let value4: any = {
    type: 'text',
    value: 123,
  };

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.json, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.json, JSON.stringify(true)))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      The unpacked value satisfies none of the type in the union type.
      Expecting unpacked value to be a non-null object, getting [object Boolean]."
  `);

  expect(JSON.parse(Type.encode(x.json, value1))).toEqual(value1);
  expect(JSON.parse(Type.encode(x.json, value2))).toEqual(value2);
  expect(() => Type.encode(x.json, value3)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      The value satisfies none of the type in the union type.
      Expecting value to be a non-null object, getting [object Boolean]."
  `);
  expect(() => Type.encode(x.json, value4)).toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      The value satisfies none of the type in the union type.
      [\\"value\\"] Expected string, getting [object Number]."
  `);

  expect(Type.is(value1)).toBe(true);
  expect(Type.is(value2)).toBe(true);
  expect(Type.is(value3)).toBe(false);
  expect(Type.is(value4)).toBe(false);
});

test('union type of mixed types should work with json value medium', () => {
  const Type = x.union(
    x.object({
      type: x.literal('text'),
      value: x.string,
    }),
    x.number,
  );

  let value1: TypeOf<typeof Type> = {
    type: 'text',
    value: '123',
  };
  let value2: TypeOf<typeof Type> = 123;
  let value3: any = true;
  let value4: any = {
    type: 'text',
    value: 123,
  };

  expect(Type.decode(x.jsonValue, value1)).toEqual(value1);
  expect(Type.decode(x.jsonValue, value2)).toEqual(value2);
  expect(() => Type.decode(x.jsonValue, value3)).toThrow(TypeConstraintError);
  expect(() => Type.decode(x.jsonValue, value4)).toThrow(TypeConstraintError);

  expect(Type.encode(x.jsonValue, value1)).toEqual(value1);
  expect(Type.encode(x.jsonValue, value2)).toEqual(value2);
  expect(() => Type.encode(x.jsonValue, value3)).toThrow(TypeConstraintError);
  expect(() => Type.encode(x.jsonValue, value4)).toThrow(TypeConstraintError);
});

test('exact with union type', () => {
  const Type = x
    .union(
      x.object({
        type: x.literal('a'),
      }),
      x.intersection(
        x.object({
          type: x.literal('b'),
        }),
        x.object({
          foo: x.string,
        }),
        x.object({
          bar: x.number,
        }),
      ),
    )
    .exact();

  type Type = x.TypeOf<typeof Type>;

  const valid1: Type = {
    type: 'a',
  };

  const valid2: Type = {
    type: 'b',
    foo: 'abc',
    bar: 123,
  };

  const invalid1: any = {
    type: 'a',
    extra: true,
  };

  const invalid2: any = {
    type: 'b',
    foo: 'abc',
    bar: 123,
    extra: true,
  };

  expect(Type.is(valid1)).toBe(true);
  expect(Type.is(valid2)).toBe(true);
  expect(Type.encode(x.jsonValue, valid1)).toEqual(valid1);
  expect(Type.encode(x.jsonValue, valid2)).toEqual(valid2);
  expect(Type.decode(x.jsonValue, valid1)).toEqual(valid1);
  expect(Type.decode(x.jsonValue, valid2)).toEqual(valid2);
  expect(Type.transform(x.jsonValue, x.json, valid1)).toBe(
    JSON.stringify(valid1),
  );
  expect(Type.transform(x.jsonValue, x.json, valid2)).toBe(
    JSON.stringify(valid2),
  );

  expect(Type.diagnose(invalid1)).toMatchInlineSnapshot(`
    Array [
      Object {
        "deferrable": true,
        "message": "Unknown key(s) \\"extra\\".",
        "path": Array [],
      },
    ]
  `);
  expect(Type.diagnose(invalid2)).toMatchInlineSnapshot(`
    Array [
      Object {
        "deferrable": true,
        "message": "Unknown key(s) \\"extra\\".",
        "path": Array [],
      },
    ]
  `);
  expect(() => Type.encode(x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unknown key(s) \\"extra\\"."
  `);
  expect(() => Type.encode(x.json, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to encode to medium:
      Unknown key(s) \\"extra\\"."
  `);
  expect(() => Type.decode(x.jsonValue, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unknown key(s) \\"extra\\"."
  `);
  expect(() => Type.decode(x.jsonValue, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to decode from medium:
      Unknown key(s) \\"extra\\"."
  `);
  expect(() => Type.transform(x.jsonValue, x.json, invalid1))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) \\"extra\\"."
  `);
  expect(() => Type.transform(x.jsonValue, x.json, invalid2))
    .toThrowErrorMatchingInlineSnapshot(`
    "Failed to transform medium:
      Unknown key(s) \\"extra\\"."
  `);
});
