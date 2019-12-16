import { Service } from 'egg'
import { err, ERRCode } from '../error'

export default class SMSService extends Service {

  @err(
    ERRCode.controller.default,
    ERRCode.service.sms,
    11)
  async send(verificationCode: string, expire: number) {
    const result = await this.ctx.curl<Result>('http://api01.monyun.cn:7901/sms/v2/std/single_send', {
      method: 'POST',
      data: {
        apikey: 'e187bc3f4009e3de730ceb2911ba88df',
        mobile: '',
        content: encodeURIComponent(`您的验证码是${verificationCode}，在${expire}分钟内输入有效。如非本人操作请忽略此短信。`),
      },
    })

    if (result && result.result === 0) {
      // success
      return
    }

    // error
    throw new Error('fail to send sms')
  }
}

interface Result {
  result: number
  [propName: string]: any
}
