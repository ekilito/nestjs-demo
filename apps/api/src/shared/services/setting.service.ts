import { Injectable } from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../entities/setting.entity';

@Injectable()
export class SettingService extends MySQLBaseService<Setting> {
  constructor(
    @InjectRepository(Setting)
    protected repository: Repository<Setting>,
  ) {
    super(repository);
  }

}
