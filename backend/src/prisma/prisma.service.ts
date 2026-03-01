import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '../../src/generated/prisma'
import { resolve } from 'node:path'

export function resolveDatabaseUrl(rawUrl?: string): string {
  const backendRoot = resolve(__dirname, '..', '..')
  const url = rawUrl || 'file:./prisma/dev.db'
  if (!url.startsWith('file:')) {
    return url
  }

  const dbPath = url.slice('file:'.length)
  if (!dbPath) {
    return `file:${resolve(backendRoot, 'prisma/dev.db').replace(/\\/g, '/')}`
  }

  const hasRelativePrefix =
    dbPath.startsWith('./') || dbPath.startsWith('../')
  if (!hasRelativePrefix) {
    return url
  }

  const absolute = resolve(backendRoot, dbPath)
  return `file:${absolute.replace(/\\/g, '/')}`
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly databaseUrl: string
  private sqlitePragmasApplied = false

  constructor() {
    const databaseUrl = resolveDatabaseUrl(process.env.DATABASE_URL)
    super({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    })
    this.databaseUrl = databaseUrl
  }

  async onModuleInit() {
    await this.$connect()
  }

  async $connect(): Promise<void> {
    await super.$connect()
    await this.ensureSqlitePragmas()
  }

  private async ensureSqlitePragmas(): Promise<void> {
    if (this.sqlitePragmasApplied || !this.databaseUrl.startsWith('file:')) {
      return
    }

    // Some Windows environments fail SQLite file journaling with `disk I/O error`.
    // Force in-memory journaling to keep local dev/test writable.
    await this.$queryRawUnsafe('PRAGMA journal_mode=MEMORY;')
    await this.$queryRawUnsafe('PRAGMA foreign_keys=ON;')
    await this.$queryRawUnsafe('PRAGMA busy_timeout=5000;')
    this.sqlitePragmasApplied = true
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close()
    })
  }
}
