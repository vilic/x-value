import * as x from '../library';
import type {
  ECMAScriptTypes,
  JSONValueTypes,
  TransformNominal,
  UsingECMAScriptMedium,
  UsingExtendedJSONMedium,
  UsingExtendedJSONValueMedium,
  UsingExtendedQueryStringMedium,
  UsingJSONMedium,
  UsingJSONValueMedium,
  UsingQueryStringMedium,
} from '../library';

declare global {
  namespace XValue {
    interface Types {
      [identifierTypeSymbol]: string;
    }

    interface Using
      extends UsingJSONMedium,
        UsingExtendedJSONMedium,
        UsingJSONValueMedium,
        UsingExtendedJSONValueMedium,
        UsingQueryStringMedium,
        UsingExtendedQueryStringMedium,
        UsingECMAScriptMedium,
        UsingMediumA,
        UsingMediumB {}
  }
}

export const identifierTypeSymbol = Symbol();

export const Identifier = x.atomic(
  identifierTypeSymbol,
  value => typeof value === 'string',
);

export interface IdentifierInMediumA extends Buffer {
  toString(encoding: 'hex'): TransformNominal<this, string>;
}

export interface MediumATypes extends ECMAScriptTypes {
  [identifierTypeSymbol]: IdentifierInMediumA;
}

export interface UsingMediumA {
  'medium-a': MediumATypes;
}

export interface MediumBTypes extends JSONValueTypes {
  [identifierTypeSymbol]: number;
}

export interface UsingMediumB {
  'medium-b': MediumBTypes;
}

export const mediumA = x.ecmascript.extend<UsingMediumA>('medium-a', {
  codecs: {
    [identifierTypeSymbol]: {
      encode(value) {
        if (value.length === 0) {
          throw new TypeError('Value cannot be empty string');
        }

        return Buffer.from(value, 'hex');
      },
      decode(value) {
        if (!Buffer.isBuffer(value)) {
          throw new TypeError();
        }

        return value.toString('hex');
      },
    },
  },
});

export const mediumB = x.jsonValue.extend<UsingMediumB>('medium-b', {
  codecs: {
    [identifierTypeSymbol]: {
      encode(value) {
        if (value.length === 0) {
          // eslint-disable-next-line no-throw-literal
          throw 'Value cannot be empty string';
        }

        return Buffer.from(value, 'hex').readUint16BE();
      },
      decode(value) {
        if (typeof value !== 'number') {
          throw new TypeError();
        }

        let buffer = Buffer.alloc(2);

        buffer.writeUInt16BE(value);

        return buffer.toString('hex');
      },
    },
  },
});
