import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../../shared/dtos/user.dto';
import { UserService } from '../../shared/services/user.service';


@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {
  }
  // 获取所有用户
  @Get('all')
  async findAll() {
    const users = await this.userService.findAll();
    return { users };
  }

  @Get("findOne/:id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findOne({
      where: { // 查找条件
        id,
      }
    });
  }
  @Post('/create')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Put('/update/:id')
  async update(@Param("id", ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const updateResult = await this.userService.update(id, updateUserDto);
    if (!updateResult.affected) {
      throw new HttpException('用户未找到', HttpStatus.NOT_FOUND);
    }
    return {
      code: HttpStatus.OK,
      message: '用户信息更新成功',
      success: true,
    }
    // return Result.success('用户信息更新成功');
  }

  @Delete('/delete/:id')
  async delete(@Param("id", ParseIntPipe) id: number) {
    const deleteResult = await this.userService.delete(id);
    if (!deleteResult.affected) {
      throw new HttpException('用户未找到', HttpStatus.NOT_FOUND);
    }
    return {
      code: HttpStatus.OK,
      message: '用户删除成功',
      success: true,
    }
  }

}

// dto : 数据传输对象 用于接收前端传递过来的数据
// 服务器在处理请求的时候要操作数据库，操作的是 实体类（Entity）
// 最后服务器向客户端返回的结果 vo ， 这个 vo 也可以使用 entity 来使用
