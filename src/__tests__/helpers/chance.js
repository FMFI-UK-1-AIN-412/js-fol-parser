import {chance} from 'jest-chance'

const ws = " \u00a0\t\n\r";
const wsOpts = { max: 7 };

export const _chanceWS = (opts = wsOpts) => chance.string({
    pool: ws,
    length: chance.natural(opts)
  })

export const chanceWS = (str = "", opts = wsOpts) =>
  _chanceWS(opts) + str + _chanceWS(opts)
