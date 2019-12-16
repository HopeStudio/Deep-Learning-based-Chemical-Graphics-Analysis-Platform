export default () => async function errorHandler(ctx, next) {
  try {
    await next()
  } catch (error) {
    ctx.send(error.code || 1, error.message || error.sqlMessage || 'unknown error')

    if (error.status) {
      ctx.status = error.status
    }
  }
}
