import { arity } from './language'

const applicationWithArityCheck = (sym, args, { expected }) => {
  const a = arity(sym);
  if (args.length !== a) {
    expected(`${a} argument${(a == 1 ? '' : 's')} to ${sym}`);
  }
  return `${sym}(${args.join(',')})`;
}

export default {
  variable: (v, _) => `v:${v}`,
  constant: (c, _) => `c:${c}`,
  functionApplication: applicationWithArityCheck,
  true: (_) => `⊤`,
  false: (_) => `⊥`,
  predicateAtom: applicationWithArityCheck,
  equalityAtom: (lhs, rhs, _) => `${lhs}=${rhs}`,
  negation: (f, _) => `¬${f}`,
  conjunction: (lhs, rhs, _) => `(${lhs}∧${rhs})`,
  disjunction: (lhs, rhs, _) => `(${lhs}∨${rhs})`,
  implication: (lhs, rhs, _) => `(${lhs}→${rhs})`,
  equivalence: (lhs, rhs, _) => `(${lhs}↔︎${rhs})`,
  existentialQuant: (v, f, _) => `∃${v} ${f}`,
  universalQuant: (v, f, _) => `∀${v} ${f}`,
  literal: (neg, sym, args, ee) =>
    `${neg ? '¬' : ''}${applicationWithArityCheck(sym, args, ee)}`,
  clause: (lits) => lits.length ? lits.join('∨') : '□',
}
