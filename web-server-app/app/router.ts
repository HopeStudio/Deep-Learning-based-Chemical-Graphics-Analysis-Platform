import { Application } from 'egg'
import verificationRouter from './router/verification'

export default (app: Application) => {
  const { controller, router } = app

  router.get('/', controller.home.index)
  router.get('/user', controller.user.add)

  verificationRouter(app)
}
