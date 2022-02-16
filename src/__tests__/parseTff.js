import {chance} from 'jest-chance'
import {chanceWS} from './helpers/chance'
import {parseTff} from '../index.js'

import factories from './helpers/factories'
import startRules from "../parser/startRules";
const application = (sym, args, _) => `${sym}(${args.join(',')})`
const factoriesWoLanguage = {...factories, functionApplication: application, predicateAtom: application}
const parse = (str, fs = factoriesWoLanguage) =>
    parseTff(str, fs)


describe('tff', () => {
  test('constant', () => {
    expect(parse('tff(declare_$i1,type,jozko:$i).')).toEqual(

          {name:'declare_$i1', type:'type', formula: {
              "atom": factoriesWoLanguage.constant('jozko'), "kind": "atom typing", "type": "$i"
            }},
    );
  });
  test('quantifiedOr', () => {
    expect(parse('tff(finite_domain,axiom, ! [X:$i] : (X=jozko|X=fmb_i2' +
        ') ).')).toEqual(
        {name:'finite_domain', type:'axiom', formula: factoriesWoLanguage.universalQuant(factoriesWoLanguage.variable("X"), factoriesWoLanguage.disjunction(
              factoriesWoLanguage.equalityAtom(factoriesWoLanguage.constant("X"), factoriesWoLanguage.constant("jozko")),
              factoriesWoLanguage.equalityAtom(factoriesWoLanguage.constant("X"), factoriesWoLanguage.constant("fmb_i2"))))}

    );
  });
  test('notEqual', () => {
    expect(parse('tff(distinct_domain,axiom,jozko!=fmbi2).')).toEqual(
        {name:'distinct_domain', type:'axiom',
          formula:factoriesWoLanguage.negation(factoriesWoLanguage.equalityAtom(factoriesWoLanguage.constant("jozko"), factoriesWoLanguage.constant("fmbi2")))},
    );
  });
  test('andStudent', () => {
    expect(parse('tff(predicate_student,axiom,\n' +
        'student(jozko)' +
        '& ~student(fmb_$i_2)' +

        ').')).toEqual(
        {name:'predicate_student', type:'axiom', formula:factoriesWoLanguage.conjunction(factoriesWoLanguage.predicateAtom("student", [factories.constant('jozko')]), factoriesWoLanguage.negation(factoriesWoLanguage.predicateAtom("student", [factories.constant("fmb_$i_2")])))},
    );
  });
  test('andZnamka', () => {
    expect(parse('tff(predicate_znamka,axiom,' +
        '~znamka(jozko) & znamka(fmbi2)' +
        ').')).toEqual(
        {name:'predicate_znamka', type:'axiom', formula:factoriesWoLanguage.conjunction(factoriesWoLanguage.negation(factoriesWoLanguage.predicateAtom("znamka",[factories.constant('jozko')])), factoriesWoLanguage.predicateAtom("znamka",[factories.constant('fmbi2')])) },
    );
  });
  test('andHodnotenie', () => {
    expect(parse('tff(predicate_hodnotenie,axiom,' +
        '~hodnotenie(jozko,jozko) & hodnotenie(jozko,fmb_$i_2)' +
        '& ~hodnotenie(fmb_$i_2,jozko)' +
        '& ~hodnotenie(fmb_$i_2,fmb_$i_2)' +
         ').')).toEqual(
        {name:'predicate_hodnotenie', type:'axiom', formula:
          factoriesWoLanguage.conjunction(
              factoriesWoLanguage.conjunction(
                  factoriesWoLanguage.conjunction(factoriesWoLanguage.negation(factoriesWoLanguage.predicateAtom("hodnotenie", [factoriesWoLanguage.constant('jozko'), factoriesWoLanguage.constant('jozko')])), factoriesWoLanguage.predicateAtom("hodnotenie", [factoriesWoLanguage.constant('jozko'), factoriesWoLanguage.constant('fmb_$i_2')])),
                  factoriesWoLanguage.negation(factoriesWoLanguage.predicateAtom("hodnotenie", [factoriesWoLanguage.constant('fmb_$i_2'), factoriesWoLanguage.constant('jozko')]))
              ),
              factoriesWoLanguage.negation(factoriesWoLanguage.predicateAtom("hodnotenie", [factoriesWoLanguage.constant('fmb_$i_2'), factoriesWoLanguage.constant('fmb_$i_2')]))
          ),
        },
    );
  });
  test('typeOfPredicate', () => {
    expect(parse('tff(declare_hodnotenie,type,hodnotenie: ($i * $i) > $o).')).toEqual(
        {name:'declare_hodnotenie', type:'type', formula:
              {
                "atom": factoriesWoLanguage.constant('hodnotenie'),
                "kind": "atom typing",
                "type": "($i * $i) > $o",
              }},
    );
  });
});
