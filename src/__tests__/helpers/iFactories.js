const application = (sym, args, _) => `${sym}(${args.join(',')})`

export default {
  variable: (v, _) => `v:${v}`,
  constant: (c, _) => `c:${c}`,
  functionApplication: application,
  predicateAtom: application,
  equalityAtom: (lhs, rhs, _) => `${lhs}=${rhs}`,
  negation: (f, _) => `¬${f}`,
  conjunction: (lhs, rhs, _) => `(${lhs}∧${rhs})`,
  disjunction: (lhs, rhs, _) => `(${lhs}∨${rhs})`,
  implication: (lhs, rhs, _) => `(${lhs}→${rhs})`,
  equivalence: (lhs, rhs, _) => `(${lhs}↔︎${rhs})`,
  existentialQuant: (v, f, _) => `∃${v} ${f}`,
  universalQuant: (v, f, _) => `∀${v} ${f}`,
  literal: (neg, sym, args, ee) =>
    `${neg ? '¬' : ''}${application(sym, args, ee)}`,
  clause: (lits) => lits.length ? lits.join('∨') : '□',
}
