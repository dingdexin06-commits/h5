import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { FormsModule } from './forms/forms.module'

@Module({
  imports: [AuthModule, FormsModule],
  controllers: [AppController]
})
export class AppModule {}
