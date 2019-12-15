import { Application } from 'egg'

export default (app: Application) => {
  const { router, controller, middleware } = app

  router.get(
    '/user',
    controller.user.add)

  router.post(
    '/user/check/username',
    middleware.errorHandler(),
    middleware.checkParam('uname'),
    controller.user.checkUserName)

  router.post(
    '/user/check/email',
    middleware.errorHandler(),
    middleware.checkParam('email'),
    controller.user.checkEmail)
}
