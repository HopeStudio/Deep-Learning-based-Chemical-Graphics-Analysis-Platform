import { Controller } from 'egg'
import CError, { ERRCode } from '../error'
import { err } from '../decorator'

enum AuthTypes {
  email = 'email',
  phone = 'phone',
}

export default class VerificationController extends Controller {
  @err(
    ERRCode.controller.verification,
    ERRCode.service.default,
    11)
    'fail to send verification email'
  private async mailValidator() {
    const { authType, authId } = this.ctx.request.body as VerificationData
    if (authType === AuthTypes.email) {
      await this.ctx.service.verification.sendVerificationCodeToMail(authId, authType)
      this.ctx.send()
    }
  }

  @err(
    ERRCode.controller.verification,
    ERRCode.service.default,
    12)
    'fail to send verification sms'
  private async phoneValidator() {
    const { authType, authId } = this.ctx.request.body as VerificationData
    if (authType === AuthTypes.phone) {
      await this.ctx.service.verification.sendVerificationCodeToPhone(authId, authType)
      this.ctx.send()
    }
  }

  @err(
    ERRCode.controller.verification,
    ERRCode.service.default,
    14,
    true)
    'fail to send verification code'
  async mainValidator() {
    const { authType } = this.ctx.request.body as VerificationData
    if (!(authType in AuthTypes)) {
      throw new CError(CError.Code(
        ERRCode.controller.verification,
        ERRCode.service.default,
        13))
        'unsupport auth type'
    }

    await this.mailValidator()
    await this.phoneValidator()
  }

  @err(
    ERRCode.controller.verification,
    ERRCode.service.default,
    15,)
    'verify code error'
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

    throw new CError(CError.Code(
      ERRCode.controller.verification,
      ERRCode.service.default,
      16))
  }
}

interface VerificationData {
  authType: AuthTypes.email | AuthTypes.phone
  authId: string
}

interface VerifyCodeData extends VerificationData {
  authCode: string
}
