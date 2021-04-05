import {chance} from 'jest-chance'
import {
  constants as constantsSet,
  predicates as predicatesSet,
  functions as functionsSet,
  arity
} from './helpers/language'
import {chanceWS} from './helpers/chance'
import {
  parseConstants,
  parsePredicates,
  parseFunctions
} from '../index'

const constants = Array.from(constantsSet);
const predicates = Array.from(predicatesSet);
const functions = Array.from(functionsSet);

const aritySymToString = (id) => id + chanceWS('/') + arity(id)
const aritySymToOutput = (id) => ({ name: id, arity: arity(id) })

describe('constants', () => {
  test('empty', () => {
    expect(parseConstants('')).toStrictEqual([]);
    expect(parseConstants('  \t\n\r  ')).toStrictEqual([]);
  });
  test('singleton', () => {
    constants.forEach((c) => expect(parseConstants(c)).toStrictEqual([c]));
  });
  test('multiple constants', () => {
    expect(parseConstants(constants.join(','))).toStrictEqual(constants);
    expect(parseConstants(constants.join(', '))).toStrictEqual(constants);
    expect(parseConstants(
      constants.map((el) => chanceWS(el)).join(',')
    )).toStrictEqual(constants);
  });
  test('bad symbols', () => {
    expect(() => parseConstants('1,(p),Jajo8'))
      .toThrow(/^Expected constant identifier/);
    expect(() => parseConstants('1,_#_,Jajo8'))
      .toThrow(/^Expected "," or end of input/);
    expect(() => parseConstants('1,AA~BB,Jajo8'))
      .toThrow(/^Expected "," or end of input/);
    expect(() => parseConstants('1,😈,Jajo8'))
      .toThrow(/^Expected constant identifier/);
  });
});

describe('predicates', () => {
  test('empty', () => {
    expect(parsePredicates('')).toStrictEqual([]);
    expect(parsePredicates('  \t\n\r  ')).toStrictEqual([]);
  });
  test('singleton', () => {
    predicates.forEach((p) =>
      expect(parsePredicates(chanceWS(aritySymToString(p))))
        .toStrictEqual([aritySymToOutput(p)])
    );
  });
  test('arity 0', () => {
    expect(parsePredicates('p/0'))
      .toStrictEqual([{ name: 'p', arity: 0 }]);
  });
  test('multiple predicates', () => {
    expect(parsePredicates(predicates.map(aritySymToString).join(','))).toStrictEqual(predicates.map(aritySymToOutput));
    expect(parsePredicates(predicates.map(aritySymToString).join(', '))).toStrictEqual(predicates.map(aritySymToOutput));
    expect(parsePredicates(
      predicates.map((p) => chanceWS(aritySymToString(p))).join(',')
    )).toStrictEqual(predicates.map(aritySymToOutput));
  });
  test('bad symbols or arities', () => {
    expect(() => parsePredicates('1,(p),Jajo8'))
      .toThrow(/^Expected end of input or predicate identifier\/non-negative arity/);
    expect(() => parsePredicates('p/1,(p),Jajo8'))
      .toThrow(/^Expected predicate identifier\/non-negative arity/);
    expect(() => parsePredicates('p/1,_#_,Jajo8'))
      .toThrow(/^Expected predicate identifier\/non-negative arity/);
    expect(() => parsePredicates('p/1,AA~BB,Jajo8'))
      .toThrow(/^Expected predicate identifier\/non-negative arity/);
    expect(() => parsePredicates('p/1,😈,Jajo8'))
      .toThrow(/^Expected predicate identifier\/non-negative arity/);
    expect(() => parsePredicates('p/1,q'))
      .toThrow(/^Expected predicate identifier\/non-negative arity/);
    expect(() => parsePredicates('p/1,q/'))
      .toThrow(/^Expected predicate identifier\/non-negative arity/);
      expect(() => parsePredicates('p/1,/1'))
      .toThrow(/^Expected predicate identifier\/non-negative arity/);
    expect(() => parsePredicates('p/1,q/-1'))
      .toThrow(/^Expected predicate identifier\/non-negative arity/);
  });
});

describe('functions', () => {
  test('empty', () => {
    expect(parseFunctions('')).toStrictEqual([]);
    expect(parseFunctions('  \t\n\r  ')).toStrictEqual([]);
  });
  test('singleton', () => {
    functions.forEach((p) =>
      expect(parseFunctions(chanceWS(aritySymToString(p))))
        .toStrictEqual([aritySymToOutput(p)])
    );
  });
  test('multiple functions', () => {
    expect(parseFunctions(functions.map(aritySymToString).join(','))).toStrictEqual(functions.map(aritySymToOutput));
    expect(parseFunctions(functions.map(aritySymToString).join(', '))).toStrictEqual(functions.map(aritySymToOutput));
    expect(parseFunctions(
      functions.map((p) => chanceWS(aritySymToString(p))).join(',')
    )).toStrictEqual(functions.map(aritySymToOutput));
  });
  test('bad symbols or arities', () => {
    expect(() => parseFunctions('1,(p),Jajo8'))
      .toThrow(/^Expected end of input or function identifier\/positive arity/);
    expect(() => parseFunctions('f/1,(p),Jajo8'))
      .toThrow(/^Expected function identifier\/positive arity/);
    expect(() => parseFunctions('f/1,_#_,Jajo8'))
      .toThrow(/^Expected function identifier\/positive arity/);
    expect(() => parseFunctions('f/1,AA~BB,Jajo8'))
      .toThrow(/^Expected function identifier\/positive arity/);
    expect(() => parseFunctions('f/1,😈,Jajo8'))
      .toThrow(/^Expected function identifier\/positive arity/);
    expect(() => parseFunctions('f/1,g'))
      .toThrow(/^Expected function identifier\/positive arity/);
    expect(() => parseFunctions('f/1,g/'))
      .toThrow(/^Expected function identifier\/positive arity/);
    expect(() => parseFunctions('f/1,g/-1'))
      .toThrow(/^Expected function identifier\/positive arity/);
      expect(() => parseFunctions('f/1,/1'))
      .toThrow(/^Expected function identifier\/positive arity/);
    expect(() => parseFunctions('f/0'))
      .toThrow(/^Expected end of input or function identifier\/positive arity/);
  });
});

