import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  BeforeInsert,
  TreeChildren,
  TreeParent,
  Tree,
} from 'typeorm';
import { generateSnowflakeId } from '../utils/snowflake';
import { AccessType } from '../dtos/access.dto';


@Entity()
@Tree("materialized-path") // materialized-path 表示使用物化路径存储树结构
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

  @Column({ type: 'enum', enum: AccessType, default: AccessType.MODULE })
  type: AccessType;

  @Column({ length: 200, nullable: true }) // nullable 表示该字段可以为空
  @ApiProperty({ description: '资源URL', example: '/api/access' })
  url: string;

  @Column({ length: 200, nullable: true })
  @ApiProperty({ description: '资源描述', example: 'accessDescription' })
  description: string;

  @TreeChildren()
  @ApiProperty({ description: '子资源', type: () => [Access] })
  children: Access[];

  // 👉 ❌ 不要在 Entity 里加 parentId 字段
  // 👉 ✅ 只保留 parent: Access 就够了 这是 TypeORM 树结构模型，它内部会自动帮你维护：parent: Access 本质上就已经包含了 parentId
  @TreeParent() // TreeParent 表示该字段是树结构的父节点
  @ApiProperty({ description: '父资源', type: () => Access })
  parent: Access;

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
