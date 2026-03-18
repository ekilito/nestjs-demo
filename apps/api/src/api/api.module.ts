import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { RoleController } from './controllers/role.controller';
import { AccessController } from './controllers/access.controller';

@Module({
  controllers: [UserController, RoleController, AccessController],
})
export class ApiModule {}
