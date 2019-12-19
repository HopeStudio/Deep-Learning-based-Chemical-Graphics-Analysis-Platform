import { Context } from 'egg'
import { createDecorator } from '../utils'
import CError from '../error'
import err from './err'
import { AccessToken } from '../type/auth'

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

  try {
    // fail to decode or timeout
    ctx.auth = await ctx.service.jwt.verify<AccessToken>(accessToken)
  } catch (error) {
    throw new CError(
      'need to reflesh accessToken',
      err.type.auth().errCode(11),
      false,
      error,
      'fail to decode or timeout')
  }

  const isNeedUpdate = await ctx.service.blacklist.verifyUserToken(ctx.auth)
  if (isNeedUpdate) {
    throw new CError(
      'need to reflesh accessToken',
      err.type.auth().errCode(12),
      false,
      undefined,
      'access token is in blacklist')
  }
})

export default auth
