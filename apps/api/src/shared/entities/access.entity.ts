import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  BeforeInsert,
} from 'typeorm';
import { generateSnowflakeId } from '../utils/snowflake';

@Entity()
export class Access {
  @PrimaryColumn({ type: 'bigint' })
  @ApiProperty({ description: 'ID', example: '12345678901234567890' })
  id: string;

  @BeforeInsert()
  setId() {
    if (!this.id) {
      this.id = generateSnowflakeId();
    }
  }

  @Column({ length: 50, unique: true })
  @ApiProperty({ description: '资源名称', example: 'accessName' })
  accessName: string;

  @Column({ default: 1 })
  @ApiProperty({ description: '生效状态', example: 1 })
  status: number;

  @Column({ default: 100 })
  @ApiProperty({ description: '排序号', example: 100 })
  sort: number;

  @CreateDateColumn()
  @ApiProperty({ description: '创建时间', example: '2024-08-11T16:49:22.000Z' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: '更新时间', example: '2024-08-11T16:49:22.000Z' })
  updatedAt: Date;
}
