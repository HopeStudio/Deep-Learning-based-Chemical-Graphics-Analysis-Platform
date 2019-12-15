export function getRandomNumberString(precision: number = 5) {
  return Math.random().toString().substr(2, precision)
}

export function response(code: number = 0, data: object | string = code === 0 ? {} : '') {
  if (code !== 0) {
    return {
      code,
      message: data,
    }
  }
  return {
    code,
    data,
  }
}
