import { Context } from 'egg'

export default (...option: string[]) => async (ctx: Context, next) => {
  const lackOfParam = option.filter(requireParam => {
    if (ctx.request.body[requireParam] === undefined) {
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
