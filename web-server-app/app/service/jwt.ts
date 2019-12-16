import { Service } from 'egg'
import { sign, verify, Secret, DecodeOptions, SignOptions } from 'jsonwebtoken'
import { err, ERRCode } from '../error'

export default class JsonWebTokenService extends Service {
  get privateKey(): Secret {
    return this.app.config.jwt.privateKey
  }

  @err(
    ERRCode.controller.default,
    ERRCode.service.jwt,
    11)
  sign(payload: any, expire: number = 5, options: SignOptions = {}): string {
    return sign(payload, this.privateKey, {
      // min
      expiresIn: expire * 60,
      ...options,
    })
  }

  @err(
    ERRCode.controller.default,
    ERRCode.service.jwt,
    12,
  )
  verify<T>(token: string, options?: DecodeOptions): T {
    return verify(token, this.privateKey, options) as any
  }
}
