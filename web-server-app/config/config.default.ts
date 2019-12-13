import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {
    keys: appInfo.name + '_1576210091479_6832',
    middleware: [],

    // mysql server config
    mysql: {
      client: {
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: 'everbrez233',
        database: 'user',
      },
    },
  }

  // the return config will combines to EggAppConfig
  return config
}
