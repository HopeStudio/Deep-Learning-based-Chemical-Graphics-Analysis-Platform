import CError from '../error'
import { err } from '../decorator'
import { Validator } from '../utils'

function exist(value) {
  if (value === '' || value === undefined) {
    return false
  }

  return true
}

/**
 * to check if the param is correct
 * usage:
 * @example
 * param('uname', 'password') // check if uname and password is exist in ctx.body
 * param('uname', ['password', 'authId']) // check if uname and (password or authId) is exist in ctx.body
 * param('uname', ['accessToken', { reflesh: 'cookie' }]) // check if uname in ctx.body and (accessToken in ctx.body or reflesh in cookie)
 * param(['accessToken', {AND: ['authId', 'authToken']}])// check if accessToken in ctx.body or (both authId and authToken) in ctx.body
 *
 * @see validator.ts
 * @export
 * @param {(...Array<string | string[]>)} options
 * @returns
 */
export default function param(...options: Array<string | string[] | Rules | Rules2>) {
  return function (_target, _name, descriptor) {
    const prevFunc = descriptor.value
    const validator = new Validator()

    descriptor.value = async function (...args) {
      // check if param is exist in ctx.body
      validator.setDefaultRule(param => exist(this.ctx.request.body[param]))

      // check if param is exist in cookie
      validator.addRule('cookie', param => exist(this.ctx.cookies.get(param)))

      const lackOfParam = validator.validate(...options)

      if (lackOfParam.length === 0) {
        const result = await prevFunc.apply(this, args)
        return result
      }

      const message = `error of param: ${lackOfParam.join(',')}`

      throw new CError(
        message,
        err.type.param().errCode(11),
        false)
    }

    return descriptor
  }
}

type rules = 'default' | 'cookie'

interface Rules {
  [props: string]: rules
}

interface Rules2 {
  'AND': Array<string | string[] | Rules | Rules2>
}
