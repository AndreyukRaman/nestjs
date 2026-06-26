import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import { ArticleEntity } from '@app/article/article.entity';
import { CommentEntity } from '@app/comment/comment.entity';
import { CommentsResponseInterface } from '@app/comment/types/comments.response.interface';
import { CommentResponseInterface } from '@app/comment/types/comment.response.interface';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(CommentEntity) private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async getComments(slug: string): Promise<CommentsResponseInterface> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.articleId = :articleId', { articleId: article.id })
      .getMany();
    return { comments: comments.map(c => this.buildCommentResponse(c).comment) };
  }

  async createComment(slug: string, currentUser: UserEntity, body: string): Promise<CommentEntity> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    const comment = new CommentEntity();
    comment.body = body;
    comment.author = currentUser;
    comment.article = article;
    return await this.commentRepository.save(comment);
  }

  buildCommentResponse(comment: CommentEntity): CommentResponseInterface {
    const { article, author, ...rest } = comment;
    return {
      comment: {
        ...rest,
        author: {
          username: author.username,
          bio: author.bio,
          image: author.image,
          points: author.points,
          following: false,
        },
      },
    };
  }

  async deleteComment(slug: string, commentId: number, currentUserId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    if (comment.author.id !== currentUserId) {
      throw new HttpException('You are not the author', HttpStatus.FORBIDDEN);
    }
    await this.commentRepository.delete({ id: commentId });
  }
}
