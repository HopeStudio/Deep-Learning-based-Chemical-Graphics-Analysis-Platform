export default class CError extends Error {
  code: number
  error: CError | Error | undefined
  usePreMessage: boolean

  static Code(
    controllerCode: number = ERRCode.controller.default,
    serviceCode: number = ERRCode.service.default,
    code: number = 0) {
    // output error code like: `${controllerCode}${serviceCode}${detailCode}`
    // format: /\d{2}\d{2}\d{2}/
    // example: 111224
    return controllerCode * 10000 + serviceCode * 100 + code
  }

  constructor(
    code: number,
    error?: Error | CError,
    usePreMessage: boolean = false) {
    super()

    this.code = code || 101010
    this.error = error
    this.usePreMessage = usePreMessage
    this.handleNativeError()
    this.handleCError()
  }

  handleCError() {
    if (this.error instanceof CError) {
      if (this.usePreMessage) {
        this.code =
          this.error.code && this.error.code === 101010
            ? this.code
            : this.error.code
        this.message = this.error.message
      }
    }
  }

  handleNativeError() {
    if (this.error instanceof Error && !(this.error instanceof CError)) {
      this.message = ERRCodeMap[this.code] && ERRCodeMap[this.code][0] || ERRCodeMap.default
    }
  }

}

export const ERRCode = {
  controller: {
    default: 10,
    user: 11,
    verification: 12,
  },
  service: {
    default: 10,
    user: 11,
    verification: 12,
    jwt: 13,
    sms: 14,
    mail: 15,
  },
}

export const ERRCodeMap = {
  default: 'Unknown Error',
}

const setERRCodeMap = (controllerCode, serviceCode, code, ...args: string[]) => {
  ERRCodeMap[CError.Code(
    controllerCode,
    serviceCode,
    code)] = args
}

// decorator
export function err(
  controllerCode: number,
  serviceCode: number,
  code: number = 0,
  usePreMessage: boolean = false) {
  return function (_target, _name, descriptor) {
    const oldFunc = descriptor.value

    descriptor.value = async function (...args) {
      let result
      try {
        result = await oldFunc.apply(this, args)
      } catch (error) {
        throw new CError(CError.Code(controllerCode, serviceCode, code), error, usePreMessage)
      }
      return result
    }
    return descriptor
  }
}

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.jwt,
  11,
  'token sign error')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.jwt,
  12,
  'token verify error')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.mail,
  11,
  'send mail error')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.sms,
  11,
  'send sms error')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.user,
  11,
  'check user error', 'get user error')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.user,
  12,
  'check email error', 'get oauth error')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.user,
  13,
  'register fail', 'transcation error')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.user,
  14,
  'create user fail', 'can not insert user')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.user,
  15,
  'create user fail', 'can not find user after insert')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.user,
  16,
  'create user fail', 'can not insert oauth')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.user,
  17,
  'user is not exist')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.user,
  18,
  'password is incorrect')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.user,
  19,
  'user is not exist', 'user is not exist, in oauth type')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.user,
  20,
  'password is incorrect', 'password is incorrect, in oauth type')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.user,
  21,
  'login error')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.user,
  22,
  'login error', 'login error in oauth')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.user,
  23,
  'inner error', 'handle password error')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.verification,
  11,
  'inner error', 'generate verification code error')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.verification,
  12,
  'inner error', 'generate verification code error: identifier should not\'t be empty')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.verification,
  13,
  'fail to verify code')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.verification,
  14,
  'fail to send verification code to mail')

setERRCodeMap(
  ERRCode.controller.default,
  ERRCode.service.verification,
  15,
  'fail to send verification code to phone')

setERRCodeMap(
  ERRCode.controller.user,
  ERRCode.service.default,
  11,
  'fail to check user', 'check user error')

setERRCodeMap(
  ERRCode.controller.user,
  ERRCode.service.default,
  12,
  'fail to check email', 'check email error')

setERRCodeMap(
  ERRCode.controller.user,
  ERRCode.service.default,
  13,
  'error to register')

setERRCodeMap(
  ERRCode.controller.user,
  ERRCode.service.default,
  14,
  'fail to register', 'token incorrect')

setERRCodeMap(
  ERRCode.controller.user,
  ERRCode.service.default,
  15,
  'fail to login', 'get login token error')

setERRCodeMap(
  ERRCode.controller.user,
  ERRCode.service.default,
  16,
  'fail to login')

setERRCodeMap(
  ERRCode.controller.user,
  ERRCode.service.default,
  17,
  'user doesn\'t exist')

setERRCodeMap(
  ERRCode.controller.user,
  ERRCode.service.default,
  18,
  'fail to reflesh access token')

setERRCodeMap(
  ERRCode.controller.user,
  ERRCode.service.default,
  19,
  'login timeout, need to login again')

setERRCodeMap(
  ERRCode.controller.user,
  ERRCode.service.default,
  19,
  'need to login again', 'reflesh token incorrect')

setERRCodeMap(
  ERRCode.controller.verification,
  ERRCode.service.default,
  11,
  'fail to send verification email')

setERRCodeMap(
  ERRCode.controller.verification,
  ERRCode.service.default,
  12,
  'fail to send verification sms')

setERRCodeMap(
  ERRCode.controller.verification,
  ERRCode.service.default,
  13,
  'unspport auth type')

setERRCodeMap(
  ERRCode.controller.verification,
  ERRCode.service.default,
  14,
  'fail to send verification code')

setERRCodeMap(
  ERRCode.controller.verification,
  ERRCode.service.default,
  15,
  'verify code error')

setERRCodeMap(
  ERRCode.controller.verification,
  ERRCode.service.default,
  16,
  'fail to verify code')
