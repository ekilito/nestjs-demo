import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../../shared/dtos/user.dto';
import { UserService } from '../../shared/services/user.service';


@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {
  }
  @Post('/create')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

}

// dto : 数据传输对象 用于接收前端传递过来的数据
// 服务器在处理请求的时候要操作数据库，操作的是 实体类（Entity）
// 最后服务器向客户端返回的结果 vo ， 这个 vo 也可以使用 entity 来使用
