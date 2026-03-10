import { Inject, Injectable } from "@nestjs/common";
@Injectable()
export class MyLoggerService {
  @Inject('LOGGER_CONFIG') private readonly config: any;
  log(message: string) {
    console.log('isEnabled', this.config.isEnabled);
    console.log(message);
  }
}