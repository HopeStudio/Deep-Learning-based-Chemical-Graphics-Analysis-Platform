import { Controller } from 'egg'
import CError from '../error'
import { err, param } from '../decorator'

enum AuthTypes {
  email = 'email',
  phone = 'phone',
}

export default class VerificationController extends Controller {

  @err.type.controller().module.verification().internal()
    .message('fail to send verification email')
    .code(11)
  private async mailValidator() {
    const { authType, authId } = this.ctx.request.body as VerificationData
    if (authType === AuthTypes.email) {
      await this.ctx.service.verification.sendVerificationCodeToMail(authId, authType)
      this.ctx.send()
      return
    }
    throw new Error('unknown auth type')
  }

  @err.type.controller().module.verification().internal()
    .message('fail to send verification sms')
    .code(12)
  private async phoneValidator() {
    const { authType, authId } = this.ctx.request.body as VerificationData
    if (authType === AuthTypes.phone) {
      await this.ctx.service.verification.sendVerificationCodeToPhone(authId, authType)
      this.ctx.send()
    }
  }

  @err.type.controller().module.verification()
    .message('fail to send verification code')
    .code(13)
  @param('authType', 'authId')
  async mainValidator() {
    const { authType } = this.ctx.request.body as VerificationData
    if (!(authType in AuthTypes)) {
      throw new CError(
        'unsupport auth type',
        err.type.controller().module.verification().errCode(14),
        false)
    }

    await this.mailValidator()
    await this.phoneValidator()
  }

  @err.type.controller().module.verification().internal()
    .message('verify code error')
    .code(15)
  @param('authType', 'authId', 'authCode')
  async verifyCode() {
    const { authType, authId, authCode } = this.ctx.request.body as VerifyCodeData

    const result = await this.ctx.service.verification.verifyCode(authCode, authId, authType)

    if (result) {
      // verify successfully
      const token = await this.ctx.service.jwt.sign({
        authType,
        authId,
      })
      this.ctx.send(0, { authToken: token })
      return
    }

    throw new CError(
      'fail to verify code',
      err.type.controller().module.verification().errCode(16),
      false)
  }
}

interface VerificationData {
  authType: AuthTypes.email | AuthTypes.phone
  authId: string
}

interface VerifyCodeData extends VerificationData {
  authCode: string
}
