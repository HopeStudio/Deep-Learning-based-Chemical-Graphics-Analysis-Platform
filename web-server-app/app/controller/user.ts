import { Controller } from 'egg'
import CError, { err, ERRCode } from '../error'

export default class UserController extends Controller {
  @err(
    ERRCode.controller.user,
    ERRCode.service.default,
    11)
  async checkUserName() {
    const { uname } = this.ctx.request.body

    const result = await this.ctx.service.user.checkUserName(uname)

    if (result) {
      this.ctx.send()
      return
    }
    this.ctx.send(1, 'has been used')
  }

  @err(
    ERRCode.controller.user,
    ERRCode.service.default,
    12)
  async checkEmail() {
    const { email } = this.ctx.request.body

    const result = await this.ctx.service.user.checkEmail(email)

    if (result) {
      this.ctx.send()
      return
    }
    this.ctx.send(1, 'has been used')
  }

  @err(
    ERRCode.controller.user,
    ERRCode.service.default,
    13,
    true)
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

    throw new CError(CError.Code(
      ERRCode.controller.user,
      ERRCode.service.default,
      14))
  }

  @err(
    ERRCode.controller.user,
    ERRCode.service.default,
    15)
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

  @err(
    ERRCode.controller.user,
    ERRCode.service.default,
    16,
    true)
  async login() {
    const { authId, password: rawPassword } = this.ctx.request.body
    const user = await this.service.user.loginByOAuth({ authId, rawPassword })

    if (!user) {
      throw new CError(CError.Code(
        ERRCode.controller.user,
        ERRCode.service.default,
        17))
    }

    const tokenData = {
      uname: user.name,
      groupId: user.group_id,
    }

    const accessToken = await this.setToken(tokenData)

    this.ctx.send(0, {
      accessToken,
    })
  }

  async generateRefleshToken(user: LoginTokenData): Promise<string> {
    const payload: RefleshTokenData = { ...user, tokenType: 'reflesh' }
    const token = await this.service.jwt.sign(payload, this.app.config.refleshToken.expire)

    return token
  }

  private async generateAccessToken(user: LoginTokenData): Promise<string> {
    const payload: AccessTokenData = { ...user, tokenType: 'access' }
    const token = await this.service.jwt.sign(payload, this.app.config.accessToken.expire)

    return token
  }

  @err(
    ERRCode.controller.user,
    ERRCode.service.default,
    18,
    true)
  async refleshAccessToken() {
    const { uname } = this.ctx.request.body
    const refleshToken = this.ctx.cookies.get('reflesh')
    if (!refleshToken) {
      throw new CError(CError.Code(
        ERRCode.controller.user,
        ERRCode.service.default,
        19))
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

    throw new CError(CError.Code(
      ERRCode.controller.user,
      ERRCode.service.default,
      20))
  }
}

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
