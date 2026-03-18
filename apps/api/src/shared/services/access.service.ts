import { Injectable } from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Access } from '../entities/access.entity';

@Injectable()
export class AccessService extends MySQLBaseService<Access> {
  constructor(
    @InjectRepository(Access)
    protected repository: Repository<Access>,
  ) {
    super(repository);
  }
}
