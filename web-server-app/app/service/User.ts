import { Service } from 'egg'

export default class UserService extends Service {
  /**
   * if the user name can use, return true
   *
   * @param {string} userName
   * @returns {Promise<boolean>}
   * @memberof UserService
   */
  async checkUserName(userName: string): Promise<boolean> {
    const user = await this.get({
      name: userName,
    })

    if (user) {
      return false
    }

    return true
  }

  /**
   * if the email can use, return true
   *
   * @param {string} email
   * @returns {Promise<boolean>}
   * @memberof UserService
   */
  async checkEmail(email: string): Promise<boolean> {
    const user = await this.getByOAuth({
      auth_type: 'email',
      open_id: email,
    })

    if (user) {
      return false
    }

    return true
  }

  async register(registerUser: RegisterUser) {
    const { uname, password, authToken, authType, authId } = registerUser
    console.log(uname, password, authId, authToken, authType)
  }

  /**
   * get one user information by id or name
   *
   * @param {GetUserQuery} userQuery
   * @returns
   * @memberof UserService
   */
  async get(userQuery: GetUserQuery) {
    const user = await this.app.mysql.get<UserSchema>('user', userQuery)
    return user
  }

  async getByOAuth(oauth: OAuthQuery) {
    const user = await this.app.mysql.get<OAuthSchema>('user_oauth', oauth)
    return user
  }

  /**
   * create a user
   *
   * @returns
   * @memberof UserService
   */
  async create({ name, password }) {
    const result = await this.app.mysql.insert<UserSchemaForRegister>('user', {
      name,
      password,
      avatar: '/image/default.png',
    })

    if (result.affectedRows === 1) {
      // create user successfully
      return
    }

    throw new Error('unknow error')
  }
}

enum Gender {
  male = 'M',
  female = 'F',
  private = 'P',
}

interface UserSchemaForRegister {
  name: string
  password: string
  avatar: string
}

interface UserSchema extends UserSchemaForRegister {
  id: number
  gender: Gender.male | Gender.female | Gender.private
  group_id: number
}

interface GetUserQuery {
  name?: string
  id?: number
}

enum AuthTypes {
  email = 'email',
  phone = 'phone',
}

interface RegisterUser {
  uname: string
  password: string
  authType: AuthTypes.email | AuthTypes.phone
  authToken: string
  authId: string
}

interface OAuthQuery {
  auth_type: string
  open_id: string
}

interface OAuthSchema {
  id: number
  user_id: number
  auth_type: string
  access_token: string
  open_id: string
}
