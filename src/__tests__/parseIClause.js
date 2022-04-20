import {chance} from 'jest-chance'

import {parseIClause} from '../index'

import {iLanguage} from './helpers/language'

import iFactories from './helpers/iFactories'

const parse = (str, fs = iFactories) =>
  parseIClause(str, iLanguage, fs)

describe('simple clauses parsing', () => {
  test('predicate atoms', () => {
    expect(parse('p(1)')).toBe('p(c:1)');
    expect(parse('Q(x,1)')).toBe('Q(v:x,c:1)');
    expect(parse('p ( 1 ) ')).toBe('p(c:1)');
    expect(parse('p(f(1))')).toBe('p(f(c:1))');
    expect(parse('Q(G(x,1),c)')).toBe('Q(G(v:x,c:1),c:c)');
    expect(parse('   p (  f ( 1 )  )   ')).toBe('p(f(c:1))');
    expect(parse(`
      p(aFunction(\r
        \tG(\r
          \t  f(x) ,\r
          \t  G(1,aConstant)\r
          ),\r
          \t$v ,\r
          \t1 ,\r
          \tf(c)
        ))
      `))
      .toBe('p(aFunction(G(f(v:x),G(c:1,c:aConstant)),v:$v,c:1,f(c:c)))');
  })

  test('predicate application is not checked for arity', () => {
    expect(parse('p(x,y)')).toBe('p(v:x,v:y)');
    expect(parse('Q(x)')).toBe('Q(v:x)');
    expect(parse('aPredicate(aFunction(1,c,x,y),c,x,y)'))
      .toBe('aPredicate(aFunction(c:1,c:c,v:x,v:y),c:c,v:x,v:y)');
  });

  test('predicate symbol can be reused as variable or function', () => {
    expect(parse('x(x(x))')).toBe('x(x(v:x))');
  });

  test.each(['¬', '-', '~', '\\lnot ','\\neg '])('negation as %s',
    sym => {
      expect(parse(`${sym}p(x)`)).toBe('¬p(v:x)');
      expect(parse(` ${sym}\t \n\rp(x) `)).toBe('¬p(v:x)');
    }
  );

  test.each(['[]', '_|_',
    '□', '▫︎', '◽︎', '◻︎', '⬜︎', '▢', '⊥',
    '\\square', '\\Box', '\\qed'])(`empty clause as %s`, sym => {
      expect(parse(`${sym}`)).toBe(`□`);
      expect(parse(` \t\n\t ${sym} \r\n \t`)).toBe(`□`);
    }
  );

  test.each(['∨', '|', '||', '\\/', '\\lor ', '\\vee ', ','])(`∨ as %s`,
    sym => {
      expect(parse(`p(x)${sym}Q(c,1)`)).toBe(`p(v:x)∨Q(c:c,c:1)`);
      expect(parse(` \tQ(c,1)\n${sym}\r\np(x) \t`))
        .toBe(`Q(c:c,c:1)∨p(v:x)`);
    }
  );

  test('a longer clause', () => {
    expect(parse('p(x)∨¬Q(c,y)∨¬Q(g(1,f(y)),c)∨¬p(f(y))'))
      .toBe('p(v:x)∨¬Q(c:c,v:y)∨¬Q(g(c:1,f(v:y)),c:c)∨¬p(f(v:y))');
    expect(parse('p(f(y)),¬Q(c,y),¬p(x),Q(g(1,f(y)),c)'))
      .toBe('p(f(v:y))∨¬Q(c:c,v:y)∨¬p(v:x)∨Q(g(c:1,f(v:y)),c:c)');
  });

  test('non-atoms', () => {
    expect(() => parse('c(x)')).toThrow(/empty clause symbol, negation symbol, or predicate symbol but "c"/);
    expect(() => parse('p()')).toThrow(/function symbol, individual constant symbol, or variable symbol but "\)"/);
    expect(() => parse('p')).toThrow(/"\(" but end of input/);
    expect(() => parse('Q(x,)')).toThrow(/function symbol, individual constant symbol, or variable symbol but "\)"/);
    expect(() => parse('Q(,x)')).toThrow(/function symbol, individual constant symbol, or variable symbol but ","/);
  })
})

const idemFactories = {
  ...iFactories,
  variable: (v, _) => `${v}`,
  constant: (c, _) => `${c}`
}

const atoms = [
  'p(x)',
  'Q(f(1),G(c,y))'
]

const chanceLowerDeg = (deg) =>
  Math.max(0, deg - chance.integer({min: 1, max: 2}))

const chanceClause = (deg, breadth) => {
  if (deg <= 0) {
    const l = `${chance.pickone(['','¬'])}${chance.pickone(atoms)}`;
    return { inStr: l, outStr: l };
  }
  const subfs = chance.n(
    () => {
      const d = chanceLowerDeg(deg);
      const { inStr, outStr } = chanceClause(d, breadth);
      return {
        inStr: d > 0 || chance.bool() ? `(${inStr})` : inStr,
        outStr
      };
    },
    chance.integer({ min: 1, max: breadth })
  );
  return {
    inStr: subfs.map(({inStr}) => inStr).join('∨'),
    outStr: subfs.map(({outStr}) => outStr).join('∨')
  }
}

describe('nested clauses parsing (256 randomly generated clauses)', () => {
  for (let _i = 0; _i < 256; ++_i) {
    const {inStr, outStr} = chanceClause(
      chance.integer({min: 1, max: 4}),
      chance.integer({min: 2, max: 4})
    );
    test(`nested clause "${inStr}"`, () => {
      expect(parse(inStr, idemFactories)).toBe(outStr);
    });
  }
});
