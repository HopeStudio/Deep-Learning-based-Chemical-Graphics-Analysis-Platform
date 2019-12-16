import { Application } from 'egg'

export default (app: Application) => {
  const { router, controller, middleware } = app

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

  router.post(
    '/user/register',
    middleware.errorHandler(),
    middleware.checkParam('uname', 'password', 'authType', 'authToken', 'authId'),
    controller.user.register)

  router.post(
    '/user/login',
    middleware.errorHandler(),
    middleware.checkParam([ 'authId', 'uname' ], 'password'),
    controller.user.login)

  router.post(
    app.config.refleshToken.path,
    middleware.errorHandler(),
    middleware.checkParam('uname'),
    controller.user.refleshAccessToken)
}
