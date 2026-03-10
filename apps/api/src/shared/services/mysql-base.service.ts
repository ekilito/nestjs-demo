import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { Injectable, NotFoundException, Logger } from '@nestjs/common';

// 基础 MySQL 服务类
@Injectable()
export abstract class MySQLBaseService<T> {
  protected readonly logger: Logger;

  constructor(protected repository: Repository<any>) {
    this.logger = new Logger(this.constructor.name);
  }

  // ==================== 查询方法 ====================

  /**
   * 获取所有记录（支持分页和条件）
   */
  async getList(options?: FindManyOptions<T>): Promise<T[]> {
    try {
      return await this.repository.find(options);
    } catch (error) {
      this.logger.error(`Failed to get list: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取分页数据
   */
  async getPage(
    page: number = 1,
    pageSize: number = 10,
    options?: FindManyOptions<T>,
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * pageSize;
      const [data, total] = await this.repository.findAndCount({
        ...options,
        skip,
        take: pageSize,
      });

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      this.logger.error(`Failed to get page: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID获取记录详情
   */
  async getById(id: number | string): Promise<T> {
    try {
      const entity = await this.repository.findOne({
        where: { id } as any,
      } as FindOneOptions<T>);

      if (!entity) {
        throw new NotFoundException(`Record with ID ${id} not found`);
      }

      return entity;
    } catch (error) {
      this.logger.error(`Failed to get record by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据条件获取单条记录
   */
  async getOne(options: FindOneOptions<T>): Promise<T> {
    try {
      const entity = await this.repository.findOne(options);

      if (!entity) {
        throw new NotFoundException('Record not found');
      }

      return entity;
    } catch (error) {
      this.logger.error(`Failed to get record: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据条件获取记录（不抛出异常）
   */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    try {
      return await this.repository.findOne(options);
    } catch (error) {
      this.logger.error(`Failed to find record: ${error.message}`);
      throw error;
    }
  }

  // ==================== 创建方法 ====================

  /**
   * 创建记录
   */
  async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data);
      return await this.repository.save(entity);
    } catch (error) {
      this.logger.error(`Failed to create record: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批量创建记录
   */
  async batchCreate(dataList: DeepPartial<T>[]): Promise<T[]> {
    try {
      const entities = this.repository.create(dataList);
      return await this.repository.save(entities);
    } catch (error) {
      this.logger.error(`Failed to batch create records: ${error.message}`);
      throw error;
    }
  }

  /**
   * 创建或更新记录
   */
  async createOrUpdate(data: DeepPartial<T>): Promise<T> {
    try {
      return await this.repository.save(data);
    } catch (error) {
      this.logger.error(`Failed to create or update record: ${error.message}`);
      throw error;
    }
  }

  // ==================== 更新方法 ====================

  /**
   * 更新记录
   */
  async update(
    id: number | string,
    data: QueryDeepPartialEntity<T>,
  ): Promise<T> {
    try {
      const result = await this.repository.update(id, data);

      if (result.affected === 0) {
        throw new NotFoundException(`Record with ID ${id} not found`);
      }

      return await this.getById(id);
    } catch (error) {
      this.logger.error(`Failed to update record ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批量更新记录
   */
  async batchUpdate(
    ids: (number | string)[],
    data: QueryDeepPartialEntity<T>,
  ): Promise<number> {
    try {
      const result = await this.repository.update(ids, data);
      return result.affected || 0;
    } catch (error) {
      this.logger.error(`Failed to batch update records: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据条件更新
   */
  async updateBy(
    options: FindManyOptions<T>,
    data: QueryDeepPartialEntity<T>,
  ): Promise<number> {
    try {
      const result = await this.repository.update(options.where || {}, data);
      return result.affected || 0;
    } catch (error) {
      this.logger.error(
        `Failed to update records by condition: ${error.message}`,
      );
      throw error;
    }
  }

  // ==================== 删除方法 ====================

  /**
   * 删除记录
   */
  async delete(id: number | string): Promise<void> {
    try {
      const result = await this.repository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Record with ID ${id} not found`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete record ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批量删除记录
   */
  async batchDelete(ids: (number | string)[]): Promise<number> {
    try {
      const result = await this.repository.delete(ids);
      return result.affected || 0;
    } catch (error) {
      this.logger.error(`Failed to batch delete records: ${error.message}`);
      throw error;
    }
  }

  /**
   * 软删除记录
   */
  async softDelete(id: number | string): Promise<void> {
    try {
      const result = await this.repository.softDelete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Record with ID ${id} not found`);
      }
    } catch (error) {
      this.logger.error(`Failed to soft delete record ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 恢复软删除记录
   */
  async restore(id: number | string): Promise<void> {
    try {
      const result = await this.repository.restore(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Record with ID ${id} not found`);
      }
    } catch (error) {
      this.logger.error(`Failed to restore record ${id}: ${error.message}`);
      throw error;
    }
  }

  // ==================== 统计和验证方法 ====================

  /**
   * 统计记录数
   */
  async count(options?: FindManyOptions<T>): Promise<number> {
    try {
      return await this.repository.count(options);
    } catch (error) {
      this.logger.error(`Failed to count records: ${error.message}`);
      throw error;
    }
  }

  /**
   * 检查记录是否存在
   */
  async exists(options: FindOneOptions<T>): Promise<boolean> {
    try {
      const count = await this.repository.count(options);
      return count > 0;
    } catch (error) {
      this.logger.error(`Failed to check record existence: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取记录数量（别名）
   */
  async getTotal(options?: FindManyOptions<T>): Promise<number> {
    return this.count(options);
  }
}
