import { Context } from 'egg'
import { createDecorator } from '../utils'
import CError from '../error'
import err from './err'

const auth = createDecorator(async function (this: { ctx: Context }) {
  const { ctx } = this

  // validate accessToken
  const { accessToken } = ctx.request.body

  if (!accessToken) {
    throw new CError(
      'need to login',
      err.type.auth().errCode(12),
      false)
  }

  let data
  try {
    // fail to decode or timeout
    data = await ctx.service.jwt.verify(accessToken)
  } catch (error) {
    throw new CError(
      'need to reflesh accessToken',
      err.type.auth().errCode(11),
      false,
      error,
      'fail to decode or timeout')
  }

  ctx.auth = data
})

export default auth
