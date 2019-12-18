import CError from '../error'

export default function (
  cbBefore?: hookFunc,
  cbAfter?: hookFunc,
  errHook: errorHookFunc = error => { throw error }) {
  return function (...options) {
    return function (_target, _property, descriptor) {
      const oldFunc = descriptor.value

      descriptor.value = async function (...args) {
        // hook before the main func
        await cbBefore?.apply(this, options)

        let result

        try {
          result = await oldFunc.apply(this, args)
        } catch (error) {
          await errHook.call(this, error, ...options)
        }

        // hook after the main func
        await cbAfter?.apply(this, options)

        return result
      }
      return descriptor
    }
  }

}

type hookFunc = (...props: any[]) => any
type errorHookFunc = (error: CError | Error, ...props: any[]) => any
