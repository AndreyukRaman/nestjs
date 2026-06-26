import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommentService } from '@app/comment/comment.service';
import { CommentsResponseInterface } from '@app/comment/types/comments.response.interface';
import { UserEntity } from '@app/user/user.entity';
import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { CommentResponseInterface } from '@app/comment/types/comment.response.interface';

@Controller('articles')
export class CommentController {
  constructor(private readonly commentService: CommentService){}

  @Get(':slug/comments')
  async getComments(@Param('slug') slug: string): Promise<CommentsResponseInterface> {
    return await this.commentService.getComments(slug);
  }

  @Post(':slug/comments')
  @UseGuards(AuthGuard)
  async createComment(
    @Param('slug') slug: string,
    @Body('comment') commentDto: { body: string },
    @User() currentUser: UserEntity,
  ):Promise<CommentResponseInterface> {
    const comment = await this.commentService.createComment(slug, currentUser, commentDto.body);
    return this.commentService.buildCommentResponse(comment);
  }

  @Delete(':slug/comments/:id')
  @UseGuards(AuthGuard)
  async deleteComment(
    @Param('slug') slug: string,
    @Param('id') commentId: number,
    @User() currentUser: UserEntity,
  ){
  return await this.commentService.deleteComment(slug,commentId,currentUser.id);
  }

}