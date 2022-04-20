import {parseITerm, SyntaxError} from '../index'

import {iLanguage, constants} from './helpers/language'

import iFactories from './helpers/iFactories'

const parse = str => parseITerm(str, iLanguage, iFactories)

describe('term parsing', () => {
  test.each(['x', 'F', '$v', '_', '$_', '__proměnná$'])
    ('variable %s', (v) => {
      expect(parse(v)).toBe(`v:${v}`)
    });

  test.each(Array.from(constants))('constant %s', (c) => {
    expect(parse(c)).toBe(`c:${c}`)
  })

  test('function application term', () => {
    expect(parse('f(1)')).toBe('f(c:1)');
    expect(parse('G(x,1)')).toBe('G(v:x,c:1)');
    expect(parse('f ( 1 ) ')).toBe('f(c:1)');
    expect(parse('aFunction(\n\tG(\n\t  f(x),\n\t  G(1,aConstant)\n),\n\t$v,\n\t1,\n\tf(c))'))
      .toBe('aFunction(G(f(v:x),G(c:1,c:aConstant)),v:$v,c:1,f(c:c))');
  })

  test('function application term is not checked for arity', () => {
    expect(parse('f(x,y)')).toBe('f(v:x,v:y)');
    expect(parse('G(x)')).toBe('G(v:x)');
    expect(parse('aFunction(1,c)')).toBe('aFunction(c:1,c:c)');
  });

  test('function symbol can be reused as variable', () => {
    expect(parse('x(x)')).toBe('x(v:x)');
  });

  test('non-terms', () => {
    expect(() => parse('c(x)')).toThrow(SyntaxError);
    expect(() => parse('f()')).toThrow(SyntaxError);
    expect(() => parse('f(x,)')).toThrow(SyntaxError);
    expect(() => parse('f(,x)')).toThrow(SyntaxError);
    expect(() => parse('G(x,)')).toThrow(SyntaxError);
    expect(() => parse('G(,x)')).toThrow(SyntaxError);
  })
})
