import errorMessage from './errorMessage'

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

    if (error instanceof CError && !error.internal) {
      return error
    }
  }
}
