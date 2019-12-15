export function getRandomNumberString(precision: number = 5) {
  return Math.random().toString().substr(2, precision)
}
