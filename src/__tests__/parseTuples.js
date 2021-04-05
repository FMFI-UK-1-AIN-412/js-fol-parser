import {chance} from 'jest-chance'
import domain from './helpers/domain'
import {chanceWS} from './helpers/chance'
import {parseTuples} from '../index'

describe('sets of tuples', () => {
  test('empty', () => {
    expect(parseTuples('')).toStrictEqual([]);
    expect(parseTuples('  \t  ')).toStrictEqual([]);
  });
  test('singleton', () => {
    domain.forEach((el) => expect(parseTuples(el)).toStrictEqual([[el]]));
  });
  test('multiple domain elements', () => {
    const expectedElems = domain.map(el => [el]);
    expect(parseTuples(domain.join(',')))
      .toStrictEqual(expectedElems);
    expect(parseTuples(domain.join(', ')))
      .toStrictEqual(expectedElems);
    expect(parseTuples(
      domain.map(el => chanceWS(el)).join(',')
    )).toStrictEqual(expectedElems);
  });
  test('parenthesized element', () => {
    expect(() => parseTuples('1,(a,b,c),(p),Jajo8'))
      .toThrow(/^Expected domain element or n-tuple of domain elements/);
  });
  test('random mixes of tuples and elements', () => {
    for (let _case = 0; _case < 25; _case++) {
      const expected = chance.n(
        () => chance.pickset(domain, chance.natural({min:1, max: 9})),
        chance.natural({max: 256})
      );
      const input = expected.map(tuple =>
        chanceWS(tuple.length > 1
          ? '(' + tuple.map(el => chanceWS(el)).join(',') + ')'
          : tuple[0]
        )
      );
      expect(
        parseTuples(chanceWS(input.join(',')))
      ).toStrictEqual(expected);
    }
  });
});
