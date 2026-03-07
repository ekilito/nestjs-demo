import { Get, Controller } from '@nestjs/common';
import { UserService } from '../../shared/services/user.service'; // 引入 UserService

@Controller('admin/users')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  // 获取所有用户
  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return { users };
  }
}