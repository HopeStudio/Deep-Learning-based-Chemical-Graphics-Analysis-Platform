import { Service } from 'egg'
import CError from '../error'
import { err } from '../decorator'

err.type.service().module.verification().save()

export default class VerificationService extends Service {
  /**
   * genrate a verification code with length = 5
   *
   * @param {string} identifier
   * @param {number} [expire=5]
   * @returns {Promise<string>}
   * @memberof VerificationService
   */
  @err.internal().message('generate verification code error').code(11)
  private async generateVerificationCode(identifier: string, expire: number = 5): Promise<string> {
    if (!identifier) {
      throw new CError(
        'generate verification code error: identifier should not\'t be empty',
        err.type.service().module.verification().errCode(12))
    }
    const verificationCode = this.ctx.helper.getRandomNumberString(5)
    await this.app.redis.set(identifier, verificationCode, 'EX', expire * 60)
    return verificationCode
  }

  /**
   * verify if the code given is valid
   *
   * @param {string} identifier
   * @param {string} code
   * @returns {Promise<boolean>}
   * @memberof VerificationService
   */
  @err.internal().message('fail to verify code').code(13)
  async verifyCode(code: string, authId: string, identifierPrefix: string): Promise<boolean> {
    const identifier = identifierPrefix + authId
    if (!identifier || !code) {
      return false
    }

    const trueCode = await this.app.redis.get(identifier)
    return trueCode === code
  }

  /**
   * use mail service to send verification mail to given receiver
   *
   * @param {string} identifier
   * @param {string} receiverMail
   * @returns
   * @memberof VerificationService
   */
  @err.internal().message('fail to send verification code to mail').code(14)
  async sendVerificationCodeToMail(receiverMail: string, identifierPrefix?: string) {
    const { expire = 5 } = this.app.config.verificationCode || {}
    const verificationCode = await this.generateVerificationCode(identifierPrefix + receiverMail, expire)

    const subjectTemplate = `[${verificationCode}] 化学图像分析平台： 邮箱验证`
    const textTemplate = `您正在注册账号，验证码为${verificationCode}，有效期为${expire}分钟。`

    await this.ctx.service.mail.send({
      to: [ receiverMail ],
      subject: subjectTemplate,
      text: textTemplate,
    })
  }

  @err.internal().message('fail to send verification code to phone').code(15)
  async sendVerificationCodeToPhone(receiverMail: string, identifierPrefix?: string) {
    const { expire = 5 } = this.app.config.verificationCode || {}
    const verificationCode = await this.generateVerificationCode(identifierPrefix + receiverMail, expire)
    await this.ctx.service.sms.send(verificationCode, expire)
  }
}

err.restore()
