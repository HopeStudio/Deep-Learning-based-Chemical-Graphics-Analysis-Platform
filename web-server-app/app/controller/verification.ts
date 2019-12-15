import { Controller } from 'egg'

enum AuthTypes {
  email = 'email',
  phone = 'phone',
}

export default class VerificationController extends Controller {
  private async mailValidator() {
    const { authType, authId } = this.ctx.request.body as VerificationData
    if (authType === AuthTypes.email) {
      await this.ctx.service.verification.sendVerificationCodeToMail(authId, authType)
      this.ctx.body = {
        code: 0,
      }
    }
  }

  private async phoneValidator() {
    const { authType, authId } = this.ctx.request.body as VerificationData
    if (authType === AuthTypes.phone) {
      await this.ctx.service.verification.sendVerificationCodeToPhone(authId, authType)
      this.ctx.body = {
        code: 0,
      }
    }
  }

  async mainValidator() {
    this.ctx.send(1, 'unsupport auth type')
    await this.mailValidator()
    await this.phoneValidator()
  }

  async verifyCode() {
    const { authType, authId, authCode } = this.ctx.request.body as VerifyCodeData

    const result = await this.ctx.service.verification.verifyCode(authCode, authId, authType)

    if (result) {
      // verify successfully
      this.ctx.send()
      return
    }

    this.ctx.send(1, 'fail to verify code')
  }
}

interface VerificationData {
  authType: AuthTypes.email | AuthTypes.phone
  authId: string
}

interface VerifyCodeData extends VerificationData {
  authCode: string
}
