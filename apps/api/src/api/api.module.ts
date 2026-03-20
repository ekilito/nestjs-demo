import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { RoleController } from './controllers/role.controller';
import { AccessController } from './controllers/access.controller';
import { TagController } from './controllers/tag.controller';
import { CategoryController } from './controllers/category.controller';
import { ArticleController } from './controllers/article.controller';
import { UploadController } from './controllers/upload.controller';


@Module({
  controllers: [UserController, RoleController, AccessController, TagController, CategoryController, ArticleController, UploadController],
})
export class ApiModule { }
