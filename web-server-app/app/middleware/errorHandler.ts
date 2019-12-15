export default () => async function errorHandler(ctx, next) {
  try {
    await next()
  } catch (error) {
    ctx.body = ctx.helper.response(error.code || 1, error.message || 'unkown error')

    if (error.status) {
      ctx.status = error.status
    }
  }
}
