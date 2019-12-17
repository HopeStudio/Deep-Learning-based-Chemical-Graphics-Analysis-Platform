import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app

  router.post(
    '/verification',
    controller.verification.mainValidator)

  router.post(
    '/verification/verify',
    controller.verification.verifyCode)
}
