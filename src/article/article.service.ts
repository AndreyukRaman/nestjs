import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '@app/user/user.entity';
import { CreateArticleDto } from '@app/article/dto/create.article.dto';
import { ArticleEntity } from '@app/article/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ArticleResponseInterface } from '@app/article/types/article.response.interface';
import slugify from 'slugify';



@Injectable()
export class ArticleService {
  constructor(@InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity> ) {}
  async createArticle(currentUser: UserEntity, createArticleDto: CreateArticleDto) : Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if(!article.tagList){
      article.tagList = [];
    }

    article.slug = this.getSlug(createArticleDto.title)

    article.author = currentUser;

    return await this.articleRepository.save(article);
  }

  buildArticleResponse(article: ArticleEntity):ArticleResponseInterface{
    return {article}
  }

  private getSlug(title:string): string{
    return slugify(title, {lower:true}) + '-' + ((Math.random() * Math.pow(36,6) | 0).toString(36));
  }

  async findBySlug(slug: string):Promise<ArticleEntity | null> {
    return await this.articleRepository.findOne({
      where: {slug}
    })
  }

  async deleteArticle(slug:string, currentUserId: number): Promise<DeleteResult>{
    const article = await this.findBySlug(slug);
    if(!article){
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

   if(article.author.id !== currentUserId){
     throw new HttpException('Author does not exist', HttpStatus.FORBIDDEN);
   }

   return  await this.articleRepository.delete({slug});
  }
}