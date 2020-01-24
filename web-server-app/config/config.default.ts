import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'
import * as path from 'path'

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {
    keys: appInfo.name + '_1576210091479_6832',
    middleware: ['errorHandler'],

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
      // unit: min
      expire: 60,
      path: '/user/reflesh',
    },

    // access token
    accessToken: {
      // unit: min
      expire: 10,
    },

    webRoot: 'https://cga.com',
    multipart: {
      fileSize: '50mb',
      mode: 'stream',
      fileExtensions: ['.txt', 'csv' ], // 扩展几种上传的文件格式
    },
    upload: path.resolve('./uploads'),
  }

  // the return config will combines to EggAppConfig
  return config
}
