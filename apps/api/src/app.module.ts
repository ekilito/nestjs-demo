import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { SharedModule } from './shared/shared.module';
import { AdminModule } from './admin/admin.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [ApiModule, SharedModule, AdminModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
