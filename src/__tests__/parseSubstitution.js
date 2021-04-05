import {chance} from 'jest-chance'
import domain from './helpers/domain'
import {mapsto} from './helpers/symbols'
import language, {variables, constants} from './helpers/language'
import factories from './helpers/factories'
import {chanceWS} from './helpers/chance'
import {parseSubstitution} from '../index'

const parse = str => parseSubstitution(str, language, factories);

const pairToStringRenderers =
  [(v, t) => '(' + chanceWS(v) + ',' + chanceWS(t) + ')'].concat(
    mapsto.map(arrow =>
      (v, t) => v + chanceWS(arrow) + t
    )
  );

const terms =
  variables.map(v => ({ input: v, output: `v:${v}` }))
  .concat(Array.from(constants).map(c => ({ input: c, output: `c:${c}` })))
  .concat([
    {
      input: 'f(c)',
      output: 'f(c:c)'
    },
    {
      input: 'G(f(x),G(1,aConstant))',
      output: 'G(f(v:x),G(c:1,c:aConstant))'
    },
    {
      input: 'aFunction(G(f(x),G(1,aConstant)),$v,1,f(c))',
      output: 'aFunction(G(f(v:x),G(c:1,c:aConstant)),v:$v,c:1,f(c:c))'
    },
    {
      input: 'aFunction(G(f(x),G(1,aConstant)),$v,1,f(c))',
      output: 'aFunction(G(f(v:x),G(c:1,c:aConstant)),v:$v,c:1,f(c:c))'
    }
  ]);

describe('substitution of variables', () => {
  test('empty', () => {
    expect(parse('')).toStrictEqual([]);
    expect(parse('  \t  ')).toStrictEqual([]);
  });
  test('singleton', () =>
    terms.forEach(({ input, output }) =>
      variables.forEach(v =>
        pairToStringRenderers.forEach(pToS =>
          expect(parse(chanceWS(pToS(v, input))))
            .toStrictEqual([[v, output]])
        )
      )
    )
  );
  test('multiple random pairs', () => {
    for ( let _case = 0; _case < 50; _case++ ) {
      const template = chance.n(
        () => [chance.pickone(variables), chance.pickone(terms)],
        chance.natural({min: 1, max: 16})
      );
      const expected = template.map(([v, term]) => [v, term.output])
      const input = template.map(
        ([v, term]) =>
          chanceWS(chance.pickone(pairToStringRenderers)(v, term.input))
      ).join(',');
      expect(parse(chanceWS(input))).toStrictEqual(expected);
    }
  });
});
