import {chance} from 'jest-chance'
import {chanceWS} from './helpers/chance'

import {parseClause} from '../index'

import language from './helpers/language'

import factories from './helpers/factories'

const parse = (str, fs = factories) =>
  parseClause(str, language, fs)

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
    expect(parse('p(x)∨¬Q(c,y)∨¬Q(G(1,f(y)),c)∨¬p(f(y))'))
      .toBe('p(v:x)∨¬Q(c:c,v:y)∨¬Q(G(c:1,f(v:y)),c:c)∨¬p(f(v:y))');
    expect(parse('p(f(y)),¬Q(c,y),¬p(x),Q(G(1,f(y)),c)'))
      .toBe('p(f(v:y))∨¬Q(c:c,v:y)∨¬p(v:x)∨Q(G(c:1,f(v:y)),c:c)');
  });

  test('a longer clause with spaces and parentheses', () => {
    expect(parse(' (  p(x) ∨ ( ¬Q(c,y) ∨ ¬Q(G(1,f(y)),c) ) ∨ ¬p(f(y)) ) '))
      .toBe('p(v:x)∨¬Q(c:c,v:y)∨¬Q(G(c:1,f(v:y)),c:c)∨¬p(f(v:y))');
    expect(parse('( p(x) ∨ ( ¬Q(c,y) ∨ ( ¬Q(G(1,f(y)),c) ∨ ¬p(f(y)) )))'))
      .toBe('p(v:x)∨¬Q(c:c,v:y)∨¬Q(G(c:1,f(v:y)),c:c)∨¬p(f(v:y))');
    expect(parse('(((p(x) ∨ ¬Q(c,y) ) ∨ ¬Q(G(1,f(y)),c) ) ∨ ¬p(f(y)) )'))
      .toBe('p(v:x)∨¬Q(c:c,v:y)∨¬Q(G(c:1,f(v:y)),c:c)∨¬p(f(v:y))');
    expect(parse(' (  p(x),  ( ¬Q(c,y),  ¬Q(G(1,f(y)),c) ),  ¬p(f(y)) ) '))
      .toBe('p(v:x)∨¬Q(c:c,v:y)∨¬Q(G(c:1,f(v:y)),c:c)∨¬p(f(v:y))');
    expect(parse('( p(x),  ( ¬Q(c,y),  ( ¬Q(G(1,f(y)),c), ¬p(f(y)) )))'))
      .toBe('p(v:x)∨¬Q(c:c,v:y)∨¬Q(G(c:1,f(v:y)),c:c)∨¬p(f(v:y))');
    expect(parse('(((p(x), ¬Q(c,y) ), ¬Q(G(1,f(y)),c) ), ¬p(f(y)) )'))
      .toBe('p(v:x)∨¬Q(c:c,v:y)∨¬Q(G(c:1,f(v:y)),c:c)∨¬p(f(v:y))');
  });

  test('non-atoms', () => {
    expect(() => parse('p(x,y)')).toThrow(/1 argument to p but "p\(x,y\)"/);
    expect(() => parse('Q(x)')).toThrow(/2 arguments to Q but "Q\(x\)"/);
    expect(() => parse('aPredicate(aFunction(1,c,x,y),c,x,y)')).toThrow(/5 arguments to aPredicate/);
    expect(() => parse('x(x(x))')).toThrow(/"\(", empty clause symbol, negation symbol, or predicate symbol but "x"/);
    expect(() => parse('c(x)')).toThrow(/empty clause symbol, negation symbol, or predicate symbol but "c"/);
    expect(() => parse('p()')).toThrow(/term but "\)"/);
    expect(() => parse('p')).toThrow(/"\(" but end of input/);
    expect(() => parse('Q(x,)')).toThrow(/term but "\)"/);
    expect(() => parse('Q(,x)')).toThrow(/term but ","/);
  })
})

const idemFactories = {
  ...factories,
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
    const neg = chance.pickone(['','¬']);
    const atom = chance.pickone(atoms);
    return {
      inStr: chanceWS() + neg + chanceWS() + atom + chanceWS(),
      outStr: neg + atom
    };
  }
  const subfs = chance.n(
    () => {
      const d = chanceLowerDeg(deg);
      const { inStr, outStr } = chanceClause(d, breadth);
      return {
        inStr: d > 0 || chance.bool()
          ? chanceWS() + `(${inStr})` + chanceWS()
          : inStr,
        outStr
      };
    },
    chance.integer({ min: 1, max: breadth })
  );
  return {
    inStr: chanceWS() + subfs.map(f => f.inStr).join('∨') + chanceWS(),
    outStr: subfs.map(f => f.outStr).join('∨')
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
