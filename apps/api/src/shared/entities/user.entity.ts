import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Role } from './role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn() // 主键 - 自增
  @ApiProperty({ description: '用户ID', example: 1 }) // 返回的scheme示例中显示
  id: number;

  @Column({ length: 50, unique: true })  // 长度50，唯一约束
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  username: string;

  @Column()
  @Exclude() /// 👈 关键：序列化时排除这个字段 返回用户对象时，密码不会被包含
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

  @Expose() // 👈 即使没有数据库字段，也会在序列化时出现 确保它在序列化时被包含
  @ApiProperty({
    description: '联系方式',
    example: 'mobile:123****7890, email:john.doe@example.com',
  })
  get contact(): string {
    return `mobile:${this.mobile}, email:${this.email}`;
  }

  // ManyToMany:   , JoinTable: 
  @ManyToMany(() => Role) // 👈 当前实体与 Role 实体是多对多关系
  // 👈 指定当前实体为关系拥有方，会自动创建中间表！！！！！！
  @JoinTable({
    name: 'sys_user_role',  // 👈 自定义表名

    // 自定义当前实体的外键列名
    joinColumn: {
      name: 'user_id',      // 👈 自定义 userId 字段名
      referencedColumnName: 'id', // 👈 引用 User 实体的 id 字段
    },

    // 自定义关联实体的外键列名
    inverseJoinColumn: {
      name: 'role_id',      // 👈 自定义 roleId 字段名
      referencedColumnName: 'id', // 👈 引用 Role 实体的 id 字段
    },
  })
  roles: Role[]; // 👈 当前实体关联的角色数组

  @Expose() // 👈 在序列化时暴露角色 ID 数组
  @ApiProperty({ description: '角色 ID 数组', example: ['1', '2', '3'] })
  get roleIds(): number[] {
    return this.roles ? this.roles.map(role => Number(role.id)) : [];
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
