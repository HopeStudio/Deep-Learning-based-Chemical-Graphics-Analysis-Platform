/**
 * to validate value use rules set by user
 * support OR, AND operator:
 * OR: a simple array
 * AND: argument list or object like: {AND: []}
 *
 * support custom rule:
 * { [param]: 'rule' }
 * if there are more than one param, then work like an AND Array
 *
 * e.g. { uname: 'string', groupId: 'number' }
 * you can use both AND and custom rule:
 * { uname: 'string', AND: ['a', 'b', 'openId'] }
 * // AND Array will use default rule, and the result will be merged
 *
 * custom rule result format will be like: `groupId{number} AND uname{string}`
 * which will following by its type, and default type will be ignore.
 *
 * @return an array of param that validate fail:
 * validate(['a', 'b', 'c']) => ['b OR c'] (if a pass, b and c fail)
 * validate('a', 'b', 'c') => ['a, b, c']
 * validate({AND: ['a', 'b', 'c']}) => ['a AND b AND c']
 *
 * @example
 * const validator = new Validator
 * const data = {a:12, b:18, c: -12, d: -13}
 *
 * validator.setDefaultRule(param => data[param] > 0)
 * // or
 * validator.addRule('default', param => data[param] > 0)
 *
 * validator.validate('a', 'b') // return []
 * validator.validate('a', 'c') // return ['c']
 * validator.validate(['a', 'c']) // return []
 * validator.validate({AND: ['c', 'd']}) // return ['c AND d']
 * validator.validate(['c', 'd']) // return ['c OR d']
 *
 * validator.addRule('reverse', param => data[param] < 0)
 * validator.validate({c: reverse, d: reverse}) // return []
 * validator.validate({a: reverse, b: reverse}) //return ['(a AND b)']
 *
 * @export
 * @class Validator
 */
export default class Validator {
  // if return true, validate successfully
  // if return false, validate fail
  rule = {
    default(value) {
      if (value === '' || value === undefined) {
        return false
      }
      return true
    },
  }

  setDefaultRule(func) {
    this.addRule('default', func)
  }

  private check(type: string | string[], param: string) {
    let result
    if (Array.isArray(type)) {
      for (const i in type) {
        const rule = type[i]
        if (this.rule[rule] && this.rule[rule](param)) {
          continue
        }
        if (rule !== 'default') {
          return `${param}{${rule}}`
        }
        return param
      }
      return ''
    }

    result = this.rule[type] && this.rule[type](param)
    if (result) {
      // true, validate successfully
      return ''
    }

    if (type !== 'default') {
      return `${param}{${type}}`
    }

    return param
  }

  private validateParam(param) {
    if (typeof param === 'string') {
      return this.validateString(param)
    }

    if (Array.isArray(param)) {
      return this.validateArray(param)
    }

    if (typeof param === 'object') {
      return this.validateObject(param)
    }

    throw new Error('unsupport type')
  }

  addRule(type: string, check: (value: any) => boolean) {
    this.rule[type] = check
  }

  private validateParams(...param: any[]) {
    return param.map(value => this.validateParam(value))
  }

  private validateString(param: string) {
    return this.check('default', param)
  }

  // return like: ['a', 'b', 'c'] => (a OR b OR c)
  private validateArray(param: any[]) {
    const result = this.validateParams(...param)

    if (result.every(res => res)) {
      // if true, array rule fail
      const messageArray = result.filter(res => res)
      const message = messageArray.join(' OR ')
      if (messageArray.length > 1) {
        return `(${message})`
      }
      return message
    }
    // success
    return ''
  }

  private validateAndArray(param: any[]): string {
    const result = this.validateParams(...param)

    const messageArray = result.filter(res => res)
    const message = messageArray.join(' AND ')
    if (messageArray.length > 1) {
      return `(${message})`
    }
    // if message Array length is 0, then pass the validate process
    return message
  }

  private validateObject(param: AndObjectArg | AndObjectArg2) {
    const result: string[] = []
    if (param.AND) {
      if (!Array.isArray(param.AND)) {
        throw new Error('param.AND should be Array')
      }

      result.push(this.validateAndArray(param.AND))
    }

    // other types
    const paramArr: ValidateObjectArg[] = []
    for (const key in param) {
      if (key === 'AND') {
        continue
      }
      paramArr.push({
        value: key,
        type: param[key],
      })
    }

    if (paramArr.length > 0) {
      const andParamArr = paramArr.map(({ value, type }) => this.check(type || 'default', value))
      result.push(...andParamArr)
    }

    const messageArray = result.filter(res => res)
    const message = messageArray.join(' AND ')
    if (messageArray.length > 1) {
      return `(${message})`
    }
    return message
  }

  validate(...param: any[]) {
    return this.validateParams(...param).filter(res => res)
  }
}

interface ValidateObjectArg {
  value: any
  type: string | string[]
}

interface AndObjectArg {
  AND: any[]
}

interface AndObjectArg2 {
  [prop: string]: string
}
