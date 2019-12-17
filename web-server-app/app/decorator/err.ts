import errorCode from '../error/errorCode'
import CError from '../error/cerror'
import errorMessage from '../error/errorMessage'

function errDecorator(
  errCode: number,
  message: string | undefined,
  internal: boolean | undefined) {
  return function (_target, _value, descriptor) {
    const prevFunc = descriptor.value

    descriptor.value = async function (...arg) {
      let result
      try {
        result = await prevFunc.apply(this, arg)
      } catch (error) {
        throw new CError(message, errCode, internal, error)
      }
      return result
    }
  }
}

/**
 * to handle error, and throw a CError instead
 * use as a decorator
 * @example
 * const err = new ERR()
 * @err.type.net().module.user().message(`some error message`).internal().code(233)
 *
 * @class ERR
 */
class ERR {
  type: ERRType
  module: ERRModule
  selectedCode = {
    type: 10,
    module: 10,
    code: 10,
  }
  isInternal: boolean | undefined
  errMessage: string | undefined

  constructor() {
    this.type = Object.create({})
    this.module = Object.create({})
    for (const codeType in errorCode.type) {
      this.type[codeType] = () => {
        // type: 11xxxx
        this.selectedCode.type = errorCode.type[codeType]
        return this
      }
    }

    for (const codeType in errorCode.module) {
      this.module[codeType] = () => {
        // module: xx11xx
        this.selectedCode.module = errorCode.module[codeType]
        return this
      }
    }
  }

  internal() {
    this.isInternal = true
    return this
  }

  message(str: string) {
    this.errMessage = str
    return this
  }

  reset() {
    this.selectedCode = {
      type: 10,
      module: 10,
      code: 10,
    }
    this.errMessage = undefined
    this.isInternal = undefined
  }

  code(detailCode: number = this.selectedCode.code) {
    const fullCode = this.selectedCode.type * 10000 + this.selectedCode.module * 100 + detailCode
    const message = this.errMessage
    const internal = this.isInternal

    if (errorMessage[fullCode] && errorMessage[fullCode] !== message) {
      console.log(`\x1b[42m\x1b[30m ErrorCode duplicate \x1b[0m: This ErrorCode \x1b[32m${fullCode}\x1b[0m has been used by \`${errorMessage[fullCode]}\`, message now is \`${message}\``)
    }
    errorMessage[fullCode] = message

    this.reset()
    return errDecorator(fullCode, message, internal)
  }

  errCode(detailCode) {
    const fullCode = this.selectedCode.type * 10000 + this.selectedCode.module * 100 + detailCode
    this.reset()
    return fullCode
  }
}

const err = new ERR()

export default err

interface ERRType {
  [prop: string]: () => ERR
  param: () => ERR
  net: () => ERR
  db: () => ERR
  controller: () => ERR
  service: () => ERR
}

interface ERRModule {
  [prop: string]: () => ERR
  user: () => ERR
  verification: () => ERR
  jwt: () => ERR
  sms: () => ERR
  mail: () => ERR
}
