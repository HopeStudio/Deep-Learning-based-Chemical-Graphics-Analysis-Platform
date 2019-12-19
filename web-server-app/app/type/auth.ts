import { User } from './user'

export enum TokenTypes {
  access = 'access',
  reflesh = 'reflesh',
}

export interface LoginTokenData {
  uname: User['name']
  groupId: User['groupId']
}

export interface RefleshTokenData extends LoginTokenData {
  tokenType: TokenTypes.reflesh
}

export interface AccessTokenData extends LoginTokenData {
  tokenType: TokenTypes.access
}

interface AdditionTokenData {
  iat: number
  exp: number
}

export interface RefleshToken extends RefleshTokenData, AdditionTokenData { }

export interface AccessToken extends AccessTokenData, AdditionTokenData { }
