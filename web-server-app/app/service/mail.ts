import { Service } from 'egg'
import { createTransport } from 'nodemailer'
import { err, ERRCode } from '../error'

export default class MailService extends Service {
  transporter: any
  private init() {
    // create reusable transporter object using the default SMTP transport
    this.transporter = createTransport({
      // https://nodemailer.com/smtp/well-known/
      service: '163',
      auth: {
        user: 'everbrez@163.com', // generated ethereal user
        pass: 'everbrez233', // generated ethereal password
      },
    })
  }

  @err(
    ERRCode.controller.default,
    ERRCode.service.mail,
    11)
  async send(mailContent: MailContent) {
    if (!this.transporter) {
      await this.init()
    }

    // send mail with defined transport object
    const info = await this.transporter.sendMail({
      from: 'everbrez@163.com', // sender address
      to: mailContent.to, // list of receivers
      subject: mailContent.subject, // Subject line
      text: mailContent.text || '', // plain text body
      html: mailContent.html || '', // html body
    })

    return info
  }
}

interface MailContent {
  to: string[]
  subject: string
  text?: string
  html?: string
}
