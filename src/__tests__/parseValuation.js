import {chance} from 'jest-chance'
import {chanceWS} from './helpers/chance'
import {parseTff} from '../index'

const parse = str => parseTff(str);

describe('tff', () => {
  test('tff declaration', () => {
    expect(parse(`${chanceWS()}tff(${chanceWS()}formula_name${chanceWS()},${chanceWS()}formula_role${chanceWS()},${chanceWS()}formula_itself${chanceWS()})${chanceWS()}.${chanceWS()}`)).toStrictEqual({
      name: 'formula_name',
      role: 'formula_role',
      formula: 'formula_itself',
    });
  });
});
