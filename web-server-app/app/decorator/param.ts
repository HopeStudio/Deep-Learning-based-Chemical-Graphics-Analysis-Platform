import CError, { ERRCode } from '../error'

function check(value: any) {
  if (value === undefined || value === '') {
    return true
  }
  return false
}

export default function param(...option: Array<string | string[]>) {
  return function (_target, _name, descriptor) {
    const oldValue = descriptor.value

    descriptor.value = async function (...args) {
      const lackOfParam = option.filter(requireParam => {
        if (Array.isArray(requireParam)) {
          return requireParam.every(param => {
            const value = this.ctx.request.body[param]

            return check(value)
          })
        }

        const value = this.ctx.request.body[requireParam]
        return check(value)
      })

      if (lackOfParam.length === 0) {
        const result = await oldValue.apply(this, args)
        return result
      }

      const message = `lack of param: ${lackOfParam.map(value => Array.isArray(value) ? value.join(' or ') : value).join(',')}`

      throw new CError(CError.Code(
        ERRCode.controller.default,
        ERRCode.service.default,
        11),
        message)
    }

    return descriptor
  }
}
