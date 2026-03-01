import { Controller, Get, UseGuards } from '@nestjs/common'
import { CurrentUser } from './auth/current-user.decorator'
import { AuthUser } from './auth/auth.types'
import { JwtAuthGuard } from './auth/jwt-auth.guard'

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return { ok: true }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return user
  }
}
