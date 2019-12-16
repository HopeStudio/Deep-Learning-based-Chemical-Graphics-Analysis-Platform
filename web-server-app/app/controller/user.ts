import { Controller } from 'egg'

export default class UserController extends Controller {
  async checkUserName() {
    const { uname } = this.ctx.request.body

    const result = await this.ctx.service.user.checkUserName(uname)

    if (result) {
      this.ctx.send()
      return
    }
    this.ctx.send(1, 'has been used')
  }

  async checkEmail() {
    const { email } = this.ctx.request.body

    const result = await this.ctx.service.user.checkEmail(email)

    if (result) {
      this.ctx.send()
      return
    }
    this.ctx.send(1, 'has been used')
  }

  async register() {
    const { uname, password, authType, authToken, authId } = this.ctx.request.body as RegisterUser

    let tokenInfo

    try {
      tokenInfo = await this.service.jwt.verify<TokenData>(authToken)
    } catch (error) {
      console.log(error)
    }

    if (tokenInfo && tokenInfo.authType === authType && tokenInfo.authId === authId) {
      const user = await this.service.user.register({ uname, password, authType, authId })
      this.ctx.send(0, user)
      return
    }

    this.ctx.send(233, 'authToken doesn\'t match')
  }

  async login() {
    const { authId, password: rawPassword } = this.ctx.request.body
    const user = await this.service.user.loginByOAuth({ authId, rawPassword })

    if (!user) {
      throw new Error('fail')
    }

    const tokenData = {
      uname: user.name,
      groupId: user.group_id,
    }

    const refleshToken = await this.generateRefleshToken(tokenData)
    const accessToken = await this.generateAccessToken(tokenData)

    this.ctx.send(0, {
      accessToken,
    })

    this.ctx.cookies.set('reflesh', refleshToken, {
      httpOnly: true,
      path: this.app.config.refleshToken.path,
      // second
      maxAge: this.app.config.refleshToken.expire * 60,
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

  async refleshAccessToken() {
    const { uname } = this.ctx.request.body
    const refleshToken = this.ctx.cookies.get('reflesh')
    if (!refleshToken) {
      this.ctx.send(233, 'need to login again')
      return
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

    this.ctx.send(0, 'token incorrect')
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

interface TokenData {
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
