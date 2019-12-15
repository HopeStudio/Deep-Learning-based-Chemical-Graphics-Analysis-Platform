import { Controller } from 'egg'

export default class UserController extends Controller {
  async add() {
    try {
      await this.ctx.service.user.create({ name: 'test1', password: 'pass' })
    } catch (error) {
      this.ctx.body = {
        code: 1,
        error: error.message,
      }
      return
    }

    this.ctx.body = {
      code: 0,
      data: {},
    }
  }

  private async check(param: any, func: string) {
    const value = this.ctx.request.body[param]

    const result = await this.ctx.service.user[func](value)

    if (result) {
      this.ctx.send()
      return
    }
    this.ctx.send(1, 'has been used')
  }

  async checkUserName() {
    await this.check('uname', 'checkUserName')
  }

  async checkEmail() {
    await this.check('email', 'checkEmail')
  }
}
