export default class ERR extends Error {
  code: number
  constructor(code: number | Error, message: string = 'unknown error') {
    super()
    if (code instanceof Error) {
      this.handleNativeError(code)
      return this
    }

    this.code = code
    this.message = message
  }

  handleNativeError(error) {
    this.message = error.message
    this.code = 1
  }
}
