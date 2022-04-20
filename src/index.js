import { parse, SyntaxError } from './parser'

import startRules from './parser/startRules'

export { parse, SyntaxError }

export const parseTerm = (input, language, factories) =>
  parse(input, {
    startRule: startRules.Term,
    language,
    factories
  })

export const parseFormulaStrict = (input, language, factories) =>
  parse(input, {
    startRule: startRules.FormulaStrict,
    language,
    factories
  })

export const parseFormulaWithPrecedence = (input, language, factories) =>
  parse(input, {
    startRule: startRules.FormulaWithPrecedence,
    language,
    factories
  })

export const parseClause = (input, language, factories) =>
  parse(input, {
    startRule: startRules.Clause,
    language,
    factories
  })

export const parseITerm = (input, language, factories) =>
  parse(input, {
    startRule: startRules.ITerm,
    language,
    factories
  })

export const parseIClause = (input, language, factories) =>
  parse(input, {
    startRule: startRules.IClause,
    language,
    factories
  })

export const parseConstants = (input) =>
  parse(input, {
    startRule: startRules.Constants,
    language: null,
    factories: null
  })

export const parsePredicates = (input) =>
  parse(input, {
    startRule: startRules.Predicates,
    language: null,
    factories: null
  })

export const parseFunctions = (input) =>
  parse(input, {
    startRule: startRules.Functions,
    language: null,
    factories: null
  })

export const parseDomain = (input) =>
  parse(input, {
    startRule: startRules.Domain,
    language: null,
    factories: null
  })

export const parseTuples = (input) =>
  parse(input, {
    startRule: startRules.Tuples,
    language: null,
    factories: null
  })

export const parseValuation = (input, language) =>
  parse(input, {
    startRule: startRules.Valuation,
    language,
    factories: null
  })

export const parseSubstitution = (input, language, factories) =>
  parse(input, {
    startRule: startRules.Substitution,
    language,
    factories
  })
