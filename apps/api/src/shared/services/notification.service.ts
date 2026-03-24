import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ArticleService } from '../../shared/services/article.service';
import { UserService } from '../../shared/services/user.service';
import { MailService } from './mail.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly articleService: ArticleService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) { }

  @OnEvent('article.submitted')
  async handleArticleSubmittedEvent(payload: { articleId: string }) {
    try {
      // 获取文章详情（包含分类和标签）
      const article = await this.articleService.getDetailById(payload.articleId);

      // 获取超级管理员
      const admin = await this.userService.findOne({
        where: { is_super: true } as any
      });

      if (admin && article) {
        const subject = `文章审核请求：${article.title}`;
        // const body = `有一篇新的文章需要审核，点击链接查看详情：http://localhost:3000/admin/articles/${payload.articleId}`;

        // TODO: 替换为实际的邮件发送逻辑
        this.logger.log(`发送邮件通知 - 收件人：${admin.email}, 主题：${subject}`);
        console.log(admin.email, subject);
        this.mailService.sendEmail(admin.email, subject, '请登录后台审核文章');
      }
    } catch (error) {
      this.logger.error(`处理文章提交通知失败：${error.message}`);
    }
  }
}