import { applyDecorators } from '@nestjs/common';
import { IsString, IsOptional, IsBoolean, IsNumber, IsEmail, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
// IsOptional : 可选的装饰器，用于标记一个属性是可选的，即可以不传递该属性的值。
// applyDecorators : 用于组合多个装饰器，将它们应用到同一个属性上。
// Type : 用于转换属性的类型，将请求数据转换为指定的类型。

// 可选的密码装饰器
export function PasswordValidators() {
  return applyDecorators(IsString(), MinLength(6), MaxLength(12)); 
}
// 可选的字符串装饰器
export function IsOptionalString() {
  return applyDecorators(IsOptional(), IsString());
}
// 可选的邮箱装饰器
export function EmailValidators() {
  return applyDecorators(IsOptional(), IsEmail());
}
// 可选的数字装饰器，并转换类型为 Number
export function IsOptionalNumber() {
  return applyDecorators(IsOptional(), IsNumber(), Type(() => Number));
}
// 可选的布尔值装饰器，并转换类型为 Boolean
export function IsOptionalBoolean() {
  return applyDecorators(IsOptional(), IsBoolean(), Type(() => Boolean));
}