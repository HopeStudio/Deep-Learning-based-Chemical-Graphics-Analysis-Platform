import { Service } from 'egg'
import { err } from '../decorator'

err.type.service().module.ir().save()

export default class IRService extends Service {
  async predictFunctionalGroup(data: number[]) {
    const requestData = {
      appuid: 1219500109767643136,
      appkey: 'd33ad148-3422-445e-85f3-9e63f229c128',
      input: [data],
    }
    // const result = await this.ctx.curl('http://39.105.169.10:8081/web/api/ai/run', {
    //   data: requestData,
    //   method: 'POST',
    //   contentType: 'application/json',
    //   dataType: 'json',
    // })

    return JSON.stringify(requestData)
  }
}

err.restore()
