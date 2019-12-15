import { Controller } from 'egg'

enum AuthTypes {
  email = 'email',
  phone = 'phone',
}

export default class VerificationController extends Controller {
  async mailValidator() {
    const { authType, authId } = this.ctx.request.body as VerificationData
    if (authType === AuthTypes.email) {
      await this.ctx.service.verification.sendVerificationCodeToMail(authId, authType)
      this.ctx.body = {
        code: 0,
      }
    }
  }

  async verifyCode() {
    const { authType, authId, authCode } = this.ctx.request.body as VerifyCodeData

    const result = await this.ctx.service.verification.verifyCode(authCode, authId, authType)

    if (result) {
      // verify successfully
      this.ctx.body = this.ctx.helper.response()
      return
    }

    this.ctx.body = this.ctx.helper.response(1, 'fail to verify code')
  }
}

interface VerificationData {
  authType: AuthTypes.email | AuthTypes.phone
  authId: string
}

interface VerifyCodeData extends VerificationData {
  authCode: string
}
