import { Context } from 'egg'

export function send(this: Context, code: number = 0, data: object | string = code === 0 ? {} : '') {
  if (code !== 0) {
    this.body = {
      code,
      message: data,
    }
    return
  }

  this.body = {
    code,
    data,
  }
}
