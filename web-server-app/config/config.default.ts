import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {
    keys: appInfo.name + '_1576210091479_6832',
    middleware: [ 'errorHandler' ],

    // mysql server config
    mysql: {
      client: {
        host: 'localhost',
        port: 3306,
        user: 'everbrez',
        password: 'everbrez233',
        database: 'graphics_analysis_platform',
      },
    },

    // redis server config
    redis: {
      client: {
        host: 'localhost',
        port: 6379,
        password: '',
        db: 0,
      },
    },

    verificationCode: {
      // min
      expire: 5,
    },

    jwt: {
      privateKey: 'Deep Learning-based Chemical Graphics Analysis Platform BackEnd main server',
    },

    // reflesh token
    refleshToken: {
      // 1 day
      expire: 24 * 60,
      path: '/user/reflesh',
    },

    // access token
    accessToken: {
      // 1 h
      expire: 60,
    },
  }

  // the return config will combines to EggAppConfig
  return config
}
