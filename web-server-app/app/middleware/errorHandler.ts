import CError from '../error'

export default () => async function errorHandler(ctx, next) {
  try {
    await next()
  } catch (err) {
    const error = new CError(undefined, undefined, undefined, err)
    ctx.send(error.code, error.message)
  }
}
