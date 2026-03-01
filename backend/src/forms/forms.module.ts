import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { FormsController } from './forms.controller'
import { FormsService } from './forms.service'
import { PrismaService } from '../prisma/prisma.service'

@Module({
  imports: [AuthModule],
  controllers: [FormsController],
  providers: [FormsService, PrismaService]
})
export class FormsModule {}
