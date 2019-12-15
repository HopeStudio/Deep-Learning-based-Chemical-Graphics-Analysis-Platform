import { Service } from 'egg'

export default class UserService extends Service {
  async register(registerUser: RegisterUser) {
    this.ctx.body = 'HW' + registerUser.authToken || 0
  }
  /**
   * get one user information
   *
   * @param {GetUserQuery} userQuery
   * @returns
   * @memberof UserService
   */
  async get(userQuery: GetUserQuery) {
    const user = await this.app.mysql.get<UserSchema>('user', userQuery)

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
  name: string,
  password: string,
  authType: AuthTypes.email | AuthTypes.phone,
  authToken: string
}
