import * as x from '../../library';
import {TypeConstraintError, TypeOf} from '../../library';

it('simple array type should work with json medium', () => {
  const Type = x.array(x.string);

  const value1: TypeOf<typeof Type> = ['abc', 'def'];
  const value2: TypeOf<typeof Type> = [];
  const value3 = [123];
  const value4 = 'oops';

  expect(Type.decode(x.json, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.json, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.json, JSON.stringify(value3))).toThrow(
    TypeConstraintError,
  );
  expect(() => Type.decode(x.json, JSON.stringify(value4))).toThrow(
    TypeConstraintError,
  );

  expect(Type.encode(x.json, value1)).toEqual(JSON.stringify(value1));
  expect(Type.encode(x.json, value2)).toEqual(JSON.stringify(value2));
  expect(() => Type.encode(x.json, value3 as any)).toThrow(TypeConstraintError);
  expect(() => Type.encode(x.json, value4 as any)).toThrow(TypeConstraintError);
});

it('simple array type should work with extended json medium', () => {
  const Type = x.array(x.Date);

  const value1: TypeOf<typeof Type> = [
    new Date('2022-3-31'),
    new Date('2022-4-1'),
  ];
  const value2: TypeOf<typeof Type> = [];
  const value3 = [123];
  const value4 = 'oops';

  expect(Type.decode(x.extendedJSON, JSON.stringify(value1))).toEqual(value1);
  expect(Type.decode(x.extendedJSON, JSON.stringify(value2))).toEqual(value2);
  expect(() => Type.decode(x.extendedJSON, JSON.stringify(value3))).toThrow(
    TypeError,
  );
  expect(() => Type.decode(x.extendedJSON, JSON.stringify(value4))).toThrow(
    TypeConstraintError,
  );

  expect(Type.encode(x.extendedJSON, value1)).toEqual(JSON.stringify(value1));
  expect(Type.encode(x.extendedJSON, value2)).toEqual(JSON.stringify(value2));
  expect(() => Type.encode(x.extendedJSON, value3 as any)).toThrow(
    TypeConstraintError,
  );
  expect(() => Type.encode(x.extendedJSON, value4 as any)).toThrow(
    TypeConstraintError,
  );
});

it('simple array type should work with extended json value medium', () => {
  const Type = x.array(x.Date);

  const value1: TypeOf<typeof Type> = [
    new Date('2022-3-31'),
    new Date('2022-4-1'),
  ];
  const value2: TypeOf<typeof Type> = [];
  const value3 = [123];
  const value4 = 'oops';

  expect(
    Type.decode(
      x.extendedJSONValue,
      value1.map(date => date.toISOString()),
    ),
  ).toEqual(value1);
  expect(
    Type.decode(
      x.extendedJSONValue,
      value2.map(date => date.toISOString()),
    ),
  ).toEqual(value2);
  expect(() => Type.decode(x.extendedJSONValue, value3 as any)).toThrow(
    TypeError,
  );
  expect(() => Type.decode(x.extendedJSONValue, value4 as any)).toThrow(
    TypeConstraintError,
  );

  expect(Type.encode(x.extendedJSONValue, value1)).toEqual(
    JSON.parse(JSON.stringify(value1)),
  );
  expect(Type.encode(x.extendedJSONValue, value2)).toEqual(
    JSON.parse(JSON.stringify(value2)),
  );
  expect(() => Type.encode(x.extendedJSONValue, value3 as any)).toThrow(
    TypeConstraintError,
  );
  expect(() => Type.encode(x.extendedJSONValue, value4 as any)).toThrow(
    TypeConstraintError,
  );
});
