import { Context } from 'egg'
import CError, { ERRCode } from '../error'

function check(value: any) {
  if (value === undefined || value === '') {
    return true
  }
  return false
}

export default (...option: Array<string | string[]>) => async (ctx: Context, next) => {
  const lackOfParam = option.filter(requireParam => {
    if (Array.isArray(requireParam)) {
      return requireParam.every(param => {
        const value = ctx.request.body[param]

        return check(value)
      })
    }

    const value = ctx.request.body[requireParam]
    return check(value)
  })

  if (lackOfParam.length === 0) {
    await next()
    return
  }

  const message = `lack of param: ${lackOfParam.map(value => Array.isArray(value) ? value.join(' or ') : value).join(',')}`

  throw new CError(CError.Code(
    ERRCode.controller.default,
    ERRCode.service.default,
    11),
    message)
}
