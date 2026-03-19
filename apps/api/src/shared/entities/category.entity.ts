import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Tree, TreeChildren, TreeParent, PrimaryColumn, BeforeInsert } from 'typeorm';
import { generateSnowflakeId } from '../utils/snowflake';

@Entity()
@Tree("materialized-path")
export class Category {
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
  @ApiProperty({ description: '分类名称', example: 'categoryName' })
  categoryName: string;

  @TreeChildren()
  children: Category[];

  @TreeParent()
  parent: Category;

  @Column({ default: 1 })
  @ApiProperty({ description: '生效状态', example: 1 })
  status: number;

  @Column({ default: 100 })
  @ApiProperty({ description: '排序号', example: 100 })
  sort: number;

  @CreateDateColumn()
  @ApiProperty({ description: '创建时间', example: '2024年8月11日16:49:22' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: '更新时间', example: '2024年8月11日16:49:22' })
  updatedAt: Date;
}