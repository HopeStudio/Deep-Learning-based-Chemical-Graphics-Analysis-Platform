const errorCode = {
  type: {
    param: 11,
    net: 12,
    db: 13,
    controller: 14,
    service: 15,
    auth: 16,
  },
  module: {
    user: 11,
    verification: 12,
    jwt: 13,
    sms: 14,
    mail: 15,
    userGroup: 16,
    ir: 17,
  },
}

export default errorCode

export interface Type {
  param
  net
  db
  controller
  service
  auth
}

export interface Module {
  user
  verification
  jwt
  sms
  mail
  userGroup
  ir
}
