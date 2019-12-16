import { Context } from 'egg'

export default (...option: string[]) => async (ctx: Context, next) => {
  const lackOfParam = option.filter(requireParam => {
    const value = ctx.request.body[requireParam]
    if (value === undefined || value === '') {
      return true
    }
    return false
  })

  if (lackOfParam.length === 0) {
    await next()
    return
  }

  ctx.send(1, `lack of param: ${lackOfParam.join(',')}`)
}
