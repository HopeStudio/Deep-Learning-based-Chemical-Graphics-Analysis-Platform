import { Service } from 'egg'
import CError, { err, ERRCode } from '../error'

export default class UserService extends Service {
  /**
   * if the user name can use, return true
   *
   * @param {string} userName
   * @returns {Promise<boolean>}
   * @memberof UserService
   */
  @err(
    ERRCode.controller.default,
    ERRCode.service.user,
    11)
  async checkUserName(userName: string): Promise<boolean> {
    const user = await this.getUser({
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
  @err(
    ERRCode.controller.default,
    ERRCode.service.user,
    12)
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

  @err(
    ERRCode.controller.default,
    ERRCode.service.user,
    13,
    true)
  async register(registerUser: RegisterUser) {
    const { uname: name, password, authType, authId } = registerUser
    const result = await this.app.mysql.beginTransactionScope(async coon => {
      const result = await coon.insert<UserSchemaForRegister>('user', {
        name,
        password,
        avatar: 'default',
      })

      if (result.affectedRows !== 1) {
        throw new CError(
          CError.Code(
            ERRCode.controller.default,
            ERRCode.service.user,
            14))
      }

      const queryResult = await coon.select<UserSchema[]>('user', {
        where: { name },
        columns: [ 'id', 'name', 'group_id' ],
      })

      if (queryResult === null || queryResult.length === 0) {
        throw new CError(
          CError.Code(
            ERRCode.controller.default,
            ERRCode.service.user,
            15))
      }

      const [ user ] = queryResult as UserSchema[]

      const { id: user_id } = user

      const userAuthResult = await coon.insert<OAuthSchemaRegister>('user_oauth', {
        user_id,
        auth_type: authType,
        open_id: authId,
      })

      if (userAuthResult.affectedRows !== 1) {
        throw new CError(
          CError.Code(
            ERRCode.controller.default,
            ERRCode.service.user,
            16))
      }

      return {
        name: user.name,
        groupId: user.group_id,
      }
    }, this.ctx)

    return result
  }

  /**
   * get one user full information by id or name
   *
   * @param {GetUserQuery} userQuery
   * @returns
   * @memberof UserService
   */
  private async getUser(userQuery: GetUserQuery) {
    const user = await this.app.mysql.get<UserSchema>('user', userQuery)
    return user
  }

  /**
   * get one user_oauth full information by oauth
   *
   * @private
   * @param {OAuthQuery} oauth
   * @returns
   * @memberof UserService
   */
  private async getByOAuth(oauth: OAuthQuery) {
    const user = await this.app.mysql.get<OAuthSchema>('user_oauth', oauth)
    return user
  }

  @err(
    ERRCode.controller.default,
    ERRCode.service.user,
    21,
    true)
  async loginByName({ name, rawPassword }) {
    const user = await this.getUser({ name })

    const processPassword = this.handlePassword(rawPassword)

    if (!user) {
      throw new CError(
        CError.Code(
          ERRCode.controller.default,
          ERRCode.service.user,
          17))
    }

    const { password, ...others } = user

    if (user.password === processPassword) {
      return others
    }

    throw new CError(
      CError.Code(
        ERRCode.controller.default,
        ERRCode.service.user,
        18))
  }

  @err(
    ERRCode.controller.default,
    ERRCode.service.user,
    22,
    true)
  async loginByOAuth({ authId, rawPassword }) {
    const [ user ] = await this.app.mysql.query<UserSchema>(`
      SELECT user.name name, user.password password, user.group_id group_id
      FROM user
      INNER JOIN user_oauth oauth
      ON user.id = oauth.user_id
      WHERE oauth.open_id= ?`, [ authId ])

    if (!user) {
      throw new CError(
        CError.Code(
          ERRCode.controller.default,
          ERRCode.service.user,
          19))
    }

    const processPassword = this.handlePassword(rawPassword)
    const { password, ...others } = user
    if (password === processPassword) {
      return others
    }

    throw new CError(
      CError.Code(
        ERRCode.controller.default,
        ERRCode.service.user,
        20))
  }

  @err(
    ERRCode.controller.default,
    ERRCode.service.user,
    23)
  private handlePassword(rawPassword: string): string {
    return rawPassword
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

interface OAuthQuery {
  auth_type: string
  open_id: string
}

interface OAuthSchemaRegister {
  user_id: number
  auth_type: string
  open_id: string
  access_token?: string
}

interface OAuthSchema extends OAuthSchemaRegister {
  id: number
  access_token: string
}

interface RegisterUser {
  uname: string
  password: string
  authType: string
  authId: string
}
