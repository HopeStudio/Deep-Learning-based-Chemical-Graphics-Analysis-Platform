import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router, middleware } = app

  router.post(
    '/verification/mail',
    middleware.errorHandler(),
    middleware.checkParam('authType', 'authId'),
    controller.verification.mainValidator)

  router.post(
    '/verification/verify',
    middleware.errorHandler(),
    middleware.checkParam('authType', 'authId', 'authCode'),
    controller.verification.verifyCode)
}
