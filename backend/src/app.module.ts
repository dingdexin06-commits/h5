import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { FormsModule } from './forms/forms.module'

@Module({
  imports: [FormsModule],
  controllers: [AppController]
})
export class AppModule {}
