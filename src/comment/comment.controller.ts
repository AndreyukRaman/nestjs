import { Controller } from '@nestjs/common';
import { CommentService } from '@app/comment/comment.service';

@Controller('articles')
export class CommentController {
  constructor(private readonly commentService: CommentService){}

}