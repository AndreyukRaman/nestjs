import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put, Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ArticleService } from '@app/article/article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { CreateArticleDto } from '@app/article/dto/create.article.dto';
import { ArticleResponseInterface } from '@app/article/types/article.response.interface';
import {
  PersistArticleDto,
} from '@app/article/dto/update.article.dto';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponseInterface';
import { BackendValidationPipe } from '@app/shared/pipes/backend.validation.pipe';
import type { ArticleQueryInterface } from '@app/article/types/article.query.type';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {
  }


  @Get()
  @ApiOperation({ summary: 'Get all articles' })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'author', required: false })
  @ApiQuery({ name: 'favorited', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async findAll(@User('id') currentUserId: number, @Query() query: ArticleQueryInterface): Promise<ArticlesResponseInterface>{
    return await this.articleService.findAll(currentUserId, query);
  }

  @Get('feed')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('Token')
  @ApiOperation({ summary: 'Get feed of followed users' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async getFeed(@User('id') currentUserId: number, @Query() query: ArticleQueryInterface): Promise<ArticlesResponseInterface>{
    return await this.articleService.getFeed(currentUserId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  @ApiBearerAuth('Token')
  @ApiOperation({ summary: 'Create article' })
  @ApiBody({ schema: { example: { article: { title: 'Title', description: 'Desc', body: 'Body', tagList: ['tag1'] } } } })
  async create(@User() currentUser: UserEntity, @Body('article') createArticleDto: CreateArticleDto ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(currentUser, createArticleDto);
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get article by slug' })
  async getSingleArticle(@Param('slug') slug:string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.findBySlug(slug);
    return this.articleService.buildArticleResponse(article!);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('Token')
  @ApiOperation({ summary: 'Delete article' })
  async deleteArticle(@User('id') currentUserId: number, @Param('slug') slug:string){
    return await this.articleService.deleteArticle(slug, currentUserId);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  @ApiBearerAuth('Token')
  @ApiOperation({ summary: 'Update article' })
  @ApiBody({ schema: { example: { article: { title: 'New title', description: 'New desc', body: 'New body' } } } })
  async updateArticle(@User('id') currentUserId: number, @Param('slug') slug:string,  @Body('article') updateArticleDto: PersistArticleDto): Promise<ArticleResponseInterface>{
    const article = await this.articleService.updateArticle(slug,currentUserId,updateArticleDto);
    return this.articleService.buildArticleResponse(article);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('Token')
  @ApiOperation({ summary: 'Favorite article' })
  async addArticleToFavorites(@User('id') currentUserId: number, @Param('slug') slug:string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorites(slug, currentUserId);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('Token')
  @ApiOperation({ summary: 'Unfavorite article' })
  async deleteArticleFromFavorites(@User('id') currentUserId: number, @Param('slug') slug:string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteArticleFromFavorites(slug, currentUserId);
    return this.articleService.buildArticleResponse(article);
  }
}
