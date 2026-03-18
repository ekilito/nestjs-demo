import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { RoleController } from './controllers/role.controller';

@Module({
  controllers: [UserController, RoleController],
})
export class ApiModule { }
