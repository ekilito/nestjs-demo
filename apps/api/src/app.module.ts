import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from '../api/api.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [ApiModule, SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
