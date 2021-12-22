import {chance} from 'jest-chance'
import domain from './helpers/domain'
import {mapsto} from './helpers/symbols'
import language, {variables} from './helpers/language'
import {chanceWS} from './helpers/chance'
import {parseValuation} from '../index'

const parse = str => parseValuation(str, language);

const pairToStringRenderers =
  [(v, el) => '(' + chanceWS(v) + ',' + chanceWS(el) + ')'].concat(
    mapsto.map(arrow =>
      (v, el) => v + chanceWS(arrow) + el
    )
  );

describe('valuation of variables', () => {
  test('empty', () => {
    expect(parse('')).toStrictEqual([]);
    expect(parse('  \t  ')).toStrictEqual([]);
  });
  test('singleton', () =>
    domain.forEach(el =>
      variables.forEach(v =>
        pairToStringRenderers.forEach(pToS =>
          expect(parse(chanceWS(pToS(v, el))))
            .toStrictEqual([[v, el]])
        )
      )
    )
  );
  test('multiple random pairs', () => {
    for ( let _case = 0; _case < 50; _case++ ) {
      const expected = chance.n(
        () => [chance.pickone(variables), chance.pickone(domain)],
        chance.natural({min: 1, max: 16})
      );
      const input = expected.map(
        ([v, el]) => chanceWS(chance.pickone(pairToStringRenderers)(v, el))
      ).join(',');
      expect(parse(chanceWS(input))).toStrictEqual(expected);
    }
  });
});
