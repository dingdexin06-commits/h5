import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

jest.setTimeout(20000)

async function ensureSchema(prisma: PrismaService) {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Form" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "type" TEXT NOT NULL DEFAULT 'FILE',
      "title" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "creatorId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Approval" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "formId" TEXT NOT NULL,
      "approverId" TEXT NOT NULL,
      "action" TEXT NOT NULL,
      "comment" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Approval_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `)
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Form_creatorId_createdAt_idx" ON "Form"("creatorId", "createdAt");`
  )
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Form_status_createdAt_idx" ON "Form"("status", "createdAt");`
  )
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Approval_formId_createdAt_idx" ON "Approval"("formId", "createdAt");`
  )
}

describe('FormsController (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let formId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    await app.init()

    prisma = app.get(PrismaService)
    await ensureSchema(prisma)
    await prisma.approval.deleteMany()
    await prisma.form.deleteMany()
  })

  afterAll(async () => {
    await app.close()
  })

  it('POST /api/forms creates a pending form', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/forms')
      .send({
        title: 'Purchase laptops',
        content: 'Request to purchase 2 dev laptops'
      })
      .expect(201)

    formId = response.body.id

    expect(typeof response.body.id).toBe('string')
    expect(response.body).toMatchObject({
      type: 'FILE',
      title: 'Purchase laptops',
      content: 'Request to purchase 2 dev laptops',
      creatorId: 'u_1001',
      status: 'PENDING'
    })
    expect(typeof response.body.createdAt).toBe('string')
  })

  it('GET /api/forms?scope=mine returns forms created by current employee', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/forms')
      .query({ scope: 'mine' })
      .expect(200)

    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body).toHaveLength(1)
    expect(response.body[0].id).toBe(formId)
    expect(response.body[0].creatorId).toBe('u_1001')
  })

  it('GET /api/forms?scope=todo returns [] for employee and pending for manager', async () => {
    const employeeResponse = await request(app.getHttpServer())
      .get('/api/forms')
      .query({ scope: 'todo' })
      .expect(200)

    expect(employeeResponse.body).toEqual([])

    const managerResponse = await request(app.getHttpServer())
      .get('/api/forms')
      .query({ scope: 'todo' })
      .set('x-user-role', 'manager')
      .expect(200)

    expect(Array.isArray(managerResponse.body)).toBe(true)
    expect(managerResponse.body).toHaveLength(1)
    expect(managerResponse.body[0]).toMatchObject({
      id: formId,
      status: 'PENDING'
    })
  })

  it('POST /api/forms/:id/approve forbids employee', async () => {
    await request(app.getHttpServer())
      .post(`/api/forms/${formId}/approve`)
      .send({
        action: 'APPROVE',
        comment: 'agree'
      })
      .expect(403)
  })

  it('POST /api/forms/:id/approve allows manager and updates detail', async () => {
    const approveResponse = await request(app.getHttpServer())
      .post(`/api/forms/${formId}/approve`)
      .set('x-user-role', 'manager')
      .send({
        action: 'APPROVE',
        comment: 'agree'
      })
      .expect(201)

    expect(approveResponse.body).toMatchObject({
      formId,
      approverId: 'u_manager_1',
      action: 'APPROVE',
      comment: 'agree'
    })

    const detailResponse = await request(app.getHttpServer())
      .get(`/api/forms/${formId}`)
      .expect(200)

    expect(detailResponse.body.form).toMatchObject({
      id: formId,
      status: 'APPROVED'
    })
    expect(detailResponse.body.approvals).toHaveLength(1)
    expect(detailResponse.body.approvals[0]).toMatchObject({
      formId,
      action: 'APPROVE',
      approverId: 'u_manager_1'
    })
  })

  it('POST /api/forms/:id/approve rejects non-pending form', async () => {
    await request(app.getHttpServer())
      .post(`/api/forms/${formId}/approve`)
      .set('x-user-role', 'manager')
      .send({
        action: 'REJECT',
        comment: 'duplicate approval'
      })
      .expect(400)
  })
})
