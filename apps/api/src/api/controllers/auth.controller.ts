import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  Session,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../../shared/services/user.service';
import { UtilityService } from '../../shared/services/utility.service';
import { AuthLoginDto } from '../../shared/dtos/auth.dto';
import { Result } from '../../shared/vo/result';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly utilityService: UtilityService,
  ) { }

  @Post('login')
  @ApiOperation({ summary: '登录' })
  @ApiBody({ type: AuthLoginDto })
  @ApiResponse({ status: 200, description: '登录成功', type: Result })
  @HttpCode(200)
  async login(@Body() body: AuthLoginDto, @Session() session: Record<string, any>) {
    const { username, password, captcha } = body;
    if (captcha?.toLowerCase() !== session.captcha?.toLowerCase()) {
      throw new UnauthorizedException('验证码错误');
    }
    delete session.captcha;

    const user = await this.userService.findOne({
      where: { username },
      relations: ['roles', 'roles.accesses'],
    });

    if (!user || !(await this.utilityService.comparePassword(password, user.password))) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    session.user = {
      id: user.id,
      username: user.username,
      roles: user.roles ?? [],
    };

    return {
      userInfo: session.user,
    };
  }

  @Get('captcha')
  @ApiOperation({ summary: '获取验证码(svg)' })
  @ApiResponse({ status: 200, description: '验证码 SVG' })
  getCaptcha(
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    const captcha = this.utilityService.generateCaptcha({
      size: 4,
      ignoreChars: '0o1il',
      noise: 2,
      color: true,
    });
    session.captcha = captcha.text;
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.type('svg');
    res.send(captcha.data);
  }

  @Post('logout')
  @ApiOperation({ summary: '退出登录' })
  @ApiResponse({ status: 200, description: '退出成功', type: Result })
  @HttpCode(200)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Session() session: Record<string, any>,
  ) {
    await new Promise<void>((resolve) => {
      session.destroy(() => resolve());
    });
    res.clearCookie('connect.sid');
    return null;
  }
}
