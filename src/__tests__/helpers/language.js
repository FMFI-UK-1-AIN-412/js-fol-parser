export const constants = new Set(['c', 'aConstant', '1'])

const _functions = new Map(Object.entries({
  'f': 1,
  'G': 2,
  'aFunction': 4
}))

export const functions = new Set(_functions.keys())

const _predicates = new Map(Object.entries({
  'p': 1,
  'Q': 2,
  'aPredicate': 5
}))

export const predicates = new Set(_predicates.keys())

const symbolsWithArity =
  new Map([..._functions, ..._predicates])

const isConstant = i => constants.has(i)
const isFunction = i => functions.has(i)
const isPredicate = i => predicates.has(i)
const isVariable = i =>
  !(isConstant(i) || isFunction(i) || isPredicate(i))
export const arity = s => symbolsWithArity.get(s)

export default {
  isConstant,
  isFunction,
  isPredicate,
  isVariable
}

export const iLanguage = {
  isConstant
}
