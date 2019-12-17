import errorMessage from './errorMessage'

export default class CError extends Error {
  code: number
  internal: boolean
  error: CError | Error | undefined

  constructor(
    message: string = 'unknown error',
    errorCode: number = 101010,
    internal: boolean = true,
    error?: CError | Error) {

    super()
    this.code = errorCode
    this.message = message
    this.internal = internal
    this.error = error

    if (errorMessage[errorCode]) {
      console.warn(`this errorCode \`${errorCode}\` has been used by \`${errorMessage[errorCode]}\`, message now is \`${message}\``)
    }
    errorMessage[errorCode] = message

    if (error instanceof CError && !error.internal) {
      return error
    }
  }
}
