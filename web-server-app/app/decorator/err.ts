import errorCode from '../error/errorCode'
import CError from '../error'
import errorMessage from '../error/errorMessage'
import { createDecorator } from '../utils'

const errDecorator = createDecorator(undefined, undefined, function (
  error,
  errCode: number,
  message: string | undefined,
  internal: boolean | undefined,
  innerMessage: string | undefined) {
  throw new CError(message, errCode, internal, error, innerMessage)
})

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
  private selectedCode = {
    type: 10,
    module: 10,
    code: 10,
  }
  private isInternal: boolean = false
  private errMessage: string | undefined
  private innerMessage: string | undefined
  private isSave: boolean = false

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

  save() {
    this.isSave = true
    return this
  }

  restore() {
    this.isSave = false
    this.reset()
    return this
  }

  message(errMessage: string, innerMessage?: string) {
    this.errMessage = errMessage
    this.innerMessage = innerMessage
    return this
  }

  private reset() {
    if (!this.isSave) {
      this.selectedCode = {
        type: 10,
        module: 10,
        code: 10,
      }
      this.isInternal = false
    }
    this.selectedCode.code = 10
    this.errMessage = undefined
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
    return errDecorator(fullCode, message, internal, this.innerMessage)
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
  auth: () => ERR
}

interface ERRModule {
  [prop: string]: () => ERR
  user: () => ERR
  verification: () => ERR
  jwt: () => ERR
  sms: () => ERR
  mail: () => ERR
}
