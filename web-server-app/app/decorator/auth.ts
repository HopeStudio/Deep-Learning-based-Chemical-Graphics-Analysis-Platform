import { Context } from 'egg'
import { createDecorator, permission } from '../utils'
import CError from '../error'
import err from './err'
import { AccessToken } from '../type/auth'
import { UserPermission, AdminPermission } from '../type/permission'

const auth = createDecorator(async function (this: { ctx: Context }, options: Options) {
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

  // check if specify detail permission
  const { user = [], admin = [] } = options
  const permissionCode = 122

  const userPermissionCheck = user.every(pos => permission.getPermission(permissionCode, pos))
  if (!userPermissionCheck) {
    throw new CError(
      'Permission denied',
      err.type.auth().errCode(13),
      false,
      undefined,
      'user permission denied')
  }

  const AdminPermissionCheck = admin.every(pos => permission.getPermissionLeft(permissionCode, pos))
  if (!AdminPermissionCheck) {
    throw new CError(
      'Permission denied',
      err.type.auth().errCode(14),
      false,
      undefined,
      'admin permission denied')
  }

})

export default auth

interface Options {
  user?: UserPermission[]
  admin?: AdminPermission[]
}
