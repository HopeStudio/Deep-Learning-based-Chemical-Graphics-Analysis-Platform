import { Service } from 'egg'
import { sign, verify, Secret, DecodeOptions, SignOptions } from 'jsonwebtoken'
import { err } from '../decorator'

err.type.service().module.jwt().save()

export default class JsonWebTokenService extends Service {
  get privateKey(): Secret {
    return this.app.config.jwt.privateKey
  }

  @err.internal().message('token sign error').code(11)
  sign(payload: any, expire: number = 5, options: SignOptions = {}): string {
    return sign(payload, this.privateKey, {
      // min
      expiresIn: expire * 60,
      ...options,
    })
  }

  @err.internal().message('token verify error').code(12)
  verify<T>(token: string, options?: DecodeOptions): T {
    return verify(token, this.privateKey, options) as any
  }
}

err.restore()
