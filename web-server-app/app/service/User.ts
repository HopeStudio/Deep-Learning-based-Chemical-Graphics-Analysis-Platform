import { Service } from 'egg'
import * as crypto from 'crypto'
import CError from '../error'
import { err } from '../decorator'
import { SelectOAuth, SelectOAuthSchema, SelectUser, SelectUserSchema, OAuthSchema, User, UserSchema, OAuth, SelectProfile, Profile, SelectProfileSchema } from '../type/user'

err.type.service().module.user().save()

export default class UserService extends Service {
  /**
   * if the user name can use, return true
   *
   * @param {string} userName
   * @returns {Promise<boolean>}
   * @memberof UserService
   */
  @err.internal().message('check user error', 'get user error').code(11)
  async checkUserName(userName: User['name']): Promise<boolean> {
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
  @err.internal().message('check email error', 'get oauth error').code(12)
  async checkEmail(email: OAuth['openId']): Promise<boolean> {
    const user = await this.getByOAuth({
      authType: 'email',
      openId: email,
    })

    if (user) {
      return false
    }

    return true
  }

  // register
  @err.internal().message('register fail', 'transcation error').code(13)
  async register(registerUser: RegisterUserParam) {
    const { name, password, authType, openId } = registerUser
    const result = await this.app.mysql.beginTransactionScope(async coon => {
      const salt = await this.generateSalt()
      const hashPassword = await this.handlePassword(password, salt)

      // insert into db
      const result = await coon.insert<SelectUserSchema<'name' | 'password' | 'salt'>>('user', {
        name,
        password: hashPassword,
        salt,
      })

      // insert fail
      if (result.affectedRows !== 1) {
        throw new CError(
          'create user fail',
          err.type.service().module.user().errCode(14),
          true,
          undefined,
          'can not insert user')
      }

      const queryResult =
        await coon.select<SelectUserSchema<'id' | 'name' | 'group_id'>>('user', {
          where: { name },
          columns: [ 'id', 'name', 'group_id' ],
        })

      if (queryResult === null || queryResult.length === 0) {
        throw new CError(
          'can not find user after insert',
          err.type.service().module.user().errCode(15),
          true)
      }

      const [ user ] = queryResult

      const { id: user_id } = user

      const updateOAuth = () => {
        return coon.insert<SelectOAuthSchema<'user_id' | 'auth_type' | 'open_id'>>('user_oauth', {
          user_id,
          auth_type: authType,
          open_id: openId,
        })
      }

      const updateProfile = () => {
        return coon.insert<SelectProfileSchema<'user_id' | 'create_time' | 'last_modify'>>('user_profile', {
          user_id,
          create_time: this.getTime(),
          last_modify: this.getTime(),
        })
      }

      const [ userAuthResult, userProfileResult ] = await Promise.all([ updateOAuth(), updateProfile() ])

      if (userAuthResult.affectedRows !== 1 || userProfileResult.affectedRows !== 1) {
        throw new CError(
          'can not insert oauth and profile',
          err.type.service().module.user().errCode(16),
          true)
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
  private async getUser(userQuery: Partial<SelectUser<'name' | 'id'>>) {
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
  private async getByOAuth(oauthQuery: Partial<SelectOAuth<'authType' | 'openId'>>) {
    const oauth = await this.app.mysql.get<OAuthSchema>('user_oauth', {
      auth_type: oauthQuery.authType,
      open_id: oauthQuery.openId,
    })
    return oauth
  }

  @err.internal().message('login error').code(21)
  async loginByName(name: User['name'], rawPassword: User['password']) {
    const user = await this.getUser({ name })

    if (!user) {
      throw new CError(
        'uname or password incorrect',
        err.type.service().module.user().errCode(17),
        false,
        undefined,
        'user is not exist')
    }

    const { password, salt } = user

    const isPasswordCorrect = await this.checkPassword(rawPassword, password, salt)

    if (isPasswordCorrect) {
      return {
        name: user.name,
        groupId: user.group_id,
      }
    }

    throw new CError(
      'uname or password incorrect',
      err.type.service().module.user().errCode(18),
      false,
      undefined,
      'password is incorrect')
  }

  @err.internal().message('login error in oauth').code(22)
  async loginByOAuth(openId: OAuth['openId'], rawPassword: User['password']) {
    const [ user ] = await this.app.mysql.query<SelectUserSchema<'name' | 'password' | 'group_id' | 'salt'>>(`
      SELECT user.name name, user.password password, user.group_id group_id, user.salt salt
      FROM user
      INNER JOIN user_oauth oauth
      ON user.id = oauth.user_id
      WHERE oauth.open_id= ?`, [ openId ])

    if (!user) {
      throw new CError(
        'user is not exist, in oauth type',
        err.type.service().module.user().errCode(19))
    }

    const { password, salt } = user
    const isPasswordCorrect = await this.checkPassword(rawPassword, password, salt)
    if (isPasswordCorrect) {
      return {
        name: user.name,
        groupId: user.group_id,
      }
    }

    throw new CError(
      'password or username is incorrect',
      err.type.service().module.user().errCode(20),
      false,
      undefined,
      'password is incorrect, in oauth type')
  }

  @err.internal().message('handle password error').code(23)
  private handlePassword(rawPassword: User['password'], salt: User['salt']) {
    const hmac = crypto.createHmac('sha512', salt)
    const processPassword = hmac.update(rawPassword).digest('hex')
    return processPassword
  }

  private generateSalt(length = 20) {
    return crypto.randomBytes(Math.floor(length / 2)).toString('hex')
  }

  private async checkPassword(rawPassword: User['password'], password: User['password'], salt: User['salt']) {
    const processPassword = await this.handlePassword(rawPassword, salt)
    return password === processPassword
  }

  async resetPassword(name: User['name'], rawPassword: User['password'], newPassword: User['password']) {
    const isPasswordCorrect = await this.verifyPassword(name, rawPassword)

    if (!isPasswordCorrect) {
      throw new CError(
        'password is incorrect',
        err.type.service().module.user().errCode(25))
    }

    const salt = await this.generateSalt()

    const processPassword = await this.handlePassword(newPassword, salt)
    const result = await this.app.mysql.update('user', {
      password: processPassword,
      salt,
    }, {
      where: { name },
    })

    if (result.affectedRows !== 1) {
      throw new CError(
        'update password fail',
        err.type.service().module.user().errCode(26))
    }

    await this.service.blacklist.setUserToken(name)
  }

  async resetPasswordByOauth(name: User['name'], newPassword: User['password']) {
    const salt = await this.generateSalt()
    const processPassword = await this.handlePassword(newPassword, salt)
    await this.app.mysql.update<SelectUserSchema<'password' | 'salt'>>('user', {
      password: processPassword,
      salt,
    }, {
      where: { name },
    })
    await this.service.blacklist.setUserToken(name)
  }

  async checkUserEmail(name: User['name'], email: OAuth['openId']) {
    const queryResult = await this.app.mysql.query(`
    SELECT user.name name, oauth.open_id open_id
    FROM user
    INNER JOIN user_oauth oauth
    ON user.id = oauth.user_id
    WHERE oauth.open_id= ? AND user.name= ? AND oauth.auth_type= ?`, [ email, name, 'email' ])

    if (!queryResult || queryResult.length === 0) {
      return false
    }

    return true
  }

  // 二次验证用户密码
  async verifyPassword(name: User['name'], rawPassword: User['password']) {
    const queryResult = await this.app.mysql.select<SelectUserSchema<'password' | 'salt'>>('user', {
      columns: [ 'password', 'salt' ],
      where: { name },
    })
    if (!queryResult || queryResult.length === 0) {
      throw new CError(
        'user not exist',
        err.type.service().module.user().errCode(27),
        false)
    }

    const [ { password, salt } ] = queryResult
    const isPasswordCorrect = await this.checkPassword(rawPassword, password, salt)
    return isPasswordCorrect
  }

  async getUserInfo(name: User['name']) {
    const queryResult = await this.app.mysql.select<SelectUserSchema<'name' | 'avatar' | 'gender'>>('user', {
      columns: [ 'name', 'avatar', 'gender' ],
      where: { name },
    })
    if (!queryResult || queryResult.length === 0) {
      throw new CError(
        'user not exist',
        err.type.service().module.user().errCode(27),
        false)
    }

    return queryResult[0]
  }

  async getUserFullInfo(name: User['name']) {
    const [ user ] = await this.app.mysql.query<UserFullInfo>(`
      SELECT
      user.name name,
      user.gender gender,
      user.avatar avatar,
      user_profile.bio bio,
      user_profile.location location,
      user_profile.url url,
      oauth.open_id email
    FROM
      user
      LEFT JOIN user_oauth oauth ON user.id = oauth.user_id AND oauth.auth_type = 'email'
      LEFT JOIN user_profile ON user.id = user_profile.user_id
    WHERE
      user.name = ?`, [ name ])

    if (!user) {
      throw new CError(
        'user not exist',
        err.type.service().module.user().errCode(28),
        false)
    }

    return user
  }

  async updateUserProfile(profileData: UpdateProfile) {
    const { bio, location, url, name } = profileData
    await this.app.mysql.query(`
        UPDATE
        user_profile
        LEFT JOIN user ON user.id = user_profile.user_id
      SET
        user_profile.bio = ?
        user_profile.location = ?
        user_profile.url = ?
        user_profile.last_modify = ?
      WHERE
        user.name = ?
        `, [ bio, location, url, this.getTime(), name ])
  }

  async deleteUser(name: User['name']) {
    await this.app.mysql.query(`
    DELETE user,
    user_oauth,
    user_profile
    FROM
      user
      LEFT JOIN user_oauth ON user_oauth.user_id = user.id
      LEFT JOIN user_profile ON user_profile.user_id = user.id
    WHERE
      user.name = ?
    `, [ name ])
  }

  async updateEmail(email: OAuth['openId'], newEmail: OAuth['openId']) {
    await this.app.mysql.update<SelectOAuthSchema<'open_id'>>('user_oauth', {
      open_id: newEmail,
    }, {
      where: { open_id: email },
    })
  }

  getTime() {
    const now = new Date()
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  }
}

err.restore()

interface RegisterUserParam extends SelectUser<'name' | 'password'>, SelectOAuth<'authType' | 'openId'> { }

interface UserFullInfo extends SelectUser<'name' | 'gender' | 'avatar'>, SelectProfile<'bio' | 'location' | 'url'> {
  email: OAuth['openId']
}

interface UpdateProfile extends SelectUser<'name'>, Omit<Profile, 'userId' | 'createTime' | 'lastModify'> {
}
