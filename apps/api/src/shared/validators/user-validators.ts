import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

// 定义一个自定义验证器，名为 'startsWith'，不需要异步验证
@ValidatorConstraint({ name: 'startsWith', async: false })
@Injectable()
// 定义 StartsWithConstraint 类并实现 ValidatorConstraintInterface 接口
export class StartsWithConstraint implements ValidatorConstraintInterface {
  // 定义验证逻辑，检查值是否以指定的前缀开头
  validate(value: any, args: ValidationArguments) {
    const [prefix] = args.constraints; // 从参数中获取前缀 const { constraints } = args[0]
    return typeof value === 'string' && value.startsWith(prefix); // 返回值是否以指定前缀开头
  }
  // 定义验证失败时的默认错误消息
  defaultMessage(args: ValidationArguments) {
    const [prefix] = args.constraints; // 从参数中获取前缀
    return `Username must start with "${prefix}".`; // 返回错误消息，提示用户名必须以指定前缀开头
  }
}
// 创建 StartsWith 装饰器工厂函数，用于给属性添加 'startsWith' 验证逻辑
export function StartsWith(
  prefix: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    // object是CreateUserDto 类的原型
    registerDecorator({
      target: object.constructor, // 注册装饰表的目标类 CreateUserDto
      propertyName: propertyName, // 目标属性名 username
      options: validationOptions, // 验证选项
      constraints: [prefix], // 传递给验证器的参数，如前缀
      validator: StartsWithConstraint, // 指定使用的验证器类
    });
  };
}

let userRepository: Repository<User>;
// 定义一个自定义验证器，名为 'isUsernameUnique'，需要异步验证
@ValidatorConstraint({ name: 'isUsernameUnique', async: true })
@Injectable()
// 定义 IsUsernameUniqueConstraint 类并实现 ValidatorConstraintInterface 接口
export class IsUsernameUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(User)
    protected repository: Repository<User>, // 依赖注入
  ) {
    if (!userRepository) {
      userRepository = this.repository;
    }
  }
  // 定义异步验证逻辑，检查用户名是否唯一
  validate = async (value: any, args: ValidationArguments) => {
    // const existingUsernames = ['user_xxx', 'USER', 'GUEST']; // 模拟已存在的用户名列表 调接口
    const user = await userRepository.findOneBy({ username: value });
    return !user; // 检查用户名是否已存在
  };
  // 定义验证失败时的默认错误消息
  defaultMessage(args: ValidationArguments) {
    return 'Username ($value) is already taken!'; // 返回错误消息，提示用户名已存在
  }
}
// 创建 IsUsernameUnique 装饰器工厂函数，用于给属性添加 'isUsernameUnique' 验证逻辑
export function IsUsernameUnique(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor, // 目标类
      propertyName: propertyName, // 目标属性名
      options: validationOptions, // 验证选项
      constraints: [], // 传递给验证器的参数，这里不需要
      validator: IsUsernameUniqueConstraint, // 指定使用的验证器类
    });
  };
}
