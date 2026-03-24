import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, JoinTable, UpdateDateColumn, PrimaryColumn, BeforeInsert } from 'typeorm';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { ArticleStateEnum } from '../enums/article.enum';
import { generateSnowflakeId } from '../utils/snowflake';
@Entity()
export class Article {
  @PrimaryColumn({ type: 'bigint' })
  @ApiProperty({ description: 'ID', example: '12345678901234567890' })
  id: string;

  @BeforeInsert()
  setId() {
    if (!this.id) {
      this.id = generateSnowflakeId();
    }
  }

  @Column({ length: 50 })
  @ApiProperty({ description: '标题', example: '文章标题' })
  title: string;


  @Column('text')
  @ApiProperty({ description: '内容', example: '文章内容' })
  content: string;

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'article_category',
    joinColumns: [{ name: 'article_id' }],
    inverseJoinColumns: [{ name: 'category_id' }],
  })
  @ApiProperty({ description: '分类列表', type: () => [Category] })
  categories: Category[];

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'article_tag',
    joinColumns: [{ name: 'article_id' }],
    inverseJoinColumns: [{ name: 'tag_id' }],
  })
  @ApiProperty({ description: '标签列表', type: () => [Tag] })
  tags: Tag[];

  @Column({ type: 'enum', enum: ArticleStateEnum, default: 'draft' })
  @ApiProperty({ description: '审核状态', example: 'draft', enum: ArticleStateEnum })
  state: ArticleStateEnum;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: '审核不通过原因', example: '内容不合要求', required: false })
  rejectionReason: string;

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