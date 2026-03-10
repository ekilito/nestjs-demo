import { Global, Module } from '@nestjs/common';
import { MyLoggerService } from './my-logger.service';

@Module({
  providers: [
    {
      provide: 'LOGGER_CONFIG',
      useValue: {
        isEnabled: true,
      },
    },
    MyLoggerService,
  ],
  exports: [MyLoggerService],
})
export class LoggerModule {}
