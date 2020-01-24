import { Service } from 'egg'
import { err } from '../decorator'
import CError from '../error'

err.type.service().module.ir().save()

export default class IRService extends Service {
  async predictFunctionalGroup(data: number[]) {
    const requestData = {
      appuid: '1219500109767643136',
      appkey: 'd33ad148-3422-445e-85f3-9e63f229c128',
      input: [data],
    }

    const rawData = JSON.stringify(requestData).replace(/("appuid":\s*)"(\d+)"/g, '$1$2')

    const { data: { error, result } } = await this.ctx.curl('http://39.105.169.10:8081/web/api/ai/run', {
      data: rawData,
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
    })

    if (error) {
      throw new CError(error, 15, true)
    }

    return JSON.parse(result)[0]

    // const { data: result } = await this.ctx.curl('localhost:8501/v1/models/functional_group:predict', {
    //   data: JSON.stringify({
    //     instances: [data],
    //   }),
    //   method: 'POST',
    //   contentType: 'application/json',
    //   dataType: 'json',
    // })
    // return result
  }
}

err.restore()
