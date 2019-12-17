import { Controller } from 'egg'
import { param, err } from '../decorator'
import CError from '../error'

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
  @param('uname', 'password', 'authType', 'authToken', 'authId')
  async register() {
    const { uname, password, authType, authToken, authId } = this.ctx.request.body as RegisterUser

    const tokenInfo = await this.service.jwt.verify<TokenInfo>(authToken)

    if (tokenInfo && tokenInfo.authType === authType && tokenInfo.authId === authId) {
      const user = await this.service.user.register({ uname, password, authType, authId })

      const accessToken = await this.setToken({
        uname: user.name,
        groupId: user.groupId,
      })

      this.ctx.send(0, { accessToken })
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
  private async setToken(tokenData: LoginTokenData) {
    const refleshToken = await this.generateRefleshToken(tokenData)
    const accessToken = await this.generateAccessToken(tokenData)

    this.ctx.cookies.set('reflesh', refleshToken, {
      httpOnly: true,
      path: this.app.config.refleshToken.path,
      // second
      maxAge: this.app.config.refleshToken.expire * 60,
    })
    return accessToken
  }

  @err.message('fail to login').code(16)
  @param([ 'authId', 'uname' ], 'password')
  async login() {
    const { uname, authId, password: rawPassword } = this.ctx.request.body

    let user
    if (uname) {
      user = await this.service.user.loginByName({ name: uname, rawPassword })
    } else if (authId) {
      user = await this.service.user.loginByOAuth({ authId, rawPassword })
    }

    if (!user) {
      throw new CError(
        'user doesn\'t exist',
        err.type.controller().module.user().errCode(17),
        true)
    }

    const tokenData = {
      uname: user.name,
      groupId: user.groupId,
    }

    const accessToken = await this.setToken(tokenData)

    this.ctx.send(0, {
      accessToken,
    })
  }

  private async generateRefleshToken(user: LoginTokenData): Promise<string> {
    const payload: RefleshTokenData = { ...user, tokenType: 'reflesh' }
    const token = await this.service.jwt.sign(payload, this.app.config.refleshToken.expire)

    return token
  }

  private async generateAccessToken(user: LoginTokenData): Promise<string> {
    const payload: AccessTokenData = { ...user, tokenType: 'access' }
    const token = await this.service.jwt.sign(payload, this.app.config.accessToken.expire)

    return token
  }

  @err.message('fail to reflesh access token').code(18)
  @param('uname')
  async refleshAccessToken() {
    const { uname } = this.ctx.request.body
    const refleshToken = this.ctx.cookies.get('reflesh')
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

  async createUser() {
    const { uname, password, authId, authType } = this.ctx.request.body
    await this.service.user.register({
      uname,
      password,
      authId,
      authType,
    })
    this.ctx.send()
  }

  async resetPassword() {
    // reset
  }
}

err.restore()

interface RegisterUser {
  uname: string
  password: string
  authType: AuthTypes.email | AuthTypes.phone
  authToken: string
  authId: string
}

enum AuthTypes {
  email = 'email',
  phone = 'phone',
}

interface TokenInfo {
  authType: string
  authId: string
}

interface LoginTokenData {
  uname: string
  groupId: number
  [prop: string]: any
}

interface RefleshTokenData extends LoginTokenData {
  tokenType: 'reflesh'
}

interface AccessTokenData extends LoginTokenData {
  tokenType: 'access'
}
