declare module "@fmfi-uk-1-ain-412/js-fol-parser" {
    export function parse(input: string, options: object): any;

    export type Position = {
        offset: number,
        line: number,
        column: number
    };

    export type Location = {
        start: Position,
        end: Position
    };

    export type Expectation = object;

    export class SyntaxError extends Error {
        message: string;
        expected: Expectation;
        found: string | null;
        location: Location;
        constructor(message: string, expected: Expectation, found: string | null, location: Location);
    }

    export interface Language {
        isConstant: (symbol: string) => boolean,
        isFunction: (symbol: string) => boolean,
        isPredicate: (symbol: string) => boolean,
        isVariable: (symbol: string) => boolean,
    }

    export interface ErrorExpected {
        error: (message: string) => void,
        expected: (expectation: string) => void
    }

    export interface TermFactories<Term> {
        variable: (symbol: string, ee: ErrorExpected) => Term,
        constant: (symbol: string, ee: ErrorExpected) => Term,
        functionApplication: (symbol: string, args: Array<Term>, ee: ErrorExpected) => Term
    }

    export interface FormulaFactories<Term, Formula>
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

    export interface ClauseFactories<Term, Literal, Clause>
    extends TermFactories<Term> {
        literal: (negated: boolean, symbol: string, args: Array<Term>, ee: ErrorExpected) => Literal,
        clause: (literals: Array<Literal>) => Clause,
    }

    export function parseTerm<Term>(input: string, language: Language, factories: TermFactories<Term>): Term;

    export function parseFormula<Term, Formula>(input: string, language: Language, factories: FormulaFactories<Term, Formula>): Formula;

    export function parseFormulaWithPrecedence<Term, Formula>(input: string, language: Language, factories: FormulaFactories<Term, Formula>): Formula;

    export function parseClause<Term, Literal, Clause>(input: string, language: Language, factories: ClauseFactories<Term, Literal, Clause>): Clause;

    export interface SymbolWithArity {
        name: string,
        arity: number
    }

    export function parseConstants(input: string): Array<string>;

    export function parseFunctions(input: string): Array<SymbolWithArity>;

    export function parsePredicates(input: string): Array<SymbolWithArity>;

    export function parseDomain(input: string): Array<string>;

    export function parseTuples(input: string): Array<Array<string>>;

    export function parseValuation(input: string, language: Language): Array<[string, string]>;

    export function parseSubstitution<Term>(input: string, language: Language, factories: TermFactories<Term>): Array<[string, Term]>;
}
