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
}
