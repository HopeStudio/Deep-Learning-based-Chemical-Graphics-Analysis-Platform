import { Controller, FileStream } from 'egg'
import { err } from '../decorator'
// import CError from '../error'

err.type.controller().module.ir().save()

export default class IRController extends Controller {
  @err.message('fail to analyse').code(11)
  async analyseFile() {
    const stream = await this.ctx.getFileStream()
    const data = await this.getContentFromStream(stream)
    const result = await this.processData(data.toString())
    const res = await this.service.ir.predictFunctionalGroup(result)
    this.ctx.send(0, res)
  }

  async getContentFromStream(stream: FileStream): Promise<Buffer>{
    return new Promise(resolve => {
      let data: any = null
      stream.on('data', chunk => {
        if (!data) {
          data = chunk
          return
        }
        data = Buffer.concat([data, chunk], data.length + chunk.length)
      })

      stream.on('end', async () => {
        resolve(data)
      })
    })
  }

  async processData(dataStr: string) {
    const data = new Array(3801).fill(0)
    dataStr.split('\n').map(row => row.split(',').map(Number)).forEach(([x, y]) => data[Math.round(x) - 200] = +(((100 - y) / 100).toFixed(3)))
    return data.slice(0, 3801)
  }
}

err.restore()
