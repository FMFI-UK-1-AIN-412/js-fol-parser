import {chance} from 'jest-chance'
import domain from './helpers/domain'
import {chanceWS} from './helpers/chance'
import {parseDomain} from '../index'

describe('domain', () => {
  test('empty', () => {
    expect(parseDomain('')).toStrictEqual([]);
    expect(parseDomain('  \t\n\r  ')).toStrictEqual([]);
  });
  test('singleton', () => {
    domain.forEach((el) => expect(parseDomain(el)).toStrictEqual([el]));
  });
  test('multiple elements', () => {
    expect(parseDomain(domain.join(','))).toStrictEqual(domain);
    expect(parseDomain(domain.join(', '))).toStrictEqual(domain);
    expect(parseDomain(
      domain.map((el) => chanceWS(el)).join(',')
    )).toStrictEqual(domain);
  });
  test('parenthesized element', () => {
    expect(() => parseDomain('1,(p),Jajo8'))
      .toThrow(/^Expected domain element/);
  });
});

