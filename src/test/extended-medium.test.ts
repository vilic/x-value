import * as x from '../library';

test('Date type should work', () => {
  const date = new Date();
  const dateString = date.toISOString();

  expect(x.Date.is(date)).toBe(true);
  expect(x.Date.is(dateString)).toBe(false);
  expect(x.Date.decode(x.extendedJSONValue, dateString)).toEqual(date);
  expect(x.Date.encode(x.extendedJSONValue, date)).toBe(dateString);
  expect(x.Date.encode(x.ecmascript, date)).toEqual(date);

  expect(
    x.object({date: x.Date}).transform(
      x.extendedJSON,
      x.extendedQueryString,
      JSON.stringify({
        date,
      }),
    ),
  ).toBe(
    new URLSearchParams({
      date: dateString,
    }).toString(),
  );

  expect(
    x.object({date: x.Date}).transform(
      x.extendedQueryString,
      x.extendedJSON,
      new URLSearchParams({
        date: dateString,
      }).toString(),
    ),
  ).toBe(
    JSON.stringify({
      date,
    }),
  );
});

test('RegExp type should work', () => {
  const regexp = /hello\/world/g;
  const regexpLiteral = `/${regexp.source}/${regexp.flags}`;

  expect(x.RegExp.is(regexp)).toBe(true);
  expect(x.RegExp.is(regexpLiteral)).toBe(false);
  expect(x.RegExp.decode(x.extendedJSONValue, regexpLiteral)).toEqual(regexp);
  expect(x.RegExp.encode(x.extendedJSONValue, regexp)).toBe(regexpLiteral);
  expect(x.RegExp.encode(x.ecmascript, regexp)).toEqual(regexp);

  expect(
    x.object({test: x.RegExp}).transform(
      x.extendedJSON,
      x.extendedQueryString,
      JSON.stringify({
        test: regexpLiteral,
      }),
    ),
  ).toBe(
    new URLSearchParams({
      test: regexpLiteral,
    }).toString(),
  );

  expect(() =>
    x.RegExp.decode(x.extendedJSONValue, 123 as any),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Expected regular expression literal, getting [object Number]"`,
  );

  expect(() =>
    x.RegExp.decode(x.extendedJSONValue, ''),
  ).toThrowErrorMatchingInlineSnapshot(`"Invalid regular expression literal"`);
});
