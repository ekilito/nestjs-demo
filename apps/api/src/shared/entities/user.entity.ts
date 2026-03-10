import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn() // 主键 - 自增
  @ApiProperty({ description: '用户ID', example: 1 })
  id: number;

  @Column({ length: 50, unique: true })
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  username: string;

  @Column()
  @Exclude() // 排除在序列化之外
  @ApiHideProperty() // 隐藏密码字段，不在Swagger文档中显示
  password: string;

  @Column({ length: 15, nullable: true })
  @ApiPropertyOptional({
    description: '手机号',
    example: '1234567890',
    format: '手机号码会被部分隐藏',
  })
  @Transform(({ value }) =>
    value ? value.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3') : value,
  ) // 手机号部分隐藏
  mobile: string;

  @Column({ length: 100, nullable: true })
  @ApiPropertyOptional({
    description: '邮箱地址',
    example: 'john.doe@example.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: '联系方式',
    example: 'mobile:123****7890, email:john.doe@example.com',
  })
  get contact(): string {
    return `mobile:${this.mobile}, email:${this.email}`;
  }

  @Column({ default: 1 })
  @ApiProperty({ description: '用户状态', example: 1 })
  status: number;

  @Column({ default: false })
  @ApiProperty({ description: '是否为超级管理员', example: false })
  is_super: boolean;

  @Column({ default: 100 })
  @ApiProperty({ description: '排序编号', example: 100 })
  sort: number;

  // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn() // 创建时间 - 数据库自动设置
  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  // @Column({
  //   type: 'timestamp',
  //   default: () => 'CURRENT_TIMESTAMP',
  //   onUpdate: 'CURRENT_TIMESTAMP',
  // })
  @UpdateDateColumn() // 更新时间 - 数据库自动设置
  @ApiProperty({ description: '更新时间', example: '2024-01-02T00:00:00Z' })
  updatedAt: Date;
}
