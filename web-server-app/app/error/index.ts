export default class ERROR extends Error {
  code: number
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
    message: string | Error = ERRCodeMap[code] || ERRCodeMap[code][0] || 'unknown error',
    error?: Error) {
    super()
    if (message instanceof Error || error instanceof Error) {
      this.handleNativeError(message || error)
      return this
    }

    this.code = code
    this.message = message
  }

  handleNativeError(error) {
    this.message = error.message || error.sqlMessage
    this.code = 101010
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

export const ERRCodeMap = {}

const setERRCodeMap = (controllerCode, serviceCode, code, ...args: string[]) => {
  ERRCodeMap[ERROR.Code(
    controllerCode,
    serviceCode,
    code)] = args
}

// decorator
export function err(
  controllerCode: number,
  serviceCode: number,
  code: number = 0) {
  return function (_target, _name, descriptor) {
    const oldFunc = descriptor.value

    descriptor.value = async function (...args) {
      let result
      try {
        result = await oldFunc.apply(this, args)
      } catch (error) {
        throw new ERROR(ERROR.Code(controllerCode, serviceCode, code))
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
  'sign token error')
