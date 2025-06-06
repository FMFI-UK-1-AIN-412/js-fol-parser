import {chance} from 'jest-chance'
import {chanceWS} from './helpers/chance'
import {parseTff} from '../index.js'

import factories from './helpers/factories'
import startRules from "../parser/startRules";
const application = (sym, args, _) => `${sym}(${args.join(',')})`
const universal = (v, type, f, _) => `∀${v} ${type} ${f}`
const exist = (v, type, f, _) => `∀${v} ${type} ${f}`
const factoriesWoLanguage = {...factories, functionApplication: application, predicateAtom: application,
                                universalQuant: universal, existentialQuant:exist}
const parse = (str, fs = factoriesWoLanguage) =>
    parseTff(str, fs)


describe('tff', () => {
  test('constant', () => {
    expect(parse(`tff('declare_$i1',type,jozko:$i).`)).toEqual(

          {name:'declare_$i1', type:'type', formula: {
              "atom": factoriesWoLanguage.constant('jozko'), "kind": "atom typing", "type": "$i"
            }},
    );
  });
  test('quantifiedOr', () => {
    expect(parse('tff(finite_domain,axiom, ! [X:$i] : (X=jozko|X=fmb_i2' +
        ') ).')).toEqual(
        {name:'finite_domain', type:'axiom', formula: factoriesWoLanguage.universalQuant(factoriesWoLanguage.variable("X"), "i", factoriesWoLanguage.disjunction(
              factoriesWoLanguage.equalityAtom(factoriesWoLanguage.variable("X"), factoriesWoLanguage.constant("jozko")),
              factoriesWoLanguage.equalityAtom(factoriesWoLanguage.variable("X"), factoriesWoLanguage.constant("fmb_i2"))))}

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
        `& ~student('fmb_$i_2')` +

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
        '~hodnotenie(jozko, jozko) & hodnotenie(jozko, \'fmb_$i_2\')' +
        '& ~hodnotenie(\'fmb_$i_2\', jozko)' +
        '& ~hodnotenie(\'fmb_$i_2\', \'fmb_$i_2\')' +
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
    expect(parse('tff(declare_hodnotenie,type,hodnotenie: $i * $i > $o).')).toEqual(
        {name:'declare_hodnotenie', type:'type', formula:
              {
                "atom": factoriesWoLanguage.constant('hodnotenie'),
                "kind": "atom typing",
                "type": "$i * $i > $o",
              }},
    );
  });
    test('structureOfFourElements', () => {
        expect(parse(`tff('declare_$i2',type,petra:$i).`)).toEqual(
            {name:'declare_$i2', type:'type', formula:
                    {
                        "atom": factoriesWoLanguage.constant('petra'),
                        "kind": "atom typing",
                        "type": "$i",
                    }},
        );

        expect(parse('tff(finite_domain,axiom,\n' +
            '      ! [X:$i] : (\n' +
            '         X = jozko | X = petra | X = hanka | X = katka\n' +
            '      ) ).')).toEqual(
            {
                name: 'finite_domain', type: 'axiom', formula:
                    factoriesWoLanguage.universalQuant(factoriesWoLanguage.variable("X"), "i",
                        factoriesWoLanguage.disjunction(
                            factoriesWoLanguage.disjunction(
                                factoriesWoLanguage.disjunction(
                                    factoriesWoLanguage.equalityAtom(factoriesWoLanguage.variable("X"), factoriesWoLanguage.constant("jozko")),
                                    factoriesWoLanguage.equalityAtom(factoriesWoLanguage.variable("X"), factoriesWoLanguage.constant("petra"))
                                ),
                                factoriesWoLanguage.equalityAtom(factoriesWoLanguage.variable("X"), factoriesWoLanguage.constant("hanka"))
                            ),
                            factoriesWoLanguage.equalityAtom(factoriesWoLanguage.variable("X"), factoriesWoLanguage.constant("katka"))
                        )
                    )
            }
        );
        expect(parse('tff(distinct_domain,axiom,\n' +
            '         jozko != petra & jozko != hanka & jozko != katka & petra != hanka & petra != katka & \n' +
            '         hanka != katka\n' +
            ').')).toEqual(
            {
                name: 'distinct_domain', type: 'axiom', formula:
                    factoriesWoLanguage.conjunction(
                        factoriesWoLanguage.conjunction(
                            factoriesWoLanguage.conjunction(
                                factoriesWoLanguage.conjunction(
                                    factoriesWoLanguage.conjunction(
                                        factoriesWoLanguage.negation(
                                            factoriesWoLanguage.equalityAtom(
                                                factoriesWoLanguage.constant("jozko"), factoriesWoLanguage.constant("petra")
                                            )
                                        ),
                                        factoriesWoLanguage.negation(
                                            factoriesWoLanguage.equalityAtom(
                                                factoriesWoLanguage.constant("jozko"), factoriesWoLanguage.constant("hanka")
                                            )
                                        ),
                                    ),
                                    factoriesWoLanguage.negation(
                                        factoriesWoLanguage.equalityAtom(
                                            factoriesWoLanguage.constant("jozko"), factoriesWoLanguage.constant("katka")
                                        )
                                    ),
                                ),
                                factoriesWoLanguage.negation(
                                    factoriesWoLanguage.equalityAtom(
                                        factoriesWoLanguage.constant("petra"), factoriesWoLanguage.constant("hanka")
                                    )
                                )
                            ),
                            factoriesWoLanguage.negation(
                                factoriesWoLanguage.equalityAtom(
                                    factoriesWoLanguage.constant("petra"), factoriesWoLanguage.constant("katka")
                                )
                            )

                        ),
                        factoriesWoLanguage.negation(
                            factoriesWoLanguage.equalityAtom(
                                factoriesWoLanguage.constant("hanka"), factoriesWoLanguage.constant("katka")
                            )
                        )
                    )

            },
        );
        expect(parse('tff(predicate_student,axiom,\n' +
            '           student(jozko)\n' +
            '         & student(petra)\n' +
            '         & student(hanka)\n' +
            '         & student(katka)\n' +
            '\n' +
            ').')).toEqual(
            {name:'predicate_student', type:'axiom', formula:
                    factoriesWoLanguage.conjunction(
                        factoriesWoLanguage.conjunction(
                            factoriesWoLanguage.conjunction(
                                factoriesWoLanguage.predicateAtom("student", [factoriesWoLanguage.constant('jozko')]),
                                factoriesWoLanguage.predicateAtom("student", [factoriesWoLanguage.constant('petra')])
                            ),
                            factoriesWoLanguage.predicateAtom("student", [factoriesWoLanguage.constant('hanka')])

                        ),
                        factoriesWoLanguage.predicateAtom("student", [factoriesWoLanguage.constant('katka')])
                    ),


            },
        );
        expect(parse('tff(predicate_znamka,axiom,\n' +
            '           znamka(jozko)\n' +
            '         & znamka(petra)\n' +
            '         & znamka(hanka)\n' +
            '         & znamka(katka)\n' +
            '\n' +
            ').')).toEqual(
            {name:'predicate_znamka', type:'axiom', formula:
                    factoriesWoLanguage.conjunction(
                        factoriesWoLanguage.conjunction(
                            factoriesWoLanguage.conjunction(
                                factoriesWoLanguage.predicateAtom("znamka", [factoriesWoLanguage.constant('jozko')]),
                                factoriesWoLanguage.predicateAtom("znamka", [factoriesWoLanguage.constant('petra')])
                            ),
                            factoriesWoLanguage.predicateAtom("znamka", [factoriesWoLanguage.constant('hanka')])

                        ),
                        factoriesWoLanguage.predicateAtom("znamka", [factoriesWoLanguage.constant('katka')])
                    ),


            },
        );


    });
    test('predicate with atomic definition', () => {
        expect(parse(`tff(predicate_p1,axiom,
                          p1('fmb_$i_1')

                       ).`)).toEqual(
            {name:'predicate_p1', type:'axiom', formula:
                    factoriesWoLanguage.predicateAtom("p1", [factoriesWoLanguage.constant('fmb_$i_1')])
            },
        );
    });
    test('comments', () => {
        let a = `tff(predicate_p7,axiom,\n` +
             `          p7('fmb_$i_1','fmb_$i_1','fmb_$i_1')\n` +
             `%         p7('fmb_$i_1','fmb_$i_4','fmb_$i_4') undefined in model\n` +
            `         & p7('fmb_$i_2','fmb_$i_1','fmb_$i_1')` +
            `).`
         expect(parse(a)).toEqual(
             {name:'predicate_p7', type:'axiom', formula:  factoriesWoLanguage.conjunction(factoriesWoLanguage.predicateAtom("p7", [factories.constant('fmb_$i_1'), factories.constant('fmb_$i_1'), factories.constant('fmb_$i_1')]),
                         factoriesWoLanguage.predicateAtom("p7", [factories.constant('fmb_$i_2'), factories.constant('fmb_$i_1'), factories.constant('fmb_$i_1')])
                         )
                 },
         );

        let b = `tff(predicate_p7,axiom,\n` +
             `          p7('fmb_$i_1','fmb_$i_1','fmb_$i_1')\n` +
             `         & p7('fmb_$i_2','fmb_$i_1','fmb_$i_1')\n` +
             `%         p7('fmb_$i_1','fmb_$i_4','fmb_$i_4') undefined in model\n` +
            `).` 
         expect(parse(b)).toEqual(
             {name:'predicate_p7', type:'axiom', formula:  factoriesWoLanguage.conjunction(factoriesWoLanguage.predicateAtom("p7", [factories.constant('fmb_$i_1'), factories.constant('fmb_$i_1'), factories.constant('fmb_$i_1')]),
                         factoriesWoLanguage.predicateAtom("p7", [factories.constant('fmb_$i_2'), factories.constant('fmb_$i_1'), factories.constant('fmb_$i_1')])
                         )
                 },
         );

        let c = `tff(predicate_p7,axiom,\n` +
             `%         p7('fmb_$i_1','fmb_$i_4','fmb_$i_4') undefined in model\n` +
             `          p7('fmb_$i_1','fmb_$i_1','fmb_$i_1')\n` +
             `        & p7('fmb_$i_2','fmb_$i_1','fmb_$i_1')\n` +
            `).`
         expect(parse(c)).toEqual(
             {name:'predicate_p7', type:'axiom', formula:  factoriesWoLanguage.conjunction(factoriesWoLanguage.predicateAtom("p7", [factories.constant('fmb_$i_1'), factories.constant('fmb_$i_1'), factories.constant('fmb_$i_1')]),
                         factoriesWoLanguage.predicateAtom("p7", [factories.constant('fmb_$i_2'), factories.constant('fmb_$i_1'), factories.constant('fmb_$i_1')])
                         )
                 },
         );
     });
 });
