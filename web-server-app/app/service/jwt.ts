import { Service } from 'egg'
import jwt from 'jsonwebtoken'

export default class JsonWebTokenService extends Service {
  get privateKey() {
    return this.app.config.jwt.privateKey
  }

  sign(payload: any, expire: number = 5, options: JWTOption = {}): string {
    return jwt.sign({
      data: payload,
    }, this.privateKey, {
      // min
      expiresIn: expire * 60,
      ...options,
    })
  }

  verify(token: string, options: object = {}) {
    return jwt.verify(token, this.privateKey, { ...options })
  }
}

interface JWTOption {
  expiresIn?: number
  algorithm?: string
}
