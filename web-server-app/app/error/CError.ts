import { Logger, FileTransport } from 'egg-logger'
import * as path from 'path'
import errorMessage from './errorMessage'

const logger = new Logger({})

logger.set('file', new FileTransport({
  file: path.join(__dirname, './logs/error-custom.log'),
  level: 'ERROR',
}))

export default class CError extends Error {
  code: number
  internal: boolean = true
  error: CError | Error | undefined
  innerMessage: string | undefined

  constructor(
    message: string = 'unknown error',
    errorCode: number = 101010,
    internal: boolean = true,
    error?: CError | Error,
    innerMessage?: string) {

    super()
    this.code = errorCode
    this.message = message
    this.internal = internal
    this.error = error
    this.innerMessage = innerMessage

    if (errorMessage[errorCode] && errorMessage[errorCode] !== message) {
      console.log(`\x1b[42m\x1b[30m ErrorCode duplicate \x1b[0m: This ErrorCode \x1b[32m${errorCode}\x1b[0m has been used by \`${errorMessage[errorCode]}\`, message now is \`${message}\``)
    }
    errorMessage[errorCode] = message

    this.log()

    if (error instanceof CError && !error.internal) {
      return error
    }
  }

  log() {
    if (this.error instanceof CError) {
      logger.error(
        this.time(),
        this.code,
        `{ ${this.message} }`, '\n',
        ` INNER { ${this.innerMessage || 'NULL'} }`, '\n',
        ' FROM ', this.error.code,
        `{ ${this.error.message} }`)
      return
    }
    const error: any = this.error
    const sqlMessage = error?.sqlMessage

    logger.error('**************************************************')
    logger.error(
      this.time(),
      this.code,
      `{ ${this.message} }`, '\n',
      ` INNER { ${this.innerMessage || 'NULL'} }`, '\n',
      ' FROM ',
      `NATIVE ${this.error?.message || (sqlMessage && `SQLMessage: { ${sqlMessage || 'NULL'} }`) || '{ NULL }'}`)
  }

  time() {
    const date = new Date()
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.toString().split(' ')[4]} ${date.getMilliseconds()}\n `
  }
}
