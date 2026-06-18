import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '@app/user/user.entity';
import { CreateArticleDto } from '@app/article/dto/create.article.dto';
import { ArticleEntity } from '@app/article/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ArticleResponseInterface } from '@app/article/types/article.response.interface';
import { ArticleQueryInterface } from '@app/article/types/article.query.type';
import slugify from 'slugify';
import {
  PersistArticleDto,
} from '@app/article/dto/update.article.dto';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponseInterface';
import { FollowEntity } from '@app/profile/follow.entity';



@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async findAll(currentUserId: number, query: ArticleQueryInterface): Promise<ArticlesResponseInterface>{
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

     if(query.favorited){
       const author = await this.userRepository.findOne({
         where: {username: query.favorited},
         relations: {favorites:true}
       })

       if (!author) {
         return { articles: [], articlesCount: 0 };
       }

       const ids = author.favorites.map(el=>el.id);
       if(ids.length > 0){
         queryBuilder.andWhere('articles.id IN (:...ids)', {ids})
       } else{
         queryBuilder.andWhere('1=0');
       }

     }

    if(query.limit){

      queryBuilder.limit(query.limit);
    }
    if(query.offset){
      queryBuilder.offset(query.offset);
    }

    let favoriteIds: number[] = [];
    if(currentUserId){
      const currentUser = await this.userRepository.findOne({
        where: {id: currentUserId},
        relations: {favorites:true}
      })
      favoriteIds = currentUser?.favorites.map((favorite)=> favorite.id) ?? []
    }
    console.log('favoriteIds', favoriteIds)
    const articlesCount = await queryBuilder.getCount();
    const articles =await queryBuilder.getMany()
const articlesWithFavorites = articles.map(article => {
  const favorited = favoriteIds.includes(article.id);
  return {...article, favorited};
})

    return {articles: articlesWithFavorites,articlesCount}
  }


  async getFeed(currentUserId: number, query: ArticleQueryInterface): Promise<ArticlesResponseInterface>{
const follows = await this.followRepository.find({
  where: {
    followerId: currentUserId
  }
})
  if(follows.length === 0){
    return {articles: [], articlesCount: 0};
  }
  const followingUserIds = follows.map(follow => follow.followingId);
  const queryBuilder = this.articleRepository
    .createQueryBuilder('articles')
    .leftJoinAndSelect('articles.author', 'author')
    .where('articles.authorId IN (:...ids)', {ids: followingUserIds});


    queryBuilder.orderBy('articles.createdAt', 'DESC');
    const articlesCount = await queryBuilder.getCount();

  if (query.limit) {
    queryBuilder.limit(query.limit);
  }
  if (query.offset) {
    queryBuilder.offset(query.offset);
  }


  const articles = await queryBuilder.getMany();

  return {articles, articlesCount};
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

async deleteArticleFromFavorites(slug:string, currentUserId:number): Promise<ArticleEntity> {
  const article = await this.findBySlug(slug);
  if (!article) {
    throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
  }
  const user = await this.userRepository.findOne({
    where: { id: currentUserId },
    relations: {favorites:true},
  })
  if (!user) {
    throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
  }

  const articleIndex = user?.favorites.findIndex(articleInFavotites => articleInFavotites.id === article.id);

  if(articleIndex >= 0 ){
user.favorites.splice(articleIndex,1)
    article.favoritesCount--;
    await this.userRepository.save(user);
    await this.articleRepository.save(article);
  }
  return article
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