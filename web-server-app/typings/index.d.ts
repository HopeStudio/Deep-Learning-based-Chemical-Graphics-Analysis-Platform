import 'egg';

declare module 'egg' {
  interface Application {
    mysql: any
  }

  interface Context {
    aaa: string
  }
}