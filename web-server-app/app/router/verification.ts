import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router, middleware } = app

  router.post('/verification/mail', middleware.errorHandler(), controller.verification.mailValidator)

  router.post('/verification/verify', middleware.errorHandler(), controller.verification.verifyCode)
}
