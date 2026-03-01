import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common'
import {
  ApprovalAction,
  FormsService,
  UserRole
} from './forms.service'

interface CreateFormBody {
  title: string
  content: string
}

interface ApproveFormBody {
  action: ApprovalAction
  comment?: string
}

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  createForm(
    @Body() body: CreateFormBody,
    @Headers('x-user-role') userRoleHeader?: string
  ) {
    return this.formsService.createForm(body, this.getCurrentUser(userRoleHeader))
  }

  @Get()
  listForms(
    @Query('scope') scope: string,
    @Headers('x-user-role') userRoleHeader?: string
  ) {
    return this.formsService.listForms(scope, this.getCurrentUser(userRoleHeader))
  }

  @Get(':id')
  getFormDetail(@Param('id') id: string) {
    return this.formsService.getFormDetail(id)
  }

  @Post(':id/approve')
  approveForm(
    @Param('id') id: string,
    @Body() body: ApproveFormBody,
    @Headers('x-user-role') userRoleHeader?: string
  ) {
    return this.formsService.approveForm(
      id,
      body,
      this.getCurrentUser(userRoleHeader)
    )
  }

  private getCurrentUser(userRoleHeader?: string): { id: string; role: UserRole } {
    const role = userRoleHeader === 'manager' ? 'manager' : 'employee'

    if (role === 'manager') {
      return { id: 'u_manager_1', role }
    }

    return { id: 'u_1001', role }
  }
}
