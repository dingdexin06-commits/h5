import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export type FormStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type ApprovalAction = 'APPROVE' | 'REJECT'
export type UserRole = 'manager' | 'employee'

export interface Form {
  id: string
  type: 'FILE'
  title: string
  content: string
  creatorId: string
  status: FormStatus
  createdAt: string
}

export interface Approval {
  id: string
  formId: string
  approverId: string
  action: ApprovalAction
  comment?: string
  createdAt: string
}

interface CurrentUser {
  id: string
  role: UserRole
}

interface CreateFormInput {
  title: string
  content: string
}

interface ApproveFormInput {
  action: ApprovalAction
  comment?: string
}

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async createForm(input: CreateFormInput, user: CurrentUser): Promise<Form> {
    const title = input.title?.trim()
    const content = input.content?.trim()

    if (!title || !content) {
      throw new BadRequestException('title and content are required')
    }

    const form = await this.prisma.form.create({
      data: {
        type: 'FILE',
        title,
        content,
        creatorId: user.id,
        status: 'PENDING'
      }
    })

    return this.toForm(form)
  }

  async listForms(scope: string | undefined, user: CurrentUser): Promise<Form[]> {
    if (scope !== 'mine' && scope !== 'todo') {
      throw new BadRequestException('scope must be mine or todo')
    }

    if (scope === 'todo' && user.role !== 'manager') {
      return []
    }

    const forms = await this.prisma.form.findMany({
      where:
        scope === 'mine'
          ? { creatorId: user.id }
          : {
              status: 'PENDING'
            },
      orderBy: { createdAt: 'desc' }
    })

    return forms.map((form) => this.toForm(form))
  }

  async getFormDetail(id: string): Promise<{ form: Form; approvals: Approval[] }> {
    const form = await this.prisma.form.findUnique({
      where: { id }
    })
    if (!form) {
      throw new NotFoundException('form not found')
    }

    const approvals = await this.prisma.approval.findMany({
      where: { formId: id },
      orderBy: { createdAt: 'asc' }
    })

    return {
      form: this.toForm(form),
      approvals: approvals.map((item) => this.toApproval(item))
    }
  }

  async approveForm(
    id: string,
    input: ApproveFormInput,
    user: CurrentUser
  ): Promise<Approval> {
    if (user.role !== 'manager') {
      throw new ForbiddenException('only manager can approve')
    }

    if (input.action !== 'APPROVE' && input.action !== 'REJECT') {
      throw new BadRequestException('action must be APPROVE or REJECT')
    }

    const comment = input.comment?.trim()

    return this.prisma.$transaction(async (tx) => {
      const form = await tx.form.findUnique({
        where: { id }
      })
      if (!form) {
        throw new NotFoundException('form not found')
      }
      if (form.status !== 'PENDING') {
        throw new BadRequestException('form is not pending')
      }

      const approval = await tx.approval.create({
        data: {
          formId: id,
          approverId: user.id,
          action: input.action,
          ...(comment ? { comment } : {})
        }
      })

      await tx.form.update({
        where: { id },
        data: {
          status: input.action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
        }
      })

      return this.toApproval(approval)
    })
  }

  private toForm(form: {
    id: string
    type: string
    title: string
    content: string
    creatorId: string
    status: string
    createdAt: Date
  }): Form {
    return {
      id: form.id,
      type: 'FILE',
      title: form.title,
      content: form.content,
      creatorId: form.creatorId,
      status: form.status as FormStatus,
      createdAt: form.createdAt.toISOString()
    }
  }

  private toApproval(approval: {
    id: string
    formId: string
    approverId: string
    action: string
    comment: string | null
    createdAt: Date
  }): Approval {
    return {
      id: approval.id,
      formId: approval.formId,
      approverId: approval.approverId,
      action: approval.action as ApprovalAction,
      ...(approval.comment ? { comment: approval.comment } : {}),
      createdAt: approval.createdAt.toISOString()
    }
  }
}
