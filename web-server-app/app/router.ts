import { Application } from 'egg'
import verificationRouter from './router/verification'
import userRouter from './router/user'

export default (app: Application) => {
  const { controller, router } = app

  router.get('/', controller.home.index)

  // /user
  userRouter(app)

  // /verification
  verificationRouter(app)
}
