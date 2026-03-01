import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApprovalAction,
  CurrentUser as FormsCurrentUser,
  FormsService
} from './forms.service'
import { CurrentUser } from '../auth/current-user.decorator'
import { AuthUser } from '../auth/auth.types'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

interface CreateFormBody {
  title: string
  content: string
}

interface ApproveFormBody {
  action: ApprovalAction
  comment?: string
}

@UseGuards(JwtAuthGuard)
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  createForm(@Body() body: CreateFormBody, @CurrentUser() user: AuthUser) {
    return this.formsService.createForm(body, this.toFormsUser(user))
  }

  @Get()
  listForms(@Query('scope') scope: string, @CurrentUser() user: AuthUser) {
    return this.formsService.listForms(scope, this.toFormsUser(user))
  }

  @Get(':id')
  getFormDetail(@Param('id') id: string) {
    return this.formsService.getFormDetail(id)
  }

  @Post(':id/approve')
  approveForm(
    @Param('id') id: string,
    @Body() body: ApproveFormBody,
    @CurrentUser() user: AuthUser
  ) {
    return this.formsService.approveForm(
      id,
      body,
      this.toFormsUser(user)
    )
  }

  private toFormsUser(user: AuthUser): FormsCurrentUser {
    return {
      id: user.id,
      role: user.role
    }
  }
}
