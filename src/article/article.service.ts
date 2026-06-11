import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '@app/user/user.entity';
import { CreateArticleDto } from '@app/article/dto/create.article.dto';
import { ArticleEntity } from '@app/article/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ArticleResponseInterface } from '@app/article/types/article.response.interface';
import slugify from 'slugify';
import {
  PersistArticleDto,
} from '@app/article/dto/update.article.dto';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponseInterface';



@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(currentUserId: number, query: any): Promise<ArticlesResponseInterface>{
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

      queryBuilder.orderBy('articles.createdAt', 'DESC');

      if(query.tag){
        queryBuilder.andWhere('articles.tagList LIKE :tag', {tag: `%${query.tag}%`})
      }


      if(query.author){
      const author = await this.userRepository.findOne({
        where: {username: query.author },
      })
      if (author) {
        queryBuilder.andWhere('articles.authorId = :id', {
          id: author.id
        })
      } else {
        return { articles: [], articlesCount: 0 };
      }
    }
    if(query.limit){

      queryBuilder.limit(query.limit);
    }
    if(query.offset){
      queryBuilder.offset(query.offset);
    }
    const articlesCount = await queryBuilder.getCount();
    const articles =await queryBuilder.getMany()
    return {articles,articlesCount}
  }



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


async addArticleToFavorites(slug:string, currentUserId:number): Promise<ArticleEntity> {
  const article = await this.findBySlug(slug);
  if (!article) {
    throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
  }
  const user = await this.userRepository.findOne({
    where: { id: currentUserId },
    relations: {favorites:true},
  })

  const isNotFavorited = user?.favorites.findIndex(articleInFavotites => articleInFavotites.id === article.id) === -1;
  if(isNotFavorited){
    user.favorites.push(article);
    article.favoritesCount++;
    await this.userRepository.save(user);
    await this.articleRepository.save(article);
  }
  return article;
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

  async updateArticle(slug:string, currentUserId: number,updateArticleDto: PersistArticleDto):Promise<ArticleEntity>{
    const article = await this.findBySlug(slug);
    if(!article){
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }
    if(article.author.id !== currentUserId){
      throw new HttpException('Author does not exist', HttpStatus.FORBIDDEN);
    }
Object.assign(article, updateArticleDto )
    return await this.articleRepository.save(article);
  }
}