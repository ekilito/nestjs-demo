// 导入所需的装饰器、模块和服务
import { Controller, Post, Body, Res, Request, Get, UseGuards, Query } from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import { UserService } from '../../shared/services/user.service';
import { UtilityService } from '../../shared/services/utility.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigurationService } from '../../shared/services/configuration.service';

@Controller('/auth')
export class AuthController {
  // 构造函数，注入服务类
  constructor(
    private readonly userService: UserService,
    private readonly utilityService: UtilityService,
    private readonly jwtService: JwtService,
    private readonly configurationService: ConfigurationService,
  ) { }

  @Post('login')
  async login(@Body() body, @Res() res: Response) {
    const { username, password } = body;
    const user = await this.validateUser(username, password);  // 验证用户
    if (user) {
      // 创建 JWT 令牌
      const tokens = this.createJwtTokens(user);
      // 返回成功响应，包含令牌信息
      return res.json({ success: true, ...tokens });
    }
    // 如果验证失败，返回 401 状态码和错误信息
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  // 验证用户的私有方法
  private async validateUser(username: string, password: string) {
    // 查找用户，并获取其关联的角色和权限
    const user = await this.userService.findOne({ where: { username }, relations: ['roles', 'roles.accesses'] });
    // 如果用户存在并且密码匹配
    if (user && await this.utilityService.comparePassword(password, user.password)) {
      // 返回用户信息
      return user;
    }
    // 否则返回 null
    return null;
  }

  // 创建 JWT 令牌的私有方法
  private createJwtTokens(user: any) {
    // 创建访问令牌，设置过期时间为 30 分钟
    const access_token = this.jwtService.sign({ id: user.id, username: user.username }, {
      secret: this.configurationService.jwtSecret,
      expiresIn: '30m',
    });
    // 返回令牌信息
    return { access_token };
  }
}