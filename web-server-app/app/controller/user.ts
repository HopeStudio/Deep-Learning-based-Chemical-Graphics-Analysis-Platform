import { Controller } from 'egg'
import { param, err, auth } from '../decorator'
import CError from '../error'
import { User, AuthTypes, OAuth } from '../type/user'
import { TokenTypes, RefleshTokenData, AccessTokenData, LoginTokenData } from '../type/auth'

err.type.controller().module.user().save()

export default class UserController extends Controller {
  @err.message('fail to check user', 'check user error').code(11)
  @param('uname')
  async checkUserName() {
    const { uname } = this.ctx.request.body

    const result = await this.ctx.service.user.checkUserName(uname)

    if (result) {
      this.ctx.send()
      return
    }
    this.ctx.send(1, 'has been used')
  }

  @err.message('fail to check email', 'check email error').code(12)
  @param('email')
  async checkEmail() {
    const { email } = this.ctx.request.body

    const result = await this.ctx.service.user.checkEmail(email)

    if (result) {
      this.ctx.send()
      return
    }
    this.ctx.send(1, 'has been used')
  }

  @err.message('error to register').code(13)
  @param('uname', 'password', 'authType', 'authToken', 'openId')
  async register() {
    const { uname, password, authType, authToken, openId } = this.ctx.request.body as RegisterUser

    const tokenInfo = await this.service.jwt.verify<TokenInfo>(authToken)

    if (tokenInfo && tokenInfo.authType === authType && tokenInfo.authId === openId) {
      const user = await this.service.user.register({
        name: uname,
        password,
        openId,
        authType,
      })

      const accessToken = await this.setToken({
        uname: user.name,
        groupId: user.groupId,
      })

      this.ctx.send(0, { accessToken, remember: true })
      return
    }

    throw new CError(
      'fail to register',
      err.type.controller().module.user().errCode(14),
      false,
      undefined,
      'token incorrect')
  }

  @err.message('fail to login', 'get login token error').code(15)
  private async setToken(tokenData: LoginTokenData, remember: boolean = true) {
    const accessToken = await this.generateAccessToken(tokenData)

    if (remember) {
      const refleshToken = await this.generateRefleshToken(tokenData)
      this.ctx.cookies.set(TokenTypes.reflesh, refleshToken, {
        httpOnly: true,
        path: this.app.config.refleshToken.path,
        // second
        maxAge: this.app.config.refleshToken.expire * 60,
      })
    }

    return accessToken
  }

  @err.message('fail to login').code(16)
  @param(['openId', 'uname'], 'password')
  async login() {
    const { uname, openId, password: rawPassword, remember = false } = this.ctx.request.body

    let user
    if (uname) {
      user = await this.service.user.loginByName(uname, rawPassword)
    } else if (openId) {
      user = await this.service.user.loginByOAuth(openId, rawPassword)
    }

    if (!user) {
      throw new CError(
        'user doesn\'t exist',
        err.type.controller().module.user().errCode(17),
        true)
    }

    const tokenData: LoginTokenData = {
      uname: user.name,
      groupId: user.groupId,
    }

    const accessToken = await this.setToken(tokenData, remember)

    this.ctx.send(0, {
      accessToken,
      remember,
    })
  }

  private async generateRefleshToken(user: LoginTokenData): Promise<string> {
    const payload: RefleshTokenData = { ...user, tokenType: TokenTypes.reflesh }
    const token = await this.service.jwt.sign(payload, this.app.config.refleshToken.expire)

    return token
  }

  private async generateAccessToken(user: LoginTokenData): Promise<string> {
    const payload: AccessTokenData = { ...user, tokenType: TokenTypes.access }
    const token = await this.service.jwt.sign(payload, this.app.config.accessToken.expire)

    return token
  }

  @err.message('fail to reflesh access token').code(18)
  @param('uname')
  async refleshAccessToken() {
    const { uname } = this.ctx.request.body
    const refleshToken = this.ctx.cookies.get(TokenTypes.reflesh)
    if (!refleshToken) {
      throw new CError(
        'login timeout, need to login again',
        err.type.controller().module.user().errCode(19))
    }

    const refleshTokenData = await this.service.jwt.verify<RefleshTokenData>(refleshToken)
    if (refleshTokenData.uname === uname && refleshTokenData.groupId) {
      const accessToken = await this.generateAccessToken({
        uname: refleshTokenData.uname,
        groupId: refleshTokenData.groupId,
      })

      this.ctx.send(0, { accessToken })
      return
    }

    throw new CError(
      'need to login again',
      err.type.controller().module.user().errCode(20),
      false,
      undefined,
      'reflesh token incorrect')
  }

  @param('uname', 'password', 'openId', 'authType')
  async createUser() {
    const { uname, password, openId, authType } = this.ctx.request.body
    await this.service.user.register({
      name: uname,
      password,
      openId,
      authType,
    })
    this.ctx.send()
  }

  @err.message('update password fail').code(19)
  @auth()
  @param('password', 'newPassword')
  async resetPassword() {
    const { password, newPassword } = this.ctx.request.body
    const { uname } = this.ctx.auth
    await this.service.user.resetPassword(uname, password, newPassword)
    this.ctx.send()
  }

  @err.message('fail to send email').code(23)
  @param('email', 'uname')
  async sendResetPasswordByEmail() {
    const { email, uname } = this.ctx.request.body
    const result = await this.service.user.checkUserEmail(uname, email)
    console.log('check =====> ', result, email, uname)
    if (!result) {
      throw new CError(
        'please input correct username or email',
        err.type.controller().module.user().errCode(21),
        false)
    }
    await this.service.verification.sendResetPasswordEmail(email, uname)
    this.ctx.send()
  }

  @err.message('reset password fail').code(22)
  @param('token', 'newPassword')
  async resetPasswordByEmail() {
    const { token, newPassword } = this.ctx.request.body
    const { uname } = await this.service.verification.verifyResetPasswordToken(token)
    await this.service.user.resetPasswordByOauth(uname, newPassword)
    this.ctx.send()
  }

  @err.message('fail to logout').code(24)
  async logout() {
    this.ctx.cookies.set(TokenTypes.reflesh, '', {
      httpOnly: true,
      path: this.app.config.refleshToken.path,
      // second
      maxAge: 0,
    })
    this.ctx.send()
  }

  @err.message('fail to delete account').code(25)
  @param('uname')
  async deleteAccount() {
    const { uname } = this.ctx.request.body
    await this.service.user.deleteUser(uname)
    this.ctx.send()
  }
}

err.restore()

interface RegisterUser {
  uname: User['name']
  password: User['password']
  authType: AuthTypes.email | AuthTypes.phone
  authToken: string
  openId: OAuth['openId']
}

interface TokenInfo {
  authType: OAuth['authType']
  authId: OAuth['openId']
}
