import { Repository, FindOneOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { DeepPartial } from 'typeorm/common/DeepPartial';

// 基础 MySQL 服务类 
// 提供基础的 CRUD 操作
export abstract class MySQLBaseService<T> {
  constructor(
    protected repository: Repository<any>
  ) {
  }
  // 查找所有实体
  async findAll(): Promise<T[]> {
    return this.repository.find();
  }
  // 查找单个实体
  async findOne(options: FindOneOptions<T>): Promise<T> {
    return this.repository.findOne(options) as Promise<T>;
  }
  // 创建实体
  async create(createDto: DeepPartial<T>): Promise<T | T[]> {
    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }
  // 更新实体
  async update(id: number, updateDto: QueryDeepPartialEntity<T>) {
    return await this.repository.update(id, updateDto);
  }
  // 删除实体
  async delete(id: number) {
    return await this.repository.delete(id);
  }
}
