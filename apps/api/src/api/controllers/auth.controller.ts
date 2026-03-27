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
  UseGuards,
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
import { AuthGuard } from '../guards/auth.guard';

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
  ) { }

  @Post('login')
  @HttpCode(200)
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
  @UseGuards(AuthGuard)
  @Get('getInfo')
  @ApiOperation({ summary: '获取当前登录用户信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: User })
  @ApiResponse({ status: 401, description: 'Token 无效或已过期' })
  getInfo(@Request() req: ExpressRequest) {
    return req.user as User;
  }
}
