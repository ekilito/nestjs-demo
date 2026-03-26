import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { generateSnowflakeId } from '../utils/snowflake';

@Entity()
export class Setting {
  @PrimaryColumn({ type: 'bigint' })
  @ApiProperty({ description: 'ID', example: '12345678901234567890' })
  id: string;

  @BeforeInsert()
  setId() {
    if (!this.id) {
      this.id = generateSnowflakeId();
    }
  }

  @Column({ length: 100 })
  @ApiProperty({ description: '网站名称', example: '我的网站' })
  siteName: string;

  @Column({ length: 500 })
  @ApiProperty({ description: '网站描述', example: '这是我的个人网站' })
  siteDescription: string;

  @Column({ length: 100 })
  @ApiProperty({ description: '联系邮箱', example: 'contact@example.com' })
  contactEmail: string;

  @CreateDateColumn()
  @ApiProperty({ description: '创建时间', example: '2024-08-11T16:49:22.000Z' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: '更新时间', example: '2024-08-11T16:49:22.000Z' })
  updatedAt: Date;
}
