import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ExtendedConsoleLogger extends ConsoleLogger {
  error(message: any, stack?: string, context?: string) {
    console.log(`[ExtendedConsoleLogger] ${message}`);
    // super.error(message, stack, context);
    super.log(message, stack, context);
  }
}
