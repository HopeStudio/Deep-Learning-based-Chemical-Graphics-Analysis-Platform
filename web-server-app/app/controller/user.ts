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
