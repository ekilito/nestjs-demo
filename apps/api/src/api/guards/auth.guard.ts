// 导入所需的装饰器、模块和服务
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from 'jsonwebtoken';
import { UserService } from '../../shared/services/user.service';
import { ConfigurationService } from '../../shared/services/configuration.service';
import { Request } from 'express';

// 使用 @Injectable() 装饰器将此类标记为可注入的服务
@Injectable()
export class AuthGuard implements CanActivate {
  // 构造函数，注入所需的服务
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configurationService: ConfigurationService,
  ) { }
  // 实现 CanActivate 接口的 canActivate 方法，用于进行身份验证
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    // 获取 HTTP 请求对象
    const request = context.switchToHttp().getRequest<Request>();
    // 从请求头中提取令牌
    const token = this.extractTokenFromHeader(request);

    // 如果没有令牌，抛出未授权异常
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    let decoded: JwtPayload & { id?: number };
    try {
      // 先只处理 JWT 校验错误
      decoded = this.jwtService.verify<JwtPayload & { id?: number }>(token, {
        secret: this.configurationService.jwtSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // JWT 校验通过后，再单独查询用户
    const user = await this.userService.findOne({
      where: { id: decoded.id },
      relations: ['roles', 'roles.accesses'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    request.user = user;
    return true;
  }
  // 从请求头中提取令牌的私有方法 （前端传token（authorization） + Bearer）
  private extractTokenFromHeader(request: Request): string | undefined {
    // 从请求头中获取授权信息，并按照空格分隔为类型和令牌
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    // 如果类型为 'Bearer'，则返回令牌，否则返回 undefined
    return type === 'Bearer' ? token : undefined;
  }
}
