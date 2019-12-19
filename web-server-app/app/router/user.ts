import { Application } from 'egg'

export default (app: Application) => {
  const { router, controller } = app

  router.post(
    '/user/check/username',
    controller.user.checkUserName)

  router.post(
    '/user/check/email',
    controller.user.checkEmail)

  router.post(
    '/user/register',
    controller.user.register)

  router.post(
    '/user/login',
    controller.user.login)

  router.post(
    // default: /user/reflesh
    app.config.refleshToken.path,
    controller.user.refleshAccessToken)

  router.post(
    '/user/create',
    controller.user.createUser)

  router.post(
    '/user/resetpassword',
    controller.user.resetPassword)
  router.post(
    '/user/forgotpassword',
    controller.user.sendResetPasswordByEmail)
  router.post(
    '/user/password/reset',
    controller.user.resetPasswordByEmail)
}
