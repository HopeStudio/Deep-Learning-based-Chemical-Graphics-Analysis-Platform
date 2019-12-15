import { EggPlugin } from 'egg'

const plugin: EggPlugin = {
  mysql: {
    enable: true,
    package: 'egg-mysql',
  },
  redis: {
    enable: true,
    package: 'egg-redis',
  },
}

export default plugin
