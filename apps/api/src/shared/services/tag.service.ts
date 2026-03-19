import { Injectable } from '@nestjs/common';
import { MySQLBaseService } from './mysql-base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class TagService extends MySQLBaseService<Tag> {
  constructor(
    @InjectRepository(Tag)
    protected repository: Repository<Tag>,
  ) {
    super(repository);
  }

}
