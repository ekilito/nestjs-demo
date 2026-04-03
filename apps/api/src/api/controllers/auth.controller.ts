import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  SerializeOptions,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { UserService } from '../../shared/services/user.service';
import { UtilityService } from '../../shared/services/utility.service';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { ConfigurationService } from '../../shared/services/configuration.service';
import { AuthLoginDto } from '../../shared/dtos/auth.dto';
import { Result } from '../../shared/vo/result';
import { User } from '../../shared/entities/user.entity';
import { RedisService } from '../../shared/services/redis.service';
import { Public } from '../decorators/public.decorator';

@ApiTags('auth')
@SerializeOptions({ strategy: 'exposeAll' })
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly utilityService: UtilityService,
    private readonly jwtService: JwtService,
    private readonly configurationService: ConfigurationService,
    private readonly redisService: RedisService,
  ) { }

  @Post('login')
  @HttpCode(200)
  @Public()
  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: AuthLoginDto })
  async login(@Body() body: AuthLoginDto) {
    const { username, password } = body;
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException('用户名或密码错误');

    const expires_in = this.configurationService.expiresIn || '30m';
    const access_token = await this.createJwtToken(user);
    return Result.ok({ access_token, expires_in, }, '登录成功');
  }

  // 验证用户凭据，返回用户信息或null
  private async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userService.findOne({
      where: { username },
      relations: ['roles', 'roles.accesses'],
    });
    if (user && (await this.utilityService.comparePassword(password, user.password))) {
      return user;
    }
    return null;
  }

  private async createJwtToken(user: User): Promise<string> {
    const expiresIn = (this.configurationService.expiresIn || '30m') as SignOptions['expiresIn']; // 默认30分钟
    // 生成JWT令牌，包含用户ID和用户名，并设置过期时间
    return this.jwtService.signAsync(
      { id: user.id, username: user.username },
      {
        secret: this.configurationService.jwtSecret,
        expiresIn,
      },
    );
  }

  // 获取用户信息
  @Get('getInfo')
  @ApiOperation({ summary: '获取当前登录用户信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: User })
  @ApiResponse({ status: 401, description: 'Token 无效或已过期' })
  getInfo(@Request() req: ExpressRequest) {
    return req.user as User;
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: '退出登录' })
  @ApiResponse({ status: 200, description: '退出成功', type: Result })
  @ApiResponse({ status: 401, description: 'Token 无效或已过期' })
  async logout(@Request() req: ExpressRequest) {
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }
    // decoded 解析JWT令牌，获取过期时间，并计算TTL（以秒为单位），如果没有过期时间，则不设置TTL
    const decoded = this.jwtService.decode(token) as | (SignOptions & { exp?: number }) | null;
    // 将令牌加入黑名单，设置过期时间为TTL，确保令牌在过期后自动失效 这个 token 离过期还剩多少秒，把这个值当成 Redis 黑名单 key 的过期时间，过期后自动删除黑名单 key，节省 Redis 存储空间
    const ttl = decoded?.exp ? Math.max(decoded.exp - Math.floor(Date.now() / 1000), 1) : undefined;
    await this.redisService.set(`auth:blacklist:${token}`, '1', ttl);
    return Result.ok(null, '退出登录成功');
  }

  private extractTokenFromHeader(request: ExpressRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
