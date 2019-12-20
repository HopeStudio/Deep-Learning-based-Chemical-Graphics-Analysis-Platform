export enum Gender {
  male = 'M',
  female = 'F',
  private = 'P',
}

export enum AuthTypes {
  email = 'email',
  phone = 'phone',
}

export interface UserSchema {
  id: number
  name: string
  password: string
  avatar: string
  group_id: number
  gender: Gender.male | Gender.female | Gender.private
  salt: string
}

export interface OAuthSchema {
  user_id: number
  auth_type: string
  access_token: string
  open_id: string
}

export interface ProfileSchema {
  user_id: number
  bio: string
  location: string
  url: string
  create_time: string
  last_modify: string
}

export interface Profile extends Omit<ProfileSchema, 'user_id' | 'create_time' | 'last_modify'> {
  userId: ProfileSchema['user_id'],
  createTime: ProfileSchema['create_time']
  lastModify: ProfileSchema['last_modify']
}

export interface User extends Omit<UserSchema, 'group_id'> {
  groupId: UserSchema['group_id']
}

export interface OAuth extends Omit<OAuthSchema, 'user_id' | 'auth_type' | 'access_token' | 'open_id'> {
  userId: OAuthSchema['user_id']
  authType: OAuthSchema['auth_type']
  accessToken: OAuthSchema['access_token']
  openId: OAuthSchema['open_id']
}

export type SelectUserSchema<K extends keyof UserSchema> = Pick<UserSchema, K>
export type SelectOAuthSchema<K extends keyof OAuthSchema> = Pick<OAuthSchema, K>
export type SelectProfileSchema<K extends keyof ProfileSchema> = Pick<ProfileSchema, K>
export type SelectUser<K extends keyof User> = Pick<User, K>
export type SelectOAuth<K extends keyof OAuth> = Pick<OAuth, K>
export type SelectProfile<K extends keyof Profile> = Pick<Profile, K>
