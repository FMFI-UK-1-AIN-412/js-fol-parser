Parsers for first-order languages
=================================

A set of parser for first order languages with many ways of writing
connectives and several alternative grammars.

Parser parameters
-----------------

### Factories

Most parsers take an object whose methods are factory functions that
are expected to create representations of syntactic elements recognized
by the parser or process them in another application-dependent way.
The required set of factories depends on the parser.

The most basic sets consists of factories producing terms:
```typescript
interface TermFactories<Term> {
    variable: (symbol: string, ee: ErrorExpected) => Term,
    constant: (symbol: string, ee: ErrorExpected) => Term,
    functionApplication: (symbol: string, args: Array<Term>, ee: ErrorExpected) => Term
}
```

Parsers of formulas need term factories and factories producing the various
cases of formulas:
```typescript
interface FormulaFactories<Term, Formula>
extends TermFactories<Term> {
    variable: (symbol: string, ee: ErrorExpected) => Term,
    constant: (symbol: string, ee: ErrorExpected) => Term,
    functionApplication: (symbol: string, args: Array<Term>, ee: ErrorExpected) => Term,
    predicateAtom: (symbol: string, args: Array<Term>, ee: ErrorExpected) => Formula,
    equalityAtom: (lhs: Term, rhs: Term, ee: ErrorExpected) => Formula,
    negation: (subf: Formula, ee: ErrorExpected) => Formula,
    conjunction: (lhs: Formula, rhs: Formula, ee: ErrorExpected) => Formula,
    disjunction: (lhs: Formula, rhs: Formula, ee: ErrorExpected) => Formula,
    implication: (lhs: Formula, rhs: Formula, ee: ErrorExpected) => Formula,
    equivalence: (lhs: Formula, rhs: Formula, ee: ErrorExpected) => Formula,
    existentialQuant: (variable: string, subf: Formula, ee: ErrorExpected) => Formula,
    universalQuant: (variable: string, subf: Formula, ee: ErrorExpected) => Formula
}
```

Parsers of clauses require term factories and factories producing literals
and clauses:
```typescript
interface ClauseFactories<Term, Literal, Clause>
extends TermFactories<Term> {
    literal: (negated: boolean, symbol: string, args: Array<Term>, ee: ErrorExpected) => Literal,
    clause: (literals: Array<Literal>) => Clause,
}
```

Typically, each factory will construct a node of an abstract syntax tree
representing the given case.
However, factories can produce any output.
For instance,
they can directly generate canonical string representations
of terms and formulas,
or directly evaluate them, returning domain elements for terms
and booleans for formulas, respectively.

Factories can use two callbacks to the parser provided in the `ee` argument
to throw a syntax error.
```typescript
interface ErrorExpected {
    error: (message: string) => void,
    expected: (expectation: string) => void
}
```
Throwing syntax errors is useful, e.g.,
if the number of arguments provided
in a function application or a predicate atom
differs from the symbol arity.
This can be seen in the examples of parser usage below.

Note that `ee.error(message)` generates a syntax error with `message`
while `ee.expected(expectation)` generates a syntax error with the message
<code>\`Expected ${expectation} but "${actual_input}" found.\`</code>.
The latter should be preferred.

### Language

Some parsers take an object whose methods should recognize the three types
of non-logical symbols and the variables of a first-order language.
```typescript
interface Language {
    isConstant: (symbol: string) => boolean,
    isFunction: (symbol: string) => boolean,
    isPredicate: (symbol: string) => boolean,
    isVariable: (symbol: string) => boolean,
}
```
When the parser encounters a
[possible non-logical or variable symbol](#non-logical-and-variable-symbols),
it uses these callbacks to determine its type.
Note that the symbol's type actually influences
the parser's decision about the kind of expression it is parsing.
The sets of symbols of different types
**must** therefore be pairwise **disjoint**.

Terms
-----

The parsing function
```typescript
function parseTerm<Term>(input: string, language: Language, factories: TermFactories<Term>): Term
```
recognizes basic first-order terms consisting of constants, variables,
and prefix applications of function symbols
to parenthesized lists of arguments which are again terms.
No infix or postfix function symbols are supported.

Formulas
--------

The basic building blocks of first-order formulas are atoms,
though no parser of atoms is exported.
Unless stated otherwise below,
formula parsers recognize predicate and equality atoms.
Predicate atoms consist either
of a sole nullary predicate symbol
or of a prefix predicate symbol with a positive arity
applied to a parenthesized lists of terms.
Infix or postfix predicate symbols are not supported.
Equality atoms are written with infix equality symbol.

The parsing function
```typescript
function parseFormulaStrict<Term, Formula>(input: string,
    language: Language, factories: FormulaFactories<Term, Formula>): Formula
```
recognizes first-order formulas with a rather strict syntax
in which each binary subformula must be parenthesized,
even at the top level.
Atomic, negated, and quantified subformulas
can be optionally parenthesized.

The function
```typescript
function parseFormulaWithPrecedence<Term, Formula>(input: string,
    language: Language, factories: FormulaFactories<Term, Formula>): Formula
```
recognizes first-order formulas with a relaxed syntax
in which parentheses can be ommited according to precedence
of syntactic operators, which is as follows:
1. negation and quantification;
2. conjunction – left-associative;
3. disjunction – left-associative;
4. implication and equivalence – both are right-associative with themselves,
   implication is also right-associative with equivalence,
   but equivalence is not associative with implication to its right;
   i.e., `A → B → C ↔︎ D ↔︎ E`
   is parsed as `A → (B → (C ↔︎ (D ↔︎ E)))`,
   however, `A ↔︎ B → C` is considered ambiguous and will not be parsed;
   it must be disambiguated to `A ↔︎ (B → C)` or `(A ↔︎ B) → C`.

The parser of clauses
```typescript
function parseClause<Term, Literal, Clause>(input: string,
    language: Language, factories: ClauseFactories<Term, Literal, Clause>): Clause
```
recognizes (possibly nested) disjunctions of
first-order predicate literals. Equality literals are not allowed.
Literals can be joined by any disjunction symbol (typically `∨` or `|`)
or the comma (`,`).
The empty clause can be given by several symbols (typically `□` or `[]`).
The empty string is not considered the empty clause.
The empty clause cannot be used as a literal.

Usage of term and formula parsers
---------------------------------

Parsers are typically used as follows:
Suppose that we have classes `Literal` and `Clause`
defined in a module `clauses.js`,
classes `Variable`, `Constant`, and `FunctionApplication`
defined in a module `terms.js`,
and that we use the clause parser in a function
that obtains the set of symbols `constants`,
and two maps of symbols to arities `functions` and `predicates`.
The clause parser is then set up and called as follows:
```javascript
import {parseClause} from '@fmfi-uk-1-ain-412/js-fol-parser';
import {Constant, Variable, FunctionApplication} from "./terms.js";
import {Literal, Clause} from './clauses.js';

function usingTheClauseParser(constants, functions, predicates) {
    ...
    const nonLogicalSymbols =
        new Set([...constants, ...functions.keys(), ...predicates.keys()])

    const language = {
        isConstant: (symbol) =>
            constants.has(symbol),
        isFunction: (symbol) =>
            functions.has(symbol),
        isPredicate: (symbol) =>
            predicates.has(symbol),
        isVariable: (symbol) =>
            !nonLogicalSymbols.has(symbol),
    }

    function checkArity(symbol, args, arityMap, {expected}) {
        const a = arityMap.get(symbol);
        if (args.length !== a) {
            expected(`${a} argument${(a == 1 ? '' : 's')} to ${symbol}`);
        }
    }

    const factories = {
        variable: (symbol, _) =>
            new Variable(symbol),
        constant: (symbol, _) =>
            new Constant(symbol),
        functionApplication: (funSymbol, args, ee) => {
            checkArity(funSymbol, args, functions, ee);
            return new FunctionApplication(funSymbol, args);
        },
        literal: (negated, predSymbol, args, ee) => {
            checkArity(predSymbol, args, predicates, ee);
            return new Literal(negated, predSymbol, args);
        },
        clause: (literals, _) =>
            new Clause(literals)
    }

    const clause = parseClause(input, language, factories);
    ...
}
```

Declarations of non-logical symbols
-----------------------------------

Three auxiliary parsers recognize lists
declaring non-logical symbols of a first-order language:
```typescript
export interface SymbolWithArity {
    name: string,
    arity: number
}

function parseConstants(input: string): Array<string>;
function parseFunctions(input: string): Array<SymbolWithArity>;
function parsePredicates(input: string): Array<SymbolWithArity>;
```
Symbols declarations must be comma-separated.
A constant declaration is just the constant symbol.
A function or predicate symbol declaration
has the form <code><var>symbol</var>/<var>arity</var></code>.
A function symbol's arity must be a positive decimal integer,
whereas a predicate symbol's arity must be a non-negative decimal integer.

It is up to the code that uses the parsers to check for and resolve
repeated mutually inconstistent declarations of the same symbol.

Substitutions
-------------

The substitution parser
```typescript
export function parseSubstitution<Term>(input: string,
    language: Language, factories: TermFactories<Term>): Array<[string, Term]>;
```
accepts comma-separated lists of ordered pairs specifying a substitution,
i.e., a map from variables to terms.
The pairs can be written alternatively
as <code>(<var>var</var>, <var>term</var>)</code>
or <code><var>var</var> MAPS-TO <var>term</var></code>,
where `MAPS-TO` is one of `->`, `|->`,
`↦` (`\u21A6`, RIGHTWARDS ARROW FROM BAR),
`⟼` (`\u27FC`, LONG RIGHTWARDS ARROW FROM BAR, maps to),
or `\mapsto`.

It is up to the code that uses the parser to check for and resolve
repeated mutually inconstistent pairs
assigning different terms to the same variable.

Finite structure and valuation definitions
------------------------------------------

The trio of parsers
```typescript
function parseDomain(input: string): Array<string>;
function parseTuples(input: string): Array<Array<string>>;
function parseValuation(input: string, language: Language): Array<[string, string]>;
```
allows for processing parts of definitions of finite structures
and variable valuation.
A domain element is a non-empty string of arbitrary characters
except `(`, `)`, `,`, Unicode spaces, and
spacing ASCII control characters (\t, \n, \r, \v, \f).

`parseDomain` accepts a comma-separated list of domain elements.

`parseTuples` accepts a comma-separated list of domain elements
or ordered <var>n</var>-tuples of domain elements in the usual notation
<code>(<var>e</var><sub>1</sub>, <var>e</var><sub>2</sub>, …,
<var>e</var><sub><var>n</var></sub>)</code>.
It is intended to parse interpretations of predicate and function symbols.

`parseValuation` accepts a comma-separated list of ordered pairs
describing a valuation of variables.
The pairs can be written alternatively
as <code>(<var>var</var>, <var>domain-element</var>)</code>
or <code><var>var</var> MAPS-TO <var>domain-element</var></code>,
where `MAPS-TO` has been specified
in the section on [substitutions](#substitutions).
This parser requires [a language](#language) as its second argument
in order to recognize the symbols of variables in the input.

Non-logical and variable symbols
--------------------------------

The parser recognizes valid
[JavaScript identifiers](https://developer.mozilla.org/en-US/docs/Glossary/Identifier)
as function, predicate, and variable symbols.

Symbols of constants can also start with a digit (as defined by Unicode)
and continue as a regular identifier.

Logical symbols
---------------

The parser recognizes many alternative ways of writing logical symbols.
The alternatives are listed below directly in the PEGjs syntax.

```pegjs
EqualitySymbol
    "equality symbol"
    = "="

ConjunctionSymbol
    "conjunction symbol"
    = "∧"
    / "&&"
    / "&"
    / "/\\"
    / "\\land" ! IdentifierPart
    / "\\wedge" ! IdentifierPart

DisjunctionSymbol
    "disjunction symbol"
    = "∨"
    / "||"
    / "|"
    / "\\/"
    / "\\lor" ! IdentifierPart
    / "\\vee" ! IdentifierPart

ImplicationSymbol
    "implication symbol"
    = "→" / "⇒" / "⟶" / "⟹" / "⊃"
    / "->" / "=>" / "-->" / "==>"
    / "\\limpl" ! IdentifierPart
    / "\\implies" ! IdentifierPart
    / "\\rightarrow" ! IdentifierPart
    / "\\to" ! IdentifierPart

EquivalenceSymbol
    "equivalence symbol"
    = "↔︎" / "⟷" / "⇔" / "⟺" / "≡"
    / "<->" / "<-->" / "<=>" / "<==>" / "==="
    / "\\lequiv" ! IdentifierPart
    / "\\leftrightarrow" ! IdentifierPart
    / "\\equivalent" ! IdentifierPart
    / "\\equiv" ! IdentifierPart

ExistsSymbol
    "existential quantifier"
    = "∃"
    / "\\e" ( "x" "ists"? )? ! IdentifierPart
    / "\\E" ! IdentifierPart

ForallSymbol
    "universal quantifier"
    = "∀"
    / "\\forall" ! IdentifierPart
    / "\\all" ! IdentifierPart
    / "\\a" ! IdentifierPart
    / "\\A" ! IdentifierPart

NegationSymbol
    "negation symbol"
    = "¬"
    / "-" / "!" / "~"
    / "\\neg" ! IdentifierPart
    / "\\lnot" ! IdentifierPart

NonEqualitySymbol
    "non-equality symbol"
    = "≠"
    / "!=" / "<>" / "/="
    / "\\neq" ! IdentifierPart

EmptyClause
    "empty clause symbol"
    = "□" / "▫︎" / "◽︎" / "◻︎" / "⬜︎" / "▢" / "⊥"
    / "[]" / "_|_"
    / "\\square" ! IdentifierPart
    / "\\Box"  ! IdentifierPart
    / "\\qed" ! IdentifierPart
```
