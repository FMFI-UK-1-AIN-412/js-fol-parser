import {chance} from 'jest-chance'

import {parseFormulaWithPrecedence} from '../index'

import language from './helpers/language'

import factories from './helpers/factories'

const parse = (str, fs = factories) =>
  parseFormulaWithPrecedence(str, language, fs)

describe('atoms', () => {
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

  test('equality atoms', () => {
    expect(parse('1=c')).toBe('c:1=c:c');
    expect(parse('1≐c')).toBe('c:1=c:c');
    expect(parse('G(x,1)=f(c)')).toBe('G(v:x,c:1)=f(c:c)');
    expect(parse(`
      aFunction(
        G( f(aConstant), G(1,c) )\t,
        1,
        $$123\t,
        f(f(f(t14)))\r\n\t)
      = aFunction(
          f(f(f(t14))),
          _x_\t,
          c,
          G( f(aConstant), G(1,c) )
        )
      `)).toBe('aFunction(G(f(c:aConstant),G(c:1,c:c)),' +
            'c:1,v:$$123,f(f(f(v:t14))))='+
            'aFunction(f(f(f(v:t14))),v:_x_,c:c,'+
            'G(f(c:aConstant),G(c:1,c:c)))');
  });

  test('non-atoms', () => {
    expect(() => parse('x(x)'))
      .toThrow(/equality symbol or non-equality symbol but "\("/);
    expect(() => parse('c(x)'))
      .toThrow(/equality symbol or non-equality symbol but "\("/);
    expect(() => parse('f(x)'))
      .toThrow(/equality symbol or non-equality symbol but end/);
    expect(() => parse('f(x,)'))
      .toThrow(/"\(", existential quantifier, negation symbol, predicate symbol, term, or universal quantifier but "f"/);
    expect(() => parse('f(,x)'))
      .toThrow(/"\(", existential quantifier, negation symbol, predicate symbol, term, or universal quantifier but "f"/);
    expect(() => parse('G(x,)'))
      .toThrow(/"\(", existential quantifier, negation symbol, predicate symbol, term, or universal quantifier but "G"/);
    expect(() => parse('G(,x)'))
      .toThrow(/"\(", existential quantifier, negation symbol, predicate symbol, term, or universal quantifier but "G"/);
    expect(() => parse('f(x,y)')).toThrow(/1 argument to f but "f\(x,y\)"/);
    expect(() => parse('G(x)')).toThrow(/2 arguments to G/);
    expect(() => parse('aFunction(1,c)')).toThrow(/4 arguments/);
    expect(() => parse('p(p)')).toThrow(/1 argument to p but "p"/);
    expect(() => parse('p()')).toThrow(/1 argument to p but "p"/);
    expect(() => parse('p')).toThrow(/1 argument to p but "p"/);
    expect(() => parse('Q(x,)')).toThrow(/2 arguments to Q but "Q"/);
    expect(() => parse('Q(,x)')).toThrow(/2 arguments to Q but "Q"/);
    expect(() => parse('p(x,y)')).toThrow(/1 argument to p but "p\(x,y\)"/);
    expect(() => parse('Q(x)')).toThrow(/2 arguments to Q but "Q\(x\)"/);
    expect(() => parse('aPredicate(aFunction(1,c,x,y),c,x,y)'))
      .toThrow(/5 arguments/);
    expect(() => parse('p(x) = f(y)'))
      .toThrow(/conjunction symbol, disjunction symbol, end of input, equivalence symbol, or implication symbol but "="/);
    expect(() => parse('f(x) = p(y)')).toThrow(/term but "p"/);
  })
});

describe('shallow formula parsing with precedence', () => {
  test.each(['¬', '-', '~', '\\lnot ','\\neg '])('negation as %s',
    sym => {
      expect(parse(`${sym}p(x)`)).toBe('¬p(v:x)');
      expect(parse(` ${sym}\t \n\rp(x) `)).toBe('¬p(v:x)');
    }
  );

  [
    {
      con: '∧',
      symbols: ['∧', '&', '&&', '/\\', '\\land ', '\\wedge ']
    },
    {
      con: '∨',
      symbols: ['∨', '|', '||', '\\/', '\\lor ', '\\vee ']
    },
    {
      con: '→',
      symbols: [
        '→', '⟶', '⇒', '⟹', '⊃',
        '->', '-->', '=>', '==>',
        '\\limpl ', '\\implies ', '\\rightarrow ', '\\to '
      ]
    },
    {
      con: '↔︎',
      symbols: [
        '↔︎', '⟷', '⇔', '⟺', '≡',
        '<->', '<-->', '<=>', '<==>', '===',
        '\\lequiv ', '\\leftrightarrow ', '\\equivalent ', '\\equiv '
      ]
    },
  ].forEach(({con, symbols}) =>
    test.each(symbols)(`${con} as %s`,
      sym => {
        expect(parse(`(p(x)${sym}Q(c,1))`)).toBe(`(p(v:x)${con}Q(c:c,c:1))`);
        expect(parse(`p(x)${sym}Q(c,1)`)).toBe(`(p(v:x)${con}Q(c:c,c:1))`);
        expect(parse(` (\tp(x)\n${sym}\r\nQ(c,1) )\t`))
          .toBe(`(p(v:x)${con}Q(c:c,c:1))`);
      }
    )
  );

  [
    {
      con: '∧',
      symbols: ['\\land', '\\wedge']
    },
    {
      con: '∨',
      symbols: ['\\lor', '\\vee']
    },
    {
      con: '→',
      symbols: [
        '\\limpl', '\\implies', '\\rightarrow', '\\to'
      ]
    },
    {
      con: '↔︎',
      symbols: [
        '\\lequiv', '\\leftrightarrow', '\\equivalent', '\\equiv'
      ]
    },
  ].forEach(({con, symbols}) =>
    test.each(symbols)(`${con} as %s`,
      sym => {
        expect(parse(`(p(x)${sym}(u=1))`)).toBe(`(p(v:x)${con}v:u=c:1)`);
      }
    )
  );

  [
    {
      quant: '∃',
      symbols: ['∃', '\\e ', '\\ex ', '\\exists ', '\\E ']
    },
    {
      quant: '∀',
      symbols: ['∀', '\\a ', '\\all ', '\\forall ', '\\A ']
    },
  ].forEach(({quant, symbols}) =>
    test.each(symbols)(`${quant} as %s`,
      sym => {
        expect(parse(`${sym}x Q(c,x)`)).toBe(`${quant}x Q(c:c,v:x)`);
        expect(parse(`( ${sym}x Q(c,x) )`)).toBe(`${quant}x Q(c:c,v:x)`);
        expect(parse(` ${sym}\tx\r\np(x)\n\t`))
          .toBe(`${quant}x p(v:x)`);
      }
    )
  );
})

describe('depth 2 formula parsing with precedence', () => {
  const binary = ['∧', '∨', '→', '↔︎'];

  test.each(binary)(`¬ has higher precedence than %s`,
    con => {
      expect(parse(`¬p(x)${con}Q(c,1)`))
        .toBe(`(¬p(v:x)${con}Q(c:c,c:1))`);
      expect(parse(`¬(p(x)${con}Q(c,1))`))
        .toBe(`¬(p(v:x)${con}Q(c:c,c:1))`);
    }
  );

  ['∃', '∀'].forEach((quant) =>
    test.each(binary)(`${quant} has higher precedence than %s`,
      con => {
        expect(parse(`${quant}x p(x)${con}Q(c,1)`))
          .toBe(`(${quant}x p(v:x)${con}Q(c:c,c:1))`);
        expect(parse(`${quant}x(p(x)${con}Q(c,1))`))
          .toBe(`${quant}x (p(v:x)${con}Q(c:c,c:1))`);
      }
    )
  )

  test.each(['∧', '∨'])(`%s is left-associative`,
    con => {
      expect(parse(`p(x)${con}f(c)=y${con}Q(c,1)`))
        .toBe(`((p(v:x)${con}f(c:c)=v:y)${con}Q(c:c,c:1))`);
    }
  );

  test.each(['∨', '→', '↔︎'])(`∧ has higher precedence than %s`,
    con => {
      expect(parse(`p(x)${con}Q(c,1)∧f(c)=y`))
        .toBe(`(p(v:x)${con}(Q(c:c,c:1)∧f(c:c)=v:y))`);
      expect(parse(`p(x)∧f(c)=y${con}Q(c,1)`))
        .toBe(`((p(v:x)∧f(c:c)=v:y)${con}Q(c:c,c:1))`);
    }
  );

  test.each(['→', '↔︎'])(`∨ has higher precedence than %s`,
    con => {
      expect(parse(`p(x)${con}Q(c,1)∨f(c)=y`))
        .toBe(`(p(v:x)${con}(Q(c:c,c:1)∨f(c:c)=v:y))`);
      expect(parse(`p(x)∨f(c)=y${con}Q(c,1)`))
        .toBe(`((p(v:x)∨f(c:c)=v:y)${con}Q(c:c,c:1))`);
    }
  );

  test.each(['→', '↔︎'])(`%s is right-associative`,
    con => {
      expect(parse(`p(x)${con}f(c)=y${con}Q(c,1)`))
        .toBe(`(p(v:x)${con}(f(c:c)=v:y${con}Q(c:c,c:1)))`);
    }
  );

  test('a chain of → can be terminated by ↔︎, which has higher precedence then', () => {
      expect(parse(`p(x)→f(c)=y↔︎Q(c,1)`))
        .toBe(`(p(v:x)→(f(c:c)=v:y↔︎Q(c:c,c:1)))`);
  });

  test('the precedence of ↔︎ to the left of → is unspecified', () => {
    expect(() => parse(`p(x)↔︎f(c)=y→Q(c,1)`))
      .toThrow('conjunction symbol, disjunction symbol, end of input, or equivalence symbol but "→"');
    expect(() => parse(`p(x)→f(c)=y↔︎Q(c,1)→Q(c,aConstant)`))
      .toThrow('conjunction symbol, disjunction symbol, end of input, or equivalence symbol but "→"');
  });
})

const idemFactories = {
  ...factories,
  variable: (v, _) => `${v}`,
  constant: (c, _) => `${c}`
}

const atoms = [
  'Q(1,x)',
  'f(1)=G(c,y)'
]

const unary = [
  f => factories.negation(f),
  f => factories.existentialQuant('x', f),
  f => factories.universalQuant('y', f),
]

const binary = [
  (f1, f2) => factories.conjunction(f1, f2),
  (f1, f2) => factories.disjunction(f1, f2),
  (f1, f2) => factories.implication(f1, f2),
  (f1, f2) => factories.equivalence(f1, f2),
]

const chanceLowerDeg = (deg) =>
  Math.max(0, deg - chance.integer({min: 1, max: 2}))

const chanceFormulaString = (deg) => {
  if (deg <= 0)
    return chance.pickone(atoms);
  const i = chance.integer({ min: -binary.length, max: unary.length - 1});
  if (i >= 0) {
    return unary[i](chanceFormulaString(chanceLowerDeg(deg)));
  }
  return binary[-i - 1](
    chanceFormulaString(chanceLowerDeg(deg)),
    chanceFormulaString(chanceLowerDeg(deg))
  );
}

describe('nested strict formula parsing (256 randomly generated formulas)',
  () => {
    for (let _i = 0; _i < 256; ++_i) {
      const f = chanceFormulaString(chance.integer({min: 1, max: 4}));
      test(`Nested formula "${f}"`, () => {
        expect(parse(f, idemFactories)).toBe(f);
      });
    }
  }
)

describe('deep right-parenthesized formulas', () => {
  test.each(['∧', '∨', '→', '↔︎'])(
    `deep right-parenthesized formula with %s`,
    (con) => {
      let deepIn = 'p(c)';
      let deepOut = 'p(c:c)';
      for (let i = 0; i < 15; i++) {
        deepIn = `(p(c)${con}${deepIn})`;
        deepOut = `(p(c:c)${con}${deepOut})`;
      }
      expect(parse(deepIn)).toBe(deepOut);
    }
  );
})

describe('deep left-parenthesized formulas', () => {
  test.each(['∧', '∨', '→', '↔︎'])(
    `deep left-parenthesized formula with %s`,
    (con) => {
      let deepIn = 'p(c)';
      let deepOut = 'p(c:c)';
      for (let i = 0; i < 15; i++) {
        deepIn = `(${deepIn}${con}p(c))`;
        deepOut = `(${deepOut}${con}p(c:c))`;
      }
      expect(parse(deepIn)).toBe(deepOut);
    }
  );
})
  
describe('deep fully right-parenthesized formula in DNF', () => {
  test('...', () => {
    expect(parse(`((p(1)&&q(aConstant))∨((p(c)&&q(aConstant))∨((p(c)&&q(aConstant))∨((p(1)&&q(aConstant))∨((p(1)&&q(aConstant))∨((p(c)&&q(aConstant))∨((p(c)&&q(aConstant))∨((p(1)&&q(aConstant))∨((p(1)&&q(aConstant))∨((p(c)&&q(aConstant))∨(((p(c)&&q(aConstant))∨(p(1)&&q(aConstant))))))))))))))`))
      .toBe(`((p(c:1)∧q(c:aConstant))∨((p(c:c)∧q(c:aConstant))∨((p(c:c)∧q(c:aConstant))∨((p(c:1)∧q(c:aConstant))∨((p(c:1)∧q(c:aConstant))∨((p(c:c)∧q(c:aConstant))∨((p(c:c)∧q(c:aConstant))∨((p(c:1)∧q(c:aConstant))∨((p(c:1)∧q(c:aConstant))∨((p(c:c)∧q(c:aConstant))∨((p(c:c)∧q(c:aConstant))∨(p(c:1)∧q(c:aConstant)))))))))))))`);
  });
})
