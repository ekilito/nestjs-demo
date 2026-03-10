import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../../shared/dtos/user.dto';
import { UserService } from '../../shared/services/user.service';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiTags,
  ApiCookieAuth,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from '../../shared/entities/user.entity';
import { Result } from '../../shared/vo/result';
import { Logger } from '@nestjs/common';
// ApiOperation: 用于描述控制器方法的操作，生成 Swagger 文档时使用 (summary: 摘要, description: 描述)
// ApiResponse: 用于描述控制器方法的响应，生成 Swagger 文档时使用 (status: 状态码, description: 描述)
// ApiParam: 用于描述控制器方法的参数，生成 Swagger 文档时使用 (name: 参数名, description: 描述)
// ApiBody: 用于描述控制器方法的请求体，生成 Swagger 文档时使用 (description: 描述)
// ApiTags: 用于描述控制器的标签，生成 Swagger 文档时使用 (name: 标签名)
// ApiCookieAuth: 用于描述控制器方法需要 Cookie 认证，生成 Swagger 文档时使用 (name: Cookie 名)
// ApiBearerAuth: 用于描述控制器方法需要 Bearer 认证，生成 Swagger 文档时使用 (name: Bearer 名)

@ApiTags('user')
@SerializeOptions({ strategy: 'exposeAll' }) // 序列化选项 - 暴露所有属性
@UseInterceptors(ClassSerializerInterceptor) // 类序列化拦截器 - 用于序列化响应数据
@Controller('user')
export class UserController {
  // 日志记录器 - 用于记录控制器方法的日志
  private readonly logger = new Logger(UserController.name);
  constructor(
    private readonly userService: UserService,
  ) { }

  @Get('list')
  @ApiOperation({ summary: '用户列表' })
  @ApiResponse({ status: 200, description: '成功返回用户列表', type: [User] })
  async getList() {
    // this.logger.log('获取所有用户列表');
    const users = await this.userService.getList();
    return {
      code: HttpStatus.OK,
      message: 'success',
      success: true,
      data: users,
    };
  }

  @Get('getById/:id')
  @ApiOperation({ summary: '根据ID获取用户信息' })
  @ApiResponse({ status: 200, description: '成功返回用户信息', type: User })
  @ApiResponse({ status: 404, description: '用户未找到' })
  @ApiParam({ name: 'id', description: '用户ID', type: Number })
  async getById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getById(id);
    if (!user) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }
    return {
      code: HttpStatus.OK,
      message: 'success',
      success: true,
      data: user,
    };
  }

  @Post('/create')
  @ApiOperation({ summary: '创建新用户' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: '用户成功创建', type: User })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createUserDto: CreateUserDto) {
    await this.userService.create(createUserDto);
    return {
      code: HttpStatus.CREATED,
      message: 'user created successfully',
      success: true,
    };
  }

  @Put('/update/:id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiParam({ name: 'id', description: '用户ID', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: '用户信息更新成功', type: Result })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '用户未找到' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updateResult = await this.userService.update(id, updateUserDto);
    if (!updateResult.affected) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }
    return {
      code: HttpStatus.OK,
      message: 'success',
      success: true,
    };
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: '删除用户' })
  @ApiParam({ name: 'id', description: '用户ID', type: Number })
  @ApiResponse({ status: 200, description: '用户删除成功', type: Result })
  @ApiResponse({ status: 404, description: '用户未找到' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleteResult = await this.userService.delete(id);
    return {
      code: HttpStatus.OK,
      message: 'success',
      success: true,
    };
  }
}

// dto : 数据传输对象 用于接收前端传递过来的数据
// 服务器在处理请求的时候要操作数据库，操作的是 实体类（Entity）
// 最后服务器向客户端返回的结果 vo ， 这个 vo 也可以使用 entity 来使用
