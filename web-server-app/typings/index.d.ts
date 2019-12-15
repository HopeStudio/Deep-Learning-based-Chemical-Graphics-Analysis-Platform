import 'egg';

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
  offset: string
}

interface mysqlFuns {
  insert<T>(table: string, data: T): Promise<mysqlResult>
  get<T>(table: string, query: object): Promise<T | null>
  select<T>(table: string, config: mysqlSelectConfig): Promise<T | null>
  beginTransaction(): mysqlTransaction
}

interface mysqlTransaction extends mysqlFuns{
  commit(): void
  rollback(): void
}

declare module 'egg' {
  interface Application {
    mysql: mysqlFuns
  }

  interface Context {
  }

  interface 
}