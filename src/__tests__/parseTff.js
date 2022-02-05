import {chance} from 'jest-chance'
import {chanceWS} from './helpers/chance'
import {parseTff} from '../index.js'

import factories from './helpers/factories'
import startRules from "../parser/startRules";

const parse = (str, fs = factories) =>
    parseTff(str, fs)


describe('tff', () => {
  test('tff declaration', () => {
    expect(parse(`${chanceWS()}tff(${chanceWS()}formula_name${chanceWS()},${chanceWS()}formula_role${chanceWS()},${chanceWS()}formula_itself${chanceWS()})${chanceWS()}.${chanceWS()}`)).toStrictEqual({
      name: 'formula_name',
      role: 'formula_role',
      formula: 'formula_itself',
    });
  });

  test('vampire', () => {
    expect(parse('tff(declare_$i1,type,jozko : $i).').toEqual(
            ['declare_$i1', 'type', factories.constant('jozko')],
        )
    );
  });
});
