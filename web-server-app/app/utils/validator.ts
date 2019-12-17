export default class Validator {
  // if return true, validate successfully
  // if return false, validate fail
  rule = {
    string(value) {
      if (value === '' || value === undefined) {
        return false
      }
      return true
    },
  }

  private check(type: string, param: string) {
    const result = this.rule[type] && this.rule[type](param)
    if (result) {
      // true, validate successfully
      return ''
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
    return this.check('string', param)
  }

  // return like: ['a', 'b', 'c'] => (a or b or c)
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

  private validateAndArray(param: any[]) {
    const result = this.validateParams(...param)

    if (result.some(res => res)) {
      // if true, and array rule fail
      const messageArray = result.filter(res => res)
      const message = messageArray.join(' AND ')
      if (messageArray.length > 1) {
        return `(${message})`
      }
      return message
    }

    return ''
  }

  private validateObject(param: AndObjectArg | ValidateObjectArg)

  private validateObject(param) {
    if (param.AND) {
      if (!Array.isArray(param.AND)) {
        throw new Error('param.AND should be Array')
      }

      return this.validateAndArray(param.AND)
    }

    // other types
    if (param.value) {
      return this.check(param.value, param.type || 'string')
    }
  }

  validate(...param: any[]) {
    return this.validateParams(...param).filter(res => res)
  }
}

interface ValidateObjectArg {
  value: any
  type: string
}

interface AndObjectArg {
  AND: any[]
}
