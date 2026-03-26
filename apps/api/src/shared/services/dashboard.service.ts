import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { ArticleService } from './article.service';
import { CategoryService } from './category.service';
import { TagService } from './tag.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly userService: UserService,
    private readonly articleService: ArticleService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService
  ) { }

  async getDashboardData() {
    const [
      userCount,
      articleCount,
      categoryCount,
      tagCount,
      latestArticles,
      latestUsers,
      articleTrend,
      userGrowth,
    ] = await Promise.all([
      this.userService.count(),
      this.articleService.count(),
      this.categoryService.count(),
      this.tagService.count(),
      // 最新数据
      this.articleService.findLatest(5),
      this.userService.findLatest(5),
      // 图表数据 7天趋势
      this.articleService.getTrend(7),
      this.userService.getTrend(7),
    ]);

    return {
      userCount,
      articleCount,
      categoryCount,
      tagCount,
      latestArticles,
      latestUsers,
      articleTrend,
      userGrowth
    };
  }
}
