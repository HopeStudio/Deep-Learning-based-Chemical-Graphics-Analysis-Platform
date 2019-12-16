import { Application } from 'egg'
import verificationRouter from './router/verification'
import userRouter from './router/user'

/*
********** register ***********
-> check if user name valid: POST /user/check/username { uname }
-> check if user email valid: POST /user/check/email { email }
-> get verification code using email or SMS: POST /verification { authType, authId }
-> verify the verification code: POST /verification/verify { authType, authId, authCode}
-> register: POST /user/register { uname, password, authType, authToken, authId }
-> auto login: return access token

********* login ***************
-> login with authId or uname: POST /user/login { authId | uname, password}
-> reflesh access token using reflesh token: POST /user/reflesh { uname } with cookie
*/

export default (app: Application) => {
  const { controller, router } = app

  router.get('/', controller.home.index)

  // /user
  userRouter(app)

  // /verification
  verificationRouter(app)
}
