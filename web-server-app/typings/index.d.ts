import 'egg';
import { AccessToken } from '../app/type/auth'

interface mysqlResult {
  fieldCount: number
  affectedRows: number
  insertId: number
  serverStatus: number
  warningCount: number
  message: string
  protocol41: boolean
  changedRows: number
}

interface mysqlSelectConfig {
  where?: object
  columns?: string[]
  orders?: Array<any>
  limit?: string
  offset?: string
}

interface mysqlFuns {
  insert<T>(table: string, data: T): Promise<mysqlResult>
  get<T>(table: string, query: object): Promise<T | null>
  select<T>(table: string, config: mysqlSelectConfig): Promise<T[] | null>
  beginTransaction(): mysqlTransaction
  beginTransactionScope<T>(func:((coon: mysqlTransaction)=>Promise<T>), ctx): T
  query<T>(sqlQuery: string, variable: string[]): Promise<T[]>
  update<T>(table: string, data: T, config: mysqlSelectConfig): Promise<mysqlResult>
}

interface mysqlTransaction extends mysqlFuns{
  commit(): void
  rollback(): void
}

interface ResponseData {
  code: number,
  message?: string,
  data?: object
}

declare module 'egg' {
  interface Application {
    mysql: mysqlFuns
  }

  interface Context {
    send(code?: number, data?: object | string): ResponseData
    auth: AccessToken
  }

  interface 
}