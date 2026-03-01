import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { FormsService } from './forms.service'

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

describe('FormsService', () => {
  const employeeUser = { id: 'u_1001', role: 'employee' as const }
  const managerUser = { id: 'u_manager_1', role: 'manager' as const }

  let prisma: PrismaService
  let service: FormsService

  beforeAll(async () => {
    prisma = new PrismaService()
    await prisma.$connect()
    await ensureSchema(prisma)
  })

  beforeEach(async () => {
    await prisma.approval.deleteMany()
    await prisma.form.deleteMany()
    service = new FormsService(prisma)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates a pending FILE form for creator', async () => {
    const result = await service.createForm(
      {
        title: 'Purchase laptops',
        content: 'Request to purchase 2 dev laptops'
      },
      employeeUser
    )

    expect(result.id).toBeTruthy()
    expect(result.type).toBe('FILE')
    expect(result.creatorId).toBe(employeeUser.id)
    expect(result.status).toBe('PENDING')
    expect(typeof result.createdAt).toBe('string')
  })

  it('lists mine scope by creator only', async () => {
    await service.createForm(
      {
        title: 'Mine',
        content: 'A'
      },
      employeeUser
    )
    await service.createForm(
      {
        title: 'Other',
        content: 'B'
      },
      { id: 'u_2002', role: 'employee' }
    )

    const mine = await service.listForms('mine', employeeUser)

    expect(mine).toHaveLength(1)
    expect(mine[0].creatorId).toBe(employeeUser.id)
    expect(mine[0].title).toBe('Mine')
  })

  it('lists todo scope for manager with pending forms only', async () => {
    const pending = await service.createForm(
      {
        title: 'Pending',
        content: 'A'
      },
      employeeUser
    )
    const approved = await service.createForm(
      {
        title: 'Will be approved',
        content: 'B'
      },
      employeeUser
    )
    await service.approveForm(
      approved.id,
      {
        action: 'APPROVE',
        comment: 'ok'
      },
      managerUser
    )

    const todoByManager = await service.listForms('todo', managerUser)
    const todoByEmployee = await service.listForms('todo', employeeUser)

    expect(todoByManager).toHaveLength(1)
    expect(todoByManager[0].id).toBe(pending.id)
    expect(todoByEmployee).toEqual([])
  })

  it('approves and rejects pending forms, and writes approval records', async () => {
    const formA = await service.createForm(
      {
        title: 'A',
        content: 'A'
      },
      employeeUser
    )
    const formB = await service.createForm(
      {
        title: 'B',
        content: 'B'
      },
      employeeUser
    )

    const approveRecord = await service.approveForm(
      formA.id,
      {
        action: 'APPROVE',
        comment: 'pass'
      },
      managerUser
    )
    const rejectRecord = await service.approveForm(
      formB.id,
      {
        action: 'REJECT',
        comment: 'reject'
      },
      managerUser
    )

    const detailA = await service.getFormDetail(formA.id)
    const detailB = await service.getFormDetail(formB.id)

    expect(detailA.form.status).toBe('APPROVED')
    expect(detailB.form.status).toBe('REJECTED')
    expect(approveRecord.action).toBe('APPROVE')
    expect(rejectRecord.action).toBe('REJECT')
    expect(detailA.approvals).toHaveLength(1)
    expect(detailB.approvals).toHaveLength(1)
    expect(detailA.approvals[0].approverId).toBe(managerUser.id)
  })

  it('forbids employee from approving forms', async () => {
    const form = await service.createForm(
      {
        title: 'Pending',
        content: 'A'
      },
      employeeUser
    )

    await expect(
      service.approveForm(
        form.id,
        {
          action: 'APPROVE'
        },
        employeeUser
      )
    ).rejects.toThrow(ForbiddenException)
  })

  it('rejects approving non-pending form', async () => {
    const form = await service.createForm(
      {
        title: 'Single approval only',
        content: 'A'
      },
      employeeUser
    )
    await service.approveForm(
      form.id,
      {
        action: 'APPROVE'
      },
      managerUser
    )

    await expect(
      service.approveForm(
        form.id,
        {
          action: 'REJECT'
        },
        managerUser
      )
    ).rejects.toThrow(BadRequestException)
  })
})
