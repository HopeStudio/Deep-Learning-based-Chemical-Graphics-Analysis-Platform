import { Service } from 'egg'
import { AccessToken, RefleshToken } from '../type/auth'

export default class BlacklistService extends Service {
  async set(identity: string, value: any, expire: number) {
    await this.app.redis.set(`blacklist-${identity}`, value, 'EX', expire * 60)
  }

  async get(identity: string) {
    const result = await this.app.redis.get(`blacklist-${identity}`)
    return result
  }

  async setUserToken(name: string) {
    await this.set(name, new Date().getTime(), this.app.config.refleshToken.expire)
  }

  async verifyUserToken(token: AccessToken | RefleshToken) {
    const { uname, iat } = token
    const updateTime = await this.get(uname)
    if (updateTime && +updateTime - iat * 1000 > 0) {
      return true
    }
    return false
  }
}
