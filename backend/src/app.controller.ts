import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return { ok: true }
  }

  @Get('me')
  getMe() {
    return {
      id: 'u_1001',
      name: '测试用户',
      department: {
        id: 'd_01',
        name: '产品研发'
      },
      roles: [
        { id: 'r_admin', name: '管理员' },
        { id: 'r_report', name: '报表查看' }
      ]
    }
  }
}
