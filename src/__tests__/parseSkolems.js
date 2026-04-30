import {parseSkolemSymbols} from "../index";
import {chanceWS} from "./helpers/chance";
import {
    arity,
    constants as constantsSet,
    functions as functionsSet,
} from "./helpers/language";

const constants = Array.from(constantsSet);
const functions = Array.from(functionsSet);

const aritySymToString = (id) => (arity(id) ?? 0) === 0 ? id : id + chanceWS('/') + arity(id)
const aritySymToOutput = (id) => ({ name: id, arity: arity(id) ?? 0 })

describe('skolems', () => {
    test('empty', () => {
        expect(() => parseSkolemSymbols('')).toThrow(/^Expected constant identifier or function identifier\/positive arity/);
        //expect(() => parseSkolemSymbols('  \t\n\r  ')).toThrow(/^Expected constant identifier or function identifier\/positive arity/);
    });
    test('singleton', () => {
        constants.forEach((c) =>
            expect(parseSkolemSymbols(chanceWS(c))).toStrictEqual([aritySymToOutput(c)]));
        functions.forEach((p) =>
            expect(parseSkolemSymbols(chanceWS(aritySymToString(p))))
                .toStrictEqual([aritySymToOutput(p)])
        );
    });
    test('multiple symbols', () => {
        expect(parseSkolemSymbols(constants.join(','))).toStrictEqual(constants.map(aritySymToOutput));
        expect(parseSkolemSymbols(constants.join(', '))).toStrictEqual(constants.map(aritySymToOutput));
        expect(parseSkolemSymbols(
            constants.map((el) => chanceWS(el)).join(',')
        )).toStrictEqual(constants.map(aritySymToOutput));

        expect(parseSkolemSymbols(functions.map(aritySymToString).join(','))).toStrictEqual(functions.map(aritySymToOutput));
        expect(parseSkolemSymbols(functions.map(aritySymToString).join(', '))).toStrictEqual(functions.map(aritySymToOutput));
        expect(parseSkolemSymbols(
            functions.map((p) => chanceWS(aritySymToString(p))).join(',')
        )).toStrictEqual(functions.map(aritySymToOutput));

        expect(parseSkolemSymbols(
            constants.map(aritySymToString).join(',') + "," + functions.map(aritySymToString).join(',')
        )).toStrictEqual([...constants.map(aritySymToOutput), ...functions.map(aritySymToOutput)]);
        expect(parseSkolemSymbols(
            constants.map(aritySymToString).join(', ') + ", " + functions.map(aritySymToString).join(', ')
        )).toStrictEqual([...constants.map(aritySymToOutput), ...functions.map(aritySymToOutput)]);
        expect(parseSkolemSymbols(
            constants.map((el) => chanceWS(el)).join(',') +
            "," +
            functions.map((p) => chanceWS(aritySymToString(p))).join(',')
        )).toStrictEqual([...constants.map(aritySymToOutput), ...functions.map(aritySymToOutput)]);
    });
    test('bad symbols or arities', () => {
        expect(() => parseSkolemSymbols('1,(p),Jajo8'))
            .toThrow(/^Expected constant identifier or function identifier\/positive arity/);
        expect(() => parseSkolemSymbols('1,_#_,Jajo8'))
            .toThrow(/^Expected "," or end of input/);
        expect(() => parseSkolemSymbols('1,AA~BB,Jajo8'))
            .toThrow(/^Expected "," or end of input/);
        expect(() => parseSkolemSymbols('1,😈,Jajo8'))
            .toThrow(/^Expected constant identifier or function identifier\/positive arity/);
        expect(() => parseSkolemSymbols('f/1,(p),Jajo8'))
            .toThrow(/^Expected constant identifier or function identifier\/positive arity/);
        expect(() => parseSkolemSymbols('f/1,_#_,Jajo8'))
            .toThrow(/^Expected "," or end of input/);
        expect(() => parseSkolemSymbols('f/1,AA~BB,Jajo8'))
            .toThrow(/^Expected "," or end of input/);
        expect(() => parseSkolemSymbols('f/1,😈,Jajo8'))
            .toThrow(/^Expected constant identifier or function identifier\/positive arity/);
        expect(() => parseSkolemSymbols('f/1,g/'))
            .toThrow(/^Expected "," or end of input/);
        expect(() => parseSkolemSymbols('f/1,g/-1'))
            .toThrow(/^Expected "," or end of input/);
        expect(() => parseSkolemSymbols('f/1,/1'))
            .toThrow(/^Expected constant identifier or function identifier\/positive arity/);
        expect(() => parseSkolemSymbols('f/0'))
            .toThrow(/^Expected "," or end of input/);
    });
});