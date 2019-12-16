import { Service } from 'egg'
import { sign, verify } from 'jsonwebtoken'
import { err, ERRCode } from '../error'

export default class JsonWebTokenService extends Service {
  get privateKey() {
    return this.app.config.jwt.privateKey
  }

  @err(
    ERRCode.controller.default,
    ERRCode.service.jwt,
    11)
  sign(payload: any, expire: number = 5, options: JWTOption = {}): string {
    return sign(payload, this.privateKey, {
      // min
      expiresIn: expire * 60,
      ...options,
    })
  }

  verify<T>(token: string, options: object = {}): T {
    return verify(token, this.privateKey, { ...options })
  }
}

interface JWTOption {
  expiresIn?: number
  algorithm?: string
}
