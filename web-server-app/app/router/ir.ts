import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app
  router.post(
    '/ir/analyse',
    controller.ir.analyseFile)
}
