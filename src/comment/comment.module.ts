import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from '@app/comment/comment.entity';
import { ArticleEntity } from '@app/article/article.entity';
import { UserEntity } from '@app/user/user.entity';
import { CommentController } from '@app/comment/comment.controller';
import { CommentService } from '@app/comment/comment.service';

@Module({
  imports:[TypeOrmModule.forFeature([UserEntity, ArticleEntity,CommentEntity])],
  controllers: [CommentController],
  providers: [CommentService],
})



export class CommentModule{}